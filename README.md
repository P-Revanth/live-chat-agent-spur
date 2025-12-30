# Noah - E-Commerce Live Chat Agent 🤖

An AI-powered customer support chatbot for e-commerce stores, built with Next.js and Express.

![Noah Chat Interface](public/preview.png)

## Features

- 💬 Real-time chat interface with AI-powered responses
- 🛒 Specialized for e-commerce customer support (shipping, returns, store policies)
- 💾 Persistent chat sessions across page reloads
- 🎨 Modern, responsive UI with Tailwind CSS
- 🔄 Conversation history stored in SQLite database

## Tech Stack

### Frontend
- **Next.js 16** - React framework
- **React 19** - UI library
- **Tailwind CSS 4** - Styling
- **TypeScript** - Type safety

### Backend
- **Express 5** - Node.js web framework
- **Better-SQLite3** - SQLite database
- **Google Generative AI (Gemini)** - AI responses
- **TypeScript** - Type safety

## Prerequisites

- **Node.js** v20.6+ (required for `--env-file` flag)
- **npm** or **yarn**
- **Google Gemini API Key** - Get one from [Google AI Studio](https://aistudio.google.com/app/apikey)

## Project Structure

```
live-chat-agent/
├── app/                    # Next.js frontend
│   ├── page.tsx           # Main chat interface
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── backend/               # Express backend
│   └── src/
│       ├── index.ts       # Server entry point
│       ├── routes/
│       │   └── chat.ts    # Chat API routes
│       ├── services/
│       │   ├── chat_service.ts  # Chat logic
│       │   └── llm_service.ts   # AI integration
│       └── db/
│           ├── db.ts      # Database connection
│           ├── messages.ts # Message queries
│           └── schema.sql # Database schema
├── public/                # Static assets
└── README.md
```

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd live-chat-agent
```

### 2. Setup Backend

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Or create manually:
echo "GEMINI_API_KEY=your_api_key_here" > .env
echo "DATABASE_URL=file:./src/db/app.db" >> .env

# Start the backend server
npm run dev
```

The backend will run on `http://localhost:4000`

### 3. Setup Frontend

```bash
# Navigate back to root directory (from backend)
cd ..

# Install dependencies
npm install

# Start the frontend development server
npm run dev
```

The frontend will run on `http://localhost:3000`

### 4. Open the App

Visit [http://localhost:3000](http://localhost:3000) in your browser to start chatting with Noah!

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Your Google Gemini API key | Yes |
| `PORT` | Server port (default: 4000) | No |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/chat/message` | Send a message and get AI response |
| `GET` | `/chat/history/:sessionId` | Get conversation history |

### POST /chat/message

**Request Body:**
```json
{
  "message": "What is your return policy?",
  "sessionId": "optional-session-id"
}
```

**Response:**
```json
{
  "reply": "Items can be returned within 30 days for a full refund...",
  "sessionId": "uuid-session-id"
}
```

## Development

### Running Both Servers

You'll need two terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### Resetting the Database

To clear all chat history:
```bash
rm backend/src/db/app.db
```
The database will be recreated automatically when the backend restarts.

## Database Setup

This project uses **SQLite** with **Better-SQLite3** for simplicity and zero-configuration setup.

### Schema Auto-Migration

The database schema is automatically applied when the backend starts. No manual migration steps required!

The schema file is located at `backend/src/db/schema.sql`:

```sql
CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id TEXT NOT NULL,
    sender TEXT NOT NULL,
    text TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id)
);
```

### Seeding

No seed data is required. The database starts empty and conversations are created dynamically when users start chatting.

---

## Architecture Overview

### Backend Structure

The backend follows a **layered architecture** pattern for clean separation of concerns:

```
backend/src/
├── index.ts              # Entry point - Express app setup, middleware, server
├── routes/
│   └── chat.ts           # API Layer - Route handlers, request validation
├── services/
│   ├── chat_service.ts   # Business Logic Layer - Orchestrates chat flow
│   └── llm_service.ts    # Integration Layer - LLM provider abstraction
└── db/
    ├── db.ts             # Data Layer - Database connection & initialization
    ├── messages.ts       # Data Layer - Message repository (CRUD operations)
    └── schema.sql        # Database schema definition
```

### Layer Responsibilities

| Layer | Files | Responsibility |
|-------|-------|----------------|
| **Routes** | `chat.ts` | HTTP handling, request validation, response formatting |
| **Services** | `chat_service.ts` | Business logic, orchestration between DB and LLM |
| **Integration** | `llm_service.ts` | External API calls, prompt engineering, error handling |
| **Data** | `db.ts`, `messages.ts` | Database operations, data persistence |

### Design Decisions

1. **SQLite over PostgreSQL/MySQL**: Chose SQLite for zero-config setup and portability. The database file is created automatically - no Docker or external services needed.

2. **Session-based conversations**: Each conversation has a unique UUID stored in localStorage. This enables:
   - Chat persistence across page reloads
   - Conversation history for LLM context
   - Easy "New Chat" functionality

3. **Synchronous Better-SQLite3**: Used synchronous API for simplicity. SQLite operations are fast enough that async overhead isn't justified for this use case.

4. **ES Modules**: The backend uses ES modules (`"type": "module"`) for modern JavaScript compatibility and better tree-shaking.

---

## LLM Integration

### Provider: Google Gemini

This project uses **Google Gemini 2.0 Flash** via the `@google/generative-ai` SDK.

**Why Gemini?**
- Generous free tier (ideal for development)
- Fast response times
- Good instruction-following capabilities
- Simple SDK integration

### Prompting Strategy

The LLM is prompted with a **system prompt** that defines its role and constraints:

```typescript
const SYSTEM_PROMPT = `
You are a helpful and polite customer support agent for a small e-commerce store.
Answer clearly, concisely, and professionally.

Store Policies:
- Shipping: We ship worldwide. Delivery takes 5–7 business days.
- Returns: Items can be returned within 30 days for a full refund.
- Support Hours: Monday to Friday, 9 AM to 6 PM IST.

IMPORTANT: You must ONLY answer questions related to our store, products, orders, 
shipping, returns, and store policies. 

If a user asks anything unrelated to the e-commerce store, politely redirect them.
`;
```

### Conversation Context

The LLM receives the **last 10 messages** from the conversation history, enabling:
- Context-aware responses
- Follow-up question handling
- Consistent conversation flow

### Using Different LLM Providers

To switch to **OpenAI** or **Anthropic**, modify `backend/src/services/llm_service.ts`:

**OpenAI Example:**
```typescript
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateReply(history, userMessage) {
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      ...history.map(msg => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.text
      })),
      { role: "user", content: userMessage }
    ]
  });
  return response.choices[0].message.content;
}
```

---

## Trade-offs & Limitations

### Current Limitations

1. **No authentication**: Any user can create conversations. Sessions are client-side only.

2. **No rate limiting**: The API doesn't limit requests, making it vulnerable to abuse.

3. **Single LLM provider**: Hardcoded to Gemini - no fallback if the service is down.

4. **No streaming**: Responses are returned all at once, not streamed token-by-token.

5. **Basic error handling**: LLM errors return a generic message without retry logic.

### If I Had More Time...

1. **🔐 Authentication & User Management**
   - Add user accounts with JWT authentication
   - Associate conversations with users
   - Admin dashboard for viewing all conversations

2. **⚡ Response Streaming**
   - Stream LLM responses using Server-Sent Events (SSE)
   - Show text appearing in real-time for better UX

3. **🔄 LLM Fallback & Retry**
   - Add multiple LLM providers (OpenAI as backup)
   - Implement exponential backoff retry logic
   - Circuit breaker pattern for resilience

4. **📊 Analytics & Monitoring**
   - Track common questions and topics
   - Measure response quality and user satisfaction
   - Dashboard for conversation analytics

5. **🎨 Enhanced UI**
   - Markdown rendering in chat messages
   - File/image upload support
   - Typing indicators with actual LLM status
   - Dark/light theme toggle

6. **🧪 Testing**
   - Unit tests for services
   - Integration tests for API endpoints
   - E2E tests with Playwright

7. **🚀 Production Ready**
   - Docker containerization
   - CI/CD pipeline
   - Rate limiting and API key management
   - PostgreSQL for production database

---

## Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Backend
- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript
- `npm run start` - Start production server

## License

ISC
