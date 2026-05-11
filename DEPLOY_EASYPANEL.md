# Déploiement Easy Panel — deux services (API + admin, boutique)

L’**administration** n’est **pas** un service à part : elle est **compilée dans l’image backend** et servie par Express sous **`/admin/`** (même origine que l’API). Vous déployez seulement :

1. **Backend** — API `/api` + SPA admin `/admin/`
2. **Boutique** — PWA dans `frontend/` (nginx)

Les variables doivent refléter vos **URL publiques HTTPS** (cookies en production ; `COOKIE_SAMESITE=none` seulement si besoin cross-site).

## 1. Vue d’ensemble

| Service  | Build | Rôle |
|----------|--------|------|
| Backend  | `backend/Dockerfile`, contexte **racine** du dépôt | API, `/api/health`, fichiers statiques **`/admin/`** (build Vite de `frontend/admin` avec `VITE_API_URL=/api`) |
| Boutique | `frontend/Dockerfile`, contexte **`frontend/`** | Site client |

CORS : origines autorisées = `FRONTEND_URL`, `ADMIN_URL`, `CORS_ORIGINS`. Quand l’admin est uniquement sur **`https://api.../admin/`**, le navigateur envoie `Origin: https://api...` — mettez **`ADMIN_URL`** (et souvent la même valeur pour couvrir l’admin) sur **l’origine de l’API** (ex. `https://api.votredomaine.tn`), pas un troisième domaine « admin ».

## 2. Variables — backend (Easy Panel)

Copier depuis `backend/.env.example`.

- **`FRONTEND_URL`** — origine de la boutique (ex. `https://boutique.votredomaine.tn`).
- **`ADMIN_URL`** — origine depuis laquelle l’admin est chargée. Ici : **la même que l’API** (ex. `https://api.votredomaine.tn`), car l’admin est sous `/admin/` sur ce host.
- **`CORS_ORIGINS`** — optionnel (www, préprod, etc.).
- **`PORT`**, **`NODE_ENV=production`**, **`TRUST_PROXY=1`**, secrets JWT / MongoDB : voir `backend/.env.example`.
- **`COOKIE_SAMESITE=none`** — seulement si boutique et API ne sont pas « same-site » et que vous avez HTTPS partout.

## 3. Build args — boutique (`frontend/`)

Injectées au **`npm run build`** (build args ou env de l’étape build).

- **`VITE_API_URL`** — ex. `https://api.votredomaine.tn/api`
- **`VITE_BACKEND_ORIGIN`** — ex. `https://api.votredomaine.tn`
- **`VITE_ADMIN_URL`** — ex. **`https://api.votredomaine.tn/admin/`** (redirection après connexion admin depuis la boutique)

Référence : `frontend/.env.example`.

## 4. Développement local

- `npm run dev` à la racine : API (+ admin en rebuild watch) et boutique Vite.
- Admin seule en HMR : `cd frontend/admin && npm run dev` (proxy `/api` → voir `frontend/admin/vite.config.js`).

## 5. Check-list

1. `GET .../api/health` → JSON `ok`.
2. Ouvrir **`.../admin/`** sur l’URL du backend → interface admin.
3. Pas d’erreur CORS depuis la boutique vers l’API.
4. Si 401 en boucle après login : `COOKIE_SAMESITE` / domaines — voir `backend/.env.example`.

## 6. Docker Compose

`docker compose up --build` : boutique sur le port 80 du service frontend, API + admin sur le service backend (voir `README.md`).

## 7. Fichiers utiles (CORS, cookies, liens)

`backend/src/config/corsOptions.js`, `backend/src/config/env.js`, `backend/src/controllers/auth.controller.js`, `backend/src/server.js`, `frontend/src/lib/backendOrigin.js` (`VITE_ADMIN_URL` optionnelle ; sinon `.../admin/` sur `VITE_BACKEND_ORIGIN`).
