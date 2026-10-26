# Upskillyfy AI

> **Learn. Build. Grow. Transform.**  
> A full-stack EdTech and career acceleration platform featuring adaptive video streaming, branch-specific assessments, verified internships, and modern enterprise IT services.

---

## 🌟 Key Highlights

- **Interactive Learning & Video Workspace**: Stream licensed technical courses in high-definition MPEG-DASH (1080p, 720p, 480p) with synchronized audio/video, dynamic progress tracking, and interactive quizzes.
- **Assessment & Examination Portal**: Dedicated full-screen testing environment for students and faculty with branch filtering, real-time timer, and result analysis.
- **Career & Internship Hub**: Browse, filter, and apply for verified technical internships with resume tools and placement resources.
- **Enterprise IT & AI Services**: Showcase of production consulting services covering Cloud Infrastructure, GenAI Automation, and Full-Stack Engineering.
- **Modern Design & Accessibility**: Fully responsive layouts, theme persistence (Dark / Light mode), and Google Cloud design system tokens.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Dash.js (MPEG-DASH player), Lucide React, CSS3 Design Tokens
- **Backend**: Node.js, Express.js (ESM), Mongoose / MongoDB Atlas, JWT Authentication
- **Streaming & Storage**: MPEG-DASH manifest demuxing, Google Cloud Storage CDN
- **Security**: Server-side API key masking, bcrypt password hashing, CORS protection

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18.0.0 or later)
- [MongoDB](https://www.mongodb.com/) (local instance or free MongoDB Atlas cluster)

---

### 1. Clone & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/upskillyfy-ai/upskillyfy-ai.git
cd upskillyfy-ai

# Install root, client, and server dependencies
npm run install-all
```

Alternatively, install in separate terminals:

```bash
# Frontend
cd client
npm install

# Backend
cd ../server
npm install
```

---

### 2. Configure Environment Variables

Create a `.env` file in the `server` directory (you can copy `server/.env.example`):

```env
PORT=5000
CLIENT_URL=http://localhost:5173
SERVER_URL=http://localhost:5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/upskillyfy
JWT_SECRET=your_super_secret_jwt_key_2026

# Course Licensing & Playback API (Hosted on Render)
COURSE_API_BASE_URL=https://course-api-1eqv.onrender.com
COURSE_API_KEY=cap_live_69b5446095cf8a01a5ba4f5be5b2c9c7a84e6aa077d67110
```

---

### 3. Start Development Servers

Run both services in separate terminals:

**Terminal 1 — Client (Vite):**
```bash
cd client
npm run dev
# Running at http://localhost:5173
```

**Terminal 2 — Server (Express API):**
```bash
cd server
npm run dev
# Running at http://localhost:5000
```

---

## 📁 Repository Structure

```
upskillyfy-ai/
├── client/                     # Frontend Single Page Application
│   ├── public/                 # Static branding assets
│   ├── src/
│   │   ├── components/         # Global navigation, footer, carousels
│   │   ├── context/            # Auth, Theme, and Language providers
│   │   ├── data/               # Seed data for courses, roadmaps, and tests
│   │   ├── pages/              # Routes: Learning, Career, Assessments, Services
│   │   ├── services/           # Assessment calculation and logic
│   │   ├── api.js              # Centralized Axios API client
│   │   ├── App.jsx             # Main router and layout definitions
│   │   └── main.jsx            # Application entry point
│   ├── index.html              # HTML shell with Dash.js CDN loader
│   └── vite.config.js          # Vite build configuration
│
├── server/                     # Backend REST API
│   ├── data/                   # Initial seeds
│   ├── middleware/             # JWT auth validation
│   ├── models/                 # Mongoose schemas (User, Internship, Assessment, etc.)
│   ├── routes/                 # Express route handlers
│   │   ├── assessments.js      # Testing and attempt submission
│   │   ├── auth.js             # User login and registration
│   │   ├── courses.js          # Course catalog, sections, and video playback
│   │   ├── internships.js      # Internship listings and applications
│   │   └── newsletter.js       # Email subscriptions
│   ├── services/
│   │   └── courseApiService.js # External Course Licensing API integration
│   ├── index.js                # Server entry point
│   └── .env.example            # Environment blueprint
│
├── .gitignore                  # Exclusions for node_modules, builds, and keys
├── package.json                # Root scripts helper
└── README.md                   # Project documentation
```

---

## 👥 Community & Support

- **Organization**: [Upskillyfy AI](https://github.com/upskillyfy-ai)
- **Email**: upskillyfy@gmail.com
- **LinkedIn**: [Upskillyfy AI](https://www.linkedin.com/company/upskillyfy-ai/)
- **Instagram**: [@upskillyfy](https://www.instagram.com/upskillyfy/)

---

## 📄 License

This project is licensed under the MIT License.
