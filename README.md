# Light Flow App

This is a Next.js application built in Firebase Studio for tracking menstrual cycles.

## Getting Started

### 1. Set up Environment Variables

To run the app with full functionality, you need to configure your environment variables. Open the `.env` file and add your credentials.

-   **Firebase:** You can find your Firebase project's configuration keys in your Firebase project settings under "General".
-   **Public App URL:** To share the app with others, you'll need to deploy it and add the public URL here. See the "Deploying and Sharing" section for more details.

The app will prompt you for Firebase keys if they are missing, but setting them in `.env` is recommended for a smoother experience.

### 2. Run the Development Server

Once your `.env` file is set up, you can run the app:

```bash
npm run dev
```

The app will be available at `http://localhost:9002`.

### 3. Deploying and Sharing

To share your app with friends for testing, you need to deploy it to get a public URL.

1.  **Deploy your app:** Follow your hosting provider's instructions to deploy the application. For Firebase App Hosting, you would typically run `firebase deploy`.
2.  **Get the Public URL:** After deployment, you will get a public URL (e.g., `https://your-app-name.web.app`).
3.  **Update Environment Variable:** Open your `.env` file and set the `NEXT_PUBLIC_APP_URL` to your public URL:
    ```
    NEXT_PUBLIC_APP_URL=https://your-app-name.web.app
    ```
4.  **Redeploy:** Deploy the app one more time with the updated environment variable.
5.  **Share:** Now, when you generate an invite link within the app, it will correctly point to your public URL, and you can share it with your friends to test!
