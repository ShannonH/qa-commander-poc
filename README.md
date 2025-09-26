# QA Commander POC

A comprehensive Quality Assurance Management Platform for Blackboard Learn/Ultra, built with React and Material-UI. QA Commander empowers teams to manage risk-based testing, automate test planning, and leverage AI for documentation, content creation, and more—all in a modern, serverless-ready UI.

## 🚀 Key Features

- 🤖 **AI Chatbot**: Get instant, context-aware answers, step-by-step procedures, and test plans for Blackboard Learn/Ultra. Connects to OpenAI, AWS Bedrock, or Ollama via secure [chatbot-middleware](https://github.com/ShannonH/chatbot-middleware).
- ✍️ **Content Creator**: Generate and organize course content, test cases, and documentation with AI assistance.
- 🎯 **Dashboard**: Visualize QA metrics, recent activity, and quick links to common tasks.
- 🔍 **Risk Analysis**: Score workflows by likelihood and impact (1–4 scale), auto-calculate risk, and get automation recommendations (1–6 = Automate).
- 📋 **Test Plans**: Manage detailed test plans, categorize by type, track status, and assign team members.
- 🧪 **Automated/Manual Test Guidance**: Built-in logic recommends automation based on risk score.
- 🚧 **Jenkins Analysis**: (Coming Soon) Analyze build logs, failures, and performance trends.
- 🖥️ **Modern UI/UX**: Responsive, Material-UI v7 design with dark mode toggle. (can be switched over to bb-ui for Blackboard look and feel)
- 🔒 **Secure & Serverless Ready**: Deploy easily to AWS S3/CloudFront, connect to serverless backends, and keep API keys safe with middleware.

---

## 📸 Screenshots

### Dashboard Overview
![Dashboard](https://github.com/user-attachments/assets/06565b8c-279e-4f7e-bd20-7f2d815cca74)

### Test Plan Creation Form
![Test Plan Form](https://github.com/user-attachments/assets/fd40f9b8-ae68-4481-9b93-8db9e2d8a1dc)

---

## 🛠️ Getting Started

### Prerequisites
- Node.js 22+
- npm 10+

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ShannonH/qa-commander-poc.git
   cd qa-commander-poc
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```
   The application will open at `http://localhost:3000`.

### Available Scripts
- `npm start` – Runs the development server
- `npm test` – Runs the test suite
- `npm run build` – Creates a production build
- `npm run eject` – Ejects from Create React App (one-way operation)

---

## ⚙️ Technical Details

### Technology Stack
- **Frontend**: React 19 + TypeScript
- **UI Framework**: Material-UI v7 (with dark mode)
- **Routing**: React Router v6
- **Styling**: Emotion (CSS-in-JS)
- **Data Storage**: LocalStorage (expandable to real database)
- **Build Tool**: Create React App

### Project Structure
```
src/
├── components/          # Reusable UI components (Layout, etc.)
├── views/               # Page components (Dashboard, RiskAnalysis, TestPlans, etc.)
├── types/               # TypeScript type definitions
├── utils/               # Utility functions and services (dataService, chatbotService, etc.)
└── App.tsx              # Main application component
```

### AWS & Serverless Deployment
- Production build creates optimized static files for S3/CloudFront.
- Environment-agnostic configuration for easy deployment.
- Scalable architecture ready for serverless backend/API integration.

### AI Chatbot Integration
To connect the QA Commander chatbot to a real AI service (OpenAI, AWS Bedrock, Ollama, etc.):
1. **Create a `.env` file in the project root:**
   ```
   REACT_APP_CHATBOT_API_URL=https://your-middleware-domain.com/chatbot
   ```
   - Replace with your deployed [chatbot-middleware](https://github.com/ShannonH/chatbot-middleware) endpoint.
   - **Never expose your AI provider's API key in the frontend.**
2. **Use the [chatbot-middleware](https://github.com/ShannonH/chatbot-middleware) Proxy:**
   - Handles authentication and securely forwards requests to the AI service.
   - Can be run locally or deployed to any cloud provider.
3. **Restart the app:**
   ```bash
   npm start
   ```
   Your chatbot will now use the configured AI service for dynamic, realistic responses.

---

## 🧭 Future Enhancements
- Jenkins log analysis and build metrics (Q2 2024)
- Database integration (PostgreSQL/MongoDB)
- User authentication and authorization
- Real-time collaboration features
- API integration with testing tools
- Advanced reporting and analytics
- Export capabilities (PDF, Excel)


---

Built with ❤️ for Quality Assurance teams working with Blackboard Learn/Ultra