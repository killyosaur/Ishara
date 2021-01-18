package users

import (
	"context"
	"net/http"

	"github.com/go-chi/chi"
	"github.com/go-chi/jwtauth"
	"github.com/google/uuid"

	"github.com/killyosaur/ishara/ishara.admin.api/controllers"
	"github.com/killyosaur/ishara/ishara.admin.api/data"
)

// ContextMiddleware ...
func ContextMiddleware(dbDriver *data.Driver) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			userID, _ := uuid.Parse(chi.URLParam(r, "userId"))
			_, claims, _ := jwtauth.FromContext(r.Context())

			claimsID, _ := uuid.Parse(claims["UserID"].(string))

			isAdmin := userIsAdmin(dbDriver, userID)
			if !isAdmin || userID != claimsID {
				controllers.Forbidden(w, "invalid request")
			} else {
				next.ServeHTTP(w, r)
			}
		})
	}
}

func userIsAdmin(dbDriver *data.Driver, userID uuid.UUID) bool {
	ctx := context.Background()

	query := "FOR a IN 1..1 OUTBOUND @userid accessed_as FILTER a.`Type` == 'Administrator' RETURN a._key"
	bindVars := map[string]interface{}{
		"userid": "user/" + userID.String(),
	}

	cursor := dbDriver.QueryWithCount(ctx, query, bindVars)

	defer cursor.Close()

	return cursor.Count() > 0
}
