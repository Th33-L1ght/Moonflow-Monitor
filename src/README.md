
# Light Flo App

This is a Next.js application built in Firebase Studio for tracking menstrual cycles.

## How to Deploy Changes

This project uses GitHub Actions for automated deployments. Every time you push a change to the `main` branch, your live application will be updated automatically.

1.  **Make your changes** in Firebase Studio.

2.  **Click the "Publish" button** at the top of the editor to save and deploy your work.

## Finding Your Live URL

You can find the public URL for your deployed application in the **Firebase Console**.
1. Navigate to your project.
2. Under the **Build** menu, click on **Hosting**.
3. Your public URL will be listed there. You can visit this URL on your computer or phone.

## Child Logins & Invitations

There are two ways to allow a child to log in and manage their own profile:

1.  **Invite via Email**: If your child has an email address, you can generate a one-time invite link from their card in the dashboard. Copy this link and send it to them. When they click it, they will be prompted to create their own account with an email and password.

2.  **Create Child Login**: If your child does not have an email address, you can create a simple username and password for them directly from their card. They can use this username and password to log in.

### Forgotten Passwords

*   **Parent Accounts**: If you forget your password, you can use the "Forgot Password?" link on the login page, which will send a reset link to your email address.
*   **Child Accounts**: If a child forgets their password (for a username-based login), the parent can reset their access. On the child's card, use the menu to select **"Unlink Account"**. This will disconnect their old login, allowing you to use **"Create Child Login"** to set up a new one. **This action is safe and does not delete any of the child's cycle data.**

## Monitoring Your App

Your application is set up to send all its data, including user feedback and error reports, to your Firebase project.

### Viewing User Login Accounts
To see the actual user accounts that can log in (both parent emails and child usernames):
1. In the Firebase Console, navigate to the **Build** section in the left menu.
2. Click on **Authentication**, and go to the **Users** tab.

### Viewing Your App's Data (Child Profiles, Feedback, etc.)

All of the data for your app—child profiles, cycle logs, and user feedback—is stored in your **Firestore Database**.

1.  In the Firebase Console, navigate to the **Build** section in the left menu.
2.  Click on **Firestore Database**.

**Important:** The database will appear empty at first. As you use the app, "collections" of data will appear automatically. For example, after you add your first child, a `children` collection will be created. After you submit feedback, a `feedback` collection will appear.

### Viewing Error Reports

When an error occurs in your app, it is logged to **Firebase Analytics** so you can see if users are having problems.

1.  In the Firebase Console, navigate to the **Release & Monitor** section in the left menu.
2.  Click on **Analytics**, then select the **Events** tab.
3.  Look for an event name called `app_error`. (Note: It can take a few hours for new events to appear).
