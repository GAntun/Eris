# Eris

Eris is a real-time chat application built with a modern React frontend and a robust Node.js/Express/Socket.IO backend. It features text and voice channels, message replies and pinning, link previews, YouTube embeds, avatars, themes, and a resizable users-online sidebar.

## Features

- **Real-time messaging** with Socket.IO — messages appear instantly across all connected clients.
- **Channels** — create, rename, and remove text/voice channels, each with a short description. A `general` text channel is always present.
- **Message replies / quotes** — reply to any message; the quoted original is shown inline and jumps to the source when clicked.
- **Pinned messages** — pin/unpin any message; pinned messages are shown in a bar under the channel header and jump to the original message on click.
- **Edit & delete** — messages can be edited or deleted by their author.
- **Link previews** — OpenGraph metadata is fetched for shared links, and YouTube links are converted to embedded players.
- **Voice channels** — join voice channels in-browser with mute control and a live participant list.
- **Presence** — a users-online sidebar (drag its edge to resize) shows who is connected in real time.
- **Accounts** — register/login with hashed passwords (bcrypt), persistent 7-day session cookies, avatars (JPEG/PNG/WebP/GIF, max 2 MB), and editable nicknames.
- **Theming** — light/dark theme toggle with a custom dark palette.
- **Emoji picker** — inline emoji picker in the composer.

## Tech Stack

- **Frontend**: React, Tailwind CSS 4, Lucide React
- **Backend**: Node.js, Express 5, Socket.IO, MongoDB (Mongoose 9)
- **Storage**: MongoDB (users, sessions, channels, messages); avatars stored on disk under `public/uploads/avatars/`
- **Base path**: All routes are served under `/eris` (`BASE_PATH`), including the REST API, static assets, and the Socket.IO endpoint.

## Getting Started

### Prerequisites

- Node.js 18 or newer
- MongoDB running locally (default URI: `mongodb://127.0.0.1:27017/eris`)
- A build tool for the frontend (e.g., Vite)

### Installation

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd eris
   ```

2. Install all dependencies:
   ```bash
   npm install
   ```

### Running the Project

#### 1. Start the Backend Server
```bash
node server.js
```
The server will start on `http://localhost:3200`.

#### 2. Start the Frontend
Since the frontend is a React application, you should run it using a development server (like Vite) and ensure it proxies requests to the backend.

**Option A: Using a Vite development server (Recommended for development)**
1. Configure your frontend build tool to proxy requests to `http://localhost:3200/eris`.
2. Run the dev server:
   ```bash
   npm run dev
   ```

**Option B: Build for Production**
1. Build the React application.
2. Move the built assets to the `public/` directory of the server.
3. Start the server:
   ```bash
   node server.js
   ```

### Configuration

The application uses `.env` for configuration. You can create a `.env.local` file to override these settings without changing the default `.env` file.

| Variable       | Default                            | Description                       |
| -------------- | ---------------------------------- | --------------------------------- |
| `PORT`         | `3200`                             | Port the HTTP server listens on.  |
| `MONGODB_URI`  | `mongodb://127.0.0.1:27017/eris`   | MongoDB connection string.        |
| `BASE_PATH`    | `/eris`                            | The base path for all routes.     |
| `SKIP_SERVER`  | `false`                            | If `true`, the Electron app will not start a new server process. |

## Desktop App (Electron)

Eris can be run as a standalone desktop application using Electron.

### Running the Electron App

- **Standard mode**: Starts the backend server and opens the Electron window.
  ```bash
  npm run electron
  ```

- **Client-only mode**: Use this if you already have a server running.
  ```bash
  SKIP_SERVER=true npm run electron
  ```

### Building the Desktop App

To build a production-ready executable:
```bash
npm run build:electron
```
The build output will be located in the `dist/` directory.

All endpoints are prefixed with `/eris`:

- `POST /eris/register`, `POST /eris/login`, `POST /eris/logout`, `GET /eris/me`
- `POST /eris/upload-avatar`, `PATCH /eris/profile`, `PATCH /eris/profile/password`
- `GET /eris/channels`, `POST /eris/channels`, `PATCH /eris/channels/:name`,
  `PATCH /eris/channels/:name/description`, `DELETE /eris/channels/:name`
- `GET /eris/channels/:name/pinned`, `POST /eris/messages/:id/pin`, `DELETE /eris/messages/:id/pin`
- `PATCH /eris/messages/:id`, `DELETE /eris/messages/:id`

Real-time events (chat messages, message updated/removed, presence, voice signaling) are exchanged over Socket.IO at `/eris/socket.io`.

## Project Structure

```
├── client/             # React frontend source code
├── server.js           # Express app, REST API, Socket.IO wiring
├── db.js               # MongoDB connection
├── models/             # Mongoose models (User, Session, Channel, Message)
├── og.js               # OpenGraph link-preview extraction
├── youtube.js          # YouTube embed extraction
├── public/             # Static assets and uploaded files
│   └── uploads/        # User avatars
└── package.json        # Project dependencies and scripts
```
