# Eris Chat Application

A real-time chat application built with modern web technologies.

## Features

- **Real-time messaging** with Socket.IO
- **Text and voice channels** with descriptions
- **Message replies and pinning**
- **Link previews** and **YouTube embeds**
- **User accounts** with avatars, nicknames, and sessions
- **Light/dark theme** toggle
- **Emoji picker** in composer
- **Presence tracking** with resizable users sidebar
- **Message editing/deletion** by authors

## Tech Stack

- **Frontend**: Tailwind CSS 4
- **Backend**: Node.js, Express 5, Socket.IO, MongoDB (Mongoose 9)
- **Storage**: MongoDB for data, disk storage for avatars
- **Desktop**: Electron for standalone application

## Project Structure

```
.
├── server.js           # Main Express app and Socket.IO setup
├── db.js               # MongoDB connection
├── models/             # Mongoose data models
│   ├── User.js         # User accounts
│   ├── Session.js      # Authentication sessions  
│   ├── Channel.js      # Channels (text/voice)
│   └── Message.js      # Chat messages
├── og.js               # OpenGraph link-preview extraction
├── youtube.js          # YouTube embed extraction
├── public/             # Static assets and uploads
│   ├── index.html      # Main HTML file
│   ├── assets/         # Images, icons, etc.
│   ├── js/             # JavaScript files
│   ├── styles/         # CSS styles
│   └── uploads/        # User avatars
├── electron/           # Desktop application
│   ├── main.js         # Electron main process
│   ├── preload.js      # Security preload script
│   ├── icon.ico        # Windows icon
│   └── icon.png        # Generic icon
├── .env                # Default environment variables
├── .env.local          # Local overrides (not in repo)
└── package.json        # Dependencies and scripts
```

## Getting Started

### Prerequisites

- Node.js 18 or newer
- MongoDB running locally (default URI: `mongodb://127.0.0.1:27017/eris`)

### Installation

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd eris
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start MongoDB server

4. Run the application:
   ```bash
   node server.js
   ```

### Configuration

Environment variables in `.env` file:

| Variable       | Default                            | Description                       |
| -------------- | ---------------------------------- | --------------------------------- |
| `PORT`         | `3200`                             | HTTP server port                  |
| `MONGODB_URI`  | `mongodb://127.0.0.1:27017/eris`   | MongoDB connection string         |
| `BASE_PATH`    | `/eris`                            | Base path for all routes          |
| `SKIP_SERVER`  | `false`                            | Skip server start in Electron     |

## Desktop Application

Eris can run as a desktop application using Electron.

### Running Electron App

- **Standard mode** (starts server):
  ```bash
  npm run electron
  ```

- **Client-only mode** (use existing server):
  ```bash
  SKIP_SERVER=true npm run electron
  ```

### Building Desktop App

```bash
npm run build:electron
```

Build output will be in `dist/` directory.

## API Endpoints

All endpoints are prefixed with `/eris`:

- **Authentication**: `POST /register`, `POST /login`, `POST /logout`, `GET /me`
- **Profile**: `POST /upload-avatar`, `PATCH /profile`, `PATCH /profile/password`
- **Channels**: `GET /channels`, `POST /channels`, `PATCH /channels/:name`, `DELETE /channels/:name`
- **Messages**: `PATCH /messages/:id`, `DELETE /messages/:id`
- **Pinning**: `GET /channels/:name/pinned`, `POST /messages/:id/pin`, `DELETE /messages/:id/pin`

Real-time events via Socket.IO at `/eris/socket.io`.