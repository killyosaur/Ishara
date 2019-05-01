package models

import (
	"github.com/google/uuid"
)

// UserDto For retrieving data from the client
type UserDto struct {
	ID        uuid.UUID `json:"id"`
	Username  string    `json:"username"`
	FirstName string    `json:"firstName"`
	LastName  string    `json:"lastName"`
	Password  string    `json:"password,omitempty"`
	Biography string    `json:"bio,omitempty"`
	Token     string    `json:"token,omitempty"`
}
