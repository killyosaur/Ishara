package data

import (
	"context"
	"fmt"

	driver "github.com/arangodb/go-driver"
	http "github.com/arangodb/go-driver/http"
)

var dbConn = &DriverData{}

// Connect ...
func Connect(options DriverConfig) (*DriverData, error) {
	var err error

	conn, err := http.NewConnection(http.ConnectionConfig{
		Endpoints: []string{fmt.Sprintf("%s:%d", options.Host, options.Port)},
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
	dbConn.Database, err = client.Database(ctx, options.DatabaseName)

	if err != nil {
		return nil, err
	}

	graph, err := dbConn.Database.Graph(ctx, options.GraphName)

	if err != nil {
		return nil, err
	}
	dbConn.Graph = graph

	return dbConn, nil
}

// IsNoMoreDocuments ...
func (arango *DriverData) IsNoMoreDocuments(err error) bool {
	return driver.IsNoMoreDocuments(err)
}
