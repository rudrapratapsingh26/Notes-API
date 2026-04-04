# Notes API

A secure REST API for managing personal notes with JWT authentication. Users register, log in, and get access to their own notes — nobody can read or modify another user's data. Built with Node.js, Express, and MongoDB.

## Tech Stack

- **Runtime** — Node.js
- **Framework** — Express.js v5
- **Database** — MongoDB with Mongoose
- **Auth** — JWT (access + refresh tokens) + bcrypt
- **Environment** — dotenv

## Project Structure

```
├── src/
│   ├── controllers/
│   │   ├── user.controllers.js    # register, login, logout, refresh token
│   │   └── notes.controllers.js   # full CRUD for notes
│   ├── database/
│   │   └── notes.database.js      # MongoDB connection
│   ├── middleware/
│   │   └── auth.middleware.js     # JWT verification middleware
│   ├── models/
│   │   ├── user.models.js         # User schema with JWT + bcrypt methods
│   │   └── note.models.js         # Note schema with user reference
│   ├── routes/
│   │   ├── user.routes.js         # auth routes
│   │   └── notes.routes.js        # note routes (all protected)
│   └── utils/
│       ├── api-errors.js          # custom ApiError class
│       ├── api-response.js        # consistent ApiResponse class
│       └── async-handler.js       # async error wrapper
├── app.js                          # Express app setup
├── index.js                        # server entry point
└── .env                            # environment variables (not committed)
```

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB (local or MongoDB Atlas)

### Installation

```bash
# Clone the repo
git clone https://github.com/rudrapratapsingh26/notes-api.git
cd notes-api

# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```env
MONGODB_URI=mongodb://localhost:27017/notes-api
PORT=8000
ACCESS_TOKEN_SECRET=your_access_token_secret_here
REFRESH_TOKEN_SECRET=your_refresh_token_secret_here
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d
```

For MongoDB Atlas:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/notes-api
```

### Run the Server

```bash
# Development (with auto-restart)
npm run dev

# Production
npm start
```

Server runs on `http://localhost:8000`

---

## How Authentication Works

1. Register an account — password is hashed with bcrypt before saving
2. Login — server returns a short-lived `accessToken` (15 min) and long-lived `refreshToken` (7 days)
3. Send `accessToken` in every protected request as `Authorization: Bearer <token>`
4. When access token expires — call `/refresh-token` with your refresh token to get a new one
5. Logout — refresh token is invalidated in the database

---

## API Reference

### Auth endpoints

#### Register

```http
POST /api/v1/users/register
```

**Request body:**
```json
{
  "username": "rudra",
  "email": "rudra@example.com",
  "password": "secret123"
}
```

**Response `201`:**
```json
{
  "statusCode": 201,
  "data": {
    "id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "email": "rudra@example.com",
    "username": "rudra"
  },
  "message": "User registered successfully",
  "success": true
}
```

---

#### Login

```http
POST /api/v1/users/login
```

**Request body:**
```json
{
  "email": "rudra@example.com",
  "password": "secret123"
}
```

**Response `200`:**
```json
{
  "statusCode": 200,
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  },
  "message": "Login successful",
  "success": true
}
```

---

#### Logout

```http
POST /api/v1/users/logout
```

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response `200`:**
```json
{
  "statusCode": 200,
  "data": null,
  "message": "Logout successful",
  "success": true
}
```

---

#### Refresh access token

```http
POST /api/v1/users/refresh-token
```

**Request body:**
```json
{
  "refreshToken": "eyJhbGc..."
}
```

**Response `200`:**
```json
{
  "statusCode": 200,
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  },
  "message": "Access token refreshed",
  "success": true
}
```

---

### Notes endpoints

All note endpoints require `Authorization: Bearer <accessToken>` header. Each user can only access their own notes.

#### Get all notes

```http
GET /api/v1/notes
```

Returns notes sorted by most recently created. Only returns notes belonging to the logged-in user.

**Response `200`:**
```json
{
  "statusCode": 200,
  "data": [
    {
      "_id": "64f1a2b3...",
      "title": "My first note",
      "content": "Note content here",
      "tags": ["javascript", "backend"],
      "isPinned": false,
      "userId": "64f1a2b3...",
      "createdAt": "2026-03-30T10:00:00.000Z",
      "updatedAt": "2026-03-30T10:00:00.000Z"
    }
  ],
  "message": "Notes retrieved successfully",
  "success": true
}
```

---

#### Create a note

```http
POST /api/v1/notes
```

**Request body:**
```json
{
  "title": "My first note",
  "content": "Note content here",
  "tags": ["javascript", "backend"],
  "isPinned": false
}
```

**Response `201`:**
```json
{
  "statusCode": 201,
  "data": {
    "_id": "64f1a2b3...",
    "title": "My first note",
    "content": "Note content here",
    "tags": ["javascript", "backend"],
    "isPinned": false,
    "userId": "64f1a2b3...",
    "createdAt": "2026-03-30T10:00:00.000Z"
  },
  "message": "Note created successfully",
  "success": true
}
```

---

#### Get a single note

```http
GET /api/v1/notes/:id
```

**Response `200`:** returns the note object.

Returns `400` for invalid ID format. Returns `404` if note doesn't exist or belongs to another user.

---

#### Update a note

```http
PATCH /api/v1/notes/:id
```

**Request body** (any field to update):
```json
{
  "title": "Updated title",
  "isPinned": true
}
```

Only the fields provided are updated — others remain unchanged.

**Response `200`:** returns the updated note object.

---

#### Delete a note

```http
DELETE /api/v1/notes/:id
```

**Response `200`:**
```json
{
  "statusCode": 200,
  "data": null,
  "message": "Note deleted successfully",
  "success": true
}
```

---

## Error Responses

All errors follow a consistent shape:

```json
{
  "statusCode": 401,
  "data": null,
  "message": "Unauthorized — no token provided",
  "success": false
}
```

| Status | Meaning |
|--------|---------|
| `400` | Bad request — missing or invalid fields |
| `401` | Unauthorized — missing, invalid, or expired token |
| `404` | Note not found or belongs to another user |
| `409` | Conflict — email or username already registered |
| `500` | Internal server error |

---

## Data Models

### User

```js
{
  username: String,      // unique, 3–30 chars, lowercase
  email: String,         // unique, validated format
  password: String,      // bcrypt hashed — never returned in responses
  refreshToken: String,  // stored for logout invalidation
  createdAt: Date,
  updatedAt: Date
}
```

### Note

```js
{
  title: String,         // required, max 100 chars
  content: String,       // required
  userId: ObjectId,      // ref to User — data isolation key
  isPinned: Boolean,     // default false
  tags: [String],        // default []
  createdAt: Date,
  updatedAt: Date
}
```

---

## Security

- Passwords hashed with bcrypt (10 salt rounds) before storing
- Access tokens expire in 15 minutes — limited damage if stolen
- Refresh tokens stored in DB — can be invalidated on logout
- All note queries filter by `userId` — users can never access each other's data
- Invalid ObjectId format rejected before hitting the database
- Sensitive fields (`password`, `refreshToken`) excluded from all responses

---

## What I Learned Building This

- JWT access token + refresh token flow from scratch
- Writing reusable auth middleware with `verifyJWT`
- Protecting routes with `router.use(middleware)`
- Data isolation — filtering every query by `req.user._id`
- Custom error classes (`ApiError`) and consistent response shape (`ApiResponse`)
- `asyncHandler` utility to eliminate try/catch boilerplate
- Mongoose `pre("save")` hooks and instance methods
- `validateBeforeSave: false` when updating non-validated fields
- ObjectId validation with `mongoose.Types.ObjectId.isValid()`
- Selective field exclusion with `.select("-password -refreshToken")`

---

## Upcoming (Project 4)

- [ ] React frontend — login, register, notes dashboard
- [ ] Deploy backend to Railway
- [ ] Deploy frontend to Vercel
- [ ] First full-stack live URL

---

## Author

**Rudra Pratap Singh** — 1st year BTech student learning full-stack development.

- GitHub: [@rudrapratapsingh26](https://github.com/rudrapratapsingh26)
- Twitter: [@Rudrapratap2610](https://twitter.com/Rudrapratap2610)
