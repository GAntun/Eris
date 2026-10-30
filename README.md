# Eris Chat Application

A real-time chat application built with modern web technologies.

## Features

- **Real-time messaging** with Socket.IO
- **Text and voice channels** with descriptions
- **WebRTC voice chat and screen sharing**
- **Message replies and pinning**
- **Link previews** and **YouTube embeds**
- **User accounts** with avatars, nicknames, and sessions
- **Light/dark theme** toggle
- **Emoji picker** in composer
- **Presence tracking** with resizable users sidebar
- **Message editing/deletion** by authors

## Tech Stack

- **Frontend**: Tailwind CSS 4, vanilla JavaScript
- **Backend**: Node.js, TypeScript, Express 5, Socket.IO, MongoDB (Mongoose 9)
- **Storage**: MongoDB for data, disk storage for avatars
- **Desktop**: Electron for standalone application
- **Tooling**: TypeScript, `tsx`, TSDoc, electron-builder

## Project Structure

```
.
├── server.ts           # Main Express app and Socket.IO setup
├── db.ts               # MongoDB connection
├── config.ts           # Environment configuration
├── models/             # Mongoose data models
│   ├── User.ts         # User accounts
│   ├── Session.ts      # Authentication sessions  
│   ├── Channel.ts      # Channels (text/voice)
│   └── Message.ts      # Chat messages
├── og.ts               # OpenGraph link-preview extraction
├── youtube.ts          # YouTube embed extraction
├── public/             # Static assets and uploads
│   ├── index.html      # Main HTML file
│   ├── assets/         # Images, icons, etc.
│   ├── js/             # JavaScript files
│   ├── styles/         # CSS styles
│   └── uploads/        # User avatars
├── electron/           # Desktop application
│   ├── main.ts         # Electron main process
│   ├── icon.ico        # Windows icon
│   └── icon.png        # Generic icon
├── build/              # Compiled TypeScript output (generated)
├── .env                # Default environment variables
├── .env.local          # Local overrides (not in repo)
├── tsconfig.json       # TypeScript configuration
└── package.json        # Dependencies and scripts
```

> The backend, models, configuration, and Electron main process are written in
> TypeScript. The browser client under `public/js/` remains JavaScript. Source
> functions are documented with TSDoc, including parameters and remarks.

## Getting Started

### Prerequisites

- Node.js 18 or newer
- MongoDB running locally (default URI: `mongodb://127.0.0.1:27017/eris_dev`)

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
   npm start
   ```

   For development with automatic reloads:
   ```bash
   npm run dev
   ```

### Development Scripts

| Script                   | Description                                              |
| ------------------------ | -------------------------------------------------------- |
| `npm start`              | Compile TypeScript and run the server from `build/`       |
| `npm run dev`            | Run `server.ts` with `tsx` watch mode                     |
| `npm run build`          | Compile TypeScript into `build/`                          |
| `npm run typecheck`      | Type-check the project without emitting files             |
| `npm run build:css`      | Build the Tailwind CSS output                             |
| `npm run watch:css`      | Watch Tailwind CSS sources and rebuild on changes         |
| `npm run electron`       | Compile TypeScript and launch the Electron app            |
| `npm run build:electron` | Compile TypeScript and package the Electron application   |

Compiled output is written to `build/` and is ignored by Git. Run
`npm run typecheck` before committing changes.

### Configuration

Environment variables in `.env` file:

| Variable       | Default                            | Description                       |
| -------------- | ---------------------------------- | --------------------------------- |
| `PORT`         | `3200`                             | HTTP server port                  |
| `MONGODB_URI`  | `mongodb://127.0.0.1:27017/eris_dev` | MongoDB connection string       |
| `BASE_PATH`    | `/eris`                            | Base path for all routes          |
| `SKIP_SERVER`  | `false`                            | Skip server start in Electron     |

`.env.local` is loaded after `.env` when present, so local values override the
defaults without changing the committed configuration.

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
- **Channels**: `GET /channels`, `POST /channels`, `PATCH /channels/:name`, `PATCH /channels/:name/description`, `DELETE /channels/:name`
- **Messages**: `PATCH /messages/:id`, `DELETE /messages/:id`
- **Pinning**: `GET /channels/:name/pinned`, `POST /messages/:id/pin`, `DELETE /messages/:id/pin`

Real-time events via Socket.IO at `/eris/socket.io`. Supported events include
`join channel`, `chat message`, `join voice`, `leave voice`, `voice offer`,
`voice answer`, `voice ice`, `screen share start`, `screen share stop`,
`screen offer`, `screen answer`, `screen ice`, and `voice speaking`.