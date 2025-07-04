# Light Flow App

This is a Next.js application built in Firebase Studio for tracking menstrual cycles.

---

## **One-Time Setup: Connecting Your Firebase Project**

For your app to save any data (like user accounts or child profiles), you must connect it to your Firebase project. **You only need to do this once.**

Here is the step-by-step guide. This does **not** involve using the terminal.

#### **Step 1: Get Your Credentials from the Firebase Console**

The "Firebase Console" is the website where you manage your project.

1.  **Open the Firebase Console:** [Click here to open the Firebase Console](https://console.firebase.google.com/).
2.  **Select Your Project:** Click on your project, named `moonflow-monitor`.
3.  **Go to Project Settings:** Click the gear icon ⚙️ next to "Project Overview" in the top-left menu, then select **Project settings**.
4.  **Find Your Web App:** In the **General** tab, scroll down to the "Your apps" card. You should see a web app listed. If not, click the `</>` icon to create one and give it a nickname.
5.  **Copy Credentials:** In the "SDK setup and configuration" section, select the `Config` option. You will see a block of code. You need to copy the values for the following keys:
    *   `apiKey`
    *   `authDomain`
    *   `projectId`
    *   `storageBucket`
    *   `messagingSenderId`
    *   `appId`

Keep these values handy for the next step.

#### **Step 2: Add Credentials to Your App in Firebase Studio**

Now, we'll put those credentials into your app's code editor.

1.  **Find the File Explorer:** On the far left edge of the Firebase Studio editor, click the icon that looks like **two overlapping pages** to open the file list.
2.  **Open or Create a `.env` file:**
    *   In the **File Explorer**, look for a file named `.env`. If it doesn't exist, right-click on the empty space at the bottom of the file list, select **New File**, and name it exactly **`.env`**.

3.  **Copy the Template:**
    *   In the File Explorer, find and open the file named **`.env.example`**.
    *   Select and copy all the text inside it.

4.  **Paste and Fill In Your Credentials:**
    *   Open your **`.env`** file.
    *   Paste the text you just copied.
    *   Now, replace the placeholder values (like `YOUR_API_KEY_HERE`) with the actual credentials you got from the Firebase Console in Step 1.

    It should look something like this when you're done (but with your real values):
    ```
    NEXT_PUBLIC_FIREBASE_API_KEY=aiZaSy...
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=moonflow-monitor.firebaseapp.com
    ...and so on for all the other keys.
    ```

5.  **Save the file.**

That's it! Your application is now connected to your Firebase project. The next time you sign up for an account, it will appear in the **Authentication -> Users** tab in your Firebase Console.

---

## How to Deploy Changes

There are two ways to make your changes live for your users: using the "Publish" button (easiest) or using the terminal. Both methods achieve the same result.

### Method 1: The "Publish" Button (Recommended)

The easiest way to deploy your app is to use the **Publish** button at the top of the editor.

1.  After I make changes for you, review them in the app preview.
2.  When you're ready, click the blue **Publish** button.
3.  A small window will pop up asking for a "commit message." This is just a short description of the changes (e.g., "Added delete profile button").
4.  Type your message and click "Commit & Push".

That's it! This automatically saves your changes and starts the deployment. You can monitor the progress in the **Actions** tab of your GitHub repository.

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
3. Your public URL (e.g., `moonflow-monitor.web.app`) will be listed there. You can visit this URL on your computer or phone.

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

**Important:** The database will appear empty at first. As you use the app, "collections" of data will appear automatically. For example, after you add your first child, a `children` collection will be created. After you submit feedback, a `feedback` collection will appear.

### Viewing Error Reports

When an error occurs in your app, it is logged to **Firebase Analytics** so you can see if users are having problems.

1.  In the Firebase Console, navigate to the **Release & Monitor** section in the left menu.
2.  Click on **Analytics**, then select the **Events** tab.
3.  Look for an event name called `app_error`. (Note: It can take a few hours for new events to appear).

**First Time Setup for Analytics:** If you've just enabled Analytics, it may show a screen asking you to "Add an app to get started". You can ignore this. Your app is already configured. Simply use your live app for a few minutes (e.g., log in and add a child) to send the first event. The screen will then be replaced with the proper Analytics dashboard automatically. This can sometimes take a few hours.
