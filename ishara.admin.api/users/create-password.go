package users

import (
	"context"
	"time"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"

	"../data"
)

// CreatePassword creates password and returns the new id
func CreatePassword(ctx context.Context, dbDriver *data.Driver, id uuid.UUID, password string) (string, error) {
	encodedPassword := []byte(password)

	if ctx == nil {
		ctx = context.Background()
	}

	secured, _, err := dbDriver.EdgeCollection(ctx, "secured_by")
	if err != nil {
		return "", err
	}

	pwdCol, err := dbDriver.VertexCollection(ctx, "password")
	if err != nil {
		return "", err
	}

	hashedPwd, err := hashAndSalt(encodedPassword)
	if err != nil {
		return "", err
	}

	pwd := map[string]interface{}{
		"PasswordHashAndSalt": hashedPwd,
		"CreatedOn":           time.Now(),
	}
	meta, err := pwdCol.CreateDocument(ctx, pwd)
	if err != nil {
		return "", err
	}

	_, err = secured.CreateDocument(ctx, map[string]interface{}{
		"_to":     meta.ID,
		"_from":   "user/" + id.String(),
		"Current": true,
	})

	return meta.ID.String(), err
}

func hashAndSalt(password []byte) ([]byte, error) {
	hash, err := bcrypt.GenerateFromPassword(password, bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	return hash, nil
}
