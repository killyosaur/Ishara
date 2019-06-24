package posts

import (
	"context"
	"net/http"

	"github.com/go-chi/chi"
	"github.com/go-chi/jwtauth"
	"github.com/google/uuid"

	"../controllers"
	"../data"
)

// ContextMiddleware ...
func ContextMiddleware(dbDriver *data.Driver) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			userID, _ := uuid.Parse(chi.URLParam(r, "userId"))
			_, claims, _ := jwtauth.FromContext(r.Context())

			if userExists(dbDriver, userID) || claims["UserID"].(uuid.UUID) != userID {
				controllers.BadRequest(w, "invalid request")
				return
			}

			ctx := context.WithValue(r.Context(), UserKey("user"), userID)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func userExists(dbDriver *data.Driver, id uuid.UUID) bool {
	userID := uuid.UUID{}

	ctx := context.Background()
	userCol, err := dbDriver.VertexCollection(ctx, "user")
	if err != nil {
		return false
	}

	_, err = userCol.ReadDocument(ctx, id.String(), &userID)
	if err != nil {
		return false
	}

	return uuid.UUID{} != userID
}
