export interface UserWorkflow {
  id: string;
  workflowName: string;
  description: string;
  userStory: string;
  blackboardFeature: BlackboardFeature;
  likelihood: number; // 1-4 scale (probability of failure)
  impact: number; // 1-4 scale (impact if failure occurs)
  riskScore: number; // likelihood * impact
  testingTier: 'Tier 1: CRITICAL' | 'Tier 2: HIGH' | 'Tier 3: MEDIUM/LOW';
  deliverables: string; // Required testing deliverables
  automationReason: string;
  sourceTestPlanId?: string; // Link to originating test plan
  sourceScenarioId?: string; // Link to originating test scenario
  createdAt: Date;
  updatedAt: Date;
}

export interface RiskAnalysisDocument {
  id: string;
  title: string;
  description: string;
  blackboardFeature: BlackboardFeature;
  workflows: UserWorkflow[];
  overallRiskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  totalRiskScore: number;
  recommendations: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TestPlan {
  id: string;
  title: string;
  description: string;
  feature: string;
  category: TestCategory;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  estimatedHours: number;
  prerequisites: string[];
  testScenarios: TestScenario[];
  testCases: TestCase[];
  blackboardFeature: BlackboardFeature;
  status: 'Draft' | 'Review' | 'Approved' | 'In Progress' | 'Completed' | 'Archived';
  assignee?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TestScenario {
  id: string;
  given: string;
  when: string;
  then: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  notes?: string;
}

export interface TestCase {
  id: string;
  title: string;
  description: string;
  steps: TestStep[];
  expectedResult: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  relatedScenarioId?: string; // Link to TestScenario
}

export interface TestStep {
  id: string;
  stepNumber: number;
  action: string;
  expectedResult: string;
}

export type TestCategory =
  | 'Functional'
  | 'Integration'
  | 'Performance'
  | 'Security'
  | 'Usability'
  | 'Accessibility'
  | 'API'
  | 'Database'
  | 'UI/UX'
  | 'Mobile'
  | 'Cross-browser';

export type BlackboardFeature =
  | 'Course Management'
  | 'Gradebook'
  | 'Discussion Forums'
  | 'Assignments'
  | 'Content Areas'
  | 'Announcements'
  | 'Calendar'
  | 'Messages'
  | 'Group Management'
  | 'Assessment Tools'
  | 'Rubrics'
  | 'SafeAssign'
  | 'Attendance'
  | 'Grade Center'
  | 'Ultra Course View'
  | 'Original Course View'
  | 'Mobile App'
  | 'Integration Tools'
  | 'Reports'
  | 'System Administration';

// Blackboard Learn API Integration Types
export interface BlackboardCredentials {
  learnUrl: string;
  username: string;
  password: string;
  token?: string;
  tokenExpiry?: Date;
  authenticated?: boolean;
}

export interface BlackboardCourse {
  courseId?: string;
  externalId: string;
  name: string;
  description?: string;
  allowGuests?: boolean;
  readOnly?: boolean;
  termId?: string;
  availability?: {
    available: 'Yes' | 'No' | 'Disabled';
    duration?: {
      type: 'Continuous' | 'DateRange' | 'FixedNumDays' | 'Term';
      start?: string;
      end?: string;
      daysOfUse?: number;
    };
  };
}

export interface BlackboardUser {
  userId?: string;
  externalId: string;
  userName: string;
  email: string;
  firstName: string;
  lastName: string;
  password?: string;
  systemRoleIds?: string[];
  availability?: {
    available: 'Yes' | 'No' | 'Disabled';
  };
}

export interface BlackboardAssignment {
  id?: string;
  title: string;
  description?: string;
  instructions?: string;
  position?: number;
  grading?: {
    due?: string;
    attemptsAllowed?: number;
    scoringModel?: 'Last' | 'Highest' | 'First' | 'Average';
    schema?: 'Percent' | 'Points' | 'CompleteIncomplete' | 'LetterGrade';
    points?: number;
  };
  availability?: {
    available: 'Yes' | 'No' | 'Disabled';
    allowGuests?: boolean;
  };
}

export interface ContentCreationRequest {
  type: 'course' | 'user' | 'assignment' | 'enrollment';
  course?: BlackboardCourse;
  user?: BlackboardUser;
  assignment?: BlackboardAssignment;
  enrollment?: {
    courseId: string;
    userId: string;
    roleId: 'Student' | 'Instructor' | 'TeachingAssistant' | 'CourseBuilder' | 'Grader';
  };
}

export interface BlackboardSession {
  credentials: BlackboardCredentials;
  authenticated: boolean;
  availableActions: string[];
}

// AI Chatbot Types
export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  type?: 'text' | 'test-plan' | 'help-article';
  metadata?: {
    testPlan?: Partial<TestPlan>;
    helpUrl?: string;
    blackboardFeature?: BlackboardFeature;
  };
}

export interface ChatbotContext {
  currentView?: string;
  selectedFeature?: BlackboardFeature;
  userGoal?: 'general-help' | 'test-planning' | 'troubleshooting';
  sessionData?: any;
}

export interface BlackboardHelpArticle {
  id: string;
  title: string;
  url: string;
  content: string;
  feature: BlackboardFeature;
  category: string;
  tags: string[];
}

// AI Chatbot Types
export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  type?: 'text' | 'test-plan' | 'help-article';
  metadata?: {
    testPlan?: Partial<TestPlan>;
    helpUrl?: string;
    blackboardFeature?: BlackboardFeature;
  };
}

export interface ChatbotContext {
  currentView?: string;
  selectedFeature?: BlackboardFeature;
  userGoal?: 'general-help' | 'test-planning' | 'troubleshooting';
  sessionData?: any;
}

export interface BlackboardHelpArticle {
  id: string;
  title: string;
  url: string;
  content: string;
  feature: BlackboardFeature;
  category: string;
  tags: string[];
}