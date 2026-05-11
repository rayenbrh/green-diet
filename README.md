# Green Diet — plateforme e-commerce sans gluten (Sfax)

Monorepo : boutique publique (`frontend`), administration (`frontend/admin`, en **production Docker** servie sous **`/admin/`** sur la **même URL que la boutique**), API Express + MongoDB (`backend`). En développement local, l’API peut encore servir `/admin/` si un build admin est présent dans `admin-dist` ou `frontend/admin/dist`.

## Prérequis

- Node.js 20+
- MongoDB (local ou conteneur)
- Comptes facultatifs : Cloudinary / Twilio (notifications WhatsApp avancées)

## Configuration locale

### Une seule commande (API + boutique + rebuild admin)

À la racine du dépôt :

```bash
npm install
npm install --prefix backend
npm install --prefix frontend
npm install --prefix frontend/admin
npm run dev
```

Cela lance en parallèle :

- **backend** (`http://localhost:5001` par défaut, ou la valeur de `PORT` dans `backend/.env`) — API + **SPA admin** sous **`/admin/`** sur cette même origine (premier build admin ~ quelques secondes, puis `--watch`).
- **frontend** Vite (`http://localhost:5177`, voir `frontend/vite.config.js`).
- **`vite build --watch`** dans `frontend/admin/` pour garder `frontend/admin/dist` à jour.

`Ctrl+C` arrête tout.

### Connexion administrateur depuis la boutique

Sur **`/connexion`**, identifiants admin (après **`npm run seed:admin`** ou **`npm run seed`**) : redirection vers **`VITE_ADMIN_URL`**. En dev par défaut : `http://localhost:5001/admin/` (Express). En prod Docker : URL du **frontend** + `/admin/` (voir `frontend/.env.example`).

### Frontend boutique (.env)

```bash
cd frontend
cp .env.example .env
```

À définir notamment :

- `VITE_API_URL=http://localhost:5001/api`
- `VITE_BACKEND_ORIGIN=http://localhost:5001`
- `VITE_ADMIN_URL=http://localhost:5177/admin/` (ex. : même origine que la boutique si tu sers le build admin depuis Vite preview ou nginx)

### Admin (mode dev isolé — optionnel)

Pour travailler sur l’UI admin avec **HMR** (sans passer par `/admin/` sur Express) :

```bash
cd frontend/admin
# Le proxy envoie /api vers :5000 (backend doit tourner).
npm run dev
```

Ouvre **`http://localhost:5175/admin/`**.

### Backend seul — détails

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Sans `vite build --watch` pour l’admin, le serveur affiche un avertissement jusqu’à ce que **`frontend/admin/dist`** existe (`npm run build --prefix frontend/admin` une fois ou le `npm run dev` à la racine).

Variables CORS (voir `backend/.env.example`) :

- **`FRONTEND_URL`** — origine de la boutique (dev : `http://localhost:5177` selon votre port Vite)
- **`ADMIN_URL`** — origine du navigateur pour l’**interface admin** : **même valeur que `FRONTEND_URL`** si l’admin est sous `https://boutique…/admin/` ; sinon origine où `/admin/` est réellement servi (ex. API seule si tu n’utilises pas l’image frontend multi-étapes)
- **`CORS_ORIGINS`** — optionnel, origines supplémentaires séparées par des virgules

### Données de démo

```bash
cd backend
npm run seed
```

Catalogue + admin par défaut : **`admin@greendiet.tn`** / **`Admin@2025!`**.

Admin **sans** recréer les produits :

```bash
npm run seed:admin --prefix backend
```

## Déploiement (Easy Panel ou Docker)

Guide détaillé (boutique + admin sur le **frontend**, API seule sur le **backend**) : **[`DEPLOY_EASYPANEL.md`](./DEPLOY_EASYPANEL.md)**.

### Deux services (recommandé)

- **Backend** : image `backend/Dockerfile` (API uniquement). Contexte de build : **racine du dépôt** `.`
- **Frontend** : `frontend/Dockerfile` (boutique + dossier **`admin/`** du même répertoire, servi sous **`/admin/`** sur nginx). **Contexte Docker = dossier `frontend/`** (obligatoire pour les chemins `COPY`).

### Backend (Easy Panel)

- **Dockerfile** : `backend/Dockerfile`
- **Contexte** : racine du monorepo (`.`).
- **Port** : celui exposé par le service (souvent `5000` dans l’image).
- Variables : `backend/.env.example` — en prod avec admin sur le frontend : **`ADMIN_URL` = `FRONTEND_URL`** (même origine que la boutique).

### Frontend (Easy Panel)

- **Dockerfile** : `Dockerfile` dans le dossier **`frontend/`**
- **Contexte de build** : le dossier **`frontend/`** (même niveau que `package.json` et `admin/`), **pas** la racine du repo.
- **Build args** : `VITE_API_URL`, `VITE_BACKEND_ORIGIN`, **`VITE_ADMIN_URL`** = URL **frontend** + `/admin/` (ex. `https://ton-frontend…/admin/`).
- **Port interne** : **80**

### Docker Compose

```bash
cp backend/.env.example backend/.env
docker compose up --build
```

- Boutique : http://localhost  
- **Admin** : **http://localhost/admin/**  
- API : http://localhost:5000/api/health  

Seed admin : `docker compose exec backend npm run seed:admin`  
Seed complet (efface produits/catégories) : `docker compose exec backend npm run seed`

## Structure des dossiers

| Dossier | Rôle |
|--------|------|
| `backend/src` | API REST, Mongoose ; en prod Docker **sans** fichiers admin dans l’image |
| `frontend` | PWA cliente ; image Docker inclut aussi **`/admin/`** (build admin) |
| `frontend/admin` | Sources Vite de l’admin (`base` `/admin/`). Build copié dans l’image **frontend** sous `html/admin/` |

## Sécurité (rappels)

- Ne jamais committer `.env`.
- Révoquer ou modifier les secrets par défaut avant mise en ligne.
- Production : HTTPS, cookies `secure`, CORS avec domaines réels.
