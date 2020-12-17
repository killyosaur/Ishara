package posts

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"github.com/google/uuid"

	"github.com/killyosaur/ishara/ishara.admin.api/controllers"
	"github.com/killyosaur/ishara/ishara.admin.api/data"
)

// CreatePostDto ...
type CreatePostDto struct {
	Title       string `json:"title"`
	Content     string `json:"content"`
	PublishedOn string `json:"publishedOn,omitempty"`
}

// CreatePost ...
type CreatePost struct {
	Key         uuid.UUID `json:"_key"`
	Title       string
	Content     string
	CreatedOn   time.Time
	ModifiedOn  time.Time
	PublishedOn string `json:"PublishedOn,omitempty"`
}

// Create ...
func Create(dbDriver *data.Driver) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var postDto CreatePostDto
		userID := r.Context().Value(UserKey("user")).(uuid.UUID)

		json.NewDecoder(r.Body).Decode(&postDto)

		key, err := createPost(dbDriver, userID, postDto)
		if err != nil {
			controllers.BadRequest(w, err.Error())
			return
		}

		controllers.Created(w, map[string]interface{}{
			"ID": key,
		})
	}
}

func createPost(dbDriver *data.Driver, userID uuid.UUID, postDto CreatePostDto) (string, error) {
	post := CreatePost{
		Key:        uuid.New(),
		Title:      postDto.Title,
		Content:    postDto.Content,
		CreatedOn:  time.Now(),
		ModifiedOn: time.Now(),
	}

	if postDto.PublishedOn != "" {
		post.PublishedOn = postDto.PublishedOn
	}

	ctx := context.Background()
	col, err := dbDriver.VertexCollection(ctx, "post")
	if err != nil {
		return "", err
	}

	meta, err := col.CreateDocument(ctx, post)
	if err != nil {
		return "", err
	}

	edge, _, err := dbDriver.EdgeCollection(ctx, "written_by")
	if err != nil {
		return "", err
	}

	writtenBy := map[string]string{
		"_from": meta.ID.String(),
		"_to":   "user/" + userID.String(),
	}

	_, err = edge.CreateDocument(ctx, writtenBy)
	if err != nil {
		return "", err
	}

	return meta.Key, nil
}
