package services

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"

	"../data"
	"../models"
	"../models/entities"
)

// PostService ...
type PostService struct {
	dbConn *data.Driver
}

// NewPostService ...
func NewPostService(dbConn *data.Driver) *PostService {
	res := PostService{
		dbConn: dbConn,
	}

	return &res
}

// Create ...
func (postService *PostService) Create(userDto models.UserDto, postDto models.PostDto) (string, error) {
	if (userDto == models.UserDto{}) {
		return "", userError()
	}

	post := entities.Post{
		Key:        uuid.New(),
		Title:      postDto.Title,
		Content:    postDto.Content,
		CreatedOn:  time.Now(),
		ModifiedOn: time.Now(),
	}

	if postDto.PublishedOn != "" {
		post.PublishedOn, _ = time.Parse("RFC3339", postDto.PublishedOn)
	}

	ctx := context.Background()
	col, err := postService.dbConn.VertexCollection(ctx, "post")
	if err != nil {
		return "", err
	}

	meta, err := col.CreateDocument(ctx, post)
	if err != nil {
		return "", err
	}

	edge, _, err := postService.dbConn.EdgeCollection(ctx, "written_by")
	if err != nil {
		return "", err
	}

	writtenBy := map[string]string{
		"_from": meta.ID.String(),
		"_to":   "user/" + userDto.ID.String(),
	}

	_, err = edge.CreateDocument(ctx, writtenBy)
	if err != nil {
		return "", err
	}

	return meta.Key, nil
}

// All ...
func (postService *PostService) All(userDto models.UserDto, limit int64, page int64) ([]*models.PostDto, error) {
	if (userDto == models.UserDto{}) {
		return nil, userError()
	}
	var postDtos []*models.PostDto

	query := "FOR p IN post FOR u IN 1..1 OUTBOUND p._id written_by FILTER u._key == @userId "

	if limit > 0 {
		skipAndLimit := string(limit)
		if page > 1 {
			skipAndLimit = string(page*limit) + "," + skipAndLimit
		}
		query = query + "LIMIT " + skipAndLimit + " "
	}

	query = query + "RETURN { \"Title\": p.Title, \"Content\": p.Content, \"ID\": p._key, \"PublishedOn\": p.PublishedOn, \"ModifiedOn\": p.ModifiedOn, \"AuthorId\": u._key }"
	bindVars := map[string]interface{}{
		"userId": userDto.ID,
	}
	ctx := context.Background()

	cursor := postService.dbConn.GetCursor(ctx, query, bindVars)

	defer cursor.Close()
	for {
		var post models.PostDto
		_, err := cursor.ReadDocument(ctx, &post)
		if postService.dbConn.IsNoMoreDocuments(err) {
			break
		}

		postDtos = append(postDtos, &post)
	}

	return postDtos, nil
}

// GetByID ...
func (postService *PostService) GetByID(userDto models.UserDto, id uuid.UUID) (models.PostDto, error) {
	if (userDto == models.UserDto{}) {
		return models.PostDto{}, userError()
	}

	query := "FOR p IN post FOR u IN 1..1 OUTBOUND p._id written_by FILTER p._key == @id and u._key == @userId RETURN { \"Title\": p.Title, \"Content\": p.Content, \"ID\": p._key, \"PublishedOn\": p.PublishedOn, \"ModifiedOn\": p.ModifiedOn, \"AuthorId\": u._key }"
	bindVars := map[string]interface{}{
		"id":     id,
		"userId": userDto.ID,
	}

	ctx := context.Background()

	cursor := postService.dbConn.GetCursor(ctx, query, bindVars)

	var post models.PostDto

	defer cursor.Close()
	for {
		_, err := cursor.ReadDocument(ctx, &post)
		if postService.dbConn.IsNoMoreDocuments(err) {
			break
		}
	}

	return post, nil
}

// Update ...
func (postService *PostService) Update(userDto models.UserDto, id uuid.UUID, postDto models.PostDto) (string, error) {
	userPost, err := postService.GetByID(userDto, id)
	if err != nil {
		return "", err
	}

	if (userPost == models.PostDto{}) {
		return "", errors.New("no post for this user with the provided id is available")
	}

	ctx := context.Background()
	posts, err := postService.dbConn.VertexCollection(ctx, "post")
	if err != nil {
		return "", err
	}

	postPatch := map[string]interface{}{
		"ModifiedOn": time.Now(),
		"Title":      postDto.Title,
		"Content":    postDto.Content,
	}

	if postDto.PublishedOn != "" {
		postPatch["PublishedOn"], _ = time.Parse("RFC3339", postDto.PublishedOn)
	}

	meta, err := posts.UpdateDocument(ctx, id.String(), postPatch)
	if err != nil {
		return "", err
	}

	return meta.Key, nil
}

// TODO: at some point need to check if the author is not the only author so that
// the other author has a chance to verify that the delete is valid

// Delete ...
func (postService *PostService) Delete(userDto models.UserDto, id uuid.UUID) error {
	userPost, _ := postService.GetByID(userDto, id)

	if (userPost == models.PostDto{}) {
		return nil
	}

	ctx := context.Background()
	posts, err := postService.dbConn.VertexCollection(ctx, "post")
	if err != nil {
		return err
	}

	_, err = posts.RemoveDocument(ctx, id.String())
	if err != nil {
		return err
	}

	return nil
}

func userError() error {
	return errors.New("no user provided")
}
