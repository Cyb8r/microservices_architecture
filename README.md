# microservices_architecture

# Microservices Frontend

## Overview
This project is a simple frontend UI for a microservices-based application, allowing users to create posts and add comments. The frontend interacts with two backend services: **Post Service** and **Comment Service**.

## Features
- Create and list posts
- Add comments to posts
- Display posts and their comments

## Technologies Used
- HTML, CSS, JavaScript
- Express.js (backend services)
- MongoDB (database)

## Setup Instructions

### Prerequisites
Ensure you have the following installed:
- Node.js
- npm (Node Package Manager)
- MongoDB (running locally or using a cloud service like MongoDB Atlas)

### Backend Setup
1. Clone the repository.
2. Navigate to each backend service folder (`post-service` and `comment-service`).
3. Install dependencies and start the services:
   ```sh
   npm install
   node index.js
   ```
4. Ensure MongoDB is running before starting the services.

### Frontend Setup
1. Navigate to the frontend directory.
2. Install dependencies (if needed for live server):
   ```sh
   npm install live-server --save-dev
   ```
3. Start the frontend:
   ```sh
   npm run start
   ```
4. Open `http://localhost:3000` in your browser.

## API Endpoints
### Post Service (`http://localhost:4000`)
- `POST /posts` - Create a post
- `GET /posts` - Retrieve all posts
- `DELETE /posts/:id` - Delete a post

### Comment Service (`http://localhost:4001`)
- `POST /posts/:postId/comments` - Add a comment to a post
- `GET /posts/:postId/comments` - Retrieve comments for a post

## Notes
- Ensure all backend services are running before using the frontend.
- Update the service URLs in `script.js` if using different ports.

## License
This project is open-source and free to use.


