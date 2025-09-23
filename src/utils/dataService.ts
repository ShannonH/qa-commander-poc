import { UserWorkflow, RiskAnalysisDocument, TestPlan } from '../types';

const STORAGE_KEYS = {
  WORKFLOWS: 'qa_commander_workflows',
  RISK_DOCUMENTS: 'qa_commander_risk_documents',
  TEST_PLANS: 'qa_commander_test_plans',
};

export class DataService {
  // User Workflow methods
  static getUserWorkflows(): UserWorkflow[] {
    const data = localStorage.getItem(STORAGE_KEYS.WORKFLOWS);
    if (data) {
      const workflows = JSON.parse(data);
      return workflows.map((workflow: any) => ({
        ...workflow,
        createdAt: new Date(workflow.createdAt),
        updatedAt: new Date(workflow.updatedAt),
      }));
    }
    return [];
  }

  static saveUserWorkflow(workflow: UserWorkflow): void {
    const workflows = this.getUserWorkflows();
    const existingIndex = workflows.findIndex(w => w.id === workflow.id);
    
    if (existingIndex >= 0) {
      workflows[existingIndex] = workflow;
    } else {
      workflows.push(workflow);
    }
    
    localStorage.setItem(STORAGE_KEYS.WORKFLOWS, JSON.stringify(workflows));
  }

  static deleteUserWorkflow(id: string): void {
    const workflows = this.getUserWorkflows().filter(w => w.id !== id);
    localStorage.setItem(STORAGE_KEYS.WORKFLOWS, JSON.stringify(workflows));
  }

  // Risk Analysis Document methods
  static getRiskDocuments(): RiskAnalysisDocument[] {
    const data = localStorage.getItem(STORAGE_KEYS.RISK_DOCUMENTS);
    if (data) {
      const documents = JSON.parse(data);
      return documents.map((doc: any) => ({
        ...doc,
        workflows: doc.workflows.map((workflow: any) => ({
          ...workflow,
          createdAt: new Date(workflow.createdAt),
          updatedAt: new Date(workflow.updatedAt),
        })),
        createdAt: new Date(doc.createdAt),
        updatedAt: new Date(doc.updatedAt),
      }));
    }
    return [];
  }

  static saveRiskDocument(document: RiskAnalysisDocument): void {
    const documents = this.getRiskDocuments();
    const existingIndex = documents.findIndex(d => d.id === document.id);
    
    if (existingIndex >= 0) {
      documents[existingIndex] = document;
    } else {
      documents.push(document);
    }
    
    localStorage.setItem(STORAGE_KEYS.RISK_DOCUMENTS, JSON.stringify(documents));
  }

  static deleteRiskDocument(id: string): void {
    const documents = this.getRiskDocuments().filter(d => d.id !== id);
    localStorage.setItem(STORAGE_KEYS.RISK_DOCUMENTS, JSON.stringify(documents));
  }

  // Test Plan methods
  static getTestPlans(): TestPlan[] {
    const data = localStorage.getItem(STORAGE_KEYS.TEST_PLANS);
    if (data) {
      const plans = JSON.parse(data);
      // Convert date strings back to Date objects
      return plans.map((plan: any) => ({
        ...plan,
        createdAt: new Date(plan.createdAt),
        updatedAt: new Date(plan.updatedAt),
      }));
    }
    return [];
  }

  static saveTestPlan(testPlan: TestPlan): void {
    const plans = this.getTestPlans();
    const existingIndex = plans.findIndex(p => p.id === testPlan.id);
    
    if (existingIndex >= 0) {
      plans[existingIndex] = testPlan;
    } else {
      plans.push(testPlan);
    }
    
    localStorage.setItem(STORAGE_KEYS.TEST_PLANS, JSON.stringify(plans));
  }

  static deleteTestPlan(id: string): void {
    const plans = this.getTestPlans().filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.TEST_PLANS, JSON.stringify(plans));
  }

  // Statistics methods
  static getStats() {
    const workflows = this.getUserWorkflows();
    const riskDocuments = this.getRiskDocuments();
    const testPlans = this.getTestPlans();
    
    return {
      totalWorkflows: workflows.length,
      totalRiskDocuments: riskDocuments.length,
      totalTestPlans: testPlans.length,
      highRiskWorkflows: workflows.filter(w => w.riskScore <= 6).length, // Risk scores 1-6 are considered high priority
      automationCandidates: workflows.filter(w => w.automationDecision === 'Automate').length,
      activeTestPlans: testPlans.filter(p => p.status === 'In Progress' || p.status === 'Review').length,
      completedTestPlans: testPlans.filter(p => p.status === 'Completed').length,
    };
  }

  // Initialize with sample data if empty
  static initializeSampleData(): void {
    if (this.getUserWorkflows().length === 0) {
      const sampleWorkflows: UserWorkflow[] = [
        {
          id: '1',
          workflowName: 'Student Login to Course',
          description: 'Student accesses course through Blackboard login',
          userStory: 'As a student, I want to log into my course so that I can access course materials',
          blackboardFeature: 'Course Management',
          likelihood: 2,
          impact: 2,
          riskScore: 4,
          automationDecision: 'Automate',
          automationReason: 'High impact, critical path, stable workflow - Risk score 4 qualifies for automation',
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-15'),
        },
        {
          id: '2',
          workflowName: 'Instructor Creates Assignment',
          description: 'Instructor creates and publishes a new assignment',
          userStory: 'As an instructor, I want to create assignments so that students can submit their work',
          blackboardFeature: 'Assignments',
          likelihood: 2,
          impact: 3,
          riskScore: 6,
          automationDecision: 'Automate',
          automationReason: 'Frequently used feature, medium risk - Risk score 6 qualifies for automation',
          createdAt: new Date('2024-01-18'),
          updatedAt: new Date('2024-01-18'),
        },
        {
          id: '3',
          workflowName: 'Student Submits Discussion Post',
          description: 'Student creates and submits a post in discussion forum',
          userStory: 'As a student, I want to participate in discussions so that I can engage with course content',
          blackboardFeature: 'Discussion Forums',
          likelihood: 3,
          impact: 3,
          riskScore: 9,
          automationDecision: 'Manual',
          automationReason: 'Risk score 9 exceeds automation threshold of 6, content-dependent, manual testing more effective',
          createdAt: new Date('2024-01-20'),
          updatedAt: new Date('2024-01-20'),
        },
      ];
      
      sampleWorkflows.forEach(workflow => this.saveUserWorkflow(workflow));
    }

    if (this.getRiskDocuments().length === 0) {
      const workflows = this.getUserWorkflows();
      const sampleRiskDocument: RiskAnalysisDocument = {
        id: '1',
        title: 'Blackboard Course Management Risk Analysis',
        description: 'Comprehensive risk analysis for core course management workflows',
        blackboardFeature: 'Course Management',
        workflows: workflows.filter(w => w.blackboardFeature === 'Course Management'),
        overallRiskLevel: 'Medium',
        totalRiskScore: workflows.filter(w => w.blackboardFeature === 'Course Management').reduce((sum, w) => sum + w.riskScore, 0),
        recommendations: 'Automate high-impact workflows, focus manual testing on content-dependent features',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
      };
      
      this.saveRiskDocument(sampleRiskDocument);
    }

    if (this.getTestPlans().length === 0) {
      const sampleTestPlans: TestPlan[] = [
        {
          id: '1',
          title: 'Gradebook Feature Testing',
          description: 'Comprehensive testing of Blackboard Ultra gradebook functionality',
          feature: 'Grade Management',
          category: 'Functional',
          priority: 'High',
          estimatedHours: 40,
          prerequisites: ['Test environment setup', 'Sample course with students'],
          testCases: [
            {
              id: 'tc1',
              title: 'Create Grade Column',
              description: 'Test creating a new grade column in gradebook',
              steps: [
                { id: 's1', stepNumber: 1, action: 'Navigate to gradebook', expectedResult: 'Gradebook loads successfully' },
                { id: 's2', stepNumber: 2, action: 'Click Add Column', expectedResult: 'Column creation form appears' },
              ],
              expectedResult: 'Grade column is created successfully',
              priority: 'High',
            },
          ],
          blackboardFeature: 'Gradebook',
          status: 'Draft',
          assignee: 'John Doe',
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-15'),
        },
        {
          id: '2',
          title: 'Discussion Forum Integration',
          description: 'Testing discussion forum features and student interactions',
          feature: 'Communication',
          category: 'Integration',
          priority: 'Medium',
          estimatedHours: 24,
          prerequisites: ['Course with enrolled students', 'Forum configuration'],
          testCases: [],
          blackboardFeature: 'Discussion Forums',
          status: 'In Progress',
          assignee: 'Jane Smith',
          createdAt: new Date('2024-01-20'),
          updatedAt: new Date('2024-01-22'),
        },
      ];
      
      sampleTestPlans.forEach(plan => this.saveTestPlan(plan));
    }
  }
}