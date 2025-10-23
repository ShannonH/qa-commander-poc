export interface UserWorkflow {
  id: string; // Matches AcceptanceCriteria.id for linking
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
  sourceAcceptanceCriteriaId?: string; // Link to specific AC item
  automationId?: string; // Unique ID for test automation code
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
  
  // 1. Feature Overview
  feature: string;
  blackboardFeature: BlackboardFeature;
  category: TestCategory;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  
  // 2. Objective
  objective: string;
  
  // 3. Test Scope  
  inScope: string[];
  outOfScope: string[];
  prerequisites: string[];
  
  // 4. Strategy
  testStrategy: string;
  strategyChecklist: StrategyChecklistItem[];
  
  // 5. Test Scenarios (Given/When/Then)
  testScenarios: TestScenario[];
  
  // 6. Test Cases
  testCases: TestCase[];
  
  // 7. Test Environment Requirements
  testEnvironmentRequirements: string[];
  
  // 8. Test Data Requirements
  testDataRequirements: string[];
  
  // 9. Success Criteria
  successCriteria: string[];
  
  // Meta information
  estimatedHours: number;
  status: 'Draft' | 'Review' | 'Approved' | 'In Progress' | 'Completed' | 'Archived';
  assignee?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StrategyChecklistItem {
  id: string;
  category: 'test_types' | 'automation' | 'risk_management' | 'tools' | 'coverage' | 'process';
  item: string;
  checked: boolean;
  notes?: string;
}

export interface AcceptanceCriteria {
  id: string; // Unique ID for test automation (e.g., "AC_001", "AC_002")
  description: string;
  automationId?: string; // Optional separate automation ID
  notes?: string;
}

export interface TestScenario {
  id: string;
  given: string;
  when: string;
  then: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  acceptanceCriteria: AcceptanceCriteria[]; // These become the workflows
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
  blackboardFeature?: BlackboardFeature; // Optional feature association
  tags?: string[]; // Optional tags for categorization
  prerequisites?: string; // Optional prerequisites
  testData?: string; // Optional test data requirements
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