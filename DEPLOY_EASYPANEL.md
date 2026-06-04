# Déploiement Easy Panel — deux services (API, boutique + admin)

L’**admin** est servie par **nginx sur le même service que la boutique** : URL du type **`https://votre-frontend…/admin/`**. L’API ne contient plus de build admin dans l’image Docker (plus léger).

1. **Backend** — uniquement l’API (`/api`, `/api/health`).
2. **Frontend** — boutique + fichiers admin sous **`/admin/`** (un seul build Docker multi-étapes).

Les variables doivent refléter vos **URL publiques HTTPS** (`COOKIE_SAMESITE=none` si la boutique et l’API ne sont pas « same-site »).

## 1. Contexte Docker **frontend** (important)

Le **`Dockerfile`** du dossier **`frontend/`** suppose que le **contexte de build est le dossier `frontend`** lui-même (celui qui contient `package.json`, le sous-dossier **`admin/`** et **`nginx.conf`**). C’est le cas par défaut si Easy Panel build depuis `…/frontend`.

Dans Easy Panel pour le service **frontend** :

- **Contexte** : répertoire **`frontend`** du dépôt (pas la racine du monorepo).
- **Dockerfile** : `Dockerfile` (dans ce même dossier).
- **Port interne** : **80** (nginx)

## 2. Variables — backend

- **`FRONTEND_URL`** — origine de la boutique (ex. `https://dokanzemni-frontend-….easypanel.host`).
- **`ADMIN_URL`** — même valeur que **`FRONTEND_URL`** lorsque l’admin est chargée depuis **`https://frontend…/admin/`** (l’en-tête `Origin` du navigateur est celui du frontend).
- **`CORS_ORIGINS`** — optionnel.
- **`PORT`**, **`NODE_ENV=production`**, **`TRUST_PROXY=1`**, MongoDB, JWT : voir `backend/.env.example`.
- **`PUBLIC_API_URL`** — URL publique HTTPS du backend **sans** `/api` (ex. `https://api.green-diet.tn`). Les réponses API renvoient des URLs d’images absolues.
- **Volume persistant** **`/app/uploads`** sur le service backend (sinon les images disparaissent au redéploiement).

Pour le service **backend** Easy Panel : contexte **racine du dépôt** `.`, Dockerfile **`backend/Dockerfile`**.

## 3. Build args — image frontend (boutique + admin)

Injectées au build (Vite fige les `VITE_*` dans le JS).

- **`VITE_API_URL`** — ex. `https://votre-backend…/api`
- **`VITE_BACKEND_ORIGIN`** — ex. `https://votre-backend…` (sans `/api`) — **obligatoire** pour les prévisualisations d’images dans l’admin
- **`VITE_ADMIN_URL`** — URL **frontend** vers l’admin, ex. **`https://votre-frontend…/admin/`**

L’étape **admin** du Dockerfile compile `frontend/admin` avec le même **`VITE_API_URL`** (URL absolue vers l’API) pour que le navigateur appelle le backend depuis la page admin.

## 4. Seed uniquement l’admin (sans produits)

À la racine du dépôt ou dans `backend/` (avec `.env` chargé) :

```bash
npm run seed:admin --prefix backend
```

Variables optionnelles :

- **`SEED_ADMIN_EMAIL`** (défaut : `admin@greendiet.tn`)
- **`SEED_ADMIN_PASSWORD`** (défaut : `Admin@2025!`)
- **`SEED_ADMIN_PHONE`** (défaut : `+21600000001`)

Si l’email existe déjà avec le rôle admin, le mot de passe n’est **pas** modifié. Si l’utilisateur existe en client, il est **promu** admin sans changer le mot de passe.

## 5. Check-list

1. `GET …/api/health` sur le backend → `ok`.
2. Ouvrir **`https://frontend…/admin/`** → interface admin.
3. Pas d’erreur CORS : **`ADMIN_URL`** = **`FRONTEND_URL`** quand l’admin est sur le frontend.
4. Connexion : si cookies bloqués entre sous-domaines, **`COOKIE_SAMESITE=none`** + HTTPS.
5. **`/admin/`** : si vous voyez « 404 · Page introuvable » (page boutique), la **PWA** a mis en cache l’ancien comportement — rebuild frontend après mise à jour, puis vider le cache / désinscrire le service worker (DevTools → Application). Le build exclut `/admin/` du fallback Workbox.

## 6. Docker Compose

`docker compose up --build` : le frontend est construit avec le contexte racine ; voir `docker-compose.yml`.

## 7. Seed catalogue complet (optionnel)

```bash
npm run seed --prefix backend
```

⚠️ Efface et recrée catégories et produits ; ne pas lancer en prod si vous avez déjà des données.
