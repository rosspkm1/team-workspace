# Thin wrappers around the docker / docker compose workflow.
# Production-only: local development remains `npm run dev`.

.PHONY: build up down logs clean

# Build the production image from the repo Dockerfile.
build:
	docker build -t team-workspace .

# Start the app (builds if needed) and serve at http://localhost:8080.
up:
	docker compose up

# Stop and remove the compose service containers.
down:
	docker compose down

# Follow the running service logs.
logs:
	docker compose logs -f

# Tear down containers and remove the built image.
clean:
	docker compose down --rmi local --volumes --remove-orphans
