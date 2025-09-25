# Book Review REST API

## Project Description
The **Book Review REST API** is a backend service that powers book discovery and community feedback. It provides secure user authentication, complete CRUD workflows for books and reviews, powerful search, and paginated responses so clients can efficiently browse large result sets. Swagger documentation is bundled at `/api-docs`, making it easy to evaluate or integrate the API.

## Tech Stack
- **Node.js**
- **Express**
- **MongoDB**
- **Mongoose**
- **JWT (JSON Web Tokens)**
- **Swagger**

## Features
- **User Authentication**: Signup, login, refresh, and logout flows secured with JWT access and refresh tokens.
- **Book Management**: Authenticated users can add/update books, fetch detailed information, and delete records.
- **Review Management**: Authenticated users can add, update, and delete reviews for specific books, with one review per user per book enforced.
- **Advanced Search**: Search books by title, author, or ISBN with case-insensitive, partial matching.
- **Pagination**: All collection endpoints support configurable page and limit parameters to optimize performance and client experience.
- **OpenAPI Reference**: Interactive Swagger UI hosted at `/api-docs` to explore schema details and execute sample requests.

## Setup Instructions
1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd book-review-api
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Configure environment variables**
   - Duplicate `.env.example` if available, or create a new `.env` file.
   - Populate the variables listed below.
4. **Start the development server**
   ```bash
   npm run dev
   ```
5. **Open the API documentation**
   - Visit `http://localhost:3000/api-docs` to review the Swagger UI and test requests.

## Environment Variables
Create a `.env` file in the project root with the following values:

| Variable      | Description                                                      | Example Value                         |
|---------------|------------------------------------------------------------------|---------------------------------------|
| `PORT`        | Server port (defaults to `3000` if omitted)                      | `3000`                                |
| `MONGODB_URL` | MongoDB connection string (`MONGO_URI` alias can be added if desired) | `mongodb://127.0.0.1:27017/book_review_db` |
| `JWT_SECRET`  | Secret key used to sign JWT access and refresh tokens            | `super-secure-secret`                 |


## API Endpoints

| Method | URL                        | Auth                | Description                                    | Request Body (JSON)                                                                                                                                         | Sample Response (JSON) |
|--------|----------------------------|---------------------|------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------|
| POST   | `/auth/signup`             | No                  | Register a new reader account                  | `{ "name": "Jane Doe", "email": "jane@example.com", "password": "P@ssw0rd!" }`                                                                           | `{ "accessToken": "...", "refreshToken": "...", "user": { "id": "...", "name": "Jane Doe", "email": "jane@example.com" } }` |
| POST   | `/auth/login`              | No                  | Authenticate and receive tokens                | `{ "email": "jane@example.com", "password": "P@ssw0rd!" }`                                                                                               | Same structure as signup response |
| POST   | `/auth/refresh`            | No (refresh token)  | Exchange a refresh token for fresh credentials | `{ "refreshToken": "<refresh-token>" }`                                                                                                                    | `{ "accessToken": "...", "refreshToken": "..." }` |
| POST   | `/auth/logout`             | No (refresh token)  | Invalidate refresh token                       | `{ "refreshToken": "<refresh-token>" }`                                                                                                                    | `{ "message": "Logged out successfully" }` |
| POST   | `/books`                   | Bearer token        | Create a new book entry                        | `{ "isbn": "9780132350884", "title": "Clean Code", "author": "Robert C. Martin", "genre": "Programming", "description": "A classic." }`             | `{ "message": "Book added successfully", "book": { ... } }` |
| GET    | `/books`                   | Optional (public)   | List books with optional filters and pagination| Query params: `page=1&limit=10&author=Martin&genre=Programming`                                                       | `{ "page": 1, "limit": 10, "total": 1, "books": [ ... ] }` |
| GET    | `/books/{id}`              | Optional (public)   | Retrieve a book plus paginated reviews         | Path param `id` (Mongo ObjectId). Optional query params `page` & `limit` for reviews.                                                                       | `{ "book": { ... }, "reviews": [ ... ], "reviewsCount": 4, "page": 1, "limit": 5 }` |
| GET    | `/books/search/query`      | Optional (public)   | Search by title, author, or ISBN               | Query params: `q=clean code&page=1&limit=10`                                                                          | `{ "page": 1, "limit": 10, "total": 1, "books": [ ... ] }` |
| POST   | `/books/{bookId}/reviews`  | Bearer token        | Add a review to a book                         | `{ "rating": 5, "comment": "A must-read for developers." }`                                                                                               | `{ "message": "Review added successfully", "review": { ... } }` |
| PUT    | `/reviews/{id}`            | Bearer token        | Update an existing review                      | `{ "rating": 4, "comment": "Updated feedback after reread." }`                                                                                            | `{ "message": "Review updated successfully", "review": { ... } }` |
| DELETE | `/reviews/{id}`            | Bearer token        | Delete a review                                | _None_                                                                                                                                                       | `{ "message": "Review deleted successfully" }` |

### Response Codes
- **200 OK** – Successful request.
- **201 Created** – Resources created (books, reviews, signup).
- **400 Bad Request** – Validation or malformed request errors.
- **401 Unauthorized** – Missing or invalid authentication token.
- **403 Forbidden** – Action not permitted for the current user.
- **404 Not Found** – Resource does not exist.
- **500 Server Error** – Unexpected server-side errors.

## Database Schema
- **User**
  - Fields: `name`, `email`, `password`, `refreshToken`, timestamps.
  - Behavior: Passwords hashed via pre-save hook; unique email constraint.
- **Book**
  - Fields: `isbn`, `title`, `author`, `genre`, `description`, `averageRating`, `totalReviews`, timestamps.
  - Constraints: Unique 13-digit ISBN; derived rating metrics updated from review activity.
- **Review**
  - Fields: `user` (ref `User`), `book` (ref `Book`), `rating`, `comment`, timestamps.
  - Relationships: Each review links to one user and one book; composite index prevents multiple reviews by the same user for a single book.

## Example Requests
Use the interactive Swagger UI to execute sample requests:
- Navigate to `http://localhost:3000/api-docs` after starting the server.
- Authenticate via the **Authorize** button to test protected endpoints with your JWT.

Example `curl` request to add a book:
```bash
curl -X POST "http://localhost:3000/books" \
  -H "Authorization: Bearer <access-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "isbn": "9780132350884",
    "title": "Clean Code",
    "author": "Robert C. Martin",
    "genre": "Programming",
    "description": "A handbook of agile software craftsmanship"
  }'
```

## Notes
- **Token Strategy**: Short-lived access tokens and longer-lived refresh tokens are both signed with the same `JWT_SECRET`. Keep this secret strong and private.
- **Validation**: Controllers provide defensive checks for pagination, ObjectId formats, and schema constraints. Adjust limits or error messages to match production requirements.
- **Deployment**: Update the Swagger server list (`config/swagger.js`) with your deployment URL so documentation points to the correct environments.
