export interface RiskAnalysis {
  id: string;
  title: string;
  description: string;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  probability: number; // 1-5 scale
  impact: number; // 1-5 scale
  mitigation: string;
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