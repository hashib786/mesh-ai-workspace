# Mesh AI Workspace — National Digital Rural Mission Initiative 🇮🇳

Welcome to the workspace for the **National Digital Rural Mission Initiative** (राष्ट्रीय डिजिटल ग्रामीण मिशन पहल). This repository houses the codebase for **जन-साथी (Jan-Sathi)**, a voice-first assistant designed to help rural users in India query information about government documents.

## 📁 Repository Structure

This workspace is organized as follows:

*   **`my-bharat-app/`**: The core Next.js web application. Contains the frontend UI (landing page and interactive voice-enabled dashboard), database models (MongoDB via Mongoose), user authentication (Clerk), and backend APIs communicating with the Mesh API.
    *   For detailed documentation of features, stack, and APIs, see [my-bharat-app/README.md](file:///c:/Users/Public/Hashib/Experiment/mesh-ai-workspace/my-bharat-app/README.md).
*   **`01-research/`**: Documentation and research regarding Mesh API capabilities and skills.
*   **`skills-lock.json`**: Project/workspace configuration locking agent customization configurations.

---

## 🚀 Quick Start

To run the primary application (**Jan-Sathi**):

1.  Navigate into the application directory:
    ```bash
    cd my-bharat-app
    ```
2.  Install the required dependencies:
    ```bash
    npm install
    ```
3.  Configure your environment variables in a `.env.local` file. Refer to the configuration section in [my-bharat-app/README.md](file:///c:/Users/Public/Hashib/Experiment/mesh-ai-workspace/my-bharat-app/README.md#%EF%B8%8F-environment-configuration) for setup.
4.  Run the development server:
    ```bash
    npm run dev
    ```
5.  Open [http://localhost:3000](http://localhost:3000) in your browser.

For complete documentation on APIs, features, and database schemas, please check the [app README](file:///c:/Users/Public/Hashib/Experiment/mesh-ai-workspace/my-bharat-app/README.md).