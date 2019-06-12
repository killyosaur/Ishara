package controllers

import (
	"context"
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi"
	"github.com/go-chi/jwtauth"
	"github.com/google/uuid"

	driver "github.com/arangodb/go-driver"

	"../models"
	"../services"
)

type userKey string

// PostController ...
type PostController struct {
	postService *services.PostService
	userService *services.UserService
}

// NewPostController ...
func NewPostController(postService *services.PostService, userService *services.UserService) *PostController {
	return &PostController{
		userService: userService,
		postService: postService,
	}
}

// ContextMiddleware ...
func (postController *PostController) ContextMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		userID, _ := uuid.Parse(chi.URLParam(r, "userId"))
		user, err := postController.userService.GetByID(userID)
		_, claims, _ := jwtauth.FromContext(r.Context())

		if (user == models.UserDto{}) || err != nil || claims["UserID"].(uuid.UUID) != user.ID {
			BadRequest(w, "failed to find requested user")
			return
		}

		ctx := context.WithValue(r.Context(), userKey("user"), user)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// Create ...
func (postController *PostController) Create(w http.ResponseWriter, r *http.Request) {
	var postDto models.PostDto
	user := r.Context().Value(userKey("user")).(models.UserDto)

	json.NewDecoder(r.Body).Decode(&postDto)

	key, err := postController.postService.Create(user, postDto)
	if err != nil {
		errResponse(w, err)
		return
	}

	Created(w, map[string]interface{}{
		"ID": key,
	})
}

// All ...
func (postController *PostController) All(w http.ResponseWriter, r *http.Request) {
	user := r.Context().Value(userKey("user")).(models.UserDto)

	pageValue, okP := r.URL.Query()["offset"]
	limitValue, okL := r.URL.Query()["limit"]

	limit := int64(0)
	page := int64(0)

	if okP && len(pageValue[0]) > 0 {
		page, _ = strconv.ParseInt(pageValue[0], 10, 64)
	}

	if okL && len(limitValue[0]) > 0 {
		limit, _ = strconv.ParseInt(limitValue[0], 10, 64)
	}

	postDtos, err := postController.postService.All(user, limit, page)
	if err != nil {
		errResponse(w, err)
		return
	}

	OK(w, postDtos)
}

// Update ...
func (postController *PostController) Update(w http.ResponseWriter, r *http.Request) {
	var postDto models.PostDto
	id, _ := uuid.Parse(chi.URLParam(r, "id"))
	user := r.Context().Value(userKey("user")).(models.UserDto)
	json.NewDecoder(r.Body).Decode(&postDto)

	key, err := postController.postService.Update(user, id, postDto)
	if err != nil {
		errResponse(w, err)
		return
	}

	OK(w, map[string]interface{}{
		"ID": key,
	})
}

// Delete ...
func (postController *PostController) Delete(w http.ResponseWriter, r *http.Request) {
	id, _ := uuid.Parse(chi.URLParam(r, "id"))
	user := r.Context().Value(userKey("user")).(models.UserDto)

	err := postController.postService.Delete(user, id)
	if err != nil {
		errResponse(w, err)
		return
	}

	NoContent(w)
}

func errResponse(w http.ResponseWriter, err error) {
	if _, ok := err.(driver.ArangoError); ok {
		panic(err)
	} else {
		BadRequest(w, err.Error())
	}
}
