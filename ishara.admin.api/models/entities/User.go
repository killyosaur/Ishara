package entities

import (
	"time"

	"github.com/google/uuid"
)

// User for getting the user data from the database
type User struct {
	Key        uuid.UUID `json:"_key"`
	Username   string
	FirstName  string
	LastName   string
	Biography  string
	CreatedOn  time.Time
	ModifiedOn time.Time
}
