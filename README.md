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

## Frontend Features

- register and login forms
- protected dashboard after authentication
- create, edit, delete, and view personal tasks
- filter tasks by status
- search tasks by title
- paginate task list results
- automatic session restore using cookie-based auth

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

## Authorization Model

- Each user can access only their own tasks.
- Task queries are always scoped to the logged-in user.
- Even if a valid task ID is guessed manually, another user cannot read, edit, or delete that task unless it belongs to their account.

## Security Notes

- `httpOnly` cookies are used for both access and refresh tokens.
- `secure` cookies are automatically enabled when `NODE_ENV=production`.
- Passwords are hashed with bcrypt.
- Validation is enforced with `express-validator`.
- MongoDB queries are built with scoped conditions to prevent users from accessing other users' tasks.
- Sensitive task descriptions are encrypted before being stored in the database.
- AES-256-GCM is used so stored descriptions are not kept in plain text.

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

## Render Deployment Steps

1. Push the repository to GitHub.
2. Create a new Render `Web Service`.
3. Connect the GitHub repository: `https://github.com/Shauryakant/task-manager-asignment`
4. Use:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Root Directory: leave empty
5. Add environment variables in Render:
   - `MONGODB_URI`
   - `ACCESS_TOKEN_SECRET`
   - `REFRESH_TOKEN_SECRET`
   - `TASK_ENCRYPTION_KEY`
   - `NODE_ENV=production`
6. Deploy and verify the health route and UI.

## Future Improvements

- add automated API and UI tests
- add email verification and password reset flow
- add rate limiting for authentication endpoints
- add task due dates and sorting options
- replace the simple static frontend with a component-based frontend framework if the project grows
