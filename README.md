# Manas – AI Mental Wellness Tracker for Students

Empathetic wellness tracker and mentor tailored for competitive exam students (JEE, NEET, UPSC, boards).

## 🚀 Getting Started

First, install dependencies:
```bash
npm install
```

Second, run the development server:
```bash
npm run dev
```
Open [http://localhost:3001](http://localhost:3001) in your browser.

## 🧪 Running Tests

To run the Vitest automated test suite:
```bash
npm run test
```

---

## 🌐 Deploying to Render

To deploy this Next.js application to **Render** (e.g., as a Web Service), configure the following parameters:

### 1. Build & Start Settings
* **Runtime**: `Node`
* **Build Command**: `npm run build`
* **Start Command**: `npm run start`

### 2. Environment Variables
You must pass the following environment keys to enable live AI integration (either OpenAI, Gemini, or both):

| Environment Variable Name | Required | Description |
| :--- | :--- | :--- |
| `OPENAI_API_KEY` | Optional (if using OpenAI) | Secure server-side OpenAI key. Starts with `sk-...`. |
| `NEXT_PUBLIC_OPENAI_API_KEY` | Optional (if using OpenAI) | Enables the frontend to route messages to the OpenAI proxy. |
| `GEMINI_API_KEY` | Optional (if using Gemini) | Secure server-side Gemini key. |
| `NEXT_PUBLIC_GEMINI_API_KEY` | Optional (if using Gemini) | Enables the frontend to route messages to the Gemini proxy. |

> [!NOTE]
> If no environment variables are provided, the application will automatically fall back to its offline rule-based NLP mentor engine for both coaching and journal logs, ensuring 100% functionality out-of-the-box.

