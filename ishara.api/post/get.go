package post

import (
	"net/http"

	"../data"
	"../infrastructure"
	"github.com/go-chi/chi"
	"github.com/google/uuid"
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
