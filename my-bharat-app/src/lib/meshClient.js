/**
 * Mesh API Client Utility
 * 
 * Note: We will primarily use endpoints like:
 * - https://api.meshapi.ai/v1/chat/completions (for RAG/Structured Output)
 * - wss://api.meshapi.ai/v1/realtime (for audio)
 */

/**
 * Returns standard fetch headers configured for the Mesh API.
 * @returns {Record<string, string>} Header configuration
 */
export function getMeshHeaders() {
  return {
    'Authorization': `Bearer ${process.env.MESH_API_KEY || ''}`,
    'Content-Type': 'application/json',
  };
}

/**
 * Reusable configuration object containing baseUrl, realtimeUrl, and headers generator.
 */
export const meshConfig = {
  baseUrl: 'https://api.meshapi.ai/v1',
  realtimeUrl: 'wss://api.meshapi.ai/v1/realtime',
  headers: getMeshHeaders,
};

export default meshConfig;
