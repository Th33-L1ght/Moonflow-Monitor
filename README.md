
# Light Flo

This is a Next.js application built in Firebase Studio for tracking menstrual cycles.

---

## **One-Time Setup**

For your app to save any data (like user accounts or profiles), you must connect your code to your Firebase project.

1.  **Get Your Credentials:** Open the [Firebase Console](https://console.firebase.google.com/), select your project, go to **Project settings** (⚙️ icon), find your web app, and copy the `Config` values (`apiKey`, `authDomain`, etc.).
2.  **Add Credentials to Your App:** In the editor, open the empty `.env` file at the root of the project. Copy the contents of `.env.example` into it, and then paste your credentials from the previous step. Save the file.

Your `.env` file is secure and will not be uploaded to GitHub.

## How to Deploy Changes

The easiest way to deploy your app is to use the **Publish** button at the top of the editor.

1.  After I make changes for you, review them in the app preview.
2.  When you're ready, click the blue **Publish** button.
3.  A small window will pop up asking for a "commit message." This is just a short description of the changes (e.g., "Updated card design").
4.  Type your message and click **Commit & Push**.

This automatically saves your changes to GitHub and starts the deployment. You can monitor the progress in the **Actions** tab of your GitHub repository.

## Finding Your Live URL

You can find the public URL for your deployed application in the **Firebase Console**.
1. Navigate to your project.
2. Under the **Build** menu, click on **Hosting**.
3. Your public URL (e.g., `your-project-id.web.app`) will be listed there.

## Viewing Your App's Data

All of the data for your app—user profiles and cycle logs—is stored in your **Firestore Database**.

1.  In the Firebase Console, navigate to the **Build** section in the left menu.
2.  Click on **Firestore Database**.

**Important:** The database will appear empty at first. As you use the app, "collections" of data will appear automatically. For example, after you add your first profile, a `children` collection will be created.
