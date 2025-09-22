<div align="center">

# 🚀 CodeProctor v1

**Your Smart Coding Interview Platform**

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-Visit_Site-blue?style=for-the-badge)](https://code-proctor.vercel.app/home)
[![GitHub Stars](https://img.shields.io/github/stars/Ajay-308/codeProctor?style=for-the-badge&logo=github)](https://github.com/Ajay-308/codeProctor)
[![TypeScript](https://img.shields.io/badge/TypeScript-98.1%25-blue?style=for-the-badge&logo=typescript)](https://github.com/Ajay-308/codeProctor)
[![Deployments](https://img.shields.io/badge/Deployments-175+-green?style=for-the-badge&logo=vercel)](https://github.com/Ajay-308/codeProctor)

*A comprehensive platform designed to streamline and enhance the remote coding interview experience with real-time collaboration, video recording, and intelligent scheduling.*

</div>

---

## 📸 **Preview**

<div align="center">
  <img width="2849" height="1455" alt="image" src="https://github.com/user-attachments/assets/43ae30ec-c836-4212-bae1-850ef2d4bf70" />
</div>

---

## ✨ **Key Features**

<table>
<tr>
<td width="50%">

### 🎯 **Core Functionality**
- 👥 **Multi-participant Sessions** - Invite multiple interviewers
- 🎥 **HD Video & Audio** - Crystal clear communication
- 💻 **Real-time Code Sync** - Live collaborative coding
- 📝 **Built-in Questions** - Pre-loaded coding challenges
- 🎬 **Auto Recording** - Capture every session

</td>
<td width="50%">

### 🔧 **Management Tools**
- 🔗 **One-click Invites** - Seamless candidate access
- 📅 **Smart Scheduling** - Advanced calendar integration
- 📊 **Analytics Dashboard** - Track interview performance
- ⭐ **Rating System** - Evaluate candidates effectively
- 📧 **Email Integration** - Direct communication tools

</td>
</tr>
</table>

---

## 🛠️ **Tech Stack**

<div align="center">

| Category | Technologies |
|----------|-------------|
| **Frontend** | ![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js) ![TypeScript](https://img.shields.io/badge/TypeScript-98.1%25-blue?logo=typescript) |
| **Styling** | ![Tailwind](https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white) |
| **Auth** | ![Clerk](https://img.shields.io/badge/Clerk-6C47FF?logo=clerk&logoColor=white) |
| **Database** | ![Convex](https://img.shields.io/badge/Convex_DB-FF6B6B?logo=convex) |
| **Real-time** | ![Socket.io](https://img.shields.io/badge/Socket.io-010101?logo=socket.io) |
| **Deployment** | ![Vercel](https://img.shields.io/badge/Vercel-000000?logo=vercel&logoColor=white) |

</div>

---

## 🚀 **Quick Start**

### Prerequisites
```bash
Node.js v18+ | npm/yarn | Convex account | Clerk account
```

### 1️⃣ **Clone & Install**
```bash
# Clone the repository
git clone https://github.com/Ajay-308/codeProctor.git
cd codeProctor

# Install dependencies
npm install
```

### 2️⃣ **Environment Setup**
```bash
# Copy environment template
cp .env.example .env.local
```

```env
# 🔐 Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret

# 📊 Database
CONVEX_DEPLOYMENT=your_convex_deployment
NEXT_PUBLIC_CONVEX_URL=your_convex_url
```

### 3️⃣ **Database & Development**
```bash
# Setup Convex database
npx convex dev

# Start development server
npm run dev
```

### 4️⃣ **Access Application**
Open [http://localhost:3000](http://localhost:3000) in your browser 🎉

---

## 📁 **Project Architecture**

```
codeProctor/
├── 🎬 actions/              # Server actions & logic
├── 📱 app/                  # Next.js app directory
├── 🧩 components/           # Reusable UI components
├── ⚙️ constants/            # Application constants
├── 💾 convex/              # Database functions
├── 🪝 hooks/               # Custom React hooks
├── 📚 lib/                 # Utility libraries
├── 🌐 pages/api/           # API routes
├── 🖼️ public/              # Static assets
├── 📝 types/               # TypeScript definitions
├── 🔧 utils/               # Helper utilities
├── 📊 cleaned_problems.json # Curated problems
└── ⚡ leetcode_problems.json # LeetCode dataset
```

---

## 💻 **Usage Guide**

<details>
<summary><b>👨‍💼 For Interviewers</b></summary>

1. **🔐 Sign Up** - Create account with Clerk authentication
2. **📅 Schedule** - Add candidates and set interview times
3. **🚀 Start Session** - Launch instant meeting rooms
4. **🤝 Collaborate** - Use real-time code editor and video
5. **📊 Review** - Access recordings and provide ratings

</details>

<details>
<summary><b>👤 For Candidates</b></summary>

1. **🔗 Join** - Click the interview invite link
2. **⚡ No Setup** - Access directly from browser
3. **💻 Code** - Collaborate in real-time editor
4. **📞 Communicate** - Video, voice, and emoji reactions

</details>

---

## 🔮 **Roadmap**

| Status | Feature | Description |
|--------|---------|-------------|
| 🚧 | **Template System** | Pre-built interview templates |
| 🚧 | **In-call Chat** | Text messaging during interviews |
| 🚧 | **Multi-face Detection** | Advanced camera analysis |
| 🚧 | **Voice Analytics** | Speaker behavior insights |
| 💡 | **AI Assistance** | Automated question suggestions |
| 💡 | **Code Analysis** | Real-time code quality feedback |

---

## 🤝 **Contributing**

We welcome contributions! Here's how you can help:

<div align="center">

[![Contributors](https://img.shields.io/badge/Contributors-Welcome-brightgreen?style=for-the-badge)](https://github.com/Ajay-308/codeProctor/contribute)

</div>

1. 🍴 **Fork** the repository
2. 🌿 **Branch** - Create feature branch (`git checkout -b feature/amazing-feature`)
3. 💻 **Code** - Make your changes
4. ✅ **Commit** - (`git commit -m 'Add amazing feature'`)
5. 📤 **Push** - (`git push origin feature/amazing-feature`)
6. 🔄 **PR** - Open a Pull Request

---

## 📊 **Project Stats**

<div align="center">

</div>

- **📈 Active Development** - Regular updates and improvements
- **🚀 175+ Deployments** - Proven stability and reliability
- **💻 98.1% TypeScript** - Type-safe and maintainable code
- **🌟 Production Ready** - Battle-tested in real interviews

---

## 📄 **License**

<div align="center">

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

</div>

---

## 👨‍💻 **Meet the Developer**

<div align="center">

<img src="https://github.com/Ajay-308.png" alt="Ajay" width="100" style="border-radius: 50%;">

**Ajay**

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Ajay-308)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/ajay308)

*"Making technical hiring efficient, intelligent, and candidate-friendly."*

</div>

---

## 💝 **Show Your Support**

<div align="center">

If CodeProctor has helped you, consider:

[![Star this repo](https://img.shields.io/badge/⭐_Star_this_repo-yellow?style=for-the-badge)](https://github.com/Ajay-308/codeProctor)
[![Fork](https://img.shields.io/badge/🍴_Fork-blue?style=for-the-badge)](https://github.com/Ajay-308/codeProctor/fork)
[![Watch](https://img.shields.io/badge/👀_Watch-green?style=for-the-badge)](https://github.com/Ajay-308/codeProctor/subscription)

**Every ⭐ star helps us grow and improve!**

</div>

---

<div align="center">

### 🚀 **CodeProctor v1** - *The Future of Technical Interviews*

*This is just the beginning. Stay tuned for more exciting features!*

[![Back to Top](https://img.shields.io/badge/⬆️_Back_to_Top-blue?style=for-the-badge)](#-codeproctor-v1)

</div>
