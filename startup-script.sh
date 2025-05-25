#!bin/sh

bun install

docker compose -f todo-list-docker/local-db.yml up --remove-orphans -d

bun run migrate

bun run dev