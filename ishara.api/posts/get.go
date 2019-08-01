package posts

import (
	"net/http"
	"strconv"

	"../data"
	"../infrastructure"
)

// Get ...
func Get(dbDriver *data.DriverData) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		pageValue, okP := r.URL.Query()["offset"]
		limitValue, okL := r.URL.Query()["limit"]

		limit := int64(0)
		page := int64(0)

		if okP && len(pageValue[0]) > 0 {
			page, _ = strconv.ParseInt(pageValue[0], 10, 64)
		}

		if okL && len(limitValue[0]) > 0 {
			limit, _ = strconv.ParseInt(limitValue[0], 10, 64)
		}

		postDtos, err := getAllPosts(dbDriver, limit, page)
		if err != nil {
			infrastructure.RespondWithJSON(w, 400, map[string]interface{}{
				"message": err.Error(),
			})
			return
		}

		infrastructure.RespondWithJSON(w, 200, postDtos)
	}
}
