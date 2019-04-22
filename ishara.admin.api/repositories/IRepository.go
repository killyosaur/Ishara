package repositories

import (
	"context"

	"github.com/google/uuid"
)

// IRepository the repository interface for all repositiories
type IRepository interface {
	Get(ctx context.Context, num int64) ([]*interface{}, error)
	GetByID(ctx context.Context, id uuid.UUID) ([]*interface{}, error)
	Create(ctx context.Context, res *interface{}) (uuid.UUID, error)
	Update(ctx context.Context, res *interface{}) (*interface{}, error)
	Delete(ctx context.Context, id uuid.UUID) (bool, error)
}
