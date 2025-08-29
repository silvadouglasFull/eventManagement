# Room Reservation API

This project is a RESTful API for managing room reservations. It's built with Node.js, Express, and TypeScript, and uses Docker to manage the application environment. The data layer is handled by Drizzle ORM and a MySQL database.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

You need to have Docker and Docker Compose installed on your system.

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/silvadouglasFull/eventManagement
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

## API Endpoints

The API exposes the following endpoints. You can use the `curl` commands below to test each one.

### **Rooms Module (`/rooms`)**

#### `POST /rooms` - Create a new room

Creates a new meeting room.

```bash
curl --location 'http://localhost:3000/rooms' \
--header 'Content-Type: application/json' \
--data '{
    "name": "Alpha Meeting Room"
}'
```

#### `GET /rooms` - List rooms

Lists all meeting rooms with support for pagination and filtering.

```bash
# List all rooms (default pagination: page=1, limit=10)
curl --location 'http://localhost:3000/rooms'

# Example with specific pagination
curl --location 'http://localhost:3000/rooms?page=2&limit=5'
```

### **Reservations Module (`/reservations`)**

#### `POST /reservations` - Create a new reservation

Creates a new reservation for a specific room and time slot. The business logic prevents overlapping schedules.

```bash
# First, create a room and use its ID
curl --location 'http://localhost:3000/reservations' \
--header 'Content-Type: application/json' \
--data '{
    "room_id": "REPLACE_WITH_A_VALID_ROOM_UUID",
    "start_time": "2025-08-28T14:00:00Z",
    "end_time": "2025-08-28T15:00:00Z"
}'
```

#### `GET /reservations` - List reservations

Lists all reservations with support for pagination and filtering by room ID.

```bash
# List all reservations
curl --location 'http://localhost:3000/reservations'

# Example with filtering by room ID
curl --location 'http://localhost:3000/reservations?room_id=REPLACE_WITH_A_VALID_ROOM_UUID'
```

#### `DELETE /reservations/:id` - Cancel a reservation (Soft Delete)

Safely cancels a reservation using a soft delete.

```bash
curl --location --request DELETE 'http://localhost:3000/reservations/REPLACE_WITH_A_VALID_RESERVATION_ID'
```

## Testing

To run the project's unit tests, use the following command:

```bash
docker-compose exec api npm test
```
