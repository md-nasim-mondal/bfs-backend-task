# Node.js WhatsApp Web REST API Backend

A Node.js backend that integrates with WhatsApp Web (via `whatsapp-web.js` and `socket.io`) to send messages through a robust RESTful API.

## Features

- **Session Persistence**: Maintains your WhatsApp authentication state via `LocalAuth` even after server restarts.
- **WebSocket QR Authentication**: Uses `Socket.io` to emit the QR authentication payload instantly to connected clients.
- **RESTful API**: Clean `/api/v1/messages` endpoint to programmatically send messages via the active WhatsApp session.
- **Concurrency & Validation**: Implements Zod validation and a modular separation of concerns.

## Prerequisites

- Node.js >= 18.x
- `npm` or `pnpm`
- Google Chrome installed (required by `puppeteer` to run whatsapp-web headless)

## Setup Instructions

1. **Clone the repository and install dependencies**
   ```bash
   pnpm install
   ```
2. **Setup Environment Variables**
   Make a copy of `.env.example` and rename it to `.env`:
   ```bash
   cp .env.example .env
   ```
   Modify `.env` if necessary (e.g. PORT and FRONTEND_URL).

3. **Start the Development Server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

## API Documentation

### 1. Send an Automated Message

**Endpoint:** `POST /api/v1/messages`

**Headers:**
`Content-Type: application/json`

**Body:**
```json
{
  "phone": "1234567890",
  "message": "Hello from Bright Future Soft Assessment!"
}
```

**Responses:**

- **200 OK** (Successfully Sent)
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Message sent successfully via WhatsApp",
  "data": {
    "messageId": "mock_id_123",
    "timestamp": 1709823901
  }
}
```

- **503 Service Unavailable** (If QR code has not been scanned yet)
```json
{
  "success": false,
  "message": "WhatsApp Client is not ready yet. Please authenticate via QR code."
}
```

## Running the Automated Tests
Integration testing using `supertest` and `jest` is configured.
```bash
npm run test
```
