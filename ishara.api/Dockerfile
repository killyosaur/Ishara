FROM golang:alpine AS builder

ENV GO111Module=on \
    CGO_ENABLED=0 \
    GOOS=linux \
    GOARCH=amd64

WORKDIR /build

# Copy and download dependency using go mod
COPY go.mod .
COPY go.sum .
RUN go mod download

# Copy the code into the container
COPY . .

RUN go build -o api .

WORKDIR /dist

RUN cp /build/api .

# Build a small image
FROM alpine

RUN apk update && apk add ca-certificates && rm -rf /var/cache/apk/*
COPY --from=builder /dist/api /

EXPOSE 5001
ENTRYPOINT ["/api"]