
 <p align="center">
<img width="557" height="172" alt="Screenshot 2026-10-30 212303" src="https://github.com/user-attachments/assets/99b54065-2272-4229-8a64-07c07bded237" />

</p>

# VideoTube 

### Live Preview (Click below)

[![Live Preview](https://img.shields.io/badge/Live%20Preview-VideoTube-red?style=for-the-badge)](https://tubeex.vercel.app)

### Video Preview:

https://github.com/user-attachments/assets/dd2ff360-849e-4997-92ea-e5e6cd4c6507



---



### 💻 Built with MERN Stack
<p align="left">
  <img src="https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%white" alt="Express.js" />
  <img src="https://img.shields.io/badge/React-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
</p>

---
### Things I Learned in This Project:

1. How to build a complete MERN Stack application.
2. My first major full-stack project.
3. Working with MongoDB and Aggregation Pipelines.
4. Connecting frontend with backend APIs.
5. Handling authentication and user sessions.
6. Managing video and image uploads.

And a lot more through practice and debugging!



# INTRODUCTION

VideoTube is a YouTube-inspired video-sharing platform built using the MERN Stack. It allows users to register, log in, upload and watch videos, like and dislike videos, comment, reply, subscribe to channels, and manage their watch history.

This is my first major MERN Stack project. I built it to explore backend development and understand how frontend, backend, APIs, and databases work together.



## Tech Stack 🛠️

**Frontend:** React.js, TypeScript, Tailwind CSS, React Router, Redux Toolkit, Context API.

**Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT.

**Other Tools:** Multer, Cloudinary, Git, GitHub, Vercel.

## Installation 🚀

1. **Clone the repository:**

   ```bash
   git clone YOUR_GITHUB_REPOSITORY_URL
   ```

2. **Navigate to the project directory:**

   ```bash
   cd VideoTube
   ```

3. **Setup Backend:**

   ```bash
   cd backend
   npm install
   ```

4. **Set up backend environment variables:**

   Create a `.env` file inside the backend directory:

   ```env
   PORT=8000
   MONGODB_URI=XXXXXXXXXXXXXXXXX
   CORS_ORIGIN=*

   ACCESS_TOKEN_SECRET=XXXXXXXXXXXX
   ACCESS_TOKEN_EXPIRY=XX

   REFRESH_TOKEN_SECRET=XXXXXXXXXXXXXXXX
   REFRESH_TOKEN_EXPIRY=XXX

   CLOUDINARY_CLOUD_NAME=XXXXXXXXXXXX
   CLOUDINARY_API_KEY=XXXXXXXXXXXXXXXX
   CLOUDINARY_API_SECRET=XXXXXXXXXXXXX
   ```

5. **Start the backend:**

   ```bash
   npm run dev
   ```

6. **Setup Frontend:**

   Open another terminal:

   ```bash
   cd frontend
   npm install
   ```

7. **Set up frontend environment variables:**

   Create a `.env` file inside the frontend directory:

   ```env
   VITE_API_BASE_URL=http://localhost:8000/api/v1
   ```

8. **Start the frontend:**

   ```bash
   npm run dev
   ```

   Open `http://localhost:5173` in your browser.

---



⭐ If you like this project, feel free to give it a star!
