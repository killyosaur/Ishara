package users

import (
	"context"
	"net/http"

	"github.com/google/uuid"

	"github.com/killyosaur/ishara/ishara.admin.api/controllers"
	"github.com/killyosaur/ishara/ishara.admin.api/data"
)

// GetUserDto ...
type GetUserDto struct {
	ID        uuid.UUID `json:"id"`
	Username  string    `json:"username"`
	FirstName string    `json:"firstName"`
	LastName  string    `json:"lastName"`
	Biography string    `json:"bio,omitempty"`
	Access    []string  `json:"access"`
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
	query := "FOR u IN user FILTER !u.InActive RETURN MERGE({ \"id\": u._key, \"firstName\": u.FirstName, \"lastName\": u.LastName, \"username\": u.Username, \"bio\": u.Biography }, {access: (FOR a IN 1..1 OUTBOUND u._id accessed_as RETURN a.Type)})"
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
