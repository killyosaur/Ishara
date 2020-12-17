package posts

import (
	"context"
	"net/http"
	"strconv"
	"time"

	"github.com/google/uuid"

	"github.com/killyosaur/ishara/ishara.admin.api/controllers"
	"github.com/killyosaur/ishara/ishara.admin.api/data"
)

// GetPostDto ...
type GetPostDto struct {
	ID          uuid.UUID `json:"id"`
	Title       string    `json:"title"`
	Content     string    `json:"content"`
	AuthorID    uuid.UUID `json:"authorId"`
	PublishedOn string    `json:"publishedOn,omitempty"`
	ModifiedOn  time.Time `json:"modifiedOn"`
}

// Get ...
func Get(dbDriver *data.Driver) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID := r.Context().Value(UserKey("user")).(uuid.UUID)

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

		postDtos, err := getAllPosts(dbDriver, userID, limit, page)
		if err != nil {
			controllers.BadRequest(w, err.Error())
			return
		}

		controllers.OK(w, postDtos)
	}
}

func getAllPosts(dbDriver *data.Driver, userID uuid.UUID, limit int64, page int64) ([]*GetPostDto, error) {
	var postDtos []*GetPostDto

	query := "FOR p IN post FOR u IN 1..1 OUTBOUND p._id written_by FILTER u._key == @userId "

	if limit > 0 {
		skipAndLimit := string(limit)
		if page > 1 {
			skipAndLimit = string(page*limit) + "," + skipAndLimit
		}
		query = query + "LIMIT " + skipAndLimit + " "
	}

	query = query + "RETURN { \"title\": p.Title, \"content\": p.Content, \"id\": p._key, \"publishedOn\": p.PublishedOn, \"modifiedOn\": p.ModifiedOn, \"authorId\": u._key }"
	bindVars := map[string]interface{}{
		"userId": userID,
	}
	ctx := context.Background()

	cursor := dbDriver.Query(ctx, query, bindVars)

	defer cursor.Close()
	for {
		var post GetPostDto
		_, err := cursor.ReadDocument(ctx, &post)
		if dbDriver.IsNoMoreDocuments(err) {
			break
		}

		postDtos = append(postDtos, &post)
	}

	return postDtos, nil
}
