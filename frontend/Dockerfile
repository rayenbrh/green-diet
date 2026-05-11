# Build depuis la RACINE du dépôt (obligatoire pour inclure frontend/admin) :
#   docker build -f frontend/Dockerfile .
# Easy Panel : répertoire du contexte = racine du repo, Dockerfile = frontend/Dockerfile

FROM node:20-alpine AS admin-build
WORKDIR /admin
COPY frontend/admin/package.json frontend/admin/package-lock.json ./
RUN npm ci
COPY frontend/admin/ ./
ARG VITE_API_URL=https://api.votredomaine.tn/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

FROM node:20-alpine AS shop-build
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
COPY frontend/.npmrc ./
RUN npm ci
COPY frontend/ ./
ARG VITE_API_URL=https://api.votredomaine.tn/api
ARG VITE_BACKEND_ORIGIN=https://api.votredomaine.tn
ARG VITE_ADMIN_URL=https://boutique.votredomaine.tn/admin/
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_BACKEND_ORIGIN=$VITE_BACKEND_ORIGIN
ENV VITE_ADMIN_URL=$VITE_ADMIN_URL
RUN npm run build

FROM nginx:alpine
COPY --from=shop-build /app/dist /usr/share/nginx/html
COPY --from=admin-build /admin/dist /usr/share/nginx/html/admin
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
