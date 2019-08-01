package post

import (
	"context"

	"github.com/google/uuid"

	"../data"
	"../models"
)

func getPost(dbDriver *data.DriverData, postID uuid.UUID) (*models.PostDto, error) {
	var postDto *models.PostDto

	query := "FOR p IN post FOR u IN 1..1 OUTBOUND p._id written_by FILTER DATE_TIMESTAMP(p.publishedOn) >= DATE_NOW() AND p._key == @postID RETURN { \"title\": p.Title, \"content\": p.Content, \"id\": p._key, \"publishedOn\": p.PublishedOn, \"modifiedOn\": p.ModifiedOn, \"author\": { \"username\": u.username, \"firstName\": u.firstName, \"lastName\": u.lastName} }"
	bindVars := map[string]interface{}{
		"postID": postID.String(),
	}
	ctx := context.Background()

	cursor, _ := dbDriver.Database.Query(ctx, query, bindVars)

	defer cursor.Close()
	for {
		_, err := cursor.ReadDocument(ctx, postDto)
		if dbDriver.IsNoMoreDocuments(err) {
			break
		} else if err != nil {
			panic(err)
		}
	}

	return postDto, nil
}
