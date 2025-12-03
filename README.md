# CANVuS

A **real-time collaborative drawing canvas** where multiple users can draw, erase, and interact simultaneously. Designed for lightweight usage with minimal UX for smooth collaboration!

## Features

* **Real-time collaboration:** Multiple users can draw on the canvas simultaneously.
* **Canvas types:**

  * **Private:** Only accessible by the creator.
  * **Public:** Anyone can join and draw.
  * **Shared:** Collaborators can be invited by email.
* **Drawing tools:**

  * Pen
  * Eraser
  * Colors with a color picker
* **Canvas sizes:** Create canvases of different sizes based on your needs.
* **Minimal UX:** Lightweight and simple interface.
* **Authentication:** OAuth2 + JWT for secure access.
* **Persistent state:** Canvas updates are synced in real-time and cached using **Redis**.
* **Firebase integration:** Stores user and session data.

### Prerequisites

* **Node.js** (v18+ recommended)
* **Redis**
  Install Redis locally or use a hosted instance. For local installation:

  * On macOS: `brew install redis`
  * On Ubuntu: `sudo apt install redis-server`
  * On Windows: [Download from Redis official site](https://redis.io/download)
* **Firebase Service Account JSON** (see SERVICE_ACCOUNT_CREDS below)

## Installation

1. Clone the repository:

   ```bash
   git clone <repo-url>
   cd CANVuS
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure environment variables in `.env`:

   ```env
   JWT_SECRET=<your-jwt-secret>
   SERVICE_ACCOUNT_CREDS=/path/to/serviceAccountKey.json
   REDIS_URL=<your-redis-url>
   ```
(Optional): Generate a secure JWT secret using the included script:

```bash
node crypt.js
 ```
4. Start the server:

   ```bash
   node server.js
   ```

5. Open the front-end in your browser to access the canvas.

### Set up Firebase project

1. Go to [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Create a new project.
3. Add a web app and generate a Service Account JSON for Admin SDK.
4. Save the JSON locally and set the path in your `.env` as `SERVICE_ACCOUNT_CREDS`.

### SERVICE_ACCOUNT_CREDS

Path to your Firebase Service Account JSON file, which contains:

* `project_id`
* `private_key`
* `client_email`
* Other credentials required for Firebase Admin SDK access

## Usage

* Log in using Google OAuth2.
* Create a new canvas: select type (private, public, or shared) and size.
* For **shared canvases**, invite collaborators by entering their email addresses.
* Use the toolbar to:

  * Draw or erase
  * Pick colors using the color picker
  
* Owners of shared canvases have control over session management.

## Tech Stack

* **Backend:** Node.js, Express
* **Real-time updates:** WebSockets (Socket.IO)
* **Caching:** Redis
* **Authentication:** OAuth2 + JWT
* **Database:** Firebase for session and canvas state
* **Front-end:** HTML, CSS, JS (Canvas API)

## Contribution

* Contributions are welcome! Open issues or submit pull requests for bug fixes or improvements. New features will be coming up, so stay tuned!
