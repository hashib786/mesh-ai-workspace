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

## 5. Cost Optimization & Routing Strategy
- **Development Phase:** Always default to models with `is_free = true` (e.g., standard testing models) to prevent draining the prepaid balance during development and debugging.
- **Production/Hackathon Demo:** Switch to robust Paid Models for final agentic tasks and complex reasoning.

## 6. Error Handling (Crucial for UI/UX)
- **Billing Errors:** Implement strict `try...catch` blocks around all MeshAPI calls.
- **Specific Status Code:** Listen specifically for `HTTP 402`.
- **Error Code:** If the error code is `spend_limit_exceeded`, do NOT crash the app. Return a graceful fallback message to the frontend (e.g., "API spend limit reached. Please check your MeshAPI dashboard.").

**Code Snippet (Node.js Error Handling):**
```javascript
try {
  const response = await openai.chat.completions.create({ /* ... */ });
} catch (error) {
  if (error.status === 402 && error.code === 'spend_limit_exceeded') {
    return res.status(402).json({ 
      success: false, 
      message: "Spend limit exceeded. Please top up your MeshAPI balance." 
    });
  }
  // Handle other generic errors
}

## 7. Model Naming Convention
- **Format:** Always specify models in the `<provider>/<model_name>` format.
- **Example:** `openai/gpt-4o`, `anthropic/claude-haiku-4.5`.

## 8. Model Discovery Endpoints (REST GET Requests)
- `GET /v1/models` (Query params: `free=true/false`, `type=text/embedding/image`, `provider=openai/google/etc.`)
- `GET /v1/models/free` (Returns only free models, ideal for dev mode)
- `GET /v1/models/paid` (Returns paid models)
- `GET /v1/models/{model_id}` (Details for a specific model)

## 9. Capability Checking (CRITICAL FOR AGENTS)
- Before routing a complex agentic task, check the model's boolean capability flags.
- **Key Flags for Automation:** 
  - `supports_tools`: Required if the agent needs to execute external functions (Function Calling).
  - `supports_structured_output`: Required if the frontend/backend expects strict JSON responses.
  - `supports_thinking`: Useful for complex reasoning tasks.
- **Implementation Note:** If building a UI model-selector, disable or hide models that do not support the required capability for the current task (e.g., if the user is doing a data-extraction task, only show models where `supports_structured_output === true`).

## 10. Authentication (Updated)
- **Header Format:** `Authorization: Bearer <YOUR_RSK_KEY>`
- **Key Format:** MeshAPI keys always begin with the prefix `rsk_`.
- **Base URL:** `https://api.meshapi.ai`

## 11. Endpoints & Syntax References (Updated)

### A. Text & Chat (Chat Completions)
- **Endpoint:** `POST https://api.meshapi.ai/v1/chat/completions`
- **Headers Required:** 
  - `Authorization: Bearer <YOUR_RSK_KEY>`
  - `Content-Type: application/json`
- **JSON Body Payload:**
  ```json
  {
    "model": "openai/gpt-4o",
    "messages": [
      {"role": "user", "content": "Explain quantum computing in one sentence."}
    ]
  }