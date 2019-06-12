package entities

import (
	"time"

	"github.com/google/uuid"
)

// Post for getting the post data from the database
type Post struct {
	Key         uuid.UUID `json:"_key"`
	Title       string
	Content     string
	CreatedOn   time.Time
	ModifiedOn  time.Time
	PublishedOn string `json:"PublishedOn,omitempty"`
}
