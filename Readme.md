# Room Reservation API

This project is a RESTful API for managing room reservations. It's built with Node.js, Express, and TypeScript, and uses Docker to manage the application environment. The data layer is handled by Drizzle ORM and a MySQL database.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

You need to have Docker and Docker Compose installed on your system.

### Installation

1.  **Clone the repository:**

    ```bash
    git clone [https://github.com/silvadouglasFull/eventManagement](https://github.com/silvadouglasFull/eventManagement)
    cd eventManagement
    ```

2.  **Configure environment variables:**
    Create a `.env` file in the project's root directory with the following content. These credentials are used to configure both the database and the API.

    ```bash
    # Docker Environment Variables
    MYSQL_ROOT_PASSWORD=my-strong-password
    MYSQL_DATABASE=skedway
    MYSQL_USER=skedway_user
    MYSQL_PASSWORD=skedway_password

    # API Environment Variables
    PORT=3000
    DB_HOST=db
    JWT_SECRET=your_secret_key_change_me
    ```

3.  **Start containers and install dependencies:**
    Run the following command to build and start the API and database containers, and install all project dependencies.

    ```bash
    docker-compose up --build
    ```

4.  **Run database migrations:**
    With the containers running, apply the Drizzle migrations to set up the necessary tables in the database.

    ```bash
    docker-compose exec api npx drizzle-kit migrate
    ```

5.  **Run database seeders:**
    After migrations, populate the database with sample data (users, rooms, and reservations).

    ```bash
    docker-compose exec api npm run seed
    ```

## Authentication and API Endpoints

All authenticated routes now require a JWT passed via an **HttpOnly cookie named `token`**.

### **Authentication Module (`/auth`)**

#### `POST /auth/login` - Authenticate a user

Authenticates a user with email and password. A successful login returns a JWT in an `HttpOnly` cookie.

```bash
curl --location --request POST 'http://localhost:3000/auth/login' \
--header 'Content-Type: application/json' \
--data '{
    "email": "user@example.com",
    "password": "my-secure-password"
}'
```

### **Users Module (`/users`)**

#### `POST /users` - Create a new user

Creates a new user. Passwords are automatically hashed and stored securely.

```bash
curl --location 'http://localhost:3000/users' \
--header 'Content-Type: application/json' \
--data '{
    "name": "João da Silva",
    "email": "joao@example.com",
    "password": "my-strong-password"
}'
```

### **Rooms Module (`/rooms`)**

#### `POST /rooms` - Create a new room

Creates a new meeting room.

```bash
# This route does not require authentication
curl --location 'http://localhost:3000/rooms' \
--header 'Content-Type: application/json' \
--data '{
    "name": "Alpha Meeting Room"
}'
```

#### `GET /rooms` - List rooms

Lists all meeting rooms with support for pagination and filtering.

```bash
# This route does not require authentication
# List all rooms (default pagination: page=1, limit=10)
curl --location 'http://localhost:3000/rooms'

# Example with specific pagination
curl --location 'http://localhost:3000/rooms?page=2&limit=5'
```

---

### **Reservations Module (`/reservations`)**

**Note:** All endpoints in this module are now protected and require a valid JWT.

#### `POST /reservations` - Create a new reservation

Creates a new reservation for a specific room and time slot, associated with the authenticated user.

```bash
# Requires an authenticated session (login) to get the 'token' cookie.
# Replace with a valid room UUID and a valid date/time.
curl --location --request POST 'http://localhost:3000/reservations' \
--header 'Content-Type: application/json' \
--header 'Cookie: token=YOUR_AUTH_TOKEN_HERE' \
--data '{
    "room_id": "REPLACE_WITH_A_VALID_ROOM_UUID",
    "start_time": "2025-08-28T14:00:00Z",
    "end_time": "2025-08-28T15:00:00Z"
}'
```

#### `GET /reservations` - List reservations

Lists reservations with support for pagination and filtering by `room_id`. By default, it lists only the authenticated user's reservations.

```bash
# Requires an authenticated session (login) to get the 'token' cookie.
# List all reservations for the authenticated user
curl --location 'http://localhost:3000/reservations' \
--header 'Cookie: token=YOUR_AUTH_TOKEN_HERE'

# Example with filtering by room ID
curl --location 'http://localhost:3000/reservations?room_id=REPLACE_WITH_A_VALID_ROOM_UUID' \
--header 'Cookie: token=YOUR_AUTH_TOKEN_HERE'
```

#### `DELETE /reservations/:id` - Cancel a reservation (Soft Delete)

Safely cancels a reservation using a soft delete. Now, a user can only cancel their own reservations.

```bash
# Requires an authenticated session.
curl --location --request DELETE 'http://localhost:3000/reservations/REPLACE_WITH_A_VALID_RESERVATION_ID' \
--header 'Cookie: token=YOUR_AUTH_TOKEN_HERE'
```

## Testing

To run the project's unit tests, use the following command:

```bash
docker-compose exec api npm test
```
