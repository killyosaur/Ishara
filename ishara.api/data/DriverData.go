package data

import (
	driver "github.com/arangodb/go-driver"
)

// DriverData ...
type DriverData struct {
	Database driver.Database
	Graph    driver.Graph
}
