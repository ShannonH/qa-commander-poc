import { UserWorkflow, RiskAnalysisDocument, TestPlan, TestScenario, StrategyChecklistItem, AcceptanceCriteria, TCMTestCase } from '../types';

const STORAGE_KEYS = {
  WORKFLOWS: 'qa_commander_workflows',
  RISK_DOCUMENTS: 'qa_commander_risk_documents',
  TEST_PLANS: 'qa_commander_test_plans',
  TCM_TEST_CASES: 'qa_commander_tcm_test_cases',
  TEST_CASE_COUNTER: 'qa_commander_test_case_counter',
};

export class DataService {
  // Generate unique test case ID (starts from 00001)
  static generateTestCaseId(): string {
    const currentCounter = parseInt(localStorage.getItem(STORAGE_KEYS.TEST_CASE_COUNTER) || '0');
    const newCounter = currentCounter + 1;
    localStorage.setItem(STORAGE_KEYS.TEST_CASE_COUNTER, newCounter.toString());
    return newCounter.toString().padStart(5, '0');
  }

  // Check if workflow ID already exists
  static isTestCaseIdUnique(id: string): boolean {
    const allWorkflows = this.getUserWorkflows();
    const allTCMCases = this.getTCMTestCases();
    return !allWorkflows.some(w => w.id === id) && !allTCMCases.some(tc => tc.id === id);
  }

  // Get all acceptance criteria from all test plans to check for duplicates
  static getAllAcceptanceCriteria(): AcceptanceCriteria[] {
    const testPlans = this.getTestPlans();
    const allAC: AcceptanceCriteria[] = [];
    testPlans.forEach(plan => {
      plan.testScenarios.forEach(scenario => {
        if (scenario.acceptanceCriteria) {
          allAC.push(...scenario.acceptanceCriteria);
        }
      });
    });
    return allAC;
  }
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
    
    // Also update the workflow in all risk analysis documents that contain it
    this.syncWorkflowToRiskDocuments(workflow);
  }
  
  // Sync workflow changes to risk analysis documents
  private static syncWorkflowToRiskDocuments(updatedWorkflow: UserWorkflow): void {
    const documents = this.getRiskDocuments();
    let documentsUpdated = false;
    
    documents.forEach(doc => {
      const workflowIndex = doc.workflows.findIndex(w => w.id === updatedWorkflow.id);
      if (workflowIndex >= 0) {
        // Update the workflow in this document
        doc.workflows[workflowIndex] = {
          ...updatedWorkflow,
          updatedAt: new Date()
        };
        
        // Recalculate overall risk metrics for the document
        const totalRisk = doc.workflows.reduce((sum, wf) => sum + wf.riskScore, 0);
        doc.totalRiskScore = totalRisk;
        doc.overallRiskLevel = this.calculateOverallRiskLevel(doc.workflows);
        doc.updatedAt = new Date();
        
        documentsUpdated = true;
      }
    });
    
    if (documentsUpdated) {
      localStorage.setItem(STORAGE_KEYS.RISK_DOCUMENTS, JSON.stringify(documents));
    }
  }
  
  private static calculateOverallRiskLevel(workflows: UserWorkflow[]): 'Low' | 'Medium' | 'High' | 'Critical' {
    if (workflows.length === 0) return 'Low';
    
    const avgRiskScore = workflows.reduce((sum, wf) => sum + wf.riskScore, 0) / workflows.length;
    
    if (avgRiskScore <= 4) return 'Critical';
    if (avgRiskScore <= 8) return 'High';
    if (avgRiskScore <= 12) return 'Medium';
    return 'Low';
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
      // Convert date strings back to Date objects and add missing fields
      return plans.map((plan: any) => ({
        ...plan,
        // Add defaults for all new fields that might be missing from old data
        objective: plan.objective || '',
        inScope: plan.inScope || [],
        outOfScope: plan.outOfScope || [],
        testStrategy: plan.testStrategy || '',
        strategyChecklist: plan.strategyChecklist || [],
        testScenarios: (plan.testScenarios || []).map((scenario: any) => ({
          ...scenario,
          acceptanceCriteria: scenario.acceptanceCriteria || []
        })),
        testEnvironmentRequirements: plan.testEnvironmentRequirements || [],
        testDataRequirements: plan.testDataRequirements || [],
        successCriteria: plan.successCriteria || [],
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
      automationCandidates: workflows.filter(w => w.riskScore >= 1 && w.riskScore <= 6).length,
      activeTestPlans: testPlans.filter(p => p.status === 'In Progress' || p.status === 'Review').length,
      completedTestPlans: testPlans.filter(p => p.status === 'Completed').length,
    };
  }

  // Clear all test plans (for debugging)
  static clearTestPlans(): void {
    localStorage.removeItem(STORAGE_KEYS.TEST_PLANS);
  }

  // TCM Test Case methods
  static getTCMTestCases(): TCMTestCase[] {
    const data = localStorage.getItem(STORAGE_KEYS.TCM_TEST_CASES);
    if (data) {
      const cases = JSON.parse(data);
      return cases.map((tc: any) => ({
        ...tc,
        createdAt: new Date(tc.createdAt),
        updatedAt: new Date(tc.updatedAt),
        lastExecuted: tc.lastExecuted ? new Date(tc.lastExecuted) : undefined,
      }));
    }
    return [];
  }

  static saveTCMTestCase(testCase: TCMTestCase): void {
    const testCases = this.getTCMTestCases();
    const existingIndex = testCases.findIndex(tc => tc.id === testCase.id);

    if (existingIndex >= 0) {
      testCases[existingIndex] = testCase;
    } else {
      testCases.push(testCase);
    }

    localStorage.setItem(STORAGE_KEYS.TCM_TEST_CASES, JSON.stringify(testCases));
  }

  static deleteTCMTestCase(id: string): void {
    const testCases = this.getTCMTestCases().filter(tc => tc.id !== id);
    localStorage.setItem(STORAGE_KEYS.TCM_TEST_CASES, JSON.stringify(testCases));
  }

  // Generate TCM test cases from workflows that meet tier threshold (Tier 1 & 2)
  static generateTCMTestCasesFromWorkflows(workflows: UserWorkflow[], testPlans: TestPlan[]): TCMTestCase[] {
    const newTestCases: TCMTestCase[] = [];
    
    workflows.forEach(workflow => {
      // Only create TCM test cases for Tier 1 and Tier 2
      if (workflow.testingTier === 'Tier 1: CRITICAL' || workflow.testingTier === 'Tier 2: HIGH') {
        // Check if test case already exists
        const existingCase = this.getTCMTestCases().find(tc => tc.id === workflow.id);
        if (existingCase) {
          return; // Skip if already exists
        }

        // Find the source test plan and scenario
        const testPlan = testPlans.find(tp => tp.id === workflow.sourceTestPlanId);
        const scenario = testPlan?.testScenarios?.find(ts => ts.id === workflow.sourceScenarioId);

        if (testPlan && scenario) {
          const testCase: TCMTestCase = {
            id: workflow.id,
            title: workflow.workflowName,
            description: workflow.description,
            sourceTestPlanId: workflow.sourceTestPlanId!,
            sourceScenarioId: workflow.sourceScenarioId!,
            sourceAcceptanceCriteriaId: workflow.sourceAcceptanceCriteriaId || workflow.id,
            adoNumber: scenario.adoNumber,
            givenWhenThen: {
              given: scenario.given,
              when: scenario.when,
              then: scenario.then,
            },
            acceptanceCriteria: workflow.workflowName,
            riskScore: workflow.riskScore,
            testingTier: workflow.testingTier,
            likelihood: workflow.likelihood,
            impact: workflow.impact,
            deliverables: workflow.deliverables,
            status: 'Draft',
            notes: workflow.automationReason,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          newTestCases.push(testCase);
          this.saveTCMTestCase(testCase);
        }
      }
    });

    return newTestCases;
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
          testingTier: 'Tier 2: HIGH',
          deliverables: 'UI Automation, Exploratory Testing',
          automationReason: 'Login is critical and stable, risk score 4 qualifies for automation.',
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
          testingTier: 'Tier 2: HIGH',
          deliverables: 'UI Automation, Exploratory Testing',
          automationReason: 'Assignment creation is frequently used, risk score 6 qualifies for automation.',
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
          testingTier: 'Tier 3: STANDARD',
          deliverables: 'Manual Testing',
          automationReason: 'Discussion posts are content-dependent, risk score 9 is above automation threshold.',
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
          title: 'Ultra Course Navigation & Content Access',
          description: 'End-to-end testing of Ultra course navigation, content organization, and student access workflows',
          feature: 'Course Navigation',
          blackboardFeature: 'Ultra Course View',
          category: 'Functional',
          priority: 'Critical',
          objective: 'Ensure students and instructors can seamlessly navigate Ultra courses, access all content types, and experience consistent performance across different devices and browsers.',
          inScope: [
            'Course homepage and navigation menu',
            'Content folder access and organization',
            'File download and preview functionality',
            'Mobile responsiveness and accessibility',
            'Cross-browser compatibility (Chrome, Safari, Firefox, Edge)'
          ],
          outOfScope: [
            'Original course view testing',
            'Third-party content integrations',
            'System administration functions',
            'Grade passback from external tools'
          ],
          prerequisites: [
            'Ultra course with diverse content types configured',
            'Test accounts for instructor, student, and TA roles',
            'Content uploaded (PDFs, videos, SCORM packages)',
            'Mobile devices for responsive testing'
          ],
          testStrategy: 'Risk-based approach focusing on high-traffic navigation paths with automated regression testing for core workflows and manual exploratory testing for accessibility and usability.',
          strategyChecklist: [
            { id: 'sc1', category: 'test_types', item: 'Functional testing of all navigation elements', checked: true, notes: 'Core requirement' },
            { id: 'sc2', category: 'test_types', item: 'Usability testing with real user scenarios', checked: true },
            { id: 'sc3', category: 'test_types', item: 'Accessibility testing (WCAG 2.1 AA compliance)', checked: true },
            { id: 'sc4', category: 'test_types', item: 'Performance testing for content loading', checked: false, notes: 'Separate performance test cycle' },
            { id: 'sc5', category: 'automation', item: 'Automate critical navigation paths', checked: true },
            { id: 'sc6', category: 'automation', item: 'Automated cross-browser testing', checked: true },
            { id: 'sc7', category: 'automation', item: 'Mobile responsive automation', checked: false, notes: 'Manual testing preferred' },
            { id: 'sc8', category: 'risk_management', item: 'Test with slow network connections', checked: true },
            { id: 'sc9', category: 'risk_management', item: 'Large file download scenarios', checked: true },
            { id: 'sc10', category: 'tools', item: 'Use screen readers for accessibility', checked: true },
            { id: 'sc11', category: 'coverage', item: 'Test all supported content types', checked: true },
            { id: 'sc12', category: 'process', item: 'Smoke test before each release', checked: true }
          ],
          testScenarios: [
            {
              id: 'ts1',
              adoNumber: 'ADO-12345',
              given: 'A student is enrolled in an Ultra course with multiple content folders',
              when: 'They click on a content folder in the course navigation',
              then: 'The folder expands to show all contained items without page reload',
              priority: 'Critical',
              acceptanceCriteria: [
                {
                  id: this.generateTestCaseId(),
                  description: 'Folder icon changes state to indicate expanded/collapsed status',
                  notes: 'Visual indicator for user feedback'
                },
                {
                  id: this.generateTestCaseId(), 
                  description: 'All child content items are visible within 2 seconds of clicking',
                  notes: 'Performance requirement'
                },
                {
                  id: this.generateTestCaseId(),
                  description: 'Folder content displays in correct hierarchical order',
                  notes: 'Content organization requirement'
                }
              ],
              notes: 'Core navigation workflow used in every session'
            },
            {
              id: 'ts2',
              adoNumber: 'ADO-12346',
              given: 'A student wants to download a PDF document from course content',
              when: 'They click the download link on a PDF file',
              then: 'The file downloads successfully and opens in their default PDF viewer',
              priority: 'High',
              acceptanceCriteria: [
                {
                  id: this.generateTestCaseId(),
                  description: 'Download begins immediately upon clicking the download link',
                  notes: 'User experience requirement'
                },
                {
                  id: this.generateTestCaseId(),
                  description: 'Downloaded file maintains original filename and format',
                  notes: 'File integrity verification'
                },
                {
                  id: this.generateTestCaseId(),
                  description: 'Browser handles PDF opening according to user preferences',
                  notes: 'Respect user browser settings'
                }
              ],
              notes: 'Essential for accessing course materials'
            },
            {
              id: 'ts3',
              adoNumber: 'ADO-12347',
              given: 'An instructor accesses their course on a mobile device',
              when: 'They navigate to the course content area',
              then: 'All content is properly formatted and accessible on the mobile interface',
              priority: 'High',
              acceptanceCriteria: [
                {
                  id: this.generateTestCaseId(),
                  description: 'Content area adapts to mobile screen width without horizontal scrolling',
                  notes: 'Responsive design requirement'
                },
                {
                  id: this.generateTestCaseId(),
                  description: 'Touch targets for content items are at least 44px in size',
                  notes: 'Accessibility requirement for mobile'
                },
                {
                  id: this.generateTestCaseId(),
                  description: 'All content functions work with touch gestures',
                  notes: 'Mobile interaction requirement'
                }
              ],
              notes: 'Mobile usage is increasing rapidly'
            }
          ],
          testCases: [
            {
              id: 'tc1',
              title: 'Content Folder Navigation',
              description: 'Verify folder navigation works correctly in Ultra courses',
              steps: [
                { id: 's1', stepNumber: 1, action: 'Login as student and access Ultra course', expectedResult: 'Course homepage loads successfully' },
                { id: 's2', stepNumber: 2, action: 'Click on content folder', expectedResult: 'Folder expands showing items' },
                { id: 's3', stepNumber: 3, action: 'Click on sub-folder', expectedResult: 'Sub-folder contents display correctly' }
              ],
              expectedResult: 'All folder navigation works smoothly without errors',
              priority: 'Critical',
              relatedScenarioId: 'ts1'
            }
          ],
          testEnvironmentRequirements: [
            'Blackboard Learn Ultra (latest version)',
            'Test course with representative content structure',
            'Multiple browser types and versions for compatibility testing',
            'Mobile devices (iOS and Android)',
            'Screen reader software for accessibility testing'
          ],
          testDataRequirements: [
            'Course content of various types (PDF, video, SCORM, web links)',
            'Folder structure with nested content organization',
            'Large files for download testing (>100MB)',
            'User accounts with different role permissions'
          ],
          successCriteria: [
            'Zero navigation failures in critical user paths',
            'Content loads within 3 seconds on standard connection',
            'Full accessibility compliance verified',
            'Cross-browser compatibility confirmed',
            'Mobile experience matches desktop functionality'
          ],
          estimatedHours: 32,
          status: 'Draft',
          assignee: 'Sarah Chen',
          createdAt: new Date('2024-02-01'),
          updatedAt: new Date('2024-02-01'),
        },
        {
          id: '2',
          title: 'Assignment Submission & Feedback Workflow',
          description: 'Comprehensive testing of student assignment submission process and instructor feedback mechanisms',
          feature: 'Assignment Management',
          blackboardFeature: 'Assignments',
          category: 'Integration',
          priority: 'High',
          objective: 'Validate the complete assignment lifecycle from student submission through instructor grading and feedback delivery, ensuring data integrity and user experience quality.',
          inScope: [
            'Student assignment submission interface',
            'File upload and attachment handling',
            'Instructor grading and comment workflows',
            'Grade and feedback delivery to students',
            'Assignment deadline management and late submissions'
          ],
          outOfScope: [
            'Plagiarism detection (SafeAssign)',
            'Bulk grade import/export',
            'Grade center advanced analytics',
            'External tool integration grading'
          ],
          prerequisites: [
            'Course with multiple assignment types configured',
            'Student test accounts with submission history',
            'Instructor account with grading permissions',
            'Sample files for submission testing'
          ],
          testStrategy: 'End-to-end workflow testing with emphasis on data integrity during submission and grading processes, including edge cases for large files and concurrent submissions.',
          strategyChecklist: [
            { id: 'sc13', category: 'test_types', item: 'End-to-end workflow testing', checked: true },
            { id: 'sc14', category: 'test_types', item: 'Data integrity validation', checked: true },
            { id: 'sc15', category: 'test_types', item: 'Load testing for concurrent submissions', checked: true },
            { id: 'sc16', category: 'automation', item: 'Automate submission workflows', checked: true },
            { id: 'sc17', category: 'automation', item: 'Automated grading workflow testing', checked: false, notes: 'Complex instructor interactions' },
            { id: 'sc18', category: 'risk_management', item: 'Test large file uploads (>500MB)', checked: true },
            { id: 'sc19', category: 'risk_management', item: 'Network interruption during upload', checked: true },
            { id: 'sc20', category: 'tools', item: 'Database verification tools', checked: true },
            { id: 'sc21', category: 'coverage', item: 'All assignment types (text, file, media)', checked: true },
            { id: 'sc22', category: 'process', item: 'Regression testing for each iteration', checked: true }
          ],
          testScenarios: [
            {
              id: 'ts4',
              adoNumber: 'ADO-12350',
              given: 'A student has completed an assignment and is ready to submit',
              when: 'They upload their file and click submit before the deadline',
              then: 'The submission is recorded with timestamp and confirmation is displayed',
              priority: 'Critical',
              acceptanceCriteria: [
                {
                  id: this.generateTestCaseId(),
                  description: 'File upload progress indicator displays during upload process',
                  notes: 'User feedback during upload'
                },
                {
                  id: this.generateTestCaseId(),
                  description: 'Submission timestamp is recorded accurately to the second',
                  notes: 'Critical for deadline enforcement'
                },
                {
                  id: this.generateTestCaseId(),
                  description: 'Confirmation message displays submission details including timestamp',
                  notes: 'User confirmation requirement'
                }
              ],
              notes: 'Core functionality for academic integrity'
            },
            {
              id: 'ts5',
              adoNumber: 'ADO-12351',
              given: 'An instructor has received multiple student submissions for grading',
              when: 'They access the grade center and provide feedback with grades',
              then: 'Students receive grades and feedback notifications immediately',
              priority: 'High',
              acceptanceCriteria: [
                {
                  id: this.generateTestCaseId(),
                  description: 'Grade entry interface allows both numeric and letter grades',
                  notes: 'Flexible grading support'
                },
                {
                  id: this.generateTestCaseId(),
                  description: 'Feedback text is saved and associated with the correct student',
                  notes: 'Data integrity requirement'
                },
                {
                  id: this.generateTestCaseId(),
                  description: 'Email notification is sent within 5 minutes of grade publication',
                  notes: 'Timely communication requirement'
                }
              ],
              notes: 'Key workflow for timely feedback'
            },
            {
              id: 'ts6',
              adoNumber: 'ADO-12352',
              given: 'A student attempts to submit an assignment after the deadline',
              when: 'They try to access the submission interface',
              then: 'They see appropriate messaging about late submission policies',
              priority: 'Medium',
              acceptanceCriteria: [
                {
                  id: this.generateTestCaseId(),
                  description: 'Clear message displays explaining the assignment is past due',
                  notes: 'Policy communication requirement'
                },
                {
                  id: this.generateTestCaseId(),
                  description: 'Late submission is blocked unless instructor allows late work',
                  notes: 'Policy enforcement requirement'
                }
              ],
              notes: 'Important for policy enforcement'
            }
          ],
          testCases: [],
          testEnvironmentRequirements: [
            'Blackboard Learn with assignment tools enabled',
            'Email server for notification testing',
            'Large storage capacity for file upload testing',
            'Network throttling tools for connection testing'
          ],
          testDataRequirements: [
            'Various file types for submission testing',
            'Assignment templates with different settings',
            'Student submission history data',
            'Grading rubrics for consistent evaluation'
          ],
          successCriteria: [
            'Zero data loss during submission process',
            'All notifications deliver within 5 minutes',
            'File uploads complete successfully up to system limits',
            'Grading workflows maintain data consistency',
            'Late submission policies enforced correctly'
          ],
          estimatedHours: 28,
          status: 'In Progress',
          assignee: 'Michael Rodriguez',
          createdAt: new Date('2024-02-05'),
          updatedAt: new Date('2024-02-07'),
        },
        {
          id: '3',
          title: 'Discussion Forum Moderation & Engagement',
          description: 'Testing discussion forum functionality including student engagement, instructor moderation, and notification systems',
          feature: 'Discussion & Communication',
          blackboardFeature: 'Discussion Forums',
          category: 'Functional',
          priority: 'Medium',
          objective: 'Ensure discussion forums facilitate effective academic discourse while providing instructors with proper moderation tools and maintaining engagement through reliable notification systems.',
          inScope: [
            'Discussion thread creation and management',
            'Student posting and reply workflows',
            'Instructor moderation capabilities',
            'Email and in-app notification systems',
            'Rich text editing and media attachments'
          ],
          outOfScope: [
            'Advanced analytics and engagement metrics',
            'External forum integrations',
            'Automated content filtering',
            'Video conference integration'
          ],
          prerequisites: [
            'Course with discussion forums configured',
            'Multiple student accounts for interaction testing',
            'Instructor account with moderation privileges',
            'Email notification system enabled'
          ],
          testStrategy: 'User-centered testing approach focusing on realistic discussion scenarios with automated testing for notification reliability and manual testing for moderation workflows.',
          strategyChecklist: [
            { id: 'sc23', category: 'test_types', item: 'User scenario-based testing', checked: true },
            { id: 'sc24', category: 'test_types', item: 'Notification reliability testing', checked: true },
            { id: 'sc25', category: 'test_types', item: 'Content moderation workflow testing', checked: true },
            { id: 'sc26', category: 'automation', item: 'Automated notification testing', checked: true },
            { id: 'sc27', category: 'automation', item: 'Basic posting workflow automation', checked: false, notes: 'Rich content requires manual validation' },
            { id: 'sc28', category: 'risk_management', item: 'Test with high-volume discussions', checked: true },
            { id: 'sc29', category: 'risk_management', item: 'Concurrent posting scenarios', checked: true },
            { id: 'sc30', category: 'tools', item: 'Email testing tools for notifications', checked: true },
            { id: 'sc31', category: 'coverage', item: 'All rich text formatting options', checked: true },
            { id: 'sc32', category: 'process', item: 'User acceptance testing with real scenarios', checked: true }
          ],
          testScenarios: [
            {
              id: 'ts7',
              adoNumber: 'ADO-12360',
              given: 'Multiple students are engaged in a discussion thread',
              when: 'A new student posts a reply to an existing thread',
              then: 'All thread participants receive email notifications about the new post',
              priority: 'High',
              acceptanceCriteria: [
                {
                  id: this.generateTestCaseId(),
                  description: 'Email notification includes thread title and new post preview',
                  notes: 'Informative notification requirement'
                },
                {
                  id: this.generateTestCaseId(),
                  description: 'Notification is sent to all thread participants within 10 minutes',
                  notes: 'Timely engagement requirement'
                },
                {
                  id: this.generateTestCaseId(),
                  description: 'Users can opt out of thread notifications via preferences',
                  notes: 'User control requirement'
                }
              ],
              notes: 'Critical for maintaining engagement'
            },
            {
              id: 'ts8',
              adoNumber: 'ADO-12361',
              given: 'An instructor is monitoring class discussions for inappropriate content',
              when: 'They hide or delete a student post that violates guidelines',
              then: 'The post is immediately removed from all student views and logs the moderation action',
              priority: 'High',
              acceptanceCriteria: [
                {
                  id: this.generateTestCaseId(),
                  description: 'Hidden post becomes invisible to students but remains visible to instructor',
                  notes: 'Moderation visibility requirement'
                },
                {
                  id: this.generateTestCaseId(),
                  description: 'Moderation action is logged with timestamp and reason',
                  notes: 'Audit trail requirement'
                },
                {
                  id: this.generateTestCaseId(),
                  description: 'Student who posted receives notification about moderation action',
                  notes: 'Student communication requirement'
                }
              ],
              notes: 'Essential for maintaining safe learning environment'
            }
          ],
          testCases: [],
          testEnvironmentRequirements: [
            'Blackboard Learn discussion tools configured',
            'Email server for notification delivery testing',
            'Multiple user accounts for interaction scenarios',
            'Rich text testing tools'
          ],
          testDataRequirements: [
            'Sample discussion topics and prompts',
            'Test content including text, images, and attachments',
            'User profile data for notification preferences',
            'Moderation policy guidelines for testing'
          ],
          successCriteria: [
            'All notifications deliver within expected timeframes',
            'Moderation actions take effect immediately',
            'Rich text content displays correctly across browsers',
            'Thread organization remains clear with high post volumes',
            'User engagement features work reliably'
          ],
          estimatedHours: 20,
          status: 'Draft',
          assignee: 'Jennifer Liu',
          createdAt: new Date('2024-02-08'),
          updatedAt: new Date('2024-02-08'),
        }
      ];

      sampleTestPlans.forEach(plan => this.saveTestPlan(plan));
    }
  }
}