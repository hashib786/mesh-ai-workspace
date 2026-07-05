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

## 22. Vision & Image Generation
- **Concept:** Use `POST /v1/chat/completions` for both analyzing images (Vision) and creating images (Generation).
- **Vision (Sending Images to AI):**
  - Inside the `messages.content` array, mix text and image parts.
  - Structure: `{"type": "image_url", "image_url": {"url": "data:image/jpeg;base64,...", "detail": "auto"}}`
  - *Best Practice:* Prefer Base64 encoding over public URLs for maximum compatibility across different provider models.
- **Image Generation:**
  - Select an image-capable model (check via `GET /v1/models`).
  - Pass the prompt in the `messages` array.
  - Add an `"image"` object to the root body: `{"size": "1024x1024", "quality": "high", "response_format": "url"}`

## 23. Standalone Image Generation (OpenAI Compatible)
- **Endpoint:** `POST /v1/images/generations`
- **Concept:** Dedicated endpoint for generating images from text prompts.
- **Payload Example:** 
  ```json
  {
    "model": "openai/gpt-image-1",
    "prompt": "A cinematic dark mode workspace with neon cyan accents",
    "size": "1024x1024",
    "stream": true
  }


* **Crucial Note on Streaming:** Set `"stream": true` for long-running generations. The API will send SSE (Server-Sent Events) with `: ping` to keep the HTTP connection alive, preventing frontend timeouts.
* **Provider Quirks:** Vertex AI (`vertex/imagen-3`) strictly returns images in `b64_json` format, completely ignoring the `response_format` parameter.

## 24. Image Editing & Transformations

* **Endpoint:** `POST /v1/images/edits`
* **Format:** Requires `multipart/form-data` (file uploads), NOT JSON.
* **Key Form Fields:** `image` (the raw file), `prompt`, `model`, and `operation`.
* **Supported Operations:**
* `"remove_background"` (Great for automation pipelines)
* `"upscale"` (Increase resolution)
* `"outpaint"` / `"inpaint"`
* **Error Handling:** If a chosen model does not support a specific operation, the API will return a `501 Not Implemented` status code.

## 25. Async Video Generation
- **Concept:** Video generation is asynchronous. You submit a task, get a Task ID, and either poll for completion or receive a webhook.
- **Endpoints:** - Create: `POST /v1/video/generations`
  - Status: `GET /v1/video/generations/{id}`
- **Payload Structure (`POST /v1/video/generations`):**
  - Requires a `content` array mixing modalities (e.g., `{"type": "text", "text": "..."}`, `{"type": "image_url", "image_url": {"url": "..."}}`).
  - Key parameters: `duration` (in seconds), `ratio` (e.g., "16:9"), `resolution`.
- **Polling Logic:** - Loop a `GET` request every 5-10 seconds until `status` is `"succeeded"`, `"failed"`, `"expired"`, or `"cancelled"`.
  - On success, the video URL is located at `content.video_url`.
- **Webhook Alternative:** Pass `"callback_url"` in the POST request to receive a server-side POST when the task reaches a terminal state.

## 26. Multi-Model Compare Endpoint
- **Concept:** Send a single prompt to multiple models concurrently and optionally receive a synthesized comparison.
- **Endpoint:** `POST /v1/chat/compare`
- **Payload Structure:**
  - `models`: Array of model IDs (e.g., `["openai/gpt-4o-mini", "anthropic/claude-haiku-4.5"]`). Max 10.
  - `messages`: Standard chat completion messages array.
  - `skip_comparison`: Set to `true` if you only want the raw outputs from each model to display in your own UI side-by-side, skipping the synthesis LLM step.
- **Streaming Modes:**
  - If `stream: true` and `skip_comparison: true`: Tokens from all models stream concurrently, tagged by their respective model name.

## 27. Batch API (Asynchronous Bulk Processing)
- **Concept:** Process high-volume requests (e.g., hundreds of scraped articles) asynchronously to avoid rate limits and timeouts.
- **Endpoints:**
  - Create: `POST /v1/batches`
  - Retrieve: `GET /v1/batches/{batch_id}`
- **Payload Structure (`POST /v1/batches`):**
  - `"completion_window"`: e.g., `"24h"`.
  - `"requests"`: Array of objects. Each MUST have a unique `"custom_id"`, and the `"body"` must contain standard Chat Completions parameters.
- **Strict Rule:** You CANNOT mix models within a single batch. All requests inside the `"requests"` array must target the exact same model.
- **Status Flow:** Poll the retrieve endpoint until `"status"` is `"completed"`. The response will contain a `"results"` array matching your `"custom_id"`s.

## 28. Auto Routing (`model: "auto"`)
- **Concept:** Let Mesh API dynamically select the best upstream model based on the prompt's complexity and intent.
- **Implementation:** Simply pass `"model": "auto"` in the standard Chat Completions or Embeddings payload.
- **Response Metadata:** - To know which model was actually used, check the `x_resolved_model_id` field in the JSON response (non-streaming).
  - For streaming, check the `X-Resolved-Model-Id` HTTP header.
- **Fallback:** If the internal router times out, it automatically falls back to a reliable, cheap model and sets `x_auto_routed_fallback: true`.
- **Cost Warning:** Using Auto Routing incurs charges for *both* the final inference model AND the internal classification model. Use strategically to avoid double-billing on high-volume background tasks.

## 29. Realtime API (Bidirectional Speech-to-Speech)
- **Concept:** Low-latency WebSocket gateway acting as a transparent proxy to OpenAI's Realtime API. Ideal for voice agents.
- **Endpoint:** `wss://api.meshapi.ai/v1/realtime?model=openai/gpt-realtime-2`
- **Authentication:**
  - *Backend (Preferred):* `Sec-WebSocket-Protocol: openai-realtime, Bearer rsk_...`
  - *Browser/Frontend:* Append `?api_key=rsk_...` to the URL.
- **Protocol Flow (OpenAI Compatible):**
  1. Client sends `session.update` (must use GA shape: `{"type":"realtime","output_modalities":["audio"],"audio":{...}}`).
  2. Client streams Base64 PCM16 via `input_audio_buffer.append`.
  3. Server streams Base64 audio back via `response.output_audio.delta`.
- **Important Restrictions:**
  - Requires a minimum account balance of $10 USD to open a session.
  - Sessions hard-cap at 30 minutes.
  - 60-second idle timeout.s

## 30. Architecture & Error Handling Best Practices
- **Automatic Failover:** The Mesh router natively handles upstream 5xx errors (e.g., OpenAI downtime) by retrying across alternative providers. Do NOT implement aggressive client-side retry loops (like `axios-retry`) for 5xx errors, as the gateway handles this.
- **Privacy:** Mesh API employs a Zero-Storage Policy for completion content. Emphasize this in the application's UI/UX to build user trust when processing sensitive data.
- **Latency Optimization:** The router automatically resolves requests to the nearest geographic cloud region.