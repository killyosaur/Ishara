package services

import (
	"net/http"
	"os"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/go-chi/jwtauth"
)

// ITokenService the interface for the token service
type ITokenService interface {
	New() TokenService
	Verifier() func(http.Handler) http.Handler
	Authenticator() func(http.Handler) http.Handler
	Encode(claim jwt.MapClaims, expiry time.Duration) (string, error)
}

// TokenService the service for managing jwtauth
type TokenService struct {
	tokenAuth *jwtauth.JWTAuth
}

// New creates a new instance of the token service
func NewTokenService() TokenService {
	auth := jwtauth.New("HS512", []byte(os.Getenv("ISHARA_SECRET")), nil)

	return TokenService{
		tokenAuth: auth,
	}
}

// Verifier creates the verifier middleware
func (tokenService TokenService) Verifier() func(http.Handler) http.Handler {
	return jwtauth.Verifier(tokenService.tokenAuth)
}

// Authenticator get the authenticator
func (tokenService TokenService) Authenticator() func(http.Handler) http.Handler {
	return jwtauth.Authenticator
}

// Encode return string value for the token
func (tokenService TokenService) Encode(claim jwt.MapClaims, expiry time.Duration) (string, error) {
	jwtauth.SetExpiryIn(claim, expiry)

	_, token, err := tokenService.tokenAuth.Encode(claim)

	if err != nil {
		return "", err
	}

	return token, nil
}
