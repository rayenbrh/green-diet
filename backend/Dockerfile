FROM node:20-alpine AS admin-build
WORKDIR /admin
COPY frontend/admin/package*.json ./
RUN npm ci
COPY frontend/admin/ ./
ENV VITE_API_URL=/api
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --omit=dev
COPY backend/src ./src
COPY --from=admin-build /admin/dist ./admin-dist
EXPOSE 5000
CMD ["node", "src/server.js"]
