# TechnoDOM Backend

Node.js + Express + TypeScript API with SQLite (Prisma) and MinIO for image storage.

## Stack

- **Express** — HTTP server
- **Prisma** + **SQLite** — database (zero setup, file-based)
- **MinIO** — S3-compatible image storage (via Docker)
- **Helmet** + **CORS** — security headers
- **Multer** — multipart file uploads (memory storage, 5 MB limit)

---

## Quick Start

### 1. Install dependencies

```bash
cd backend
npm install   # or pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

### 3. Start MinIO (Docker required)

```bash
docker-compose up -d
```

MinIO console: http://localhost:9001 (login: `minioadmin` / `minioadmin`)

### 4. Initialise the database & seed

```bash
npm run db:push    # create SQLite schema
npm run db:seed    # load sample data
```

### 5. Run development server

```bash
npm run dev
# → http://localhost:4000
```

---

## API Reference

### Health

| Method | Path      | Description         |
| ------ | --------- | ------------------- |
| GET    | `/health` | Server health check |

---

### Products — `/api/products`

| Method | Path                | Description                |
| ------ | ------------------- | -------------------------- |
| GET    | `/api/products`     | List products (filterable) |
| GET    | `/api/products/:id` | Get product by ID          |
| POST   | `/api/products`     | Create product             |
| PUT    | `/api/products/:id` | Update product             |
| DELETE | `/api/products/:id` | Delete product             |

**GET query params:**

| Param       | Type                             | Example     |
| ----------- | -------------------------------- | ----------- |
| `page`      | number                           | `1`         |
| `pageSize`  | number                           | `12`        |
| `category`  | string                           | `Смартфоны` |
| `search`    | string                           | `iPhone`    |
| `minPrice`  | number                           | `10000`     |
| `maxPrice`  | number                           | `100000`    |
| `inStock`   | boolean                          | `true`      |
| `sortBy`    | `price\|name\|rating\|createdAt` | `price`     |
| `sortOrder` | `asc\|desc`                      | `asc`       |

**POST / PUT body** (`multipart/form-data`):

| Field         | Type                           | Required  |
| ------------- | ------------------------------ | --------- |
| `name`        | string                         | POST only |
| `description` | string                         | POST only |
| `price`       | number                         | POST only |
| `oldPrice`    | number                         | —         |
| `category`    | string                         | POST only |
| `inStock`     | boolean                        | —         |
| `rating`      | number                         | —         |
| `reviewCount` | number                         | —         |
| `image`       | file (jpg/png/webp/gif, ≤5 MB) | —         |

---

### Categories — `/api/categories`

| Method | Path                  | Body               |
| ------ | --------------------- | ------------------ |
| GET    | `/api/categories`     | —                  |
| POST   | `/api/categories`     | `{ name, slug }`   |
| PUT    | `/api/categories/:id` | `{ name?, slug? }` |
| DELETE | `/api/categories/:id` | —                  |

---

### Filter Groups — `/api/filters`

| Method | Path                                 | Body                     |
| ------ | ------------------------------------ | ------------------------ |
| GET    | `/api/filters`                       | — (includes options)     |
| POST   | `/api/filters`                       | `{ name, key, type }`    |
| PUT    | `/api/filters/:id`                   | `{ name?, key?, type? }` |
| DELETE | `/api/filters/:id`                   | —                        |
| GET    | `/api/filters/:id/options`           | —                        |
| POST   | `/api/filters/:id/options`           | `{ label, value }`       |
| PUT    | `/api/filters/:id/options/:optionId` | `{ label?, value? }`     |
| DELETE | `/api/filters/:id/options/:optionId` | —                        |

`type` must be one of: `checkbox`, `select`, `range`

---

### Standalone Image Upload — `/api/upload`

| Method | Path          | Body                                  |
| ------ | ------------- | ------------------------------------- |
| POST   | `/api/upload` | `multipart/form-data` — field `image` |

**Response:**

```json
{ "url": "http://localhost:9000/products/uuid.jpg", "filename": "uuid.jpg" }
```

---

## Notes

- Product IDs are integers (`1`, `2`, …). If connecting to an existing frontend using string IDs, update the `Product` type in the frontend.
- Search is case-insensitive for ASCII; Cyrillic search is exact-case with SQLite. Migrate to PostgreSQL for full Unicode case-insensitive search.
- Old MinIO images are not auto-deleted when a product is updated or deleted — clean up manually via the MinIO console if needed.
