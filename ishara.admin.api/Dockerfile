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

RUN go build -o admin .

WORKDIR /dist

RUN cp /build/admin .

# Build a small image
FROM alpine

COPY --from=builder /dist/admin /

EXPOSE 5000
ENTRYPOINT ["/admin"]