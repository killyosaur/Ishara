package main

import (
	"fmt"
	"net/http"
	"os"
	"strconv"

	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
	"github.com/go-chi/cors"
	"github.com/go-chi/jwtauth"

	"github.com/killyosaur/ishara/ishara.admin.api/data"
	"github.com/killyosaur/ishara/ishara.admin.api/posts"
	"github.com/killyosaur/ishara/ishara.admin.api/users"
)

const (
	dbName    = "IsharaDB"
	graphName = "Ishara"
)

func main() {
	var err error
	port, _ := strconv.ParseInt(os.Getenv("DB_PORT"), 10, 64)

	dbDriver, err := data.Connect(data.ConnectionOptions{
		DatabaseName: dbName,
		GraphName:    graphName,
		Host:         os.Getenv("DB_HOST"),
		Port:         port,
		Username:     os.Getenv("DB_USER"),
		Password:     os.Getenv("DB_PWRD"),
	})

	if err != nil {
		panic(err)
	}

	pass := users.CreateRootUser(dbDriver)
	fmt.Print("admin password: " + pass)

	r := chi.NewRouter()
	r.Use(middleware.Recoverer)
	r.Use(middleware.RedirectSlashes)
	r.Use(middleware.Logger)
	r.Use(getCors())

	r.Route("/api", func(rt chi.Router) {
		rt.Mount("/admin", routers(dbDriver))
	})

	http.ListenAndServe(":5000", r)
}

func getCors() func(next http.Handler) http.Handler {
	cors := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		AllowCredentials: true,
		MaxAge:           300,
	})

	return cors.Handler
}

func routers(dbDriver *data.Driver) http.Handler {
	router := chi.NewRouter()
	secret := os.Getenv("ISHARA_SECRET")
	auth := jwtauth.New("HS512", []byte(secret), nil)

	router.Group(func(r chi.Router) {
		r.Post("/authenticate", users.Authenticate(auth, dbDriver))
	})

	router.Group(func(r chi.Router) {
		r.Use(jwtauth.Verifier(auth))
		r.Use(jwtauth.Authenticator)

		r.Mount("/{userId}/users", userRouters(dbDriver))
		r.Mount("/{userId}/posts", postRouters(dbDriver))
	})

	return router
}

func userRouters(dbDriver *data.Driver) http.Handler {
	r := chi.NewRouter()

	r.Use(users.ContextMiddleware(dbDriver))

	r.Get("/", users.Get(dbDriver))
	r.Post("/", users.Create(dbDriver))
	r.Put("/{id}", users.Update(dbDriver))
	r.Delete("/{id}", users.Delete(dbDriver))

	return r
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
