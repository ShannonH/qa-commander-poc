export interface UserWorkflow {
  id: string;
  workflowName: string;
  description: string;
  userStory: string;
  blackboardFeature: BlackboardFeature;
  likelihood: number; // 1-5 scale (probability of failure)
  impact: number; // 1-5 scale (impact if failure occurs)
  riskScore: number; // likelihood * impact
  automationDecision: 'Automate' | 'Manual' | 'Skip' | 'Pending';
  automationReason: string;
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
  testCases: TestCase[];
  blackboardFeature: BlackboardFeature;
  status: 'Draft' | 'Review' | 'Approved' | 'In Progress' | 'Completed' | 'Archived';
  assignee?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TestCase {
  id: string;
  title: string;
  description: string;
  steps: TestStep[];
  expectedResult: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
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