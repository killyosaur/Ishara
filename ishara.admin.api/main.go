package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"os"
	"strconv"
	"time"

	"golang.org/x/crypto/bcrypt"

	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
	"github.com/go-chi/jwtauth"

	driver "github.com/arangodb/go-driver"
	arrHttp "github.com/arangodb/go-driver/http"

	"github.com/google/uuid"

	"github.com/dgrijalva/jwt-go"
)

var tokenAuth *jwtauth.JWTAuth
var client driver.Client
var db driver.Database
var graph driver.Graph

const (
	dbName    = "IsharaDB"
	graphName = "Ishara"
	dbHost    = "localhost"
	dbPort    = 8529
)

func main() {
	r := chi.NewRouter()
	r.Use(middleware.Recoverer)
	r.Use(middleware.RedirectSlashes)
	r.Use(middleware.Logger)

	r.Route("/api", func(rt chi.Router) {
		rt.Mount("/users", routers())
	})

	http.ListenAndServe("localhost:5000", r)
}

func init() {
	tokenAuth = jwtauth.New("HS512", []byte(os.Getenv("ISHARA_SECRET")), nil)

	var err error

	conn, err := arrHttp.NewConnection(arrHttp.ConnectionConfig{
		Endpoints: []string{fmt.Sprintf("http://%s:%d", dbHost, dbPort)},
	})

	catch(err)

	user := os.Getenv("DB_USER")
	pwd := os.Getenv("DB_PWRD")
	auth := driver.JWTAuthentication(user, pwd)

	client, err = driver.NewClient(driver.ClientConfig{
		Connection:     conn,
		Authentication: auth,
	})

	catch(err)

	ctx := context.Background()
	db, err = client.Database(ctx, dbName)
	catch(err)

	graph, err = db.Graph(ctx, graphName)
	catch(err)
}

func routers() http.Handler {
	router := chi.NewRouter()

	router.Group(func(r chi.Router) {
		r.Post("/authenticate", Authenticate)
		r.Post("/register", Register)
	})

	router.Group(func(r chi.Router) {
		r.Use(jwtauth.Verifier(tokenAuth))
		r.Use(jwtauth.Authenticator)

		r.Get("/", AllUsers)
		r.Get("/{id}", GetUserByID)
		r.Put("/{id}", UpdateUser)
		r.Delete("/{id}", DeleteUser)

		r.Route("/{userId}/posts", func(rt chi.Router) {
			rt.Mount("/users", postRouters())
		})
	})

	return router
}

func postRouters() http.Handler {
	r := chi.NewRouter()

	r.Get("/", AllPosts)
	r.Get("/{id}", GetPostByID)
	r.Post("/", CreatePost)
	r.Put("/{id}", UpdatePost)
	r.Delete("/{id}", DeletePost)

	return r
}

// models

// UserDto For retrieving data from the client
type UserDto struct {
	ID        string `json:"id"`
	Username  string `json:"username"`
	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`
	Password  string `json:"password"`
	Biography string `json:"bio"`
	Token     string `json:"token"`
}

// User for getting the user data from the database
type User struct {
	Key        uuid.UUID `json:"_key"`
	Username   string
	FirstName  string
	LastName   string
	Biography  string
	CreatedOn  time.Time
	ModifiedOn time.Time
}

// PostDto for getting post data from client
type PostDto struct {
	ID          string `json:"id"`
	Title       string `json:"title"`
	Content     string `json:"content"`
	AuthorID    string `json:"authorId"`
	PublishedOn string `json:"publishedOn"`
	ModifiedOn  string `json:"modifiedOn"`
}

// Post for getting the post data from the database
type Post struct {
	Key         uuid.UUID `json:"_key"`
	Title       string
	Content     string
	CreatedOn   time.Time
	ModifiedOn  time.Time
	PublishedOn time.Time
}

// WrittenBy for getting and setting the written by edge rom the database
type WrittenBy struct {
	Key  string `json:"_key"`
	From string `json:"_from"`
	To   string `json:"_to"`
}

// Password for getting a password from the database
type Password struct {
	Key                 string `json:"_key"`
	PasswordHashAndSalt []byte
	Current             bool
	SecureKey           string
}

// models

// GetUserByID for getting the user by id
func GetUserByID(w http.ResponseWriter, r *http.Request) {
	id, _ := uuid.Parse(chi.URLParam(r, "id"))

	user := gubi(id)

	respondwithJSON(w, http.StatusOK, map[string]interface{}{
		"id":        user.Key,
		"firstName": user.FirstName,
		"lastName":  user.LastName,
		"username":  user.Username,
		"bio":       user.Biography,
	})
}

// AllUsers for getting all the users
func AllUsers(w http.ResponseWriter, r *http.Request) {
	var userDtos []map[string]interface{}

	ctx := context.Background()
	query := "FOR u IN user RETURN { \"id\": u._key, \"firstName\": u.FirstName, \"lastName\": u.LastName, \"username\": u.Username, \"bio\": u.Biography }"

	cursor, err := db.Query(ctx, query, nil)
	catch(err)

	defer cursor.Close()
	for {
		var user map[string]interface{}
		_, err := cursor.ReadDocument(ctx, &user)
		if driver.IsNoMoreDocuments(err) {
			break
		} else {
			catch(err)
		}

		userDtos = append(userDtos, user)
	}

	respondwithJSON(w, http.StatusOK, userDtos)
}

// UpdateUser for updating a user
func UpdateUser(w http.ResponseWriter, r *http.Request) {
	id, _ := uuid.Parse(chi.URLParam(r, "id"))

	var userDto UserDto
	json.NewDecoder(r.Body).Decode(&userDto)

	ctx := context.Background()
	patch := map[string]interface{}{
		"FirstName":  userDto.FirstName,
		"LastName":   userDto.LastName,
		"ModifiedOn": time.Now(),
	}

	if userDto.Biography != "" {
		patch["Biography"] = userDto.Biography
	}

	user := gubu(userDto.Username)
	emptyUser := User{}

	if (user != emptyUser) && (user.Key != id) {
		respondwithJSON(w, http.StatusBadRequest, map[string]interface{}{
			"message": "Username is already in use! Please choose a different username.",
		})
		return
	} else if user == emptyUser {
		patch["Username"] = userDto.Username
	}

	if userDto.Password != "" {
		password := []byte(userDto.Password)
		err := updatePassword(id, password)
		respondwithJSON(w, http.StatusBadRequest, map[string]interface{}{
			"message": err,
		})
		return
	}

	userCol, err := graph.VertexCollection(ctx, "user")
	catch(err)

	meta, err := userCol.UpdateDocument(ctx, id.String(), patch)
	catch(err)

	respondwithJSON(w, http.StatusOK, map[string]interface{}{
		"ID": meta.Key,
	})
}

// DeleteUser delete a user
func DeleteUser(w http.ResponseWriter, r *http.Request) {
	id, _ := uuid.Parse(chi.URLParam(r, "id"))

	ctx := context.Background()
	patch := map[string]interface{}{
		"Biography": "",
		"LastName":  "DELETED",
		"InActive":  true,
	}

	userCol, err := graph.VertexCollection(ctx, "user")
	catch(err)

	meta, err := userCol.UpdateDocument(ctx, id.String(), patch)
	catch(err)

	respondwithJSON(w, http.StatusOK, map[string]interface{}{
		"ID": meta.Key,
	})
}

// Authenticate for auth results of a user
func Authenticate(w http.ResponseWriter, r *http.Request) {
	var jsonObj map[string]string
	json.NewDecoder(r.Body).Decode(&jsonObj)

	if jsonObj["Username"] == "" || jsonObj["Password"] == "" {
		respondwithJSON(w, http.StatusBadRequest, map[string]string{
			"message": "Username or Password is incorrect",
		})
		return
	}

	user := gubu(jsonObj["Username"])

	query := "FOR u IN user FOR p, s IN 1..1 OUTBOUND u secured_by FILTER s.Current == true && u._key == @uid RETURN { _key: p._key, PasswordHashAndSalt: p.PasswordHashAndSalt, Current: s.Current, SecureKey: s._key }"
	bindVars := map[string]interface{}{
		"uid": user.Key,
	}

	cursor, ctx := getCursor(query, bindVars)

	var pass Password

	defer cursor.Close()
	for {
		_, err := cursor.ReadDocument(ctx, &pass)
		if driver.IsNoMoreDocuments(err) {
			break
		} else {
			catch(err)
		}
	}

	if !passwordCompare(pass.PasswordHashAndSalt, []byte(jsonObj["Password"])) {
		respondwithJSON(w, http.StatusBadRequest, map[string]string{
			"message": "Username or Password is incorrect",
		})
		return
	}

	claim := jwt.MapClaims{
		"Username": user.Username,
	}

	jwtauth.SetExpiryIn(claim, time.Hour)

	_, token, err := tokenAuth.Encode(claim)
	catch(err)

	respondwithJSON(w, http.StatusOK, map[string]string{
		"ID":       user.Key.String(),
		"Username": user.Username,
		"Name":     fmt.Sprintf("%s %s", user.FirstName, user.LastName),
		"Token":    token,
	})
}

// Register for creating new users (for now)
func Register(w http.ResponseWriter, r *http.Request) {
	var userDto UserDto
	json.NewDecoder(r.Body).Decode(&userDto)

	ctx := context.Background()

	if userDto.Username == "" {
		respondwithJSON(w, http.StatusBadRequest, map[string]interface{}{
			"message": "Username is required.",
		})
		return
	}

	user := gubu(userDto.Username)

	if (user != User{}) {
		respondwithJSON(w, http.StatusBadRequest, map[string]interface{}{
			"message": "Username is already in use! Please choose a different username.",
		})
		return
	}

	if userDto.Password == "" {
		respondwithJSON(w, http.StatusBadRequest, map[string]interface{}{
			"message": "Please provide a password!",
		})
		return
	}

	newUser := User{
		Key:        uuid.New(),
		Username:   userDto.Username,
		Biography:  userDto.Biography,
		FirstName:  userDto.FirstName,
		LastName:   userDto.LastName,
		CreatedOn:  time.Now(),
		ModifiedOn: time.Now(),
	}

	userCol, err := graph.VertexCollection(ctx, "user")
	catch(err)

	_, err = userCol.CreateDocument(ctx, newUser)
	catch(err)

	_, err = createPassword(newUser.Key, []byte(userDto.Password))
	catch(err)

	respondwithJSON(w, http.StatusCreated, map[string]interface{}{
		"message": "successfully registered",
	})
}

// CreatePost for creating new posts
func CreatePost(w http.ResponseWriter, r *http.Request) {
	var postDto PostDto
	userID := chi.URLParam(r, "userId")

	json.NewDecoder(r.Body).Decode(&postDto)

	post := Post{
		Key:        uuid.New(),
		Title:      postDto.Title,
		Content:    postDto.Content,
		CreatedOn:  time.Now(),
		ModifiedOn: time.Now(),
	}

	if postDto.PublishedOn != "" {
		post.PublishedOn, _ = time.Parse("RFC3339", postDto.PublishedOn)
	}

	ctx := context.Background()
	col, err := graph.VertexCollection(ctx, "post")
	catch(err)

	meta, err := col.CreateDocument(ctx, post)
	catch(err)

	edge, _, err := graph.EdgeCollection(ctx, "written_by")
	catch(err)

	writtenBy := WrittenBy{
		From: meta.ID.String(),
		To:   "user/" + userID,
	}

	meta, err = edge.CreateDocument(ctx, writtenBy)
	catch(err)

	respondwithJSON(w, http.StatusCreated, map[string]interface{}{
		"ID": meta.Key,
	})
}

// AllPosts for getting all the posts for a user
func AllPosts(w http.ResponseWriter, r *http.Request) {
	userID, _ := uuid.Parse(chi.URLParam(r, "userId"))

	var postDtos []PostDto

	ctx := context.Background()
	query := "FOR p IN post FOR u IN 1..1 OUTBOUND p._id written_by FILTER u._key == @userId RETURN { \"Title\": p.Title, \"Content\": p.Content, \"ID\": p._key, \"PublishedOn\": p.PublishedOn, \"ModifiedOn\": p.ModifiedOn, \"AuthorId\": u._key }"
	bindVars := map[string]interface{}{
		"userId": userID,
	}

	cursor, err := db.Query(ctx, query, bindVars)
	catch(err)

	defer cursor.Close()
	for {
		var post PostDto
		_, err := cursor.ReadDocument(ctx, &post)
		if driver.IsNoMoreDocuments(err) {
			break
		} else {
			catch(err)
		}

		postDtos = append(postDtos, post)
	}

	respondwithJSON(w, http.StatusOK, postDtos)
}

// GetPostByID for getting a post by id by user
func GetPostByID(w http.ResponseWriter, r *http.Request) {
	id, _ := uuid.Parse(chi.URLParam(r, "id"))
	userID, _ := uuid.Parse(chi.URLParam(r, "userId"))

	postDto := gpbi(id, userID)

	respondwithJSON(w, http.StatusOK, postDto)
}

// UpdatePost for updating a post
func UpdatePost(w http.ResponseWriter, r *http.Request) {
	var postDto PostDto
	id, _ := uuid.Parse(chi.URLParam(r, "id"))
	userID, _ := uuid.Parse(chi.URLParam(r, "userId"))

	userPost := gpbi(id, userID)

	if (userPost == PostDto{}) {
		respondwithJSON(w, http.StatusBadRequest, map[string]string{
			"message": "no post for this user with the provided id is available",
		})
		return
	}

	json.NewDecoder(r.Body).Decode(&postDto)

	ctx := context.Background()
	posts, err := graph.VertexCollection(ctx, "post")
	catch(err)

	postPatch := map[string]interface{}{
		"ModifiedOn": time.Now(),
		"Title":      postDto.Title,
		"Content":    postDto.Content,
	}

	if postDto.PublishedOn != "" {
		postPatch["PublishedOn"], _ = time.Parse("RFC3339", postDto.PublishedOn)
	}

	meta, err := posts.UpdateDocument(ctx, id.String(), postPatch)
	catch(err)

	respondwithJSON(w, http.StatusOK, map[string]interface{}{
		"ID": meta.Key,
	})
}

// DeletePost for deleting a Post
func DeletePost(w http.ResponseWriter, r *http.Request) {
	id, _ := uuid.Parse(chi.URLParam(r, "id"))
	userID, _ := uuid.Parse(chi.URLParam(r, "userId"))

	userPost := gpbi(id, userID)
	if (userPost != PostDto{}) {
		respondwithJSON(w, http.StatusNoContent, map[string]string{"message": "successfully deleted"})
		return
	}

	ctx := context.Background()
	posts, err := graph.VertexCollection(ctx, "post")
	catch(err)

	_, err = posts.RemoveDocument(ctx, id.String())
	catch(err)

	respondwithJSON(w, http.StatusNoContent, map[string]string{"message": "successfully deleted"})
}

func gubi(id uuid.UUID) User {
	var user User

	ctx := context.Background()
	userCol, err := graph.VertexCollection(ctx, "user")
	catch(err)

	_, err = userCol.ReadDocument(ctx, id.String(), &user)
	catch(err)

	return user
}

func lastXPasswords(id uuid.UUID) []Password {
	top, err := strconv.ParseInt(os.Getenv("LAST_X_PASSWORD_COUNT"), 10, 32)
	if err != nil {
		top = 10
	}

	query := "FOR p, e IN 1..@top OUTBOUND 'user/@id' secured_by RETURN { _key: p._key, PasswordAndHash: p.PasswordAndHash, Current: e.Current, SecureKey: e._key }"
	bindVars := map[string]interface{}{
		"top": top,
		"id":  id,
	}

	cursor, ctx := getCursor(query, bindVars)

	var passwords []Password

	defer cursor.Close()
	for {
		var password Password
		_, err := cursor.ReadDocument(ctx, &password)
		if driver.IsNoMoreDocuments(err) {
			break
		} else {
			catch(err)
		}

		passwords = append(passwords, password)
	}

	return passwords
}

func hashAndSalt(password []byte) ([]byte, error) {
	hash, err := bcrypt.GenerateFromPassword(password, bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	return hash, nil
}

func gubu(username string) User {
	query := "FOR u IN user FILTER u.Username == @username RETURN { _key: u._key, FirstName: u.FirstName, LastName: u.LastName, Username: u.Username }"
	bindVars := map[string]interface{}{
		"username": username,
	}

	cursor, ctx := getCursor(query, bindVars)

	var user User

	defer cursor.Close()
	for {
		meta, err := cursor.ReadDocument(ctx, &user)
		if driver.IsNoMoreDocuments(err) {
			break
		} else {
			catch(err)
		}

		if (meta != driver.DocumentMeta{}) {
			// testing the metadata
		}
	}

	return user
}

func gpbi(id uuid.UUID, userID uuid.UUID) PostDto {
	query := "FOR p IN post FOR u IN 1..1 OUTBOUND p._id written_by FILTER p._key == @id and u._key == @userId RETURN { \"Title\": p.Title, \"Content\": p.Content, \"ID\": p._key, \"PublishedOn\": p.PublishedOn, \"ModifiedOn\": p.ModifiedOn, \"AuthorId\": u._key }"
	bindVars := map[string]interface{}{
		"id":     id,
		"userId": userID,
	}

	cursor, ctx := getCursor(query, bindVars)

	var post PostDto

	defer cursor.Close()
	for {
		meta, err := cursor.ReadDocument(ctx, &post)
		if driver.IsNoMoreDocuments(err) {
			break
		} else {
			catch(err)
		}

		if (meta != driver.DocumentMeta{}) {
			// testing the metadata
		}
	}

	return post
}

func getCursor(query string, bindVars map[string]interface{}) (driver.Cursor, context.Context) {
	ctx := context.Background()

	cursor, err := db.Query(ctx, query, bindVars)
	catch(err)

	return cursor, ctx
}

func querySingle(query string, bindVars map[string]interface{}, result interface{}) error {
	ctx := context.Background()

	cursor, err := db.Query(ctx, query, bindVars)
	if err != nil {
		return err
	}

	defer cursor.Close()
	for {
		_, err = cursor.ReadDocument(ctx, &result)
		if err != nil && !driver.IsNoMoreDocuments(err) {
			return err
		} else if driver.IsNoMoreDocuments(err) {
			break
		}
	}

	return nil
}

func updatePassword(id uuid.UUID, password []byte) error {
	ctx := context.Background()
	passwords := lastXPasswords(id)

	alreadyUsed := false
	var currentID string

	for _, element := range passwords {
		if passwordCompare(element.PasswordHashAndSalt, password) {
			alreadyUsed = true
			break
		}

		if element.Current {
			currentID = element.SecureKey
		}
	}

	if alreadyUsed {
		return errors.New("Password was already used, please try a different password")
	}

	sEdge, _, err := graph.EdgeCollection(ctx, "secured_by")
	if err != nil {
		return err
	}

	meta, err := createPassword(id, password)
	if err != nil {
		return err
	}

	_, err = sEdge.UpdateDocument(ctx, currentID, map[string]interface{}{
		"Current": false,
		"_from":   meta.ID,
	})
	if err != nil {
		return err
	}

	return nil
}

func passwordCompare(hashedPwd []byte, plainPwd []byte) bool {
	err := bcrypt.CompareHashAndPassword(hashedPwd, plainPwd)
	if err != nil {
		return false
	}

	return true
}

func createPassword(id uuid.UUID, password []byte) (driver.DocumentMeta, error) {
	emptyDocMeta := driver.DocumentMeta{}
	ctx := context.Background()
	sEdge, _, err := graph.EdgeCollection(ctx, "secured_by")
	if err != nil {
		return emptyDocMeta, err
	}

	pwdCol, err := graph.VertexCollection(ctx, "password")
	if err != nil {
		return emptyDocMeta, err
	}

	hashedPwd, err := hashAndSalt(password)
	if err != nil {
		return emptyDocMeta, err
	}

	pwd := map[string]interface{}{
		"PasswordHashAndSalt": hashedPwd,
		"CreatedOn":           time.Now(),
	}
	meta, err := pwdCol.CreateDocument(ctx, pwd)
	if err != nil {
		return emptyDocMeta, err
	}

	_, err = sEdge.CreateDocument(ctx, map[string]interface{}{
		"_to":     meta.ID,
		"_from":   "user/" + id.String(),
		"Current": true,
	})

	return meta, err
}
