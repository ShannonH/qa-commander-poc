import { RiskAnalysis, TestPlan } from '../types';

const STORAGE_KEYS = {
  RISK_ANALYSES: 'qa_commander_risk_analyses',
  TEST_PLANS: 'qa_commander_test_plans',
};

export class DataService {
  // Risk Analysis methods
  static getRiskAnalyses(): RiskAnalysis[] {
    const data = localStorage.getItem(STORAGE_KEYS.RISK_ANALYSES);
    return data ? JSON.parse(data) : [];
  }

  static saveRiskAnalysis(riskAnalysis: RiskAnalysis): void {
    const analyses = this.getRiskAnalyses();
    const existingIndex = analyses.findIndex(a => a.id === riskAnalysis.id);
    
    if (existingIndex >= 0) {
      analyses[existingIndex] = riskAnalysis;
    } else {
      analyses.push(riskAnalysis);
    }
    
    localStorage.setItem(STORAGE_KEYS.RISK_ANALYSES, JSON.stringify(analyses));
  }

  static deleteRiskAnalysis(id: string): void {
    const analyses = this.getRiskAnalyses().filter(a => a.id !== id);
    localStorage.setItem(STORAGE_KEYS.RISK_ANALYSES, JSON.stringify(analyses));
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
    const riskAnalyses = this.getRiskAnalyses();
    const testPlans = this.getTestPlans();
    
    return {
      totalRiskAnalyses: riskAnalyses.length,
      totalTestPlans: testPlans.length,
      highRiskItems: riskAnalyses.filter(r => r.riskLevel === 'High' || r.riskLevel === 'Critical').length,
      activeTestPlans: testPlans.filter(p => p.status === 'In Progress' || p.status === 'Review').length,
      completedTestPlans: testPlans.filter(p => p.status === 'Completed').length,
    };
  }

  // Initialize with sample data if empty
  static initializeSampleData(): void {
    if (this.getRiskAnalyses().length === 0) {
      const sampleRiskAnalyses: RiskAnalysis[] = [
        {
          id: '1',
          title: 'User Authentication Security',
          description: 'Risk analysis for authentication module vulnerabilities',
          riskLevel: 'High',
          probability: 3,
          impact: 5,
          mitigation: 'Implement multi-factor authentication and regular security audits',
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-15'),
        },
        {
          id: '2',
          title: 'Database Performance Under Load',
          description: 'Assessment of database performance risks during peak usage',
          riskLevel: 'Medium',
          probability: 4,
          impact: 3,
          mitigation: 'Implement database optimization and caching strategies',
          createdAt: new Date('2024-01-20'),
          updatedAt: new Date('2024-01-20'),
        },
      ];
      
      sampleRiskAnalyses.forEach(analysis => this.saveRiskAnalysis(analysis));
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