# Feedback Admin Panel

A MERN Stack web application for collecting and managing course feedback.

## Features
- View course IDs, course names and durations
- Calculate average feedback ratings for each course
- Add, edit and delete feedback
- Search feedback records
- Store data in MongoDB

## Technologies Used
- **Frontend:** React, Vite, Axios, React Router
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas with Mongoose

## Project Structure
- `frontend/` - User interface
- `backend/` - API, routes, models and database connection

## Running the Project

1. Install Node.js.
2. Open a terminal in `backend/` and run `npm install`.
3. Configure the MongoDB connection in `backend/.env`.
4. Run `npm start` in the backend terminal.
5. Open another terminal in `frontend/`, run `npm install`, then `npm run dev`.
6. Open the local URL shown by Vite.

**Security:** Keep `.env` files and database credentials private.
