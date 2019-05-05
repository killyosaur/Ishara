package services

import (
	"context"
	"errors"
	"os"
	"strconv"
	"time"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"

	"../data"
	"../models/entities"
)

// NewPasswordService ...
func NewPasswordService(dbConn *data.Driver) PasswordService {
	passwordService := PasswordService{
		dbConn: dbConn,
	}

	return passwordService
}

// PasswordService the service for managing passwords
type PasswordService struct {
	dbConn *data.Driver
}

// Get ...
func (p *PasswordService) Get(ctx context.Context, id uuid.UUID) (*entities.Password, error) {
	query := "FOR p, s IN 1..1 OUTBOUND @uid secured_by FILTER s.Current == true RETURN { _key: p._key, PasswordHashAndSalt: p.PasswordHashAndSalt, Current: s.Current, SecureKey: s._key }"
	bindVars := map[string]interface{}{
		"uid": "user/" + id.String(),
	}

	if ctx == nil {
		ctx = context.Background()
	}

	cursor := p.dbConn.GetCursor(ctx, query, bindVars)

	var pass *entities.Password

	defer cursor.Close()
	for {
		_, err := cursor.ReadDocument(ctx, &pass)
		if p.dbConn.IsNoMoreDocuments(err) {
			break
		} else if err != nil {
			return nil, err
		}
	}

	return pass, nil
}

// GetAll ...
func (p *PasswordService) GetAll(ctx context.Context, id uuid.UUID) ([]*entities.Password, error) {
	pwdCount, _ := strconv.ParseInt(os.Getenv("LAST_X_PASSWORD_COUNT"), 10, 32)

	if pwdCount <= 0 {
		pwdCount = 10
	}

	query := "FOR p, e IN 1..@pwdCount OUTBOUND @uid secured_by RETURN { _key: p._key, PasswordAndHash: p.PasswordAndHash, Current: e.Current, SecureKey: e._key }"
	bindVars := map[string]interface{}{
		"pwdCount": pwdCount,
		"uid":      "user/" + id.String(),
	}

	if ctx == nil {
		ctx = context.Background()
	}

	cursor := p.dbConn.GetCursor(ctx, query, bindVars)

	var passwords []*entities.Password

	defer cursor.Close()
	for {
		var password entities.Password
		_, err := cursor.ReadDocument(ctx, &password)
		if p.dbConn.IsNoMoreDocuments(err) {
			break
		} else if err != nil {
			return nil, err
		}

		passwords = append(passwords, &password)
	}

	return passwords, nil
}

// Compare ...
func (p *PasswordService) Compare(hashedPwd []byte, plainPwd string) bool {
	plainPwdEncoded := []byte(plainPwd)
	err := bcrypt.CompareHashAndPassword(hashedPwd, plainPwdEncoded)
	if err != nil {
		return false
	}

	return true
}

// Create ...
func (p *PasswordService) Create(ctx context.Context, id uuid.UUID, password string) (string, error) {
	encodedPassword := []byte(password)

	if ctx == nil {
		ctx = context.Background()
	}

	secured, _, err := p.dbConn.EdgeCollection(ctx, "secured_by")
	if err != nil {
		return "", err
	}

	pwdCol, err := p.dbConn.VertexCollection(ctx, "password")
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

// Update ...
func (p *PasswordService) Update(ctx context.Context, id uuid.UUID, password string) error {
	if ctx == nil {
		ctx = context.Background()
	}

	passwords, err := p.GetAll(ctx, id)

	if err != nil {
		return err
	}

	alreadyUsed := false
	var currentID string

	for _, element := range passwords {
		if p.Compare(element.PasswordHashAndSalt, password) {
			alreadyUsed = true
			break
		}

		if element.Current {
			currentID = element.SecureKey
		}
	}

	if alreadyUsed {
		return errors.New("Password was already used, please try a different password")
	}

	sEdge, _, err := p.dbConn.EdgeCollection(ctx, "secured_by")
	if err != nil {
		return err
	}

	edgeID, err := p.Create(ctx, id, password)
	if err != nil {
		return err
	}

	_, err = sEdge.UpdateDocument(ctx, currentID, map[string]interface{}{
		"Current": false,
		"_from":   edgeID,
	})

	return err
}

func hashAndSalt(password []byte) ([]byte, error) {
	hash, err := bcrypt.GenerateFromPassword(password, bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	return hash, nil
}
