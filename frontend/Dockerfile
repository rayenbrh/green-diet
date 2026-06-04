# Contexte Docker = ce dossier `frontend/` (là où se trouvent package.json, admin/, nginx.conf).
# Easy Panel : répertoire de build = dossier du service frontend (ex. …/code/frontend), Dockerfile = Dockerfile.

FROM node:20-alpine AS admin-build
WORKDIR /admin
COPY admin/package.json admin/package-lock.json ./
RUN npm ci
COPY admin/ ./
ARG VITE_API_URL=https://api.votredomaine.tn/api
ARG VITE_BACKEND_ORIGIN=https://api.votredomaine.tn
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_BACKEND_ORIGIN=$VITE_BACKEND_ORIGIN
RUN npm run build

FROM node:20-alpine AS shop-build
WORKDIR /app
COPY package.json package-lock.json ./
COPY .npmrc ./
RUN npm ci
COPY . .
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
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
