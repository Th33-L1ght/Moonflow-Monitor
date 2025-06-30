# Light Flow App

This is a Next.js application built in Firebase Studio for tracking menstrual cycles.

## Getting Started

### 1. Set up Environment Variables

To run the app with full functionality (including user authentication and AI features), you need to configure your API keys.

1.  Copy the `.env.example` file to a new file named `.env`:
    ```bash
    cp .env.example .env
    ```
2.  Open the `.env` file and add your credentials. Alternatively, if you run the app without the keys, it will prompt you for them.
    -   **Firebase:** You can find your Firebase project's configuration keys in your Firebase project settings under "General".
    -   **Google AI (Gemini):** You can get a Google AI API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

### 2. Run the Development Server

Once your `.env` file is set up, you can run the app:

```bash
npm run dev
```

The app will be available at `http://localhost:9002`.
