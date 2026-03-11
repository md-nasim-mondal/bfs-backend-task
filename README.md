# Node.js WhatsApp Web REST API Backend

A production-ready Node.js backend that integrates with WhatsApp Web (via `whatsapp-web.js` and `socket.io`) to send messages through a robust RESTful API. Built with Express, TypeScript, Mongoose, and Winston.

## Features

- **Session Persistence**: Maintains WhatsApp authentication state via `LocalAuth` — no re-scan after server restart.
- **Real-time QR Authentication**: QR code displayed both in the **terminal** (ASCII) and via **Socket.IO** to browser clients.
- **RESTful API**: Clean endpoints to send messages, check status, and manage logout.
- **Concurrency & Message Queue**: Sequential message queue prevents WhatsApp client overload under concurrent requests.
- **Rate Limiting**: `express-rate-limit` protects the API from spam (100 requests per 15 minutes per IP).
- **Structured Logging**: Winston logger with Console, File, and **MongoDB** transports for production-grade log management.
- **Centralized Error Handling**: Zod validation + global error handler with structured JSON responses.
- **Automatic Reconnection**: Auto-reconnects if WhatsApp client disconnects.
- **Modular Architecture**: Clean separation — controllers, services, routes, middlewares, config.

## Tech Stack

| Technology | Purpose |
|---|---|
| Node.js + Express | HTTP Server & REST API |
| TypeScript | Type Safety |
| whatsapp-web.js | WhatsApp Web Client |
| Socket.IO | Real-time QR code transmission |
| Mongoose (MongoDB) | Log storage in database |
| Winston | Structured logging |
| Zod | Request validation |
| Jest + Supertest | Automated testing |
| Puppeteer (Google Chrome) | Headless browser for WhatsApp |

## Prerequisites

- Node.js >= 18.x
- `npm` or `pnpm`
- Google Chrome installed (required by Puppeteer for WhatsApp Web)
- MongoDB running locally or remote URI

## Setup Instructions

1. **Clone the repository and install dependencies**
   ```bash
   git clone https://github.com/md-nasim-mondal/bfs-backend-task.git
   cd bfs-backend-task
   pnpm install
   ```

2. **Setup Environment Variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your values:
   ```env
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   DB_URL=mongodb://localhost:27017
   ```

3. **Start the Development Server**
   ```bash
   pnpm run dev
   ```

4. **Authenticate WhatsApp**
   - **Option A (Terminal):** Scan the QR code printed directly in the terminal.
   - **Option B (Browser):** Open `http://localhost:5000/client` to see the QR code in the browser.
   - Open WhatsApp on your phone → **Linked Devices** → **Link a Device** → Scan the QR code.

5. **Send Messages via API**
   Once authenticated, use Postman or curl to hit the API endpoints below.

## API Documentation

### Base URL: `http://localhost:5000/api/v1`

---

### 1. Send a Message

**`POST /messages`**

Send a WhatsApp message to a target phone number.

**Headers:** `Content-Type: application/json`

**Request Body:**
```json
{
  "phone": "8801XXXXXXXXX",
  "message": "Hello from WhatsApp API!"
}
```
> **Note:** Phone number must include country code without `+` sign (e.g., `8801712345678` for Bangladesh).

**Success Response (200):**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Message sent successfully via WhatsApp",
  "data": {
    "messageId": "true_88017XXXXXXXX@c.us_3EB0...",
    "timestamp": 1709823901
  }
}
```

**Error Response (503) — Not authenticated:**
```json
{
  "statusCode": 503,
  "success": false,
  "message": "WhatsApp Client is not ready yet. Please authenticate via QR code.",
  "data": null
}
```

**Error Response (400) — Validation failed:**
```json
{
  "success": false,
  "message": "Validation Error",
  "errorSources": [
    { "path": "phone", "message": "Phone number is required" }
  ]
}
```

---

### 2. Check Connection Status

**`GET /messages/status`**

Check if the WhatsApp client is currently connected and ready.

**Success Response (200):**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "WhatsApp Client is connected and ready.",
  "data": {
    "isReady": true
  }
}
```

---

### 3. Logout WhatsApp Session

**`POST /messages/logout`**

Logout the current WhatsApp session. A new QR code will be generated automatically for re-authentication.

**Success Response (200):**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "WhatsApp Client logged out successfully.",
  "data": null
}
```

---

### 4. Health Check

**`GET /`**

```json
{
  "message": "Welcome to WhatsApp Web Integration API!"
}
```

## WebSocket Events

Connect to `http://localhost:5000` via Socket.IO to receive real-time events:

| Event | Description |
|---|---|
| `qr` | QR code image (base64 data URL) for authentication |
| `ready` | WhatsApp client is ready to send messages |
| `authenticated` | Successfully authenticated |
| `auth_failure` | Authentication failed |
| `disconnected` | Client disconnected (auto-reconnect will attempt) |

## Project Structure

```
src/
├── app.ts                          # Express app setup
├── server.ts                       # Server entry point
└── app/
    ├── config/
    │   ├── env.ts                  # Environment variables
    │   └── db.ts                   # MongoDB connection
    ├── errorHelpers/
    │   ├── AppError.ts             # Custom error class
    │   └── handlerZodError.ts      # Zod error transformer
    ├── middlewares/
    │   ├── globalErrorHandler.ts   # Centralized error handler
    │   ├── notFound.ts             # 404 handler
    │   └── validateRequest.ts      # Zod validation middleware
    ├── modules/
    │   └── message/
    │       ├── message.controller.ts
    │       ├── message.route.ts
    │       └── message.validation.ts
    ├── services/
    │   ├── socket.service.ts       # Socket.IO service
    │   └── whatsapp.service.ts     # WhatsApp client + message queue
    └── utils/
        ├── catchAsync.ts           # Async error wrapper
        ├── logger.ts               # Winston logger (Console + File + MongoDB)
        └── sendResponse.ts         # Standardized response helper
tests/
└── message.test.ts                 # API integration tests
public/
└── index.html                      # Browser QR code client
```

## Running Tests

```bash
pnpm test
```

Tests cover:
- ✅ Validation failure (missing phone number)
- ✅ Validation failure (missing message)
- ✅ 503 when WhatsApp client is not ready
- ✅ 200 successful message send

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` |
| `FRONTEND_URL` | CORS origin | `http://localhost:3000` |
| `DB_URL` | MongoDB connection URI | `mongodb://localhost:27017` |

## License

ISC
