package users

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"time"

	"github.com/google/uuid"

	"github.com/killyosaur/ishara/ishara.admin.api/controllers"
	"github.com/killyosaur/ishara/ishara.admin.api/data"
)

// CreateUserDto ...
type CreateUserDto struct {
	ID        uuid.UUID `json:"id"`
	Username  string    `json:"username"`
	FirstName string    `json:"firstName"`
	LastName  string    `json:"lastName"`
	Password  string    `json:"password"`
	Biography string    `json:"bio"`
}

// CreateUser for getting the user data from the database
type CreateUser struct {
	Key        uuid.UUID `json:"_key"`
	Username   string
	FirstName  string
	LastName   string
	Biography  string
	CreatedOn  time.Time
	ModifiedOn time.Time
}

// Create ...
func Create(dbDriver *data.Driver) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var userDto CreateUserDto
		json.NewDecoder(r.Body).Decode(&userDto)

		key, err := createUser(dbDriver, userDto)

		if err != nil {
			controllers.BadRequest(w, err.Error())
		} else {
			controllers.Created(w, key)
		}
	}
}

// CreateRootUser ...
func CreateRootUser(dbDriver *data.Driver) string {
	ctx := context.Background()

	if userNameExists(ctx, dbDriver, "root") {
		return ""
	}

	password := GeneratePassword()

	newUser := CreateUserDto{
		Username:  "root",
		Biography: "The First User",
		FirstName: "Root",
		LastName:  "User",
		Password:  password,
	}

	createUser(dbDriver, newUser)

	return password
}

func createUser(dbDriver *data.Driver, userDto CreateUserDto) (uuid.UUID, error) {
	ctx := context.Background()

	if userDto.Username == "" {
		return uuid.UUID{}, errors.New("username is required")
	}

	if userNameExists(ctx, dbDriver, userDto.Username) {
		return uuid.UUID{}, errors.New("username is already in use")
	}

	if userDto.Password == "" {
		return uuid.UUID{}, errors.New("password not provided")
	}

	newUser := CreateUser{
		Key:        uuid.New(),
		Username:   userDto.Username,
		Biography:  userDto.Biography,
		FirstName:  userDto.FirstName,
		LastName:   userDto.LastName,
		CreatedOn:  time.Now(),
		ModifiedOn: time.Now(),
	}

	userCol, err := dbDriver.VertexCollection(ctx, "user")
	if err != nil {
		return uuid.UUID{}, err
	}

	_, err = userCol.CreateDocument(ctx, newUser)
	if err != nil {
		return uuid.UUID{}, err
	}

	_, err = CreatePassword(ctx, dbDriver, newUser.Key, userDto.Password)
	if err != nil {
		return uuid.UUID{}, err
	}

	return newUser.Key, nil
}

func userNameExists(ctx context.Context, dbDriver *data.Driver, username string) bool {
	query := "FOR u IN user FILTER u.Username == @username RETURN u._key"
	bindVars := map[string]interface{}{
		"username": username,
	}

	cursor := dbDriver.QueryWithCount(ctx, query, bindVars)

	defer cursor.Close()
	return cursor.Count() > 0
}
