package main

import (
	"net/http"
	"os"

	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
	"github.com/go-chi/cors"
	"github.com/go-chi/jwtauth"

	"./data"
	"./posts"
	"./users"
)

const (
	dbName    = "IsharaDB"
	graphName = "Ishara"
	dbHost    = "localhost"
	dbPort    = 8529
)

func main() {
	var err error
	dbDriver, err := data.Connect(data.ConnectionOptions{
		DatabaseName: dbName,
		GraphName:    graphName,
		Host:         dbHost,
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
		rt.Mount("/users", routers(dbDriver))
	})

	http.ListenAndServe("localhost:5000", r)
}

func getCors() func(next http.Handler) http.Handler {
	cors := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		AllowCredentials: true,
		MaxAge:           300,
	})

	return cors.Handler
}

func routers(dbDriver *data.Driver) http.Handler {
	router := chi.NewRouter()
	auth := jwtauth.New("HS512", []byte(os.Getenv("ISHARA_SECRET")), nil)

	router.Group(func(r chi.Router) {
		r.Post("/authenticate", users.Authenticate(auth, dbDriver))
	})

	router.Group(func(r chi.Router) {
		r.Use(jwtauth.Verifier(auth))
		r.Use(jwtauth.Authenticator)

		r.Get("/", users.Get(dbDriver))
		r.Put("/{id}", users.Update(dbDriver))
		r.Delete("/{id}", users.Delete(dbDriver))
		r.Post("/", users.Create(dbDriver))

		r.Mount("/{userId}/posts", postRouters(dbDriver))
	})

	return router
}

func postRouters(dbDriver *data.Driver) http.Handler {
	r := chi.NewRouter()

	r.Use(posts.ContextMiddleware(dbDriver))

	r.Get("/", posts.Get(dbDriver))
	r.Post("/", posts.Create(dbDriver))
	r.Put("/{id}", posts.Update(dbDriver))
	r.Delete("/{id}", posts.Delete(dbDriver))

	return r
}
