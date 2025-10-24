# Online Videos Streaming API

A RESTful API for uploading and streaming videos online. This backend application provides authentication, online video steams.

## Overview

The Online Video Streaming App allows users to stream videos and movies online.  
It lets users get trending videos and sort them by preference.  
It uses **MongoDB** for data storage and **JWT** for authentication.

## 🚀 Features

- Upload videos to Cloudinary
- Stream videos efficiently using byte-range requests
- Handle video metadata (title, description, etc.)
- Secure user authentication (signup, login, logout)
- JWT-based authorization
- Supports HLS and MP4 formats
- RESTful API tested with Postman

## Tech Stack

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - MongoDB object modeling
- **Auth:** JWT
- **Joi** - Input validation
- **Bcrypt** - Password hashing
- **Environment:** dotenv
- **Cloud Storage:** Cloudinary

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Okita-Damian/video-streaming-App.git
   cd video-streaming-app
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```

   ```

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string

CLOUD_NAME=your_cloudinary_name
CLOUD_KEY=your_cloudinary_api_key
CLOUD_SECRET=your_cloudinary_api_secret

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USERNAME=your_email_address
EMAIL_PASSWORD=your_email_app_password

JWT_KEY=your_jwt_secret_key
JWT_REFRESH_KEY=your_jwt_refresh_secret
```

## Configuration

- **JWT_KEY**: Secret key for signing JWT tokens
- **DB_URL**: MongoDB connection string (e.g., `mongodb://localhost:2****/video-streaming-App` or Atlas URL)
- **PORT**: Port number for the server (default is 5000)
- **ALLOWED_ORIGINS**: Comma-separated list of allowed origins for CORS in production (e.g., `https://example.com,https://app.example.com`). In development mode, all origins are allowed by default.

### CORS Configuration

The application uses the `cors` package to handle Cross-Origin Resource Sharing. The configuration:

- In development mode: Allows requests from any origin (`*`)
- In production mode: Restricts requests to origins specified in the `ALLOWED_ORIGINS` environment variable
- Allows common HTTP methods: GET, POST, PATCH, DELETE, PUT
- Allows specific headers: Content-Type, Authorization, X-Requested-With
- Exposes headers: Content-Length, X-Rate-Limit
- Enables credentials (cookies, authorization headers)
- Caches preflight requests for 24 hours

## Running the Application

### Development Mode

```bash
npm run dev
```

This starts the server with nodemon, which automatically restarts when changes are detected.

### Production Mode

```bash
npm start
```

## Project Structure

```
video-streaming-App/
├── src/
│   ├── app.js
│   ├── server.js
│   ├── config/
│   ├── utils/
│   ├── validation/
│   ├── templates/
│   ├── controllers/     # Business logic
│   ├── middlewares/     # Custom middleware
│   ├── routes/          # API routes
│   └── schemas/         # Mongoose models
├── .env                 # Environment variables (not in repo)
├── .env.example         # Example environment variables
├── package.json         # Project metadata and dependencies
└── README.md            # Project documentation
```

## API Endpoints

The API will include endpoints for:

- Authentication (register, login)
- User management
- Uploading videos
- streaming videos
- sorting videos

Detailed API documentation will be added as the project develops.

## Development Guidelines

### Coding Standards

- Use ES6+ features
- Follow the MVC pattern
- Use async/await for asynchronous operations
- Validate all inputs using Joi
- Handle errors properly with appropriate status codes

### Git Workflow

1. Create feature branches from `dev`
2. Make changes and commit with descriptive messages
3. Push to the remote repository
4. Create a pull request to merge into `dev`
5. After review, PR will be merged into `dev`

## Testing

Range: bytes=0-
Authorization: Bearer <your_jwt_token>

## License

ISC

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
