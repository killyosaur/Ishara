package posts

import (
	"context"
	"net/http"

	"github.com/go-chi/chi"
	"github.com/google/uuid"

	"../controllers"
	"../data"
)

// TODO: at some point need to check if the author is not the only author so that
// the other author has a chance to verify that the delete is valid

// Delete ...
func Delete(dbDriver *data.Driver) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		postID, _ := uuid.Parse(chi.URLParam(r, "id"))
		userID := r.Context().Value(UserKey("user")).(uuid.UUID)

		err := deletePost(dbDriver, userID, postID)
		if err != nil {
			controllers.BadRequest(w, err.Error())
			return
		}

		controllers.NoContent(w)
	}
}

func deletePost(dbDriver *data.Driver, userID uuid.UUID, postID uuid.UUID) error {
	if !checkIfPostExists(dbDriver, userID, postID) {
		return nil
	}

	ctx := context.Background()
	posts, err := dbDriver.VertexCollection(ctx, "post")
	if err != nil {
		return err
	}

	_, err = posts.RemoveDocument(ctx, postID.String())
	if err != nil {
		return err
	}

	return nil
}

func checkIfPostExists(dbDriver *data.Driver, userID uuid.UUID, postID uuid.UUID) bool {
	query := "FOR p IN post FOR u IN 1..1 OUTBOUND p._id written_by FILTER p._key == @id and u._key == @userId RETURN { \"Title\": p.Title, \"Content\": p.Content, \"ID\": p._key, \"PublishedOn\": p.PublishedOn, \"ModifiedOn\": p.ModifiedOn, \"AuthorId\": u._key }"
	bindVars := map[string]interface{}{
		"id":     postID,
		"userId": userID,
	}

	ctx := context.Background()
	cursor := dbDriver.QueryWithCount(ctx, query, bindVars)

	return cursor.Count() > 0
}
