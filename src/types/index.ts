export interface UserWorkflow {
  id: string; // Matches AcceptanceCriteria.id for linking (test case ID like "00001")
  workflowName: string;
  description: string;
  userStoryId: string; // User Story ID in format <AB#####> - required for linkage
  userStory: string; // Full GIVEN/WHEN/THEN statement for context
  blackboardFeature: BlackboardFeature;
  likelihood: number; // 1-4 scale (1=Most likely to fail, 4=Unlikely)
  impact: number; // 1-4 scale (1=Most impactful, 4=Minimal)
  riskScore: number; // likelihood * impact
  testingTier: 'Tier 1: CRITICAL' | 'Tier 2: HIGH' | 'Tier 3: STANDARD';
  deliverables: string; // Required testing deliverables based on tier
  automationReason: string;
  sourceTestPlanId?: string; // Link to originating test plan
  sourceScenarioId?: string; // Link to originating test scenario
  sourceAcceptanceCriteriaId?: string; // Link to specific AC item (test case ID)
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
  valueStream?: string; // Value stream for organizational context
  
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
  id: string; // Auto-generated test case ID (e.g., "00001", "00002") - not user-editable
  description: string;
  notes?: string;
}

export interface TestScenario {
  id: string;
  title?: string; // Optional friendly title for the scenario (used in risk analysis)
  userStoryId: string; // User Story ID in format <AB#####> - required for linkage
  adoNumber?: string; // ADO number to help identify this scenario
  given: string;
  when: string;
  then: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  acceptanceCriteria: AcceptanceCriteria[]; // These become the workflows - each AC is the atomic unit for risk
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

// Test Case Management (TCM) Types
export interface TCMTestCase {
  id: string; // Test case ID (matches acceptance criteria ID like "00001")
  title: string;
  description: string;
  sourceTestPlanId?: string; // Optional - not all test cases come from test plans
  sourceScenarioId?: string;
  sourceAcceptanceCriteriaId?: string;
  adoNumber?: string; // ADO number from the scenario
  givenWhenThen?: {
    given: string;
    when: string;
    then: string;
  };
  acceptanceCriteria: string; // The AC description
  riskScore?: number;
  testingTier?: 'Tier 1: CRITICAL' | 'Tier 2: HIGH' | 'Tier 3: STANDARD';
  likelihood?: number;
  impact?: number;
  deliverables?: string;
  testSteps: TestStep[]; // Test steps for executing the test case
  expectedResult: string; // Overall expected outcome
  prerequisites?: string[]; // Prerequisites for the test case
  tags?: string[]; // Tags for categorization
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Test Case Collection (for organizing and exporting test cases)
export interface TCMCollection {
  id: string;
  name: string;
  description: string;
  testCaseIds: string[]; // Array of test case IDs in this collection
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
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