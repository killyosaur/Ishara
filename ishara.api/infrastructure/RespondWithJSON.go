package infrastructure

import (
	"encoding/json"
	"fmt"
	"net/http"
)

// RespondWithJSON ...
func RespondWithJSON(w http.ResponseWriter, code int, payload interface{}) {
	response, _ := json.Marshal(payload)

	fmt.Println(payload)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	w.Write(response)
}
