package posts

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"time"

	"github.com/go-chi/chi"
	"github.com/google/uuid"
	"github.com/killyosaur/ishara/ishara.admin.api/controllers"
	"github.com/killyosaur/ishara/ishara.admin.api/data"
)

// UpdatePostDto ...
type UpdatePostDto struct {
	Title       string `json:"title"`
	Content     string `json:"content"`
	PublishedOn string `json:"publishedOn,omitempty"`
}

// Update ...
func Update(dbDriver *data.Driver) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var postDto UpdatePostDto
		postID, _ := uuid.Parse(chi.URLParam(r, "id"))
		userID := r.Context().Value(UserKey("user")).(uuid.UUID)
		json.NewDecoder(r.Body).Decode(&postDto)

		err := updatePost(dbDriver, userID, postID, postDto)
		if err != nil {
			controllers.BadRequest(w, err.Error())
			return
		}

		controllers.OK(w, map[string]interface{}{
			"ID": userID.String(),
		})
	}
}

func updatePost(dbDriver *data.Driver, userID uuid.UUID, postID uuid.UUID, postDto UpdatePostDto) error {
	if !checkForPost(dbDriver, userID, postID) {
		return errors.New("no post for this user with the provided id is available")
	}

	ctx := context.Background()
	posts, err := dbDriver.VertexCollection(ctx, "post")
	if err != nil {
		return err
	}

	postPatch := map[string]interface{}{
		"ModifiedOn": time.Now(),
		"Title":      postDto.Title,
		"Content":    postDto.Content,
	}

	if postDto.PublishedOn != "" {
		postPatch["PublishedOn"] = postDto.PublishedOn
	}

	_, err = posts.UpdateDocument(ctx, postID.String(), postPatch)
	if err != nil {
		return err
	}

	return nil
}

func checkForPost(dbDriver *data.Driver, userID uuid.UUID, postID uuid.UUID) bool {
	query := "FOR p IN post FOR u IN 1..1 OUTBOUND p._id written_by FILTER p._key == @id and u._key == @userId RETURN { \"Title\": p.Title, \"Content\": p.Content, \"ID\": p._key, \"PublishedOn\": p.PublishedOn, \"ModifiedOn\": p.ModifiedOn, \"AuthorId\": u._key }"
	bindVars := map[string]interface{}{
		"id":     postID.String(),
		"userId": userID.String(),
	}

	ctx := context.Background()

	cursor := dbDriver.QueryWithCount(ctx, query, bindVars)
	defer cursor.Close()

	return cursor.Count() > 0
}
