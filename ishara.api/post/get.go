package post

import (
	"net/http"

	"github.com/go-chi/chi"
	"github.com/google/uuid"
	"github.com/killyosaur/ishara/ishara.api/data"
	"github.com/killyosaur/ishara/ishara.api/infrastructure"
)

// Get ...
func Get(dbDriver *data.DriverData) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id, _ := uuid.Parse(chi.URLParam(r, "id"))

		postDto, err := getPost(dbDriver, id)
		if err != nil {
			infrastructure.RespondWithJSON(w, 400, map[string]interface{}{
				"message": err.Error(),
			})
			return
		}

		infrastructure.RespondWithJSON(w, 200, postDto)
	}
}
