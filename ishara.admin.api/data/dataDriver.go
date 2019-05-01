package datadriver

import (
	"context"
	"fmt"

	driver "github.com/arangodb/go-driver"
	http "github.com/arangodb/go-driver/http"

	"../models"
)

// Arango ...
type Arango struct {
	database driver.Database
	Graph    driver.Graph
}

// GetCursor ...
func (arango *Arango) GetCursor(ctx context.Context, query string, bindVars map[string]interface{}) driver.Cursor {
	cursor, err := arango.database.Query(ctx, query, bindVars)
	if err != nil {
		panic(err)
	}

	return cursor
}

// IsNoMoreDocuments ...
func (arango *Arango) IsNoMoreDocuments(err error) bool {
	if driver.IsNoMoreDocuments(err) {
		return true
	} else if err != nil {
		panic(err)
	}

	return false
}

// EdgeCollection ...
func (arango *Arango) EdgeCollection(ctx context.Context, name string) (driver.Collection, driver.VertexConstraints, error) {
	return arango.Graph.EdgeCollection(ctx, name)
}

// VertexCollection ...
func (arango *Arango) VertexCollection(ctx context.Context, name string) (driver.Collection, error) {
	return arango.Graph.VertexCollection(ctx, name)
}

var dbConn = &Arango{}

// Connect ...
func Connect(options models.ConnectionOptions) (*Arango, error) {
	var err error

	conn, err := http.NewConnection(http.ConnectionConfig{
		Endpoints: []string{fmt.Sprintf("http://%s:%d", options.Host, options.Port)},
	})

	if err != nil {
		return nil, err
	}

	auth := driver.JWTAuthentication(options.Username, options.Password)

	client, err := driver.NewClient(driver.ClientConfig{
		Connection:     conn,
		Authentication: auth,
	})

	if err != nil {
		return nil, err
	}

	ctx := context.Background()
	dbConn.database, err = client.Database(ctx, options.DatabaseName)

	if err != nil {
		return nil, err
	}

	graph, err := dbConn.database.Graph(ctx, options.GraphName)

	if err != nil {
		return nil, err
	}
	dbConn.Graph = graph

	return dbConn, nil
}
