# Moonflow Monitor

This is a Next.js application built in Firebase Studio for tracking menstrual cycles.

---

## **One-Time Setup**

Your app has two one-time setup steps that must be completed to function correctly.

### 1. Connect Your Code to Firebase (In the Editor)

For your app to save any data (like user accounts or child profiles), you must connect your code to your Firebase project.

1.  **Get Your Credentials:** Open the [Firebase Console](https://console.firebase.google.com/), select your project (`moonflow-monitor`), go to **Project settings** (⚙️ icon), find your web app, and copy the `Config` values (`apiKey`, `authDomain`, etc.).
2.  **Add Credentials to Your App:** In the editor, open the empty `.env` file. Copy the contents of `.env.example` into it, and then paste your credentials from the previous step. Save the file.

#### **Your Keys Are Safe!**
You might be worried about adding secret keys to your project. Don't be! Your `.env` file is listed in a special file called `.gitignore`. This tells GitHub to **never** upload your `.env` file. Your keys will always remain private and secure in your editor environment.

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
To see the actual user accounts that can log in (both parent emails and child usernames):
1. In the Firebase Console, navigate to the **Build** section in the left menu.
2. Click on **Authentication**, and go to the **Users** tab.

### Viewing Your App's Data (Child Profiles, Feedback, etc.)

All of the data for your app—child profiles, cycle logs, and user feedback—is stored in your **Firestore Database**. Think of it as the master spreadsheet for your application.

1.  In the Firebase Console, navigate to the **Build** section in the left menu.
2.  Click on **Firestore Database**.

**Important:** The database will appear empty at first. As you use the app, "collections" of data will appear automatically. For example, after you add your first child, a `children` collection will be created. After you submit feedback through the app, a `feedback` collection will appear here as well.

### Viewing Error Reports

When an error occurs in your app, it is logged to **Firebase Analytics** so you can see if users are having problems.

1.  In the Firebase Console, navigate to the **Release & Monitor** section in the left menu.
2.  Click on **Analytics**, then select the **Events** tab.
3.  Look for an event name called `app_error`. (Note: It can take a few hours for new events to appear).

**First Time Setup for Analytics:** If you've just enabled Analytics, it may show a screen asking you to "Add an app to get started". You can ignore this. Your app is already configured. Simply use your live app for a few minutes (e.g., log in and add a child) to send the first event. The screen will then be replaced with the proper Analytics dashboard automatically. This can sometimes take a few hours.
