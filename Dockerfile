# Server
## FROM --platform=$BUILDPLATFORM
## See more for cross-compile:
## https://dh1tw.de/2019/12/cross-compiling-golang-cgo-projects/
FROM --platform=$TARGETPLATFORM golang:1.23-alpine3.21 AS server
RUN apk update && apk add musl-dev gcc g++ ffmpeg-libs ffmpeg-dev
WORKDIR /app
COPY server/go.mod server/go.sum ./
RUN go mod download -x
COPY server/ ./
ARG TARGETOS TARGETARCH
RUN GOOS=$TARGETOS GOARCH=$TARGETARCH CGO_ENABLED=1 go build -v -installsuffix cgo -o photo-gallery
# For static compilation (not working): -ldflags '-extldflags "-static"'

# Fronted
FROM --platform=$BUILDPLATFORM node:22-alpine3.21 AS frontend
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Deploy
FROM --platform=$TARGETPLATFORM alpine:3.21
WORKDIR /app/server
EXPOSE 3080
VOLUME "/photos" "/thumbs"
RUN apk update && apk add ffmpeg-libs
COPY --from=frontend /app/build /app/build/
COPY --from=server /app/photo-gallery /app/server/photo-gallery
ENTRYPOINT ["./photo-gallery", "--host", "0.0.0.0"]
CMD ["-r", "-c", "name=Photos,path=/photos,thumbs=/thumbs"]
