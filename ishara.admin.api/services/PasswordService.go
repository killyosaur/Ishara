package services

/*import (
	"os"
	"strconv"

	"github.com/arangodb/go-driver"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"

	"../models/entities"
)

// PasswordService the service for managing passwords
type PasswordService struct{}

func Get(p *PasswordService, id uuid.UUID) (*entities.Password, error) {

}

func passwordCompare(hashedPwd []byte, plainPwd []byte) bool {
	err := bcrypt.CompareHashAndPassword(hashedPwd, plainPwd)
	if err != nil {
		return false
	}

	return true
}

func hashAndSalt(password []byte) ([]byte, error) {
	hash, err := bcrypt.GenerateFromPassword(password, bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	return hash, nil
}

func get(id uuid.UUID, num int64) ([]*entities.Password, error) {
	top, err := strconv.ParseInt(os.Getenv("LAST_X_PASSWORD_COUNT"), 10, 32)
	if num <= 0 {
		num = 10
	}

	query := "FOR p, e IN 1..@top OUTBOUND @uid secured_by RETURN { _key: p._key, PasswordAndHash: p.PasswordAndHash, Current: e.Current, SecureKey: e._key }"
	bindVars := map[string]interface{}{
		"top": num,
		"uid": "user/" + id.String(),
	}

	cursor, ctx := getCursor(query, bindVars)

	var passwords []*entities.Password

	defer cursor.Close()
	for {
		var password entities.Password
		_, err := cursor.ReadDocument(ctx, &password)
		if driver.IsNoMoreDocuments(err) {
			break
		} else {
			return nil, err
		}

		passwords = append(passwords, &password)
	}

	return passwords, nil
}*/
