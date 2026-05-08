# Setup Guide: Project Credentials

To make your portfolio fully functional, you need to gather credentials from several free-tier services. Follow these steps for each:

---

### 1. Admin Email & Password
**Location**: [`.env.local`](file:///d:/portfolio/portfolio/.env.local)
- **Email**: You can set any email you like (e.g., `admin@yourname.com`).
- **Password**: Set any secure password.
- **Usage**: Use these to log in at `/login` to access the admin dashboard.

---

### 2. MongoDB URI (Database)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a **Free Shared Cluster**.
3. Create a **Database User** (keep the username and password).
4. In "Network Access", allow access from `0.0.0.0/0` (for development).
5. Click **Connect** > **Drivers** > **Node.js**.
6. Copy the connection string and replace `<password>` with your database user password.

---

### 3. Gemini API Key (AI Chatbot)
1. Go to [Google AI Studio](https://aistudio.google.com/).
2. Log in with your Google account.
3. Click on **"Get API Key"** on the left sidebar.
4. Click **"Create API key in new project"**.
5. Copy the key and add it to `GEMINI_API_KEY` in your `.env.local`.

---

### 4. Cloudinary (Image Uploads)
1. Go to [Cloudinary](https://cloudinary.com/) and sign up for a free account.
2. Go to your **Dashboard**.
3. You will see your **Cloud Name**, **API Key**, and **API Secret** clearly listed on the main page.
4. Copy these into the respective fields in your `.env.local`.

---

### 5. Pusher (Real-time Notifications)
1. Go to [Pusher](https://pusher.com/) and sign up.
2. Create a new **Channels** app.
3. Name it (e.g., "Portfolio") and select a cluster (usually `ap2` or `mt1`).
4. Go to the **"App Keys"** tab in your Pusher dashboard.
5. Copy the `app_id`, `key`, `secret`, and `cluster` into your `.env.local`.

---

### 6. Auth Secret
Use the secret I generated for you in the previous step:
`AUTH_SECRET=6wjsxeN+/pVmsoivvyKtU1Km8iQCcHwH8UJR2MGVRDk=`

---

> [!TIP]
> After adding these credentials, you must **restart your development server** (`npm run dev`) for the changes to take effect.
