# Video Platform Backend

A modular backend application built with Node.js, Express.js, and MongoDB. This project follows a structured backend architecture with separate controllers, models, routes, middleware, and utility modules.

## Tech Stack

- **Runtime:** Node.js
- **Backend Framework:** Express.js
- **Database:** MongoDB
- **ODM:** Mongoose
- **Authentication:** JSON Web Tokens (JWT)
- **Password Security:** bcrypt
- **Media Management:** Cloudinary
- **File Uploads:** Multer
- **Configuration:** dotenv
- **Development:** Nodemon

## Project Structure

```text
BackendNodejs/
├── src/
│   ├── controllers/    # Request handlers and business logic
│   ├── db/             # Database connection
│   ├── middlewares/    # Request processing middleware
│   ├── models/         # Mongoose data models
│   ├── routes/         # API route definitions
│   ├── utils/          # Reusable utility functions
│   ├── app.js          # Express application configuration
│   ├── constants.js    # Application constants
│   └── index.js        # Application entry point
├── .env
├── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js
- npm
- MongoDB instance
- Cloudinary account (if using media upload functionality)

### 1. Clone the repository

```bash
git clone https://github.com/Naba-cloud/BackendNodejs.git
```

### 2. Navigate to the project

```bash
cd BackendNodejs
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a `.env` file in the project root and configure the environment variables required by the application.

Typical configuration may include:

```env
PORT=8000
MONGODB_URI=your_mongodb_connection_string
CORS_ORIGIN=your_frontend_origin
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Use the exact variable names expected by your application code.

### 5. Start the development server

```bash
npm run dev
```

## Architecture

The application follows a modular backend structure:

- **Controllers:** Handle incoming requests and application logic.
- **Models:** Define database schemas using Mongoose.
- **Routes:** Organize API endpoints.
- **Middlewares:** Handle shared request-processing operations.
- **Utilities:** Keep reusable functionality separate from business logic.
- **Database:** Manage MongoDB connectivity.

## Project Goals

- Practice building structured REST API backends.
- Understand Node.js and Express application architecture.
- Work with MongoDB and Mongoose.
- Explore authentication and authorization concepts.
- Understand file uploads and cloud media management.

## Author

**Naba Zehra**

- [GitHub](https://github.com/Naba-cloud)
- [Portfolio](https://naba-portfolio.vercel.app)
- [LinkedIn](https://www.linkedin.com/in/naba-zehra-dev/)
