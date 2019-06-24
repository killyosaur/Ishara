package users

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/go-chi/chi"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"

	"../controllers"
	"../data"
)

// UpdateUserDto ...
type UpdateUserDto struct {
	ID        uuid.UUID `json:"id"`
	Username  string    `json:"username"`
	FirstName string    `json:"firstName"`
	LastName  string    `json:"lastName"`
	Password  string    `json:"password"`
	Biography string    `json:"bio"`
}

// UpdateUser ...
type UpdateUser struct {
	Key      uuid.UUID `json:"_key"`
	Username string
}

// Password ...
type Password struct {
	SecureKey           string
	Current             bool
	PasswordHashAndSalt []byte
}

// Update ...
func Update(dbDriver *data.Driver) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id, _ := uuid.Parse(chi.URLParam(r, "id"))

		var userDto UpdateUserDto
		json.NewDecoder(r.Body).Decode(&userDto)

		key, err := userUpdate(dbDriver, id, userDto)

		if err != nil {
			controllers.BadRequest(w, err.Error())
		} else {
			controllers.OK(w, map[string]interface{}{
				"ID": key,
			})
		}
	}
}

func userUpdate(dbDriver *data.Driver, id uuid.UUID, userDto UpdateUserDto) (string, error) {
	ctx := context.Background()
	patch := map[string]interface{}{
		"FirstName":  userDto.FirstName,
		"LastName":   userDto.LastName,
		"ModifiedOn": time.Now(),
	}

	if userDto.Biography != "" {
		patch["Biography"] = userDto.Biography
	}

	user := getByUsername(ctx, dbDriver, userDto.Username)
	emptyUser := UpdateUser{}

	if (user != emptyUser) && (user.Key != id) {
		return "", errors.New("username is already in use")
	} else if user == emptyUser {
		patch["Username"] = userDto.Username
	}

	if userDto.Password != "" {
		err := updatePassword(ctx, dbDriver, id, userDto.Password)

		if err != nil {
			return "", err
		}
	}

	userCol, err := dbDriver.VertexCollection(ctx, "user")
	if err != nil {
		return "", err
	}

	meta, err := userCol.UpdateDocument(ctx, id.String(), patch)
	if err != nil {
		return "", err
	}

	return meta.Key, nil
}

func getByUsername(ctx context.Context, dbDriver *data.Driver, username string) UpdateUser {
	query := "FOR u IN user FILTER u.Username == @username RETURN { _key: u._key, Username: u.Username }"
	bindVars := map[string]interface{}{
		"username": username,
	}

	cursor := dbDriver.Query(ctx, query, bindVars)

	var user UpdateUser

	defer cursor.Close()
	for {
		_, err := cursor.ReadDocument(ctx, &user)
		if dbDriver.IsNoMoreDocuments(err) {
			break
		}
	}

	return user
}

func updatePassword(ctx context.Context, dbDriver *data.Driver, id uuid.UUID, password string) error {
	passwords, err := getAllPasswords(ctx, dbDriver, id)

	if err != nil {
		return err
	}

	currentSecureID, err := checkPassword(passwords, password)

	if err != nil {
		return err
	}

	sEdge, _, err := dbDriver.EdgeCollection(ctx, "secured_by")
	if err != nil {
		return err
	}

	passwordID, err := CreatePassword(ctx, dbDriver, id, password)
	if err != nil {
		return err
	}

	_, err = sEdge.UpdateDocument(ctx, currentSecureID, map[string]interface{}{
		"Current": false,
		"_from":   passwordID,
	})

	return err
}

func checkPassword(passwords []Password, password string) (string, error) {
	alreadyUsed := false
	var currentSecureID string

	for _, element := range passwords {
		plainPwdEncoded := []byte(password)
		err := bcrypt.CompareHashAndPassword(element.PasswordHashAndSalt, plainPwdEncoded)

		if err == nil {
			alreadyUsed = true
			break
		}

		if element.Current {
			currentSecureID = element.SecureKey
		}
	}

	if alreadyUsed {
		return "", errors.New("Password was already used, please try a different password")
	}

	return currentSecureID, nil
}

func getAllPasswords(ctx context.Context, dbDriver *data.Driver, id uuid.UUID) ([]Password, error) {

	pwdCount, _ := strconv.ParseInt(os.Getenv("LAST_X_PASSWORD_COUNT"), 10, 32)

	if pwdCount <= 0 {
		pwdCount = 10
	}

	query := "FOR p, e IN 1..@pwdCount OUTBOUND @uid secured_by RETURN { PasswordAndHash: p.PasswordAndHash, Current: e.Current, SecureKey: e._key }"
	bindVars := map[string]interface{}{
		"pwdCount": pwdCount,
		"uid":      "user/" + id.String(),
	}

	if ctx == nil {
		ctx = context.Background()
	}

	cursor := dbDriver.Query(ctx, query, bindVars)

	var passwords []Password

	defer cursor.Close()
	for {
		var password Password
		_, err := cursor.ReadDocument(ctx, &password)
		if dbDriver.IsNoMoreDocuments(err) {
			break
		} else if err != nil {
			return nil, err
		}

		passwords = append(passwords, password)
	}

	return passwords, nil
}
