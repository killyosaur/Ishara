package main

import (
	"net/http"
	"os"

	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"

	"./controllers"
	"./data"
	"./models"
	"./services"
)

const (
	dbName    = "IsharaDB"
	graphName = "Ishara"
	dbHost    = "localhost"
	dbPort    = 8529
)

func main() {
	var err error
	dbDriver, err := data.Connect(models.ConnectionOptions{
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

	tokenService := services.NewTokenService()
	passwordService := services.NewPasswordService(dbDriver)
	userService := services.NewUserService(dbDriver, passwordService, tokenService)
	postService := services.NewPostService(dbDriver)
	userController := controllers.NewUserController(userService)
	postController := controllers.NewPostController(postService, userService)

	r := chi.NewRouter()
	r.Use(middleware.Recoverer)
	r.Use(middleware.RedirectSlashes)
	r.Use(middleware.Logger)

	r.Route("/api", func(rt chi.Router) {
		rt.Mount("/users", routers(&tokenService, userController, postController))
	})

	http.ListenAndServe("localhost:5000", r)
}

func routers(ts *services.TokenService, uc *controllers.UserController, pc *controllers.PostController) http.Handler {
	router := chi.NewRouter()

	router.Group(func(r chi.Router) {
		r.Post("/authenticate", uc.Authenticate)
		r.Post("/register", uc.Register)
	})

	router.Group(func(r chi.Router) {
		r.Use(ts.Verifier())
		r.Use(ts.Authenticator())

		r.Get("/", uc.All)
		r.Get("/{id}", uc.GetByID)
		r.Put("/{id}", uc.Update)
		r.Delete("/{id}", uc.Delete)

		r.Mount("/{userId}/posts", postRouters(pc))
	})

	return router
}

func postRouters(pc *controllers.PostController) http.Handler {
	r := chi.NewRouter()

	r.Use(pc.ContextMiddleware)

	r.Get("/", pc.All)
	r.Get("/{id}", pc.GetByID)
	r.Post("/", pc.Create)
	r.Put("/{id}", pc.Update)
	r.Delete("/{id}", pc.Delete)

	return r
}
