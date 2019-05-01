package models

import (
	"time"

	"github.com/google/uuid"
)

// PostDto for getting post data from client
type PostDto struct {
	ID          uuid.UUID `json:"id"`
	Title       string    `json:"title"`
	Content     string    `json:"content"`
	AuthorID    string    `json:"authorId"`
	PublishedOn string    `json:"publishedOn,omitempty"`
	ModifiedOn  time.Time `json:"modifiedOn"`
}
