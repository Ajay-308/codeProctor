# CodeProctor v1 🚀

**Your Smart Coding Interview Platform**

A comprehensive platform designed to streamline and enhance the remote coding interview experience. CodeProctor enables seamless technical interviews with real-time collaboration, video recording, and intelligent scheduling.

🔗 **Live Demo**: [code-proctor.vercel.app](https://code-proctor.vercel.app/home)

## 📸 Screenshots

![Landing Page](https://github.com/user-attachments/assets/landing-page-hero.png)

*More screenshots coming soon...*

## ✨ Features

### 🎯 Core Features (v1)

#### **Instant Meeting Room**
- 👥 Invite multiple participants to interview sessions
- 🎥 Voice, video, and emoji reactions
- 💻 Real-time code collaboration and synchronization
- 📝 Built-in coding questions rendered live on screen
- 🎬 Automatic video recording of each session

#### **Join Interview via Link**
- 🔗 Direct invite links for candidates
- 🔒 Secure and seamless access
- ⚡ No setup required for participants

#### **Interview Scheduling**
- 📅 Schedule interviews with any candidate
- 👨‍💼 Add multiple interviewers per session
- 📊 View candidate availability
- 📧 Send interview invites directly via email

#### **Recording Management**
- 🎥 View recordings tied to your account
- ⏰ 30-day retention period
- 🔍 Easy access and organization

#### **Dashboard**
- 📈 Track all completed interviews
- ⭐ Rate candidates post-interview
- 💬 Continue post-interview conversations
- 📊 Interview analytics and insights

#### **Candidate Management**
- 👤 View all registered candidates
- 📅 Check candidate availability
- 📧 Direct email communication
- 🗓️ One-click interview scheduling

## 🔮 Coming Soon

- **Template Page** - Structured assessments for interviews
- **Chat Inside Meet** - In-call text chat functionality
- **Multiple Face Capturing** - Detect all faces on camera
- **Voice Capturing** - Analyze speaker activity and behavior

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript (98.1%)
- **Styling**: Tailwind CSS
- **Authentication**: Clerk
- **Database**: Convex Database
- **Real-time Communication**: Socket.io
- **Video Streaming**: Custom streaming solution
- **Code Editor**: Integrated code editor with syntax highlighting
- **Deployment**: Vercel

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Convex account for database
- Clerk account for authentication

### Installation

1. **Clone the repository**
\`\`\`bash
git clone https://github.com/Ajay-308/codeProctor.git
cd codeProctor
\`\`\`

2. **Install dependencies**
\`\`\`bash
npm install
# or
yarn install
\`\`\`

3. **Set up environment variables**
\`\`\`bash
cp .env.example .env.local
\`\`\`

Fill in your environment variables:
\`\`\`env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Convex Database
CONVEX_DEPLOYMENT=your_convex_deployment
NEXT_PUBLIC_CONVEX_URL=your_convex_url

# Add other required environment variables
\`\`\`

4. **Set up Convex database**
\`\`\`bash
npx convex dev
\`\`\`

5. **Start the development server**
\`\`\`bash
npm run dev
# or
yarn dev
\`\`\`

6. **Open [http://localhost:3000](http://localhost:3000) in your browser**

## 📁 Project Structure

\`\`\`
codeProctor/
├── actions/              # Server actions
├── app/                  # Next.js app directory
├── components/           # Reusable UI components
├── constants/            # Application constants
├── convex/              # Convex database functions
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions
├── pages/api/           # API routes
├── public/              # Static assets
├── types/               # TypeScript type definitions
├── utils/               # Helper utilities
├── cleaned_problems.json # Cleaned coding problems
├── leetcode_problems.json # LeetCode questions
└── middleware.ts        # Next.js middleware
\`\`\`

## 🎯 Usage

### For Interviewers

1. **Create an Account** - Sign up using Clerk authentication
2. **Schedule Interview** - Add candidates and set interview times
3. **Start Interview** - Create instant meeting rooms
4. **Collaborate** - Use real-time code editor and video chat
5. **Review** - Access recordings and rate candidates

### For Candidates

1. **Join via Link** - Click the interview invite link
2. **No Setup Required** - Join directly from browser
3. **Code Together** - Collaborate in real-time code editor
4. **Communicate** - Use video, voice, and reactions

## 🔧 Configuration

### Database Schema

The project uses Convex for real-time database operations. Key collections include:
- Users and authentication
- Interview sessions
- Recordings
- Candidate profiles
- Scheduling data

### Authentication

Clerk handles user authentication with support for:
- Email/password authentication
- Social login options
- Session management
- Protected routes

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📊 Analytics & Insights

- **Language Distribution**: TypeScript (98.1%), CSS (1.1%), JavaScript (0.8%)
- **Total Deployments**: 175+ successful deployments
- **Active Development**: Regular updates and improvements

## 🐛 Known Issues

- Template page functionality in development
- Voice analysis features coming soon
- Multi-face detection in progress

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by the need for better remote technical interviews
- Community feedback and suggestions

## 📞 Contact & Support

**Developer**: Ajay
- **GitHub**: [@Ajay-308](https://github.com/Ajay-308)
- **LinkedIn**: [Connect with Ajay](https://linkedin.com/in/ajay-profile)
- **Project**: [CodeProctor Repository](https://github.com/Ajay-308/codeProctor)

## 🌟 Show Your Support

If you found CodeProctor helpful, please consider:
- ⭐ Starring this repository
- 🐛 Reporting bugs and issues
- 💡 Suggesting new features
- 🤝 Contributing to the codebase

---

**CodeProctor v1** - Making technical hiring efficient, intelligent, and candidate-friendly.

*This is just the beginning. Stay tuned for more exciting features!* 🚀
