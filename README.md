# Image Storage App

A full-stack web application for managing images in nested folders, similar to Google Drive. Users can register, create folders, upload images, and search through their images.

## Features

- ✅ User Registration & Authentication (JWT-based)
- ✅ User Login & Logout
- ✅ Create Nested Folders (like Google Drive)
- ✅ Upload Images with custom names
- ✅ User-specific access (users can only see their own content)
- ✅ Search Images by name
- ✅ Responsive design with modern UI
- ✅ Image previews and thumbnails
- ✅ Breadcrumb navigation

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Multer** - File upload handling
- **express-validator** - Input validation

### Frontend
- **React** with TypeScript - Frontend framework
- **React Router** - Client-side routing
- **Styled Components** - CSS-in-JS styling
- **Axios** - HTTP client
- **React Icons** - Icon library
- **Context API** - State management

## Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v14 or higher)
- **MongoDB** (running locally or MongoDB Atlas)
- **Git**

## Installation & Setup

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd image-storage-app
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file and configure environment variables
# The .env file is already created with default values
# Update MongoDB URI and JWT secret as needed

# Start the backend server
npm run dev
```

**Backend Environment Variables (`.env`):**
```
PORT=5000
MONGODB_URI=mongodb+srv://File:Pwzg2yCd1ez9lwnU@file.yolhzxu.mongodb.net/image-storage-app?retryWrites=true&w=majority&appName=File
JWT_SECRET=your_jwt_secret_key_here_change_this_in_production
NODE_ENV=development
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory (open new terminal)
cd frontend

# Install dependencies
npm install

# Start the frontend development server
npm start
```

### 4. MongoDB Setup

**Using MongoDB Atlas (Already Configured):**
The application is already configured to use MongoDB Atlas with the provided connection string. The database `image-storage-app` will be automatically created when you first run the application.

**For local MongoDB (Alternative):**
If you prefer to use local MongoDB instead:
```bash
# Start MongoDB service
mongod

# Update the MONGODB_URI in backend/.env to:
MONGODB_URI=mongodb://localhost:27017/image-storage-app
```

## Usage

1. **Access the Application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

2. **Create an Account:**
   - Navigate to http://localhost:3000
   - Click "Sign up here" to create a new account
   - Fill in username, email, and password

3. **Login:**
   - Use your credentials to log in
   - You'll be redirected to the dashboard

4. **Create Folders:**
   - Click "New Folder" button
   - Enter folder name
   - Folders can be nested by selecting a parent folder first

5. **Upload Images:**
   - Select a folder from the sidebar
   - Click "Upload Image" button
   - Choose an image file and provide a name
   - Supported formats: JPEG, PNG, GIF, BMP, WebP

6. **Search Images:**
   - Use the search bar at the top
   - Search works on image names
   - Can search globally or within specific folders

7. **Navigate:**
   - Use the folder tree in the sidebar
   - Click on folders to view their contents
   - Use breadcrumbs for navigation

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Folders
- `POST /api/folders` - Create folder
- `GET /api/folders` - Get folders
- `GET /api/folders/tree` - Get folder tree
- `GET /api/folders/:id` - Get specific folder
- `PUT /api/folders/:id` - Update folder
- `DELETE /api/folders/:id` - Delete folder

### Images
- `POST /api/images` - Upload image
- `GET /api/images` - Get images in folder
- `GET /api/images/search` - Search images
- `GET /api/images/:id` - Get specific image
- `PUT /api/images/:id` - Update image name
- `DELETE /api/images/:id` - Delete image
- `POST /api/images/:id/move` - Move image to different folder

## Project Structure

```
image-storage-app/
├── backend/
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Folder.js
│   │   └── Image.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── folders.js
│   │   └── images.js
│   ├── uploads/          # Uploaded images
│   ├── .env              # Environment variables
│   ├── server.js         # Main server file
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/    # Reusable components
    │   ├── contexts/      # React contexts
    │   ├── pages/         # Page components
    │   ├── services/      # API services
    │   ├── types/         # TypeScript types
    │   └── App.tsx        # Main app component
    └── package.json
```

## Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcryptjs with salt rounds
- **Input Validation** - Server-side validation for all inputs
- **File Type Validation** - Only image files allowed
- **File Size Limits** - 10MB maximum file size
- **User Isolation** - Users can only access their own data
- **CORS Protection** - Configured for security

## Development Scripts

### Backend
```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
```

### Frontend
```bash
npm start          # Start development server
npm run build      # Build for production
npm test           # Run tests
```

## Deployment

### Backend Deployment
1. Set environment variables for production
2. Use MongoDB Atlas for database
3. Deploy to platforms like Heroku, Vercel, or AWS

### Frontend Deployment
1. Build the React app: `npm run build`
2. Deploy to platforms like Netlify, Vercel, or AWS S3
3. Update API base URL for production

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.

## Support

If you encounter any issues or have questions, please create an issue in the repository.
