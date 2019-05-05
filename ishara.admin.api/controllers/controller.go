package controllers

import (
	"encoding/json"
	"fmt"
	"net/http"
)

// Controller ...
type Controller interface{}

// RespondWithJSON ...
func RespondWithJSON(w http.ResponseWriter, code int, payload interface{}) {
	response, _ := json.Marshal(payload)

	fmt.Println(payload)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	w.Write(response)
}

// ErrorWithJSON ...
func ErrorWithJSON(w http.ResponseWriter, code int, message string) {
	RespondWithJSON(w, code, map[string]interface{}{
		"message": message,
	})
}

// OK ...
func OK(w http.ResponseWriter, result interface{}) {
	RespondWithJSON(w, http.StatusOK, result)
}

// BadRequest ...
func BadRequest(w http.ResponseWriter, message string) {
	ErrorWithJSON(w, http.StatusBadRequest, message)
}

// NotFound ...
func NotFound(w http.ResponseWriter, message string) {
	ErrorWithJSON(w, http.StatusNotFound, message)
}

// Unauthorized ...
func Unauthorized(w http.ResponseWriter, message string) {
	ErrorWithJSON(w, http.StatusUnauthorized, message)
}

// NoContent ...
func NoContent(w http.ResponseWriter) {
	w.WriteHeader(http.StatusNoContent)
}

// Created ...
func Created(w http.ResponseWriter, result interface{}) {
	RespondWithJSON(w, http.StatusCreated, result)
}
