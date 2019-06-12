package controllers

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi"
	"github.com/go-chi/jwtauth"
	"github.com/google/uuid"

	"../models"
	"../services"
)

// UserController ...
type UserController struct {
	userService *services.UserService
}

// NewUserController ...
func NewUserController(userService *services.UserService) *UserController {
	return &UserController{
		userService: userService,
	}
}

// ContextMiddleware ...
func (userController UserController) ContextMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		_, claims, _ := jwtauth.FromContext(r.Context())

		_, err := userController.userService.GetByID(claims["UserID"].(uuid.UUID))

		if err != nil {
			panic(err)
		}
	})
}

// Authenticate ...
func (userController UserController) Authenticate(w http.ResponseWriter, r *http.Request) {
	var userDto models.UserDto
	json.NewDecoder(r.Body).Decode(&userDto)

	resultDto, err := userController.userService.Authenticate(userDto)

	if err != nil {
		Unauthorized(w, err.Error())
	} else {
		OK(w, resultDto)
	}
}

// Register ...
func (userController UserController) Register(w http.ResponseWriter, r *http.Request) {
	var userDto models.UserDto
	json.NewDecoder(r.Body).Decode(&userDto)

	key, err := userController.userService.Register(userDto)

	if err != nil {
		BadRequest(w, err.Error())
	} else {
		Created(w, key)
	}
}

// Update ...
func (userController UserController) Update(w http.ResponseWriter, r *http.Request) {
	id, _ := uuid.Parse(chi.URLParam(r, "id"))

	var userDto models.UserDto
	json.NewDecoder(r.Body).Decode(&userDto)

	key, err := userController.userService.Update(id, userDto)

	if err != nil {
		BadRequest(w, err.Error())
	} else {
		OK(w, map[string]interface{}{
			"ID": key,
		})
	}
}

// Delete ...
func (userController UserController) Delete(w http.ResponseWriter, r *http.Request) {
	id, _ := uuid.Parse(chi.URLParam(r, "id"))

	err := userController.userService.Delete(id)

	if err != nil {
		BadRequest(w, err.Error())
	} else {
		NoContent(w)
	}
}

// All ...
func (userController UserController) All(w http.ResponseWriter, r *http.Request) {
	allUsers, err := userController.userService.All()

	if err != nil {
		BadRequest(w, err.Error())
	} else {
		OK(w, allUsers)
	}
}
