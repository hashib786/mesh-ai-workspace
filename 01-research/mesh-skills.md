# Mesh API Implementation Skills & Guidelines

## 1. Core Principles
- Always route AI calls through Mesh API (Hackathon Rule).
- Use standard REST API HTTP calls (Axios/Fetch) as Node.js SDK is unavailable.
- Implement robust error handling for API timeouts or routing failures.

## 2. Authentication
- Add Mesh API Key in headers.
- [Placeholder: Header syntax to be added once we read Auth docs]

## 3. Endpoints & Syntax References

### A. Text & Chat (Multi-model / Router)
- Endpoint: `[Placeholder]`
- JSON Body Structure: `[Placeholder]`
- Expected Response: `[Placeholder]`

### B. Agents & Automation (Structured Output / RAG)
- Endpoint: `[Placeholder]`
- Usage Notes: Useful for connecting Playwright scraped data to LLMs.

### C. Media Generation (Images / Video / Audio)
- Endpoint: `[Placeholder]`
- Required Parameters: `[Placeholder]`

## 4. Best Practices for MERN Stack
- Store API keys in `.env` securely.
- Ensure all Mesh API calls happen on the Node.js backend, not the React frontend.

## 2. Authentication & Base URL (Crucial)
- **Base URL:** `https://api.meshapi.ai`
- **Compatibility:** MeshAPI is fully OpenAI-compatible. 
- **Integration Method:** Use the official OpenAI SDK (Node.js or Python). Do NOT write raw Axios calls unless absolutely necessary. Simply override the `baseURL` property in the OpenAI client configuration to point to MeshAPI.

## 3. Endpoints & Syntax References

### A. Text & Chat (Chat Completions)
- **Method:** Standard OpenAI `chat.completions.create` structure.
- **Model ID:** Pass the specific MeshAPI model string (e.g., model name/id provided by MeshAPI) in the `model` parameter.
- **Code Snippet (Node.js Example):**
  ```javascript
  const OpenAI = require('openai');
  const openai = new OpenAI({
    apiKey: process.env.MESH_API_KEY,
    baseURL: '[https://api.meshapi.ai/v1](https://api.meshapi.ai/v1)', // Standard OpenAI v1 suffix usually applies
  });