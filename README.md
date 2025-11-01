# Connect Four Game

A real-time multiplayer Connect Four game built with React, Node.js, Socket.IO, and MongoDB. Players can match with each other or play against a bot.

## Features

- Real-time multiplayer gameplay
- Matchmaking system
- Bot opponent option
- Leaderboard tracking
- Username persistence (localStorage)
- Responsive UI with animations

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB 

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd connect-four
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

## Environment Variables

### Backend (.env file in `/backend` directory)

Create a `.env` file in the `backend` directory with the following variables:

```env
# MongoDB connection string (required)
MONGO_URI=
PORT=8000
NODNODE_ENV=development
VITE_FRONTEND_URL=http://localhost:5173
```

### Frontend (.env file in `/frontend` directory)

Create a `.env` file in the `frontend` directory with the following variables:

```env
# Backend server URL for Socket.IO and API (required)
VITE_BACKEND_URL=http://localhost:8000

# Backend leaderboard API endpoint (required)
VITE_BACKEND_LEADERBOARD_URL=http://localhost:8000/api/leaderboard
```


## Running the Application

### Development Mode


1. **Start the Backend Server**:
```bash
cd backend
npm run dev
```
The backend will start on `http://localhost:8000` (or the PORT you specified).

2. **Start the Frontend Development Server**:
```bash
cd frontend
npm run dev
```
The frontend will typically start on `http://localhost:5173` (Vite default port).

3. **Open your browser** and navigate to the frontend URL (e.g., `http://localhost:5173`)
