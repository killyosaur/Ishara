package entities

// Password for getting a password from the database
type Password struct {
	Key                 string `json:"_key"`
	PasswordHashAndSalt []byte
	Current             bool
	SecureKey           string
}
