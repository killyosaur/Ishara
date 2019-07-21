package users

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/go-chi/jwtauth"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"

	"../controllers"
	"../data"
)

// AuthenticateUserDto For retrieving data from the client
type AuthenticateUserDto struct {
	ID        uuid.UUID `json:"id"`
	Username  string    `json:"username"`
	FirstName string    `json:"firstName"`
	LastName  string    `json:"lastName"`
	IsAdmin   bool      `json:"isAdmin"`
	Token     string    `json:"token"`
}

// Authenticate ...
func Authenticate(auth *jwtauth.JWTAuth, dbDriver *data.Driver) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var userDto map[string]string
		json.NewDecoder(r.Body).Decode(&userDto)

		resultDto, err := authenticateService(userDto, auth, dbDriver)

		if err != nil {
			controllers.Unauthorized(w, err.Error())
		} else {
			controllers.OK(w, resultDto)
		}
	}
}

func authenticateService(userDto map[string]string, auth *jwtauth.JWTAuth, dbDriver *data.Driver) (interface{}, error) {
	if userDto["username"] == "" || userDto["password"] == "" {
		return AuthenticateUserDto{}, usernameOrPasswordException()
	}

	username := userDto["username"]
	password := userDto["password"]

	ctx := context.Background()
	user := getUser(ctx, dbDriver, username)

	if (user == AuthenticateUserDto{}) {
		return nil, usernameOrPasswordException()
	}

	pass, _ := getPassword(ctx, dbDriver, user.ID)

	plainPwdEncoded := []byte(password)
	err := bcrypt.CompareHashAndPassword(pass.PasswordHashAndSalt, plainPwdEncoded)

	if pass == nil || err != nil {
		return nil, usernameOrPasswordException()
	}

	claim := jwt.MapClaims{
		"Username": username,
		"UserID":   user.ID,
	}

	token, err := getEncodedToken(auth, claim, time.Hour)

	if err != nil {
		return AuthenticateUserDto{}, err
	}

	user.Token = token

	return user, nil
}

func getEncodedToken(auth *jwtauth.JWTAuth, claim jwt.MapClaims, expiry time.Duration) (string, error) {
	jwtauth.SetExpiryIn(claim, expiry)

	_, token, err := auth.Encode(claim)

	if err != nil {
		return "", err
	}

	return token, nil
}

func getUser(ctx context.Context, dbDriver *data.Driver, username string) AuthenticateUserDto {
	query := "FOR u IN user FOR a IN 1..1 OUTBOUND u._id accessed_as FILTER u.Username == @username RETURN { id: u._key, firstName: u.FirstName, lastName: u.LastName, username: u.Username, isAdmin: a.Type == 'Administrator' }"
	bindVars := map[string]interface{}{
		"username": username,
	}

	cursor := dbDriver.Query(ctx, query, bindVars)

	var user AuthenticateUserDto

	defer cursor.Close()
	for {
		_, err := cursor.ReadDocument(ctx, &user)
		if dbDriver.IsNoMoreDocuments(err) {
			break
		}
	}

	return user
}

func usernameOrPasswordException() error {
	return errors.New("username or password is incorrect")
}

func getPassword(ctx context.Context, dbDriver *data.Driver, id uuid.UUID) (*password, error) {
	query := "FOR p, s IN 1..1 OUTBOUND @uid secured_by FILTER s.Current == true RETURN { _key: p._key, PasswordHashAndSalt: p.PasswordHashAndSalt, Current: s.Current, SecureKey: s._key }"
	bindVars := map[string]interface{}{
		"uid": "user/" + id.String(),
	}

	if ctx == nil {
		ctx = context.Background()
	}

	cursor := dbDriver.Query(ctx, query, bindVars)

	var pass *password

	defer cursor.Close()
	for {
		_, err := cursor.ReadDocument(ctx, &pass)
		if dbDriver.IsNoMoreDocuments(err) {
			break
		} else if err != nil {
			return nil, err
		}
	}

	return pass, nil
}

type password struct {
	Key                 string `json:"_key"`
	PasswordHashAndSalt []byte
	Current             bool
	SecureKey           string
}
