package main

import (
	"encoding/json"
	"fmt"
	"net/http"

	driver "github.com/arangodb/go-driver"
)

func catch(err error) {
	if err != nil {
		panic(err)
	}
}

func checkIsNoMoreDocuments(err error) bool {
	if driver.IsNoMoreDocuments(err) {
		return true
	} else {
		catch(err)
	}

	return false
}

func respondWithError(w http.ResponseWriter, code int, msg string) {
	respondwithJSON(w, code, map[string]string{"message": msg})
}

func respondwithJSON(w http.ResponseWriter, code int, payload interface{}) {
	response, _ := json.Marshal(payload)

	fmt.Println(payload)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	w.Write(response)
}
