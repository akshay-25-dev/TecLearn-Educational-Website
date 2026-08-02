# 🎓 TecLearn - Full-Stack EdTech Learning Platform

TecLearn is a state-of-the-art, feature-rich **EdTech Learning Management System (LMS)** built with the MERN stack (MongoDB, Express.js, React.js, Node.js). It enables instructors to create, manage, and publish courses while providing students with an interactive learning platform, seamless payment integration, video playback, progress tracking, and course review capabilities.

---

## 🚀 Key Features

### 👨‍🎓 Student Capabilities
- **Authentication & Security**: Signup/login with OTP verification via email, secure JWT authentication.
- **Catalog & Course Discovery**: Browse courses by category with dynamic catalog pages and top-selling course recommendations.
- **Shopping Cart & Checkout**: Add courses to cart and purchase multiple or single courses via Razorpay gateway integration.
- **Enrolled Courses & Video Player**: Access purchased courses, stream video lectures, collapse/expand sections, and track progress.
- **Ratings & Reviews**: Leave interactive star reviews and feedback on completed courses.
- **Purchase History & Profile**: View complete transaction logs and customize student profile details.

### 👨‍🏫 Instructor Capabilities
- **Course Builder**: Step-by-step course creator (Course Details, Sections, Subsections/Lectures, Thumbnail & Video Uploads).
- **Instructor Dashboard**: Monitor total students enrolled, total earnings, and published vs draft courses.
- **Course Management**: Publish, draft, edit, or delete existing courses.
- **Withdrawals & Earnings**: Request payout withdrawals and track earnings history.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Redux Toolkit, Tailwind CSS, React Router v7, React Icons, React Hook Form, Swiper
- **Backend**: Node.js, Express.js 5, MongoDB with Mongoose, Cloudinary (Video & Image Storage), Nodemailer (Email/OTP Services)
- **Payment Gateway**: Razorpay Checkout SDK & REST API
- **Authentication**: JWT (JSON Web Tokens) & bcryptjs password hashing

---

## 📂 Project Structure

```
Mega_Project/
├── client/                 # React Frontend (Vite)
│   ├── src/
│   │   ├── components/    # Reusable UI & Dashboard components
│   │   ├── pages/         # Page Views (Home, Catalog, CourseDetails, Dashboard, etc.)
│   │   ├── services/      # API Connector & Endpoints logic
│   │   ├── slices/        # Redux Toolkit Slices (auth, profile, cart, course)
│   │   └── data/          # Static Link & Navigation Data
│   ├── .env.example       # Sample Client Environment Variables
│   └── package.json
├── server/                 # Node.js Express Backend
│   ├── config/            # Cloudinary, Database, Razorpay Configuration
│   ├── controllers/       # Business Logic Handlers (Auth, Course, Payments, Profile)
│   ├── middlewares/       # Auth & Role Access Middlewares (isStudent, isInstructor)
│   ├── models/            # Mongoose Data Schemas (User, Profile, Course, Section, SubSection, Payment)
│   ├── routes/            # Express API Routes
│   ├── .env.example       # Sample Server Environment Variables
│   └── package.json
├── .gitignore              # Global Repository Git Ignore Rules
├── package.json            # Workspace Management Scripts
└── README.md
```

---

## ⚙️ Environment Variables Setup

Before running the application, set up your `.env` files in both the `server` and `client` directories.

### 1. Server Environment Variables (`server/.env`)
Create a `.env` file inside the `server/` directory:

```env
PORT=4000
MONGODB_URL="mongodb+srv://<username>:<password>@cluster.mongodb.net/Ed-Tech"
JWT_SECRET="your_jwt_secret_key"

CLOUD_NAME="your_cloudinary_cloud_name"
API_KEY="your_cloudinary_api_key"
API_SECRET="your_cloudinary_api_secret"
FOLDER_NAME="Ed-Tech"

RAZORPAY_KEY="rzp_test_YourKeyId"
RAZORPAY_SECRET="your_razorpay_secret_key"

MAIL_HOST=smtp.gmail.com
MAIL_USER=your_email@gmail.com
MAIL_PASS=your_app_password
ALLOWED_ORIGINS="http://localhost:3000,http://localhost:5173,http://localhost:5174"
```

### 2. Client Environment Variables (`client/.env`)
Create a `.env` file inside the `client/` directory:

```env
VITE_APP_BASE_URL="http://localhost:4000/api/v1"
REACT_APP_BASE_URL="http://localhost:4000/api/v1"
VITE_RAZORPAY_KEY="rzp_test_YourKeyId"
```

---

## 🏃 Local Development Setup

### 1. Install Dependencies
```bash
# Install Server Dependencies
cd server
npm install

# Install Client Dependencies
cd ../client
npm install
```

### 2. Start the Backend Server
```bash
cd server
npm run dev
```
*Backend will run on `http://localhost:4000`*

### 3. Start the Frontend Development Server
```bash
cd client
npm run dev
```
*Frontend will run on `http://localhost:5174` (or `http://localhost:5173`)*

---

## 💳 How to Make Test Payments (Razorpay Integration)

The project includes an active **Razorpay Test Mode** integration. Follow these steps to complete test course purchases:

### Steps for Test Purchase:
1. Log in as a **Student** account (or sign up for a new student profile).
2. Browse the **Catalog** and click on any course.
3. Click the **Buy Now** button.
4. The Razorpay checkout modal will pop up in **Test Mode**.

### Option A: Using Test Card Details
- **Card Number**: `5267 3181 8797 5449` *(Indian Test Mastercard)*
- **Expiry Date**: Any future date (e.g. `12 / 30`)
- **CVV**: Any 3 digits (e.g. `123`)
- **Card Holder Name**: Any name
- Click **Pay Now**.
- On the OTP screen, click **"Pay on bank's page ↗"** link below the input field and select **"Success"**.

### Option B: Using Netbanking (Fastest Test Method)
- Select **Netbanking** inside the Razorpay modal.
- Choose any bank (e.g., *State Bank of India / HDFC Bank*).
- Click **Continue**.
- On the bank simulation screen, click the **"Success"** button.

Upon successful completion, you will be redirected to your **Enrolled Courses** dashboard with immediate access to the course content!

---

## 🌐 Production Deployment Guide

### Deploying Frontend (Vercel / Netlify)
1. Push project to GitHub (sensitive `.env` files are automatically ignored).
2. Connect your repository to **Vercel** or **Netlify**.
3. Set Root Directory to `client`.
4. Set Build Command: `npm run build`
5. Set Output Directory: `dist`
6. Add Environment Variable:
   - `VITE_APP_BASE_URL` = `https://your-backend-api-domain.com/api/v1`
   - `VITE_RAZORPAY_KEY` = `your_razorpay_key_id`

### Deploying Backend (Render / Railway / AWS)
1. Connect your repository to **Render** or **Railway**.
2. Set Root Directory to `server`.
3. Set Build Command: `npm install`
4. Set Start Command: `npm start` (or `node index.js`)
5. Add Environment Variables (`MONGODB_URL`, `JWT_SECRET`, `CLOUD_NAME`, `API_KEY`, `API_SECRET`, `RAZORPAY_KEY`, `RAZORPAY_SECRET`, `MAIL_USER`, `MAIL_PASS`, `ALLOWED_ORIGINS`).

---

## 📜 License
This project is licensed under the ISC License.
