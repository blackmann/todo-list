FROM oven/bun:1.1.5

WORKDIR /app

COPY package.json bun.lock ./

RUN bun install

COPY . .

RUN bun run build

EXPOSE 5173

CMD ["bun", "run", "dev"]