package services

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"

	"../data"
	"../models"
	"../models/entities"
)

// UserService ...
type UserService struct {
	dbConn          *data.Driver
	passwordService *PasswordService
	tokenService    *TokenService
}

// NewUserService ...
func NewUserService(dbConn *data.Driver, passwordService PasswordService, tokenService TokenService) *UserService {
	res := UserService{
		dbConn:          dbConn,
		passwordService: &passwordService,
		tokenService:    &tokenService,
	}

	return &res
}

// GetByID for getting the user by id
func (userService *UserService) GetByID(id uuid.UUID) (models.UserDto, error) {
	var user entities.User

	ctx := context.Background()
	userCol, err := userService.dbConn.VertexCollection(ctx, "user")
	if err != nil {
		return models.UserDto{}, err
	}

	_, err = userCol.ReadDocument(ctx, id.String(), &user)
	if err != nil {
		return models.UserDto{}, err
	}

	return models.UserDto{
		ID:        user.Key,
		Username:  user.Username,
		FirstName: user.FirstName,
		LastName:  user.LastName,
		Biography: user.Biography,
	}, nil
}

// All for getting all the users
func (userService *UserService) All() ([]models.UserDto, error) {
	query := "FOR u IN user RETURN { \"id\": u._key, \"firstName\": u.FirstName, \"lastName\": u.LastName, \"username\": u.Username, \"bio\": u.Biography }"
	var allUsers []models.UserDto
	ctx := context.Background()

	cursor := userService.dbConn.GetCursor(ctx, query, nil)

	defer cursor.Close()
	for {
		item := models.UserDto{}

		_, err := cursor.ReadDocument(ctx, &item)
		if userService.dbConn.IsNoMoreDocuments(err) {
			break
		} else if err != nil {
			return nil, err
		}

		allUsers = append(allUsers, item)
	}

	return allUsers, nil
}

// Update for updating a user
func (userService *UserService) Update(id uuid.UUID, userDto models.UserDto) (string, error) {
	ctx := context.Background()
	patch := map[string]interface{}{
		"FirstName":  userDto.FirstName,
		"LastName":   userDto.LastName,
		"ModifiedOn": time.Now(),
	}

	if userDto.Biography != "" {
		patch["Biography"] = userDto.Biography
	}

	user := getByUsername(ctx, userService.dbConn, userDto.Username)
	emptyUser := entities.User{}

	if (user != emptyUser) && (user.Key != id) {
		return "", usernameInUseException()
	} else if user == emptyUser {
		patch["Username"] = userDto.Username
	}

	if userDto.Password != "" {
		err := userService.passwordService.Update(ctx, id, userDto.Password)

		if err != nil {
			return "", err
		}
	}

	userCol, err := userService.dbConn.VertexCollection(ctx, "user")
	if err != nil {
		return "", err
	}

	meta, err := userCol.UpdateDocument(ctx, id.String(), patch)
	if err != nil {
		return "", err
	}

	return meta.Key, nil
}

// Delete delete a user
func (userService *UserService) Delete(id uuid.UUID) error {
	ctx := context.Background()
	patch := map[string]interface{}{
		"Biography": "",
		"LastName":  "DELETED",
		"InActive":  true,
	}

	userCol, err := userService.dbConn.VertexCollection(ctx, "user")
	if err != nil {
		return err
	}

	_, err = userCol.UpdateDocument(ctx, id.String(), patch)
	if err != nil {
		return err
	}

	return nil
}

// Authenticate for auth results of a user
func (userService *UserService) Authenticate(userDto models.UserDto) (models.UserDto, error) {
	if userDto.Username == "" || userDto.Password == "" {
		return models.UserDto{}, usernameOrPasswordException()
	}

	ctx := context.Background()
	user := getByUsername(ctx, userService.dbConn, userDto.Username)

	pass, _ := userService.passwordService.Get(ctx, user.Key)

	if pass == nil || !userService.passwordService.Compare(pass.PasswordHashAndSalt, userDto.Password) {
		return models.UserDto{}, usernameOrPasswordException()
	}

	token, err := userService.tokenService.Encode(map[string]interface{}{
		"Username": user.Username,
		"UserID":   user.Key,
	}, time.Hour)

	if err != nil {
		return models.UserDto{}, err
	}

	return models.UserDto{
		ID:        user.Key,
		Username:  user.Username,
		FirstName: user.FirstName,
		LastName:  user.LastName,
		Token:     token,
	}, nil
}

// Register for creating new users (for now)
func (userService *UserService) Register(userDto models.UserDto) (uuid.UUID, error) {
	ctx := context.Background()

	if userDto.Username == "" {
		return uuid.UUID{}, errors.New("username is required")
	}

	user := getByUsername(ctx, userService.dbConn, userDto.Username)

	if (user != entities.User{}) {
		return uuid.UUID{}, usernameInUseException()
	}

	if userDto.Password == "" {
		return uuid.UUID{}, errors.New("password not provided")
	}

	newUser := entities.User{
		Key:        uuid.New(),
		Username:   userDto.Username,
		Biography:  userDto.Biography,
		FirstName:  userDto.FirstName,
		LastName:   userDto.LastName,
		CreatedOn:  time.Now(),
		ModifiedOn: time.Now(),
	}

	userCol, err := userService.dbConn.VertexCollection(ctx, "user")
	if err != nil {
		return uuid.UUID{}, err
	}

	_, err = userCol.CreateDocument(ctx, newUser)
	if err != nil {
		return uuid.UUID{}, err
	}

	_, err = userService.passwordService.Create(ctx, newUser.Key, userDto.Password)
	if err != nil {
		return uuid.UUID{}, err
	}

	return newUser.Key, nil
}

func getByUsername(ctx context.Context, dbDriver *data.Driver, username string) entities.User {
	query := "FOR u IN user FILTER u.Username == @username RETURN { _key: u._key, FirstName: u.FirstName, LastName: u.LastName, Username: u.Username }"
	bindVars := map[string]interface{}{
		"username": username,
	}

	cursor := dbDriver.GetCursor(ctx, query, bindVars)

	var user entities.User

	defer cursor.Close()
	for {
		_, err := cursor.ReadDocument(ctx, &user)
		if dbDriver.IsNoMoreDocuments(err) {
			break
		}
	}

	return user
}

func usernameInUseException() error {
	return errors.New("username is already in use")
}

func usernameOrPasswordException() error {
	return errors.New("username or password is incorrect")
}
