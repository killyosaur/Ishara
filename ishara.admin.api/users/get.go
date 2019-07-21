package users

import (
	"context"
	"net/http"

	"github.com/google/uuid"

	"../controllers"
	"../data"
)

// GetUserDto ...
type GetUserDto struct {
	ID        uuid.UUID `json:"id"`
	Username  string    `json:"username"`
	FirstName string    `json:"firstName"`
	LastName  string    `json:"lastName"`
	Biography string    `json:"bio,omitempty"`
}

// Get ...
func Get(dbDriver *data.Driver) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		allUsers, err := getAllUsers(dbDriver)

		if err != nil {
			controllers.BadRequest(w, err.Error())
		} else {
			controllers.OK(w, allUsers)
		}
	}
}

func getAllUsers(dbDriver *data.Driver) (interface{}, error) {
	query := "FOR u IN user FILTER !u.InActive RETURN { \"id\": u._key, \"firstName\": u.FirstName, \"lastName\": u.LastName, \"username\": u.Username, \"bio\": u.Biography }"
	var allUsers []GetUserDto
	ctx := context.Background()

	cursor := dbDriver.Query(ctx, query, nil)

	defer cursor.Close()
	for {
		item := GetUserDto{}

		_, err := cursor.ReadDocument(ctx, &item)
		if dbDriver.IsNoMoreDocuments(err) {
			break
		} else if err != nil {
			return nil, err
		}

		allUsers = append(allUsers, item)
	}

	return allUsers, nil
}
