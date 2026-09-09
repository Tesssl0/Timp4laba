FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

ENV PORT=5000
EXPOSE 5000

# Ждём готовности PostgreSQL перед стартом, чтобы избежать падения
# при первом подключении пула сразу после старта контейнера БД.
CMD ["sh", "-c", "node server.js"]
