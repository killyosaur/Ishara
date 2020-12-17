package main

import (
	"net/http"
	"os"
	"strconv"

	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
	"github.com/go-chi/cors"

	"github.com/killyosaur/ishara/ishara.api/data"
	"github.com/killyosaur/ishara/ishara.api/post"
	"github.com/killyosaur/ishara/ishara.api/posts"
)

const (
	dbName    = "Ishara"
	graphName = "Ishara"
)

func main() {
	var err error
	dbPort, _ := strconv.ParseInt(os.Getenv("DB_PORT"), 10, 64)

	dbDriver, err := data.Connect(data.DriverConfig{
		DatabaseName: dbName,
		GraphName:    graphName,
		Host:         os.Getenv("DB_HOST"),
		Port:         dbPort,
		Username:     os.Getenv("DB_USER"),
		Password:     os.Getenv("DB_PWRD"),
	})
	if err != nil {
		panic(err)
	}

	r := chi.NewRouter()
	r.Use(middleware.Recoverer)
	r.Use(middleware.RedirectSlashes)
	r.Use(middleware.Logger)
	r.Use(getCors())

	r.Route("/api", func(rt chi.Router) {
		rt.Mount("/posts", routers(dbDriver))
	})

	http.ListenAndServe(":5001", r)
}

func getCors() func(next http.Handler) http.Handler {
	cors := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Content-Type", "X-CSRF-Token"},
		AllowCredentials: true,
		MaxAge:           300,
	})

	return cors.Handler
}

func routers(dbDriver *data.DriverData) http.Handler {
	router := chi.NewRouter()

	router.Get("/", posts.Get(dbDriver))
	router.Get("/{id}", post.Get(dbDriver))

	return router
}
