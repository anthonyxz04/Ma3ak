# MA3AK — optional self-hosted image. The main deployment is Netlify (see README).
# Needs DATABASE_URL (Postgres). Uploaded photos are stored under DATA_DIR (mount a volume).
FROM node:22-alpine
ENV NODE_ENV=production DATA_DIR=/var/data PORT=3000
WORKDIR /app
COPY package.json ./
COPY server ./server
COPY scripts ./scripts
COPY client ./client
COPY public ./public
COPY netlify/database/migrations ./netlify/database/migrations
RUN node scripts/build.js && mkdir -p /var/data && chown -R node:node /var/data
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1
CMD ["node", "server/index.js"]
