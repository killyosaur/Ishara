package models

// PostsDto ...
type PostsDto struct {
	Posts    []PostDto `json:"posts"`
	Count    int64     `json:"total"`
	NextPage int64     `json:"nextPage"`
	PrevPage int64     `json:"prevPage"`
}
