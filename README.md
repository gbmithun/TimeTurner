# TimeTurner

TimeTurner is a full-stack web application for watch enthusiasts to explore, compare, and manage luxury watches from top brands. Users can browse a curated collection, compare specifications, manage wishlists, and read watch-related blogs.

## Features

- Explore a wide range of luxury watches with detailed specifications and images
- Add watches to your wishlist for easy access
- Compare multiple watches side-by-side
- User authentication (signup, login, password reset via email OTP)
- Admin panel for managing blogs and watches
- Responsive design for desktop and mobile
- Newsletter subscription (UI only)
- Blog section with articles about watches and horology

## Tech Stack

- Node.js
- Express.js
- MongoDB & Mongoose
- EJS templating
- Tailwind CSS
- Session-based authentication
- Nodemailer (for password reset emails)

## Getting Started

### Prerequisites

- Node.js (v16 or higher recommended)
- MongoDB database (local or Atlas)
- Google account for sending emails (for password reset)

### Installation

1. **Clone the repository:**
   ```sh
   git clone https://github.com/yourusername/timeturner.git
   cd timeturner
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Set up environment variables:**

   Create a `.env` file in the root directory and add the following (replace with your actual values):

   ```
   CLIENT_ID=your_google_client_id
   CLIENT_SECRET=your_google_client_secret
   REDIRECT_URI=your_google_redirect_uri
   REFRESH_TOKEN=your_google_refresh_token
   SENDER_EMAIL=your_email@gmail.com
   MONGODB_URI=your_mongodb_connection_string
   ```

4. **Seed the database:**

   To populate the database with the initial watch data, run:

   ```sh
   node seed.js
