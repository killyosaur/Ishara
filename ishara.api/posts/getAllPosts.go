package posts

import (
	"context"

	"../data"
	"../models"
)

func getAllPosts(dbDriver *data.DriverData, limit int64, page int64) ([]*models.PostDto, error) {
	var postDtos []*models.PostDto

	query := "FOR p IN post FOR u IN 1..1 OUTBOUND p._id written_by FILTER DATE_TIMESTAMP(p.publishedOn) >= DATE_NOW() "

	if limit > 0 {
		skipAndLimit := string(limit)
		if page > 1 {
			skipAndLimit = string(page*limit) + "," + skipAndLimit
		}
		query = query + "LIMIT " + skipAndLimit + " "
	}

	query = query + "RETURN { \"title\": p.Title, \"content\": p.Content, \"id\": p._key, \"publishedOn\": p.PublishedOn, \"modifiedOn\": p.ModifiedOn, \"author\": { \"username\": u.username, \"firstName\": u.firstName, \"lastName\": u.lastName} }"
	ctx := context.Background()

	cursor, _ := dbDriver.Database.Query(ctx, query, nil)

	defer cursor.Close()
	for {
		var post models.PostDto
		_, err := cursor.ReadDocument(ctx, &post)
		if dbDriver.IsNoMoreDocuments(err) {
			break
		} else if err != nil {
			panic(err)
		}

		postDtos = append(postDtos, &post)
	}

	return postDtos, nil
}
