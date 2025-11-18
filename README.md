# Nano POS

## Live Demo:

[https://nano-pos.tushar.co.za/](https://nano-pos.tushar.co.za/)

## Design Decisions

- **Full-stack Framework:** Next.js with App Router is used for both frontend and backend (Route Handlers), providing a unified development experience.
- **Frontend:** React with client-side components (`"use client"`) for interactive UI.
- **Styling:** Tailwind CSS for a utility-first approach to styling, enabling rapid UI development.
- **Database:** PostgreSQL, accessed directly using the `pg` client with raw SQL queries for maximum flexibility and control over database operations.
- **Database Connection Management:** `pg.Pool` is utilized for efficient and robust database connection pooling.
- **Environment Variables:** `dotenv` is used to manage sensitive configuration and database credentials, separating them from the codebase.
- **Performance Optimization:** React Compiler is enabled to automatically optimize React component re-renders.
- **API Design:** RESTful API endpoints are implemented using Next.js Route Handlers.
- **Transactional Integrity:** Database transactions (`BEGIN`, `COMMIT`, `ROLLBACK`) are employed for critical operations like checkout to ensure data consistency and atomicity.
- **Idempotency:** The checkout API implements idempotency using an `X-Idempotency-Key` header to prevent duplicate transactions.
- **Frontend State Management:** Local component state is managed using React's `useState` and `useEffect` hooks, keeping state management simple and localized.
- **Client-side Data Fetching:** Direct `fetch` API calls are used for client-side data retrieval and submission.

## Trade-offs

- **Raw SQL vs. ORM:** While raw SQL offers fine-grained control and potential performance benefits, it increases development time, requires careful query management, and lacks the type safety and schema migration benefits of a full ORM.
- **Client-side Product Search:** The product search functionality is implemented client-side. This approach is simple to develop but may not scale efficiently for very large product datasets, as all products are initially fetched and filtered in the browser. A server-side search would be more scalable for extensive inventories.

## Known Limitations

- **Idempotency Storage:** The current idempotency key storage for the checkout API is in-memory (`processedRequests` Set). This means idempotency is not guaranteed across server restarts or in horizontally scaled environments where requests might be routed to different server instances. For production, a persistent store (e.g., Redis, a dedicated database table) would be required.
- **Authentication and Authorization:** The current application does not include explicit authentication or authorization mechanisms, which are essential for securing a production-ready POS system.
- **Input Validation:** While database constraints provide some level of data integrity, comprehensive server-side input validation (e.g., using a library like Zod or Joi) is not explicitly implemented in the API routes. This is crucial for robust API design and preventing invalid data from reaching the database.
- **Testing Coverage:** Unit and integration testing is not implemented. Comprehensive testing is vital for application reliability and maintainability.

## Getting Started Locally

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Setup for Postgres:

### 1️. Install Docker & Docker Compose

If you haven’t already installed **Docker** and **Docker Compose**, install them first:

#### 🔹 For Windows & Mac:

- Install **Docker Desktop** 👉 [Download Here](https://www.docker.com/products/docker-desktop)
- Docker Compose is included in Docker Desktop.

#### 🔹 For Linux:

- Install Docker:
  ```sh
  sudo apt update && sudo apt install -y docker.io
  ```
- Install Docker Compose:
  ```sh
  sudo apt install -y docker-compose
  ```
- Start Docker:

  ```sh
  sudo systemctl start docker
  sudo systemctl enable docker
  ```

### Start the container

Navigate back to the root directory and run the following:

```sh
sudo docker compose up -d
```

### Check If Everything Is Running

Run the following command to list all running containers:

```sh
sudo docker ps
```

### Stop Everything (When Done)

To stop the running containers:

```sh
sudo docker-compose down
```
