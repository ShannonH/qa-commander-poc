# QA Commander POC

A comprehensive Quality Assurance Management Platform built with React and Material-UI, designed for managing QA testing workflows for Blackboard Learn/Ultra features.

## Features

### 🎯 Dashboard
- Overview of QA metrics and statistics
- Quick access to common tasks
- Recent activity tracking

### 🔍 Risk Analysis
- Create and manage risk assessments for risk-based testing
- Probability and impact scoring (1-5 scale)
- Risk level categorization (Low, Medium, High, Critical)
- Mitigation strategy documentation

### 📋 Test Plans
- Comprehensive test plan management for Blackboard Learn/Ultra features
- Categorization by test type (Functional, Integration, Performance, etc.)
- Priority and status tracking
- Detailed forms with prerequisites and test cases
- Support for all major Blackboard features:
  - Course Management, Gradebook, Discussion Forums
  - Assignments, Content Areas, Announcements
  - Assessment Tools, Rubrics, SafeAssign
  - Ultra and Original Course Views
  - And many more...

### 🚧 Jenkins Analysis (Coming Soon)
- Under construction view for future Jenkins log analysis tool
- Planned features include build failure analytics and performance trending

## Technology Stack

- **Frontend**: React 19 with TypeScript
- **UI Framework**: Material-UI v5
- **Routing**: React Router v6
- **Styling**: Emotion (CSS-in-JS)
- **Data Storage**: LocalStorage (expandable to real database)
- **Build Tool**: Create React App

## Getting Started

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

- `npm start` - Runs the development server
- `npm test` - Runs the test suite
- `npm run build` - Creates a production build
- `npm run eject` - Ejects from Create React App (one-way operation)

## AWS Deployment Ready

The application is configured for easy deployment to AWS:
- Production build creates optimized static files
- Can be deployed to S3 + CloudFront
- Environment-agnostic configuration
- Scalable architecture ready for serverless backend integration

## Project Structure

```
src/
├── components/          # Reusable UI components
│   └── Layout.tsx      # Main app layout with navigation
├── views/              # Page components
│   ├── DashboardView.tsx
│   ├── RiskAnalysisView.tsx
│   ├── TestPlansView.tsx
│   └── UnderConstructionView.tsx
├── types/              # TypeScript type definitions
│   └── index.ts
├── utils/              # Utility functions and services
│   └── dataService.ts  # Data persistence layer
└── App.tsx             # Main application component
```

## Features in Detail

### Risk Analysis
- Create comprehensive risk assessments
- Rate probability and impact on 1-5 scales
- Categorize by risk level with color coding
- Document detailed mitigation strategies
- Track creation and update timestamps

### Test Plan Management
- **Comprehensive Forms**: Detailed test plan creation with all necessary fields
- **Blackboard Integration**: Pre-configured for all Blackboard Learn/Ultra features
- **Categorization**: Support for multiple test types and priorities
- **Team Management**: Assignee tracking and collaboration features
- **Prerequisites**: Manage test dependencies and setup requirements
- **Status Tracking**: From Draft to Completed with visual indicators

### User Experience
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Material Design**: Clean, professional interface following Google's Material Design
- **Intuitive Navigation**: Sidebar navigation with active state indicators
- **Quick Actions**: Easy access to common tasks from the dashboard
- **Form Validation**: Client-side validation for data integrity

## Configuring AI Service Integration

To connect the QA Commander chatbot to a real AI service (such as OpenAI or AWS Bedrock), you need to set the API endpoint in a `.env` file. This allows the frontend to send user questions to your AI backend securely.

### 1. Create a `.env` file in the project root:

```
REACT_APP_CHATBOT_API_URL=https://your-middleware-domain.com/chatbot
```

- Replace `https://your-middleware-domain.com/chatbot` with the URL of your deployed AI middleware/proxy server.
- **Never expose your AI provider's API key directly in the frontend.** Always use a secure backend or middleware.

### 2. Use the [chatbot-middleware](https://github.com/ShannonH/chatbot-middleware) Proxy

For security and flexibility, we recommend using the [chatbot-middleware](https://github.com/ShannonH/chatbot-middleware) project as a proxy between your React app and the AI provider (e.g., OpenAI, Ollama).

- The middleware handles authentication and securely forwards requests to the AI service.
- You can run it locally or deploy it to any cloud provider.
- See the [chatbot-middleware README](https://github.com/ShannonH/chatbot-middleware) for setup and deployment instructions.

### 3. Restart the App

After updating your `.env` file, restart the development server:

```bash
npm start
```

Your chatbot will now use the configured AI service for dynamic, realistic responses.

## Future Enhancements

### Jenkins Analysis Tool (Q2 2024)
- Real-time build log parsing and analysis
- Failure pattern recognition with ML
- Performance trending and bottleneck identification
- Integration with existing test planning workflow
- Custom dashboard widgets for build metrics

### Additional Features
- Database integration (PostgreSQL/MongoDB)
- User authentication and authorization
- Real-time collaboration features
- API integration with testing tools
- Advanced reporting and analytics
- Export capabilities (PDF, Excel)

## Screenshots

### Dashboard Overview
![Dashboard](https://github.com/user-attachments/assets/06565b8c-279e-4f7e-bd20-7f2d815cca74)

### Test Plan Creation Form
![Test Plan Form](https://github.com/user-attachments/assets/fd40f9b8-ae68-4481-9b93-8db9e2d8a1dc)

---

Built with ❤️ for Quality Assurance teams working with Blackboard Learn/Ultra