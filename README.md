# Green Diet — plateforme e-commerce sans gluten (Sfax)

Monorepo : boutique publique (`frontend`), administration (`frontend/admin`, build servi par l’API Express), API Express + MongoDB (`backend`).

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

- **backend** (`http://localhost:5000`) — API + **SPA admin** sous **`http://localhost:5000/admin/`** (premier build admin ~ quelques secondes, puis `--watch`).
- **frontend** Vite (`http://localhost:5173`).
- **`vite build --watch`** dans `frontend/admin/` pour garder `frontend/admin/dist` à jour.

`Ctrl+C` arrête tout.

### Connexion administrateur depuis la boutique

Sur **`/connexion`**, utilisez les identifiants admin (après **`npm run seed`** dans `backend`) : redirection automatique vers **`http://localhost:5000/admin/`**. Le cookie refresh est alors sur la même origine que l’API.

### Frontend boutique (.env)

```bash
cd frontend
cp .env.example .env
```

À définir notamment :

- `VITE_API_URL=http://localhost:5000/api`
- `VITE_BACKEND_ORIGIN=http://localhost:5000` (pour la redirection admin)

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

Variables CORS :

- **`FRONTEND_URL`** — boutique dev : `http://localhost:5173`
- **`ADMIN_URL`** — origine de l’admin servie par Express : `http://localhost:5000` (ou votre domaine prod)

### Données de démo

```bash
cd backend
npm run seed
```

Administrateur après seed : **`admin@greendiet.tn`** / **`Admin@2025!`**.

## Déploiement (Easy Panel ou Docker)

Déployez **deux services** : l’API (backend) et la PWA boutique (frontend). L’admin est **incluse** dans l’image Docker du backend (build Vite de `frontend/admin` → fichiers statiques sous `/admin/` sur la même origine que l’API).

### Backend (Easy Panel)

- **Type** : Dockerfile
- **Répertoire du dépôt** : racine du monorepo
- **Dockerfile** : `backend/Dockerfile`
- **Contexte de build** : **racine du dépôt** (`.`). Ne pas utiliser `backend/` seul comme contexte : le Dockerfile copie `frontend/admin` pour builder l’admin.
- **Port** : `5000` (ou celui défini par `PORT` / votre reverse proxy)
- Variables d’environnement : copier depuis `backend/.env.example` (MongoDB, JWT, URLs CORS `FRONTEND_URL`, `ADMIN_URL`, secrets, etc.).

### Frontend boutique (Easy Panel)

- **Type** : Dockerfile dans `frontend/`, contexte **`frontend/`**
- **Build args** (selon `frontend/Dockerfile`) : `VITE_API_URL`, `VITE_BACKEND_ORIGIN`, `VITE_ADMIN_URL` pointant vers vos URLs publiques HTTPS.
- **Port** : `80` (nginx dans l’image) ou selon votre configuration.

### Docker Compose

Le build **Docker du backend** compile aussi **`frontend/admin`** et copie les fichiers statiques dans l’image (`admin-dist`).

```bash
cp backend/.env.example backend/.env
docker compose up --build
```

- Boutique : http://localhost:80  
- **Admin** : **`http://localhost:5000/admin/`**  
- API : http://localhost:5000/api/health  

Seed : `docker compose exec backend node src/seeders/seed.js`

## Structure des dossiers

| Dossier | Rôle |
|--------|------|
| `backend/src` | API REST, modèles Mongoose, sert **`/admin`** depuis `admin-dist` ou `frontend/admin/dist` |
| `frontend` | PWA cliente |
| `frontend/admin` | Sources Vite de l’admin (`base: /admin/`). Build → `frontend/admin/dist`. |

## Sécurité (rappels)

- Ne jamais committer `.env`.
- Révoquer ou modifier les secrets par défaut avant mise en ligne.
- Production : HTTPS, cookies `secure`, CORS avec domaines réels.
