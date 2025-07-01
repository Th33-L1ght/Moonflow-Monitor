
# Light Flow App

This is a Next.js application built in Firebase Studio for tracking menstrual cycles.

## Getting Started Locally

1.  **Set up Environment Variables:**
    To run the app with full functionality, you need to configure your environment variables. Open the `.env` file and add your Firebase project keys. You can find these in your Firebase project settings under "General". The app will prompt you for keys if they are missing, but setting them here is recommended.

2.  **Run the Development Server:**
    ```bash
    npm run dev
    ```
    The app will be available at `http://localhost:9002`.

---

## Deploying with GitHub (Recommended for Sharing)

To share your app with friends, the best way is to set up automated deployments. This way, every time you push your code to GitHub, it will automatically update your live application.

### Prerequisites

*   You have pushed this project's code to a repository on GitHub.
*   You have the Firebase CLI installed: `npm install -g firebase-tools`.

### Step 1: Login to Firebase

In your local terminal, run this command and follow the prompts to log in to your Firebase account:

```bash
firebase login
```

### Step 2: Set Up Automated Deployment

1.  In your local terminal (in the project folder), run the following command:
    ```bash
    firebase init hosting:github
    ```
2.  The CLI will guide you through a series of questions:
    *   **Select a Firebase project:** Choose the same Firebase project you've been using.
    *   **What's the name of the GitHub repository... ?** Enter your repository name in the format `your-username/your-repo-name`.
    *   **Set up a workflow to run a build script before every deploy?** Yes.
    *   **What script should be run before every deploy?** `npm run build`.
    *   **Set up automatic deployment to your site's live channel when a PR is merged?** Yes.
    *   **What is the name of the GitHub branch... ?** `main` (or whichever branch you use as your primary).

The CLI will automatically create the necessary GitHub Actions workflow file in your project.

### Step 3: Add Environment Variables to GitHub

For Firebase to build your project correctly, it needs your environment variables. You must add them as "Secrets" in your GitHub repository.

1.  Go to your repository on GitHub.
2.  Click on **Settings** > **Secrets and variables** > **Actions**.
3.  Click **New repository secret** for each of the following variables from your `.env` file:
    *   `NEXT_PUBLIC_FIREBASE_API_KEY`
    *   `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
    *   `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
    *   `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
    *   `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
    *   `NEXT_PUBLIC_FIREBASE_APP_ID`

4.  Finally, get your Firebase Hosting URL. You can find this in your **Firebase Console** under the **Hosting** section; it usually ends in `.web.app`. Add this URL as a secret as well:
    *   `NEXT_PUBLIC_APP_URL`

### Step 4: Push to Deploy!

Commit and push your changes to GitHub. This will upload the workflow file you just created and start the first automatic deployment.

```bash
git add .
git commit -m "Configure GitHub Actions for deployment"
git push
```

Now, every time you push to your `main` branch, your app will be deployed, and your invite links will work correctly. You can check the deployment progress in the "Actions" tab of your GitHub repository and find your public URL in the Firebase Console under "Hosting". You can share this Firebase Hosting URL with your friends!


