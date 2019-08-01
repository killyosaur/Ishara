package models

import (
	"time"

	"github.com/google/uuid"
)

// PostDto ...
type PostDto struct {
	ID          uuid.UUID `json:"id"`
	Title       string    `json:"title"`
	Content     string    `json:"content"`
	Author      AuthorDto `json:"author"`
	PublishedOn string    `json:"publishedOn,omitempty"`
	ModifiedOn  time.Time `json:"modifiedOn"`
}
