# Moonflow Monitor

This is a Next.js application built in Firebase Studio for tracking menstrual cycles.

---

## **One-Time Setup**

Your app has two one-time setup steps that must be completed to function correctly.

### 1. Connect Your Code to Firebase (In the Editor)

For your app to save any data (like user accounts or child profiles), you must connect your code to your Firebase project.

1.  **Get Your Credentials:** Open the [Firebase Console](https://console.firebase.google.com/), select your project (`moonflow-monitor`), go to **Project settings** (⚙️ icon), find your web app, and copy the `Config` values (`apiKey`, `authDomain`, etc.).
2.  **Add Credentials to Your App:** In the editor here, open the file explorer (📄 icon on the far left). Copy the contents of `.env.example`, paste them into the empty `.env` file, and fill in the values you just copied. Save the file.

### 2. Enable Hosting Backend (In the Firebase Console)

The first time you deploy, Firebase may ask you to **"Publish your app"** by linking a billing account and enabling services. This is a one-time step to set up the necessary server infrastructure for your app. **This process does not touch your code or GitHub.** It simply prepares Firebase to receive your deployments.

---

## How to Deploy Changes (Push to GitHub)

There are two ways to make your changes live for your users. Both methods push your code to GitHub, which automatically starts the deployment process.

### Method 1: The "Publish" Button (Recommended)

The easiest way to deploy your app is to use the **Publish** button at the top of the editor.

1.  After I make changes for you, review them in the app preview.
2.  When you're ready, click the blue **Publish** button.
3.  A small window will pop up asking for a "commit message." This is just a short description of the changes (e.g., "Added delete profile button").
4.  Type your message and click **Commit & Push**.

That's it! This automatically saves your changes to GitHub and starts the deployment. You can monitor the progress in the **Actions** tab of your GitHub repository.

### Method 2: Using the Terminal

If you prefer using the command line, you can follow these steps:

1.  **Open the Terminal** in the editor.
2.  **Run these three commands** to save your work and deploy it:
    ```bash
    # Stage all your changes
    git add .
    # Commit the changes with a message describing what you did
    git commit -m "Your descriptive message here"
    # Push the changes to GitHub to start the deployment
    git push
    ```

## Finding Your Live URL

You can find the public URL for your deployed application in the **Firebase Console**.
1. Navigate to your project: **moonflow-monitor**.
2. Under the **Build** menu, click on **Hosting**.
3. Your public URL (e.g., `moonflow-monitor.web.app`) will be listed there.

## Monitoring Your App

Your application is set up to send all its data, including user feedback and error reports, to your Firebase project.

### Viewing User Login Accounts
To see the user accounts that have signed up:
1. In the Firebase Console, navigate to the **Build** section in the left menu.
2. Click on **Authentication**, and go to the **Users** tab.

### Viewing Your App's Data (Child Profiles, etc.)
All of the data for your app—child profiles, cycle logs, and user feedback—is stored in your **Firestore Database**.

1.  In the Firebase Console, navigate to the **Build** section in the left menu.
2.  Click on **Firestore Database**.

**Important:** The database will appear empty at first. As you use the app, "collections" of data will appear automatically. For example, after you add your first child, a `children` collection will be created.
