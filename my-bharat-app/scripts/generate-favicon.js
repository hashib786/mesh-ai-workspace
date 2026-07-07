const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const outputPath = path.join(publicDir, 'favicon.ico');

// Load environment variables from .env.local if available
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split(/\r?\n/).forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const index = trimmedLine.indexOf('=');
      if (index > 0) {
        const key = trimmedLine.substring(0, index).trim();
        const value = trimmedLine.substring(index + 1).trim().replace(/^["']|["']$/g, '');
        if (key && !process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  });
}

// Mesh API utilizes MESH_API_KEY environment variable
const MESH_API_KEY = process.env.MESH_API_KEY;

if (!MESH_API_KEY) {
  console.error('Error: MESH_API_KEY environment variable is not defined.');
  process.exit(1);
}

async function generateFavicon() {
  console.log('Requesting favicon generation from Mesh API...');
  try {
    const response = await fetch('https://api.meshapi.ai/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MESH_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'vertex/imagen-3',
        prompt: 'A minimalist, flat vector logo of a friendly glowing microphone with Indian tricolor accents (saffron, white, green), solid dark background, UI icon style.',
        size: '256x256'
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Mesh API returned status ${response.status}: ${errText}`);
    }

    const result = await response.json();
    const imageData = result.data?.[0];

    if (!imageData) {
      throw new Error(`No image data found in response: ${JSON.stringify(result)}`);
    }

    let imageBuffer;
    if (imageData.b64_json) {
      console.log('Successfully received image as base64 string.');
      imageBuffer = Buffer.from(imageData.b64_json, 'base64');
    } else if (imageData.url) {
      console.log('Successfully received image URL:', imageData.url);
      const downloadRes = await fetch(imageData.url);
      if (!downloadRes.ok) {
        throw new Error(`Failed to download image from URL: ${downloadRes.statusText}`);
      }
      imageBuffer = Buffer.from(await downloadRes.arrayBuffer());
    } else {
      throw new Error('Image data in response contains neither b64_json nor url.');
    }

    fs.writeFileSync(outputPath, imageBuffer);
    console.log('Favicon generated successfully and written to:', outputPath);
  } catch (error) {
    console.error('Favicon generation script error:', error);
    process.exit(1);
  }
}

generateFavicon();
