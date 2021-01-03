package users

import (
	"context"

	"github.com/google/uuid"

	"github.com/killyosaur/ishara/ishara.admin.api/data"
)

const (
	Admin     = "Administrator"
	Author    = "Author"
	Commenter = "Commenter"
)

func getAccessTypeId(ctx context.Context, dbDriver *data.Driver, accessType string) string {
	query := "FOR a IN access FILTER a.Type == @accessType RETURN a._id"
	bindVars := map[string]interface{}{
		"accessType": accessType,
	}

	cursor := dbDriver.Query(ctx, query, bindVars)

	defer cursor.Close()

	val := ""

	cursor.ReadDocument(ctx, &val)

	return val
}

func setAccess(ctx context.Context, dbDriver *data.Driver, id uuid.UUID, accessType string) error {
	typeId := getAccessTypeId(ctx, dbDriver, accessType)

	accessedAs, _, err := dbDriver.EdgeCollection(ctx, "accessed_as")
	if err != nil {
		return err
	}

	_, err = accessedAs.CreateDocument(ctx, map[string]interface{}{
		"_to":   typeId,
		"_from": "user/" + id.String(),
	})

	return err
}

func setAccessTypes(ctx context.Context, dbDriver *data.Driver) error {
	query := "FOR a IN access RETURN a.Type"

	cursor := dbDriver.QueryWithCount(ctx, query, map[string]interface{}{})

	defer cursor.Close()
	if cursor.Count() == 0 {
		accessCol, err := dbDriver.VertexCollection(ctx, "access")
		if err != nil {
			return err
		}

		_, err = accessCol.CreateDocument(ctx, map[string]interface{}{
			"Type": Admin,
		})

		if err != nil {
			return err
		}

		_, err = accessCol.CreateDocument(ctx, map[string]interface{}{
			"Type": Author,
		})

		if err != nil {
			return err
		}

		_, err = accessCol.CreateDocument(ctx, map[string]interface{}{
			"Type": Commenter,
		})

		if err != nil {
			return err
		}
	}

	return nil
}
