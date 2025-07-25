
# 📁 Image Storage App

A **full-stack web application** for managing images in **nested folders**, similar to Google Drive. Users can register, create folders, upload images, and search seamlessly.

---

## 🚀 Features

- ✅ **JWT Authentication** (Login/Signup/Logout)
- ✅ **Create Nested Folders** (like Google Drive)
- ✅ **Image Uploads** with custom names
- ✅ **User-specific access** to folders and images
- ✅ **Search** images by name
- ✅ **Image Previews & Thumbnails**
- ✅ **Breadcrumb Navigation**
- ✅ **Modern UI** with responsive design

---

## 🛠️ Tech Stack

### 🔧 Backend

- **Node.js** + **Express.js**
- **MongoDB** + **Mongoose**
- **JWT** for Authentication
- **bcryptjs** for Password Hashing
- **Multer** for File Uploads
- **express-validator** for Input Validation

### 🎨 Frontend

- **React** (w/ TypeScript)
- **React Router** for Navigation
- **Styled Components** for CSS-in-JS
- **Axios** for HTTP Requests
- **React Icons** for UI Icons
- **Context API** for State Management

---

## 📦 Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas)
- [Git](https://git-scm.com/)

---

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd image-storage-app
```

---

### 2. Backend Setup

```bash
cd backend
npm install
npm run dev
```

📝 Create a `.env` file:

```
PORT=5000
MONGODB_URI= SET YOUR URL
JWT_SECRET=your_jwt_secret_key_here_change_this_in_production
NODE_ENV=development
```

---

### 3. Frontend Setup

```bash
cd frontend
npm install
npm start
```

---

### 4. MongoDB Setup

#### ✅ Using MongoDB Atlas (Default)
Already configured — no changes needed.

#### 🖥️ Local MongoDB (Optional)
```bash
mongod
```

Update `.env`:
```
MONGODB_URI=mongodb://localhost:27017/image-storage-app
```

---

## 🌐 Usage Guide

### 🔐 Register / Login
- Access: http://localhost:3000
- Create an account or login to your dashboard

### 🗂️ Create Nested Folders
- Click “New Folder”
- Enter a name
- Folders can be nested inside others

### 🖼️ Upload Images
- Choose a folder first
- Click “Upload Image”
- Provide a name + image file (JPG, PNG, GIF, BMP, WebP)
- Max Size: **10MB**

### 🔎 Search
- Use the top search bar
- Search globally or within a folder

### 🧭 Navigate Easily
- Sidebar folder tree
- Breadcrumbs for folder hierarchy

---

## 🔗 API Endpoints

### 🧑‍💻 Auth
- `POST /api/auth/signup` - Register
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Current user info

### 📁 Folders
- `POST /api/folders` - Create folder
- `GET /api/folders` - List folders
- `GET /api/folders/tree` - Folder hierarchy
- `GET /api/folders/:id` - Get a folder
- `PUT /api/folders/:id` - Update folder
- `DELETE /api/folders/:id` - Delete folder

### 🖼️ Images
- `POST /api/images` - Upload image
- `GET /api/images` - Get images in folder
- `GET /api/images/search` - Search images
- `GET /api/images/:id` - Get image
- `PUT /api/images/:id` - Rename image
- `DELETE /api/images/:id` - Delete image
- `POST /api/images/:id/move` - Move image to another folder

---

## 🧱 Project Structure

```
image-storage-app/
├── backend/
│   ├── middleware/        # Auth middleware
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   ├── uploads/           # Uploaded images
│   ├── .env               # Env vars
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── components/    # Reusable UI
    │   ├── contexts/      # Global state
    │   ├── pages/         # Routes/pages
    │   ├── services/      # API logic
    │   ├── types/         # Type definitions
    │   └── App.tsx
```

---

## 🔐 Security Features

- ✅ **JWT** Authentication
- ✅ **Hashed Passwords** using bcryptjs
- ✅ **Input Validation** on all forms
- ✅ **MIME-type & file size checks**
- ✅ **CORS** configured
- ✅ **User Isolation** for data access

---

## 🧪 Development Scripts

### Backend

```bash
npm run dev     # Dev mode (nodemon)
npm start       # Prod server
```

### Frontend

```bash
npm start       # Dev mode
npm run build   # Production build
npm test        # Run tests
```

---

## 🚀 Deployment

### 📦 Backend
- Use MongoDB Atlas
- Deploy to platforms like **Heroku**, **Render**, **Railway**, or **Vercel Functions**

### 🌐 Frontend
- Build app: `npm run build`
- Deploy to **Netlify**, **Vercel**, or **S3**
- Update API base URLs for production

---

## 🤝 Contributing

1. Fork the repo
2. Create a new branch
3. Make changes and commit
4. Push your branch
5. Create a Pull Request

---

> Built with 💖 by Raj Dubey
