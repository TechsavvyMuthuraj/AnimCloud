# 🚀 Deployment Guide for AnimDrive

This guide outlines the steps to deploy your AnimDrive application to production using **Vercel** (recommended for Next.js) and configuring the necessary third-party services.

## Prerequisites

1.  **Vercel Account**: Sign up at [vercel.com](https://vercel.com) using your GitHub account.
2.  **GitHub Repository**: Your project code must be pushed to a GitHub repository.
3.  **Google Cloud Console Access**: To update OAuth redirect URIs.
4.  **Clerk Dashboard Access**: To get production API keys.

---
## Step 1: Push to GitHub

If you haven't already, push your local code to a new GitHub repository:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/your-username/anim-drive.git
git push -u origin main
```

*(Replace `your-username/anim-drive.git` with your actual repository URL)*

---
## Step 2: Deploy to Vercel

1.  Log in to your **Vercel Dashboard**.
2.  Click **"Add New..."** -> **"Project"**.
3.  Import your `anim-drive` repository from GitHub.
4.  **Configure Project**:
    *   **Framework Preset**: Next.js (should be auto-detected).
    *   **Root Directory**: `./` (default).
    *   **Build Command**: `next build` (default).
    *   **Install Command**: `npm install` (default).

5.  **Environment Variables**:
    You need to copy all variables from your local `.env.local` file to the Vercel Environment Variables section.

    **Required Variables:**
    *   `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (Get "Production" key from Clerk)
    *   `CLERK_SECRET_KEY` (Get "Production" key from Clerk)
    *   `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`
    *   `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`
    *   `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard`
    *   `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard`
    *   `GOOGLE_CLIENT_ID`
    *   `GOOGLE_CLIENT_SECRET`
    *   `NEXT_PUBLIC_APP_URL` (Your production URL, e.g., `https://anim-drive.vercel.app`)

    > **💡 Tip:** You can copy-paste the entire content of your `.env.local` file into Vercel's "Environment Variables" text area to add them all at once.

6.  Click **"Deploy"**.
    *   Wait for the build to complete. You will get a deployment URL (e.g., `https://anim-drive.vercel.app`).

---
## Step 3: Configure Clerk for Production

1.  Go to your **Clerk Dashboard**.
2.  Switch from "Development" to **"Production"** instance (you might need to create one).
3.  Go to **API Keys** and copy the *Production* Publishable Key and Secret Key.
4.  Update these keys in your **Vercel Project Settings** -> **Environment Variables**.
5.  Go to **Paths** in Clerk and ensure they match your app:
    *   Sign in: `/sign-in`
    *   Sign up: `/sign-up`
    *   Home: `/`

---
## Step 4: Configure Google Cloud OAuth

This is the most critical step for the Drive integration to work in production.

1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  Select your project.
3.  Go to **APIs & Services** -> **Credentials**.
4.  Find your **OAuth 2.0 Client ID**.
5.  **Add Authorized JavaScript Origins**:
    *   Add your Vercel production URL: `https://anim-drive.vercel.app`
    *   (Optional) Add `http://localhost:3000` for local testing.
6.  **Add Authorized Redirect URIs**:
    *   **For Clerk**: If using Clerk for Google Auth, you need Clerk's callback URL.
        *   Go to Clerk Dashboard -> **User & Authentication** -> **Social Connections**.
        *   Enable Google.
        *   Copy the **"Authorized redirect URI"** provided by Clerk.
        *   Paste this into Google Cloud Console.
    *   **For Custom Drive Integration**: Use your app's callback path:
        *   `https://anim-drive.vercel.app/api/auth/callback/google` (if applicable)

7.  **Publish OAuth App**:
    *   Go to **OAuth consent screen**.
    *   If the app is in "Testing" mode, user access is limited. Click **"Publish App"** to make it accessible to any Google user (Google verification may be required for sensitive scopes like `drive.file`).

---
## Step 5: Final Verification

1.  Redeploy your Vercel project if you updated environment variables (Settings -> Deployments -> Redeploy).
2.  Visit your live URL (`https://anim-drive.vercel.app`).
3.  Test the flows:
    *   **Sign Up/Login**: Verify Clerk works.
    *   **Google Drive Connection**: Go to Admin/Settings, click "Connect Google Drive". Ensure the popup allows access and doesn't show a "redirect_uri_mismatch" error.
    *   **Upload**: Try uploading a file to verify permissions.

## Troubleshooting

*   **Redirect URI Mismatch**: This means the URL in valid in Google Cloud Console doesn't match where your app is sending the user. Double-check `https` vs `http` and trailing slashes.
*   **403 Forbidden (Drive API)**: Ensure the user has granted the specific scopes. You might need to re-authenticate.
*   **Build Errors**: Check Vercel logs for missing dependencies or type errors.

Enjoy your deployed AnimDrive! 🚀
