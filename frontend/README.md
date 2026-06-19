# WariGPT — Frontend

A premium, production-grade **AI assistant** in the spirit of ChatGPT / Claude.
RAG runs entirely **behind the scenes**: general questions are answered normally,
uploaded documents are used automatically *when relevant*, and the user never sees
retrieval internals unless they choose to.

Built with Next.js 15 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui-style
components, Lucide icons, TanStack Query, and Framer Motion.

Connects to the WariGPT **FastAPI** backend at `http://localhost:8000`.

---

## Features

- 🤖 **Conversational first** — ask anything; the assistant answers from general
  knowledge or your documents automatically (hidden relevance-gated retrieval).
- ⚡ **Streaming responses** token-by-token via Server-Sent Events, with a stop button.
- 🔁 **Regenerate** the last reply; **copy** any message.
- 🫥 **Hidden sources** — no "Source 1/2/3" blocks. A subtle **Sources** button appears
  only when a document was used, opening an on-demand side sheet.
- 💡 **Suggested follow-ups** generated after each answer, shown as clickable chips.
- 📎 **ChatGPT-style attachments** — drag-drop or attach PDF / DOCX / TXT (images/audio
  accepted in the UI, analysis deferred). Files are indexed automatically.
- 🗂️ **Multiple conversations** with history (grouped Today / Yesterday / …), rename &
  delete, persisted to `localStorage` and restored on refresh.
- 📝 Markdown, tables, lists, and syntax-highlighted code blocks.
- 🌑 Dark mode by default + light toggle, glassmorphism accents, smooth Framer Motion.
- 🔌 Live backend status, offline banner, friendly error handling.
- 📱 Fully responsive with a mobile sidebar drawer.

---

## Tech Stack

| Concern        | Choice                              |
| -------------- | ----------------------------------- |
| Framework      | Next.js 15 (App Router)             |
| Language       | TypeScript (strict)                 |
| Styling        | Tailwind CSS v4                     |
| Components     | shadcn/ui-style primitives + Radix  |
| Icons          | lucide-react                        |
| Data fetching  | TanStack Query (React Query)        |
| Animations     | Framer Motion                       |
| HTTP client    | axios                               |
| Notifications  | sonner                              |

---

## Project Structure

```
src/
├── app/                    # App Router: layout, page, providers, globals.css
├── components/             # Shared UI (app-shell, sidebar, status, copy)
│   └── ui/                 # shadcn-style primitives (dialog, sheet, dropdown, …)
├── features/
│   ├── chat/               # chat-view, message, composer, follow-ups,
│   │                       #   greeting, markdown, use-chat-stream
│   ├── conversations/      # conversation store (context) + history list
│   ├── citations/          # on-demand Sources button + sheet (hidden RAG)
│   ├── upload/             # attachment chips + upload hook
│   ├── documents/          # uploaded-file list + store hook
│   └── settings/           # settings dialog
├── services/               # API layer: http, api (upload/health), chat-stream (SSE)
├── hooks/                  # reusable hooks (localStorage, backend status)
├── types/                  # domain types (Conversation/Message) + API contracts
└── lib/                    # utils & constants
```

### Future-ready architecture

Types reserve `system`/`tool` message roles, `toolCalls`, and `Attachment` shapes;
the conversation store is structured to swap `localStorage` for IndexedDB or a
server DB; and the SSE service isolates transport so agents / tool-calling / voice
can be layered on without touching the UI.

---

## Getting Started

### 1. Prerequisites

- Node.js 18.18+ (tested on Node 20)
- The WariGPT FastAPI backend running on `http://localhost:8000`

### 2. Configure environment

A `.env.local` is already provided. To point at a different backend, edit:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

### 3. Install dependencies

```bash
cd frontend
npm install
```

### 4. Run the dev server

```bash
npm run dev
```

Open **http://localhost:3000**.

### 5. Production build

```bash
npm run build
npm start
```

---

## Backend Setup (FastAPI)

Run the backend from its virtualenv (it already has the deps):

```bash
cd backend
./venv/bin/uvicorn app:app --reload --port 8000
# DOCX support needs python-docx (already installed in venv):
#   ./venv/bin/pip install python-docx
```

> **CORS:** The backend's `app.py` includes `CORSMiddleware` allowing
> `http://localhost:3000`, which is required for the browser to call the API.

---

## API Integration

| Endpoint        | Method | Purpose                                                        |
| --------------- | ------ | -------------------------------------------------------------- |
| `/`             | GET    | Backend health/status                                          |
| `/chat-stream`  | POST   | `{ messages, doc_ids? }` → **SSE** stream of `token` / `sources` / `followups` / `done` events |
| `/upload`       | POST   | Multipart upload + auto-index (PDF/DOCX/TXT). `/upload-pdf` is a back-compat alias |
| `/ask-pdf`      | POST   | Legacy one-shot RAG (kept for back-compat)                     |

The SSE client lives in `src/services/chat-stream.ts` (fetch + `ReadableStream`,
abortable for stop/regenerate). Upload/health use axios via `src/services/http.ts`,
which normalizes failures into a friendly `ApiError` (timeout / network / HTTP).

### How "hidden RAG" works

Each turn, the backend embeds the latest user message and retrieves the nearest
chunks. It grounds the answer **only when the best match is close enough**
(`rag/retrieval.py: is_relevant`); otherwise it answers from general knowledge.
A `sources` event is emitted **only** when grounding happened — and the UI keeps
those passages hidden behind the Sources button.
