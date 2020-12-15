package users

import (
	"context"
	"time"
	"math/rand"
	"strings"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"

	"../data"
)

var (
	minCharSets = []string {
		"ABCDEFGHIJKLMNOPQRSTUVWXYZ",
		"!@#$%&*.+=><",
		"0123456789",
	}
    allCharSet = "abcdefghijklmnopqrstuvwxyz" + strings.Join(minCharSets, "")
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

// GeneratePassword creates a random password
func GeneratePassword() string {
	rand.Seed(time.Now().Unix())
	var password strings.Builder
	var charSets = len(minCharSets)

	for i := 0; i < charSets; i++ {
		for j := 0; j < 3; j++ {
			password.WriteString(character(minCharSets[i]))
		}
	}

	remainingLength := 42 - (charSets * 3)
	for i := 0; i < remainingLength; i++ {
		password.WriteString(character(allCharSet))
	}

	inRune := []rune(password.String())
	rand.Shuffle(len(inRune), func(i, j int){
		inRune[i], inRune[j] = inRune[j], inRune[i]
	})

	return string(inRune)
}

func character(charset string) string {
	random := rand.Intn(len(charset))
	return string(charset[random])
}
