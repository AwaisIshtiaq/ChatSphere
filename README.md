# ChatSphere

A real-time chat application built with **NestJS** and **Next.js**. Users can register, log in, create chat rooms, and exchange messages instantly over WebSockets.

## Features

- User registration and JWT authentication
- Create and browse chat rooms
- Real-time messaging with Socket.io
- Online/offline user presence
- Persistent message history in PostgreSQL
- Responsive Next.js frontend with Tailwind CSS

## Tech Stack

| Layer    | Technologies                                      |
| -------- | ------------------------------------------------- |
| Frontend | Next.js 16, React 19, Tailwind CSS, Zustand, Axios |
| Backend  | NestJS 11, TypeORM, PostgreSQL, Passport JWT      |
| Realtime | Socket.io                                         |

## Project Structure

```
ChatSphere/
├── chatsphere-backend/    # NestJS REST API + WebSocket gateway
│   └── src/
│       ├── auth/          # Register, login, JWT strategy
│       ├── users/         # User entity and service
│       ├── rooms/         # Chat room CRUD
│       ├── messages/      # Message persistence
│       └── chat/          # Socket.io gateway
└── chatsphere-frontend/   # Next.js web app
    └── src/
        ├── app/           # Pages (login, chat)
        ├── hooks/         # useSocket hook
        ├── lib/           # Axios API client
        └── store/         # Zustand state
```

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [PostgreSQL](https://www.postgresql.org/) database
- npm

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/AwaisIshtiaq/ChatSphere.git
cd ChatSphere
```

### 2. Backend setup

```bash
cd chatsphere-backend
npm install
```

Create a `.env` file in `chatsphere-backend/`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=chatsphere

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
```

Start the API server (runs on **http://localhost:3000**):

```bash
npm run start:dev
```

### 3. Frontend setup

```bash
cd ../chatsphere-frontend
npm install
```

Create a `.env.local` file in `chatsphere-frontend/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
```

Start the dev server (runs on **http://localhost:3001**):

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

## API Endpoints

| Method | Endpoint                        | Auth | Description              |
| ------ | ------------------------------- | ---- | ------------------------ |
| POST   | `/auth/register`                | No   | Register a new user      |
| POST   | `/auth/login`                   | No   | Log in and receive JWT   |
| GET    | `/rooms`                        | Yes  | List all chat rooms      |
| POST   | `/rooms`                        | Yes  | Create a new room        |
| GET    | `/rooms/:id`                    | Yes  | Get a single room        |
| GET    | `/rooms/:roomId/messages`       | Yes  | Get messages in a room   |
| POST   | `/rooms/:roomId/messages`       | Yes  | Send a message (REST)    |

## WebSocket Events

Connect to the backend Socket.io server with a JWT token in the handshake auth.

| Event            | Direction       | Description                    |
| ---------------- | --------------- | ------------------------------ |
| `joinRoom`       | Client → Server | Join a chat room               |
| `leaveRoom`      | Client → Server | Leave a chat room              |
| `sendMessage`    | Client → Server | Send a message to a room       |
| `receiveMessage` | Server → Client | New message broadcast          |
| `userOnline`     | Server → Client | A user came online             |
| `userOffline`    | Server → Client | A user went offline            |

## Available Scripts

### Backend (`chatsphere-backend/`)

| Command              | Description                |
| -------------------- | -------------------------- |
| `npm run start:dev`  | Start in watch mode        |
| `npm run build`      | Compile for production     |
| `npm run start:prod` | Run compiled production build |
| `npm run test`       | Run unit tests             |
| `npm run lint`       | Lint source files          |

### Frontend (`chatsphere-frontend/`)

| Command         | Description           |
| --------------- | --------------------- |
| `npm run dev`   | Start dev server (port 3001) |
| `npm run build` | Build for production  |
| `npm run start` | Start production server |
| `npm run lint`  | Lint source files     |

## License

This project is licensed under the [GPL-3.0 License](LICENSE).

---

*Last updated: July 2026*
