package data

import (
	"context"
	"fmt"

	driver "github.com/arangodb/go-driver"
	http "github.com/arangodb/go-driver/http"
)

// Driver ...
type Driver struct {
	database driver.Database
	Graph    driver.Graph
}

// Query ...
func (arango *Driver) Query(ctx context.Context, query string, bindVars map[string]interface{}) driver.Cursor {
	cursor, err := arango.database.Query(ctx, query, bindVars)
	if err != nil {
		panic(err)
	}

	return cursor
}

// QueryWithCount ...
func (arango *Driver) QueryWithCount(ctx context.Context, query string, bindVars map[string]interface{}) driver.Cursor {
	countCtx := driver.WithQueryCount(ctx)

	cursor, err := arango.database.Query(countCtx, query, bindVars)
	if err != nil {
		panic(err)
	}

	return cursor
}

// IsNoMoreDocuments ...
func (arango *Driver) IsNoMoreDocuments(err error) bool {
	if driver.IsNoMoreDocuments(err) {
		return true
	} else if err != nil {
		panic(err)
	}

	return false
}

// EdgeCollection ...
func (arango *Driver) EdgeCollection(ctx context.Context, name string) (driver.Collection, driver.VertexConstraints, error) {
	return arango.Graph.EdgeCollection(ctx, name)
}

// VertexCollection ...
func (arango *Driver) VertexCollection(ctx context.Context, name string) (driver.Collection, error) {
	return arango.Graph.VertexCollection(ctx, name)
}

var dbConn = &Driver{}

// Connect ...
func Connect(options ConnectionOptions) (*Driver, error) {
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

// ConnectionOptions ...
type ConnectionOptions struct {
	Password     string
	Username     string
	DatabaseName string
	GraphName    string
	Port         int64
	Host         string
}
