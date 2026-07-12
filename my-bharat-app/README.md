# जन-साथी (Jan-Sathi) — राष्ट्रीय डिजिटल ग्रामीण मिशन पहल 🇮🇳

**Jan-Sathi** is a voice-first government document assistant designed specifically for rural India under the **National Digital Rural Mission Initiative** (राष्ट्रीय डिजिटल ग्रामीण मिशन पहल). It helps rural users navigate procedures for essential government documents—such as Aadhaar card, PAN card, and Passports—entirely through natural Hindi voice conversations.

The application features **Suhani**, a friendly 24-year-old village girl persona, who guides users step-by-step, respects cultural norms, adjusts her instructions based on the user's technology literacy, and protects them from middleman/scam fees.

---

## 🌟 Key Features

1. **Voice-First Interaction (सिर्फ बोलकर सवाल पूछें)**
   - Tailored for rural users who may find typing difficult.
   - Powered by Indian language speech-to-text models for high accuracy.

2. **Text-to-Speech Output (आवाज़ में जवाब पाएं)**
   - Synthesizes speech outputs using standard Indian accents so users can hear responses clearly.

3. **Cultural Persona & Relational Addressing (सांस्कृतिक व्यवहार)**
   - Guided by **Suhani**, a 24-year-old virtual assistant who addresses older users respectfully using terms like *चाचा जी* (Uncle), *माँ जी* / *आंटी जी* (Aunty), *दादा जी* (Grandfather), and younger users as *भाई* (Brother) or *बहन* (Sister).

4. **Tech-Savviness Context Checks**
   - Automatically detects whether the user is comfortable using smartphones or computers.
   - **For tech-savvy users:** Provides simple step-by-step online directions.
   - **For non-tech-savvy users:** Advises them to go to a nearby Common Service Center (CSC) or Online Cafe, guides them on exactly what to say to the operator, and warns them about the maximum standard fee (e.g. *“online वाले को सिर्फ ₹50 दीजिएगा, इससे ज़्यादा नहीं”*).

5. **Anti-Scam & Fee Transparency (दलालों से बचाव)**
   - Explicitly communicates standard official fees to prevent middlemen from overcharging vulnerable users.

6. **Credit-Limited Safety Net**
   - Implements a default credit limit system ($0.10 credit limit per user; $0.005 charged per message) to prevent API abuse while keeping it free for genuine testing.

7. **Auto-Titling**
   - Automatically generates brief 3-4 word Hindi titles for new chat sessions using LLMs based on the user's first query.

---

## 🛠️ Technology Stack

- **Frontend & Routing**: [Next.js 16](https://nextjs.org/) (App Router, React 19)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & `@tailwindcss/postcss`
- **Authentication**: [Clerk Auth](https://clerk.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) via [Mongoose](https://mongoosejs.com/)
- **AI Integrations (via Mesh API)**:
  - **Chat completions**: `openai/gpt-4o-mini`
  - **Speech-to-Text (STT)**: `sarvam/saaras:v3` (Optimized for Indian languages)
  - **Text-to-Speech (TTS)**: `sarvam/bulbul:v3` (Realistic Indian accents)

---

## 📁 Project Structure

```
my-bharat-app/
├── public/                 # Static assets (images, icons)
├── scripts/                # Utility scripts (e.g., generate-favicon.js)
├── src/
│   ├── app/                # Next.js App Router (pages & API routes)
│   │   ├── api/            # Backend API Endpoints
│   │   │   ├── auth/sync   # Sync Clerk User Profiles to MongoDB
│   │   │   ├── chat        # Manage Chat Session CRUD & Mesh API responses
│   │   │   ├── chats       # List Chat Sessions
│   │   │   ├── tts         # Convert Text to Audio (Sarvam Bulbul)
│   │   │   └── voice-to-text # Convert Audio to Text (Sarvam Saaras)
│   │   ├── app/            # Nested Dashboard application (/app)
│   │   ├── sign-in/        # Clerk Authentication Page
│   │   ├── sign-up/        # Clerk Authentication Page
│   │   ├── globals.css     # Global Tailwind styles
│   │   ├── layout.tsx      # Main application layout
│   │   └── page.tsx        # Public Landing Page
│   ├── components/         # Reusable React UI Components
│   │   ├── dashboard/      # VoiceControlCard, ChatHistoryCard, Sidebar, etc.
│   │   └── landing/        # Navbar, HeroSection, FeaturesSection, Footer
│   ├── hooks/              # Custom React Hooks
│   │   ├── useChatHistory.js # Handles conversation flow, history & active sessions
│   │   └── useTtsPlayer.js   # Audio playback, play status, and TTS triggers
│   ├── lib/                # Utility clients
│   │   ├── db.js           # Mongoose MongoDB Connection helper
│   │   └── meshClient.js   # Mesh API configuration & headers
│   └── models/             # Mongoose Schemas & Database Models
│       ├── ChatSession.js  # Chat History database schema
│       └── UserProfile.js  # User Profile & Credit tracking database schema
├── package.json            # Scripts & Dependency Manifest
└── tsconfig.json           # TypeScript Configurations
```

---

## ⚙️ Environment Configuration

Create a `.env.local` file in the root of the `my-bharat-app` directory and fill in the following details:

```env
# Mesh API Configuration
MESH_API_KEY=your_mesh_api_key_here

# MongoDB Connection Configuration
MONGODB_URI=your_mongodb_connection_string_here

# Clerk Authentication Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Clerk Route Redirects
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
```

---

## 🚀 Getting Started

### 1. Install Dependencies
Run the following command inside the `my-bharat-app` directory:
```bash
npm install
```

### 2. Generate Favicon (Optional)
A node script is provided to pre-build app assets:
```bash
npm run gen-icon
```

### 3. Run Development Server
Start the local server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### 4. Build for Production
Create an optimized production build:
```bash
npm run build
```

Start the built production server:
```bash
npm run start
```

---

## 📡 API Endpoints Reference

### 1. User Sync `/api/auth/sync`
- **GET**: Validates the logged-in Clerk user, syncs or initializes their profile document in MongoDB, and initializes their free tier credit limit.

### 2. Chat Operations `/api/chat`
- **GET**: Fetches the default conversation history log.
- **POST**: Accepts a user query (`text`) and optional `chatId`. Charges $0.005 to their profile, queries the Mesh API (`gpt-4o-mini`) using the custom Suhani persona prompt, saves the assistant's reply to the specific `ChatSession` document, and returns the response.
- **DELETE**: Clears the conversation history for the current session.

### 3. Session Listing `/api/chats`
- **GET**: Lists all active conversation sessions for the current logged-in user, sorted by last update time.

### 4. Text-To-Speech (TTS) `/api/tts`
- **POST**: Accepts text content, calls the Mesh Audio Speech API using the `sarvam/bulbul:v3` model, and streams back the synthesized `.wav` audio format response.

### 5. Voice-To-Text `/api/voice-to-text`
- **POST**: Accepts audio form data, calls the Mesh Audio Transcriptions API using the `sarvam/saaras:v3` model, logs the query text to MongoDB, and returns the transcribed text.

---

## 🔒 License

This project is prepared for the **National Digital Rural Mission Initiative** and is open for public community enhancement.
