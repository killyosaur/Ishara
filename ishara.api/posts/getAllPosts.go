package posts

import (
	"context"

	"../data"
	"../models"
)

func getAllPosts(dbDriver *data.DriverData, limit int64, page int64) (*models.PostsDto, error) {
	var postDtos []models.PostDto

	countQuery := "RETURN LENGTH(FOR p IN post FOR u IN 1..1 OUTBOUND p._id written_by FILTER HAS(p, \"PublishedOn\") AND DATE_TIMESTAMP(p.PublishedOn) <= DATE_NOW() RETURN 1)"
	query := "FOR p IN post FOR u IN 1..1 OUTBOUND p._id written_by FILTER HAS(p, \"PublishedOn\") AND DATE_TIMESTAMP(p.PublishedOn) <= DATE_NOW() SORT p.PublishedOn DESC "

	if limit > 0 {
		skipAndLimit := string(limit)
		if page > 1 {
			skipAndLimit = string(page*limit) + "," + skipAndLimit
		}
		query = query + "LIMIT " + skipAndLimit + " "
	}

	query = query + "RETURN { \"title\": p.Title, \"content\": p.Content, \"id\": p._key, \"publishedOn\": p.PublishedOn, \"modifiedOn\": p.ModifiedOn, \"author\": { \"username\": u.Username, \"firstName\": u.FirstName, \"lastName\": u.LastName} }"
	ctx := context.Background()

	cursor, _ := dbDriver.Database.Query(ctx, query, nil)
	cursorCount, _ := dbDriver.Database.Query(ctx, countQuery, nil)

	defer cursorCount.Close()
	defer cursor.Close()

	var postCount int64

	_, _ = cursorCount.ReadDocument(ctx, &postCount)

	for {
		var post models.PostDto
		_, err := cursor.ReadDocument(ctx, &post)
		if dbDriver.IsNoMoreDocuments(err) {
			break
		} else if err != nil {
			panic(err)
		}

		postDtos = append(postDtos, post)
	}

	var next int64
	next = -1
	if limit > 0 && postCount > (page*limit) {
		next = page + 1
	}

	prev := page - 1

	return &models.PostsDto{
		Posts:    postDtos,
		Count:    postCount,
		NextPage: next,
		PrevPage: prev,
	}, nil
}
