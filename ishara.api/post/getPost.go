package post

import (
	"context"

	"github.com/google/uuid"

	"github.com/killyosaur/ishara/ishara.api/data"
	"github.com/killyosaur/ishara/ishara.api/models"
)

func getPost(dbDriver *data.DriverData, postID uuid.UUID) (*models.PostDto, error) {
	var postDto models.PostDto

	query := "FOR p IN post FOR u IN 1..1 OUTBOUND p._id written_by FILTER HAS(p, \"PublishedOn\") AND DATE_TIMESTAMP(p.PublishedOn) <= DATE_NOW() AND p._key == @postID RETURN { \"title\": p.Title, \"content\": p.Content, \"id\": p._key, \"publishedOn\": p.PublishedOn, \"modifiedOn\": p.ModifiedOn, \"author\": { \"username\": u.Username, \"firstName\": u.FirstName, \"lastName\": u.LastName} }"
	bindVars := map[string]interface{}{
		"postID": postID.String(),
	}
	ctx := context.Background()

	cursor, _ := dbDriver.Database.Query(ctx, query, bindVars)

	defer cursor.Close()
	for {
		_, err := cursor.ReadDocument(ctx, &postDto)
		if dbDriver.IsNoMoreDocuments(err) {
			break
		} else if err != nil {
			panic(err)
		}
	}

	return &postDto, nil
}
