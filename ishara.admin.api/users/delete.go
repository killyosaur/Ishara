package users

import (
	"context"
	"net/http"

	"github.com/go-chi/chi"
	"github.com/google/uuid"

	"github.com/killyosaur/ishara/ishara.admin.api/controllers"
	"github.com/killyosaur/ishara/ishara.admin.api/data"
)

// Delete ...
func Delete(dbDriver *data.Driver) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id, _ := uuid.Parse(chi.URLParam(r, "id"))

		err := deleteUser(dbDriver, id)

		if err != nil {
			controllers.BadRequest(w, err.Error())
		} else {
			controllers.NoContent(w)
		}
	}
}

func deleteUser(dbDriver *data.Driver, id uuid.UUID) error {
	ctx := context.Background()
	patch := map[string]interface{}{
		"Biography": "",
		"LastName":  "DELETED",
		"InActive":  true,
	}

	userCol, err := dbDriver.VertexCollection(ctx, "user")
	if err != nil {
		return err
	}

	_, err = userCol.UpdateDocument(ctx, id.String(), patch)
	if err != nil {
		return err
	}

	return nil
}
