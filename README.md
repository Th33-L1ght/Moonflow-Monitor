# Light Flow App

This is a Next.js application built in Firebase Studio for tracking menstrual cycles.

## How to Deploy Changes

This project uses GitHub Actions for automated deployments. Every time you push a change to the `main` branch, your live application will be updated automatically.

1.  **Make your changes** in Firebase Studio.

2.  **Open the Terminal** in the editor.

3.  **Run these three commands** to save your work and deploy it:

    ```bash
    # Stage all your changes
    git add .

    # Commit the changes with a message describing what you did
    git commit -m "Your descriptive message here"

    # Push the changes to GitHub to start the deployment
    git push
    ```

That's it! You can monitor the progress of your deployment in the **Actions** tab of your GitHub repository.

## Finding Your Live URL

You can find the public URL for your deployed application in the **Firebase Console**.
1. Navigate to your project: **moonflow-monitor**.
2. Under the "Build" menu, click on **Hosting**.
3. Your public URL (e.g., `moonflow-monitor.web.app`) will be listed there. You can visit this URL on your computer or phone.

## Monitoring Your App

Your application is set up to send feedback and error reports to your Firebase project.

### Viewing User Feedback
When a user submits feedback via the app, it's stored in your database.
1. In the Firebase Console, navigate to the **Build** section in the left menu.
2. Click on **Firestore Database**.
3. Look for a collection named `feedback`. All submissions will appear here.

### Viewing Error Reports
When an error occurs in the app, it is logged as an Analytics event.
1. In the Firebase Console, navigate to the **Release & Monitor** section in the left menu.
2. Click on **Analytics**, then select **Events**.
3. Look for an event name called `app_error`. Clicking on this will show you details about any errors that have occurred. (Note: It can take a few hours for events to appear).