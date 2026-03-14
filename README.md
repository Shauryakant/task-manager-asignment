# Task Manager Assignment

This is a separate full-stack project created for the `Full_Stack_Assignment_Advanced_260225_013337 (1).pdf` requirements. It does not modify the earlier `PROJECT-MANAGE` app.

## Live Links

- Live URL: `https://task-manager-asignment.onrender.com`
- GitHub Repository: `https://github.com/Shauryakant/task-manager-asignment`

## What It Includes

- Node.js + Express backend
- MongoDB with Mongoose
- JWT authentication
- access and refresh tokens stored in HTTP-only cookies
- bcrypt password hashing
- task CRUD for the logged-in user only
- pagination, status filter, and title search
- encrypted task descriptions using AES-256-GCM before database storage
- protected frontend UI served from the same Express app
- structured validation and error handling

## Project Structure

```text
TASK-MANAGER-ASSIGNMENT/
  public/
    assets/
      app.js
      styles.css
    index.html
  src/
    controllers/
    db/
    middlewares/
    models/
    routes/
    utils/
    app.js
    index.js
```

## Environment Variables

Create a `.env` file using `.env.example`.

```env
PORT=8000
MONGODB_URI=mongodb://127.0.0.1:27017/task-manager-assignment
ACCESS_TOKEN_SECRET=replace-with-a-long-random-string
REFRESH_TOKEN_SECRET=replace-with-a-long-random-string
TASK_ENCRYPTION_KEY=replace-with-32-char-key-material
NODE_ENV=development
```

## Setup

```bash
npm install
npm run dev
```

Open `http://localhost:8000`.

## Architecture Notes

- The frontend is served from the same Express app to keep cookie auth simple and reliable.
- Each task document belongs directly to one user through the `user` field.
- Every read, update, and delete operation is filtered by both `taskId` and `req.user._id`.
- Task descriptions are encrypted at write time and decrypted only when returned to the authenticated owner.

## Security Notes

- `httpOnly` cookies are used for both access and refresh tokens.
- `secure` cookies are automatically enabled when `NODE_ENV=production`.
- Passwords are hashed with bcrypt.
- Validation is enforced with `express-validator`.
- MongoDB queries are built with scoped conditions to prevent users from accessing other users' tasks.

## API Summary

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh-token`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Tasks

- `POST /api/tasks`
- `GET /api/tasks?page=1&limit=10&status=todo&search=readme`
- `GET /api/tasks/:taskId`
- `PUT /api/tasks/:taskId`
- `DELETE /api/tasks/:taskId`

## Sample Requests And Responses

### Register

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Aman Patel",
  "email": "aman@example.com",
  "password": "StrongPass1"
}
```

```json
{
  "statusCode": 201,
  "data": {
    "user": {
      "_id": "67d3...",
      "name": "Aman Patel",
      "email": "aman@example.com",
      "createdAt": "2026-03-14T08:00:00.000Z"
    }
  },
  "message": "User registered successfully",
  "success": true
}
```

### Create Task

```http
POST /api/tasks
Content-Type: application/json
Cookie: accessToken=...

{
  "title": "Submit assignment",
  "description": "Push code, deploy app, and update README",
  "status": "in_progress"
}
```

```json
{
  "statusCode": 201,
  "data": {
    "task": {
      "_id": "67d3...",
      "title": "Submit assignment",
      "description": "Push code, deploy app, and update README",
      "status": "in_progress",
      "createdAt": "2026-03-14T08:10:00.000Z",
      "updatedAt": "2026-03-14T08:10:00.000Z"
    }
  },
  "message": "Task created",
  "success": true
}
```

### List Tasks

```http
GET /api/tasks?page=1&limit=6&status=todo&search=submit
Cookie: accessToken=...
```

```json
{
  "statusCode": 200,
  "data": {
    "tasks": [],
    "pagination": {
      "total": 0,
      "page": 1,
      "limit": 6,
      "totalPages": 1
    }
  },
  "message": "Tasks fetched successfully",
  "success": true
}
```

## Deployment

The application is deployed on Render and serves both the frontend and backend from a single Node.js web service:

- Live app: `https://task-manager-asignment.onrender.com`
- Health endpoint: `https://task-manager-asignment.onrender.com/api/health`
