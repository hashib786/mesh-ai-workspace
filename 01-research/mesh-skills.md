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

## 12. Prompt Templates Integration
- **Concept:** MeshAPI allows moving long system prompts and logic to server-side templates with dynamic variable interpolation `{{variable}}`.
- **Usage in Chat Completions:** Instead of passing a long `"system"` message, use the `"template"` and `"variables"` fields in the POST body.
- **Example Payload:**
  ```json
  {
    "template": "my-custom-template-name",
    "variables": {
      "key1": "value1",
      "key2": "value2"
    },
    "messages": [
      { "role": "user", "content": "Process this data: {{data}}" }
    ]
  }

## 14. Structured Output (Strict JSON Formatting)
- **Concept:** Force the model to return syntactically valid JSON for predictable data extraction (vital for Playwright/Scraping workflows).
- **Implementation:** Use the `response_format` parameter in `POST /v1/chat/completions`.
- **Mode 1: `json_object`** - Simply returns JSON. Must instruct the model in the prompt to return JSON and specify desired keys.
- **Mode 2: `json_schema` (RECOMMENDED FOR AGENTS)**
  - Strictly enforces the output structure, field names, and data types.
  - **Syntax:**
    ```json
    "response_format": {
      "type": "json_schema",
      "json_schema": {
        "name": "data_extraction",
        "schema": {
          "type": "object",
          "properties": {
            "keyName": { "type": "string" }
          },
          "required": ["keyName"],
          "additionalProperties": false 
        }
      }
    }
    ```
- **Crucial Tips for Structured Output:**
  - Set `"temperature": 0` in the API call for deterministic outputs.
  - Set `"additionalProperties": false` in the schema to prevent the model from hallucinating extra fields.
  - The response will be a JSON string inside `choices[0].message.content`. It MUST be parsed client-side using `JSON.parse()`.

## 15. Embeddings (Vector Generation for RAG)
- **Concept:** Converts text strings into dense vector arrays (floats) for semantic search and Retrieval-Augmented Generation (RAG).
- **Endpoint:** `POST https://api.meshapi.ai/v1/embeddings`
- **JSON Body Structure:**
  ```json
  {
    "model": "openai/text-embedding-3-small",
    "input": ["String 1", "String 2"] // Send an array for batch embedding!
  }

## 16. RAG (Files & Semantic Search)
- **Concept:** MeshAPI handles file chunking, embedding, and vector storage natively. No external vector DB (like Pinecone) is required.
- **Workflow (3 Steps):**
  1. **Upload (`POST /v1/files`):** Get a `signed_url` and PUT the raw file bytes to it immediately. Set `"embed": true`.
  2. **Poll Status (`GET /v1/files/{file_id}`):** Wait until `"embedding_status"` is `"ready"`.
  3. **Search (`POST /v1/files/search`):** Send a natural language `"query"` to retrieve relevant text chunks.
- **End-to-End Chat Integration:**
  - After searching, extract the text from the results: `const context = searchData.results.map(r => r.text).join("\n\n");`
  - Pass this context into the `"system"` prompt of a standard Chat Completion request, instructing the model to answer based *only* on the provided context.
- **Metadata Filtering:** Use the `"metadata"` object during upload (e.g., `{"department": "HR"}`) to later filter searches using the `"filter"` object.

## 17. Audio Handling (Input & Output)
- **Concept:** Send audio for transcription or request audio output from supported models.
- **Audio Input (Base64):**
  - Inside the `messages` array, add a content part with type `input_audio`.
  - Format: `{"type": "input_audio", "input_audio": {"data": "<BASE64_STRING>", "format": "wav"}}`
- **Audio Output:**
  - Request both text and audio by adding `"modalities": ["text", "audio"]` to the main request body.
  - Define voice settings: `"audio": {"voice": "alloy", "format": "wav"}`
- **Audio Translation to English:**
  - Use endpoint `POST /v1/audio/translations` to send audio in any language and receive an English text translation.
  - Recommended model: `openai/whisper-large-v3`
- **Important Note:** Always base64 encode audio payloads for Chat Completions. Keep file sizes optimized for performance.

## 18. Speech-to-Text (STT) & Audio File Uploads
- **Concept:** Convert audio files to text. Uses `multipart/form-data`, NOT JSON.
- **Endpoints:**
  - `POST /v1/audio/transcriptions` (Standard Transcription)
  - `POST /v1/audio/transcriptions/translate` (Transcribe directly to English text, recommended model: `sarvam/saaras:v2`)
- **Node.js Note:** Use native `FormData` or `form-data` package. Append the audio file as a Blob/Stream and pass the `"model"` field.

## 19. Real-Time Streaming Audio (WebSockets)
- **Concept:** Use WebSockets for live microphone transcription without waiting for the full recording to finish.
- **Endpoint:** `WS wss://api.meshapi.ai/v1/audio/transcriptions/realtime?model=openai/whisper-large-v3&api_key=rsk_...`
- **Protocol (OpenAI Compatible):**
  - **Send to server:** `{ "type": "input_audio_buffer.append", "audio": "<BASE64_PCM_AUDIO>" }`
  - **Receive from server (Interim text):** `{ "type": "conversation.item.input_audio_transcription.delta", "delta": "..." }`
  - **Receive from server (Final text):** `{ "type": "conversation.item.input_audio_transcription.completed", "transcript": "..." }`
- **Commit:** Send `{ "type": "input_audio_buffer.commit" }` to finalize an audio segment.


## 20. Text-to-Speech (TTS) REST API
- **Concept:** Convert text into audio files. Supports top brands like ElevenLabs and Kokoro natively.
- **Endpoint:** `POST /v1/audio/speech`
- **Payload Requirements:**
  - `model`: Required (e.g., `"eleven_flash_v2_5"` or `"hexgrad/kokoro-82m"`).
  - `input`: Required. The text string to synthesize.
  - `voice`: Required for most. The specific Voice ID (can be fetched via `GET /v1/audio/voices`).
  - `stream`: Set to `false` if you want to receive a complete file buffer (e.g., `response_format: "mp3_44100_128"`).

## 21. Real-Time Streaming TTS (WebSockets)
- **Concept:** Send text chunks as they arrive from an LLM to get instant audio bytes back, minimizing latency.
- **Endpoint:** `WS wss://api.meshapi.ai/v1/audio/speech/stream/{voice_id}?model_id=hexgrad/kokoro-82m&api_key=rsk_...`
- **Protocol (Standard Models like Kokoro/Cartesia):**
  - **Send to server:** `{ "type": "input_text_buffer.append", "text": "chunk" }`
  - **Receive from server:** `{ "type": "conversation.item.audio_output.delta", "delta": "<BASE64_AUDIO>" }`
  - **Commit:** `{ "type": "input_text_buffer.commit" }`