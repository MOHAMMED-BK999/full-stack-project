# E-Store Project

A full-stack e-commerce sample application with an Angular frontend and a Spring Boot backend.

## Project structure

- `backend/backend/` - Spring Boot backend service
- `frontend/e-store-frontend/` - Angular frontend application

## Tech stack

- Backend: Spring Boot 3.5.2, Java 21, Spring Data MongoDB, MongoDB GridFS
- Frontend: Angular 21, Angular SSR support, TypeScript, RxJS

## Prerequisites

- Java 21 JDK
- Maven or use the included Maven wrapper
- Node.js 18+ and npm
- MongoDB running locally or accessible remotely

## Backend

### Run backend

From `backend/backend/`:

Windows:

```bash
cd backend/backend
./mvnw.cmd spring-boot:run
```

macOS/Linux:

```bash
cd backend/backend
./mvnw spring-boot:run
```

### Build backend

```bash
cd backend/backend
./mvnw.cmd clean package
```

### Backend API

- `GET /api/products` - list products
- `GET /api/products/{id}` - get product details
- `POST /api/products` - create product
- `PUT /api/products/{id}` - update product
- `DELETE /api/products/{id}` - delete product
- `POST /api/products/{id}/image` - upload image file for product
- `GET /api/products/{id}/image` - retrieve stored product image

The backend stores product images in MongoDB GridFS and serves them from its own image endpoint.

## Frontend

### Install dependencies

```bash
cd frontend/e-store-frontend
npm install
```

### Run frontend

```bash
cd frontend/e-store-frontend
npm start
```

Open the browser at `http://localhost:4200`.

### Build frontend

```bash
cd frontend/e-store-frontend
npm run build
```

### SSR serve (optional)

After building the app:

```bash
cd frontend/e-store-frontend
npm run serve:ssr:e-store-frontend
```

## Development notes

- The backend allows CORS requests from `http://localhost:4200`.
- Product creation expects an image URL by default; the backend downloads the image and stores it in MongoDB.
- Admin requests are protected using the custom `AdminAccessService` header.

## Useful commands

### Full-stack dev workflow

Start MongoDB, run the backend, then run the frontend.

### Clean and rebuild

```bash
cd backend/backend
./mvnw.cmd clean package

cd ../..rontend/e-store-frontend
npm run build
```

## Additional resources

- Angular CLI: https://angular.io/cli
- Spring Boot: https://spring.io/projects/spring-boot
- MongoDB GridFS: https://www.mongodb.com/docs/manual/core/gridfs/
