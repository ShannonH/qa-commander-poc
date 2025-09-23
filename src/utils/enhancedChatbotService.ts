import Fuse from 'fuse.js';
import { 
  ChatMessage, 
  ChatbotContext, 
  BlackboardHelpArticle, 
  BlackboardFeature, 
  TestPlan,
  TestCategory 
} from '../types';

interface KnowledgeBase {
  articles: BlackboardHelpArticle[];
  procedures: ProcedureDocument[];
  testStrategies: TestStrategyDocument[];
}

interface ProcedureDocument {
  id: string;
  title: string;
  feature: BlackboardFeature;
  steps: string[];
  tips: string[];
  commonIssues: string[];
}

interface TestStrategyDocument {
  id: string;
  feature: BlackboardFeature;
  testTypes: string[];
  scenarios: TestScenario[];
  riskAreas: string[];
}

interface TestScenario {
  name: string;
  description: string;
  steps: string[];
  expectedResult: string;
  testData: string[];
}

export class EnhancedChatbotService {
  private static readonly STORAGE_KEY = 'enhanced_chatbot_history';
  private static knowledgeBase: KnowledgeBase;
  private static fuse: Fuse<any>;
  private static initialized = false;

  // Comprehensive Blackboard Learn Knowledge Base
  private static readonly KNOWLEDGE_BASE: KnowledgeBase = {
    articles: [
      {
        id: 'bb_assess_create',
        title: 'Creating Assessments in Blackboard Learn',
        url: 'https://help.blackboard.com/Learn/Instructor/Tests_Pools_Surveys/Tests',
        content: `To create an assessment in Blackboard Learn:

1. **Navigate to the Course Content area** where you want to add the assessment
2. **Click the "+" button** and select "Create Assessment"
3. **Choose Assessment Type:**
   - Test: Graded with various question types
   - Survey: Ungraded, for gathering feedback
   - Assignment: File submissions or text entry

4. **Configure Basic Settings:**
   - Assessment Name: Clear, descriptive title
   - Instructions: Detailed guidelines for students
   - Points Possible: Total points for grading
   - Time Limit: Optional time restrictions
   - Attempts Allowed: Number of submission attempts

5. **Set Availability:**
   - Display After/Until: Control when assessment appears
   - Submit After/Until: Control submission window
   - Password Protection: Optional security measure

6. **Add Questions:**
   - Multiple Choice: Single or multiple correct answers
   - True/False: Simple binary questions
   - Fill in the Blank: Text entry responses
   - Essay: Long-form text responses
   - Matching: Connect related items
   - Ordering: Sequence items correctly

7. **Advanced Options:**
   - Question Randomization: Shuffle question order
   - Answer Randomization: Shuffle answer choices
   - Feedback: Provide explanations for answers
   - Auto-Grading: Configure automatic scoring

**Best Practices:**
- Preview assessments before making available
- Test all question types thoroughly
- Provide clear instructions and examples
- Set reasonable time limits based on complexity
- Use consistent naming conventions`,
        feature: 'Assessment Tools',
        category: 'Step-by-Step Guide',
        tags: ['assessment', 'test', 'quiz', 'create', 'questions', 'grading']
      },
      {
        id: 'bb_gradebook_mgmt',
        title: 'Advanced Gradebook Management and Calculations',
        url: 'https://help.blackboard.com/Learn/Instructor/Grade/Gradebook',
        content: `Blackboard Learn Gradebook provides comprehensive grade management:

**Creating Grade Columns:**
1. Navigate to Grade Center > Full Grade Center
2. Click "Create Column" > Select column type:
   - Manual: Enter grades directly
   - Calculated: Formula-based calculations
   - Weighted: Percentage-based weighting
   - External: Connect to external tools

**Grade Calculations:**
- **Total Column:** Automatically calculates based on selected columns
- **Weighted Total:** Assigns percentage weights to categories
- **Formula:** Custom calculations using grade center variables
- **Running Total:** Excludes empty grades from calculations

**Grade Schemas:**
- Points: Numerical scores (0-100)
- Percentage: Percentage scores (0-100%)
- Letter Grades: A, B, C, D, F with customizable ranges
- Complete/Incomplete: Binary grading
- Custom Schemas: Institution-specific grading scales

**Advanced Features:**
- Grade Replacement: Override calculated grades
- Exemptions: Exclude students from specific grades
- Grade History: Track all grade changes with timestamps
- Smart Views: Filter grades by various criteria
- Bulk Grade Operations: Grade multiple students simultaneously

**Best Practices:**
- Set up grading schema before entering grades
- Use categories to organize related assignments
- Regularly backup gradebook data
- Communicate grading policies clearly to students
- Review calculated totals for accuracy`,
        feature: 'Gradebook',
        category: 'Advanced Guide',
        tags: ['gradebook', 'grades', 'calculation', 'weighted', 'schema', 'total']
      },
      {
        id: 'bb_discussion_setup',
        title: 'Creating and Managing Discussion Forums',
        url: 'https://help.blackboard.com/Learn/Instructor/Interact/Discussions',
        content: `Discussion Forums facilitate student engagement and collaboration:

**Creating Discussion Forums:**
1. Go to Course Content area
2. Click "+" > Create > Discussion
3. Configure Forum Settings:
   - Forum Name: Descriptive title
   - Instructions: Guidelines and expectations
   - Grading: Optional points assignment
   - Availability: When forum is accessible

**Forum Types:**
- **General Discussion:** Open conversation
- **Q&A Forum:** Question and answer format
- **Graded Discussion:** Evaluated participation
- **Group Discussion:** Small group conversations

**Moderation Options:**
- **Pre-Moderation:** Instructor approval required
- **Post-Moderation:** Monitor after posting
- **Student Moderation:** Students can moderate peers
- **Anonymous Posting:** Hide student identities

**Grading Discussions:**
- Participation Rubrics: Standardized evaluation
- Frequency Scoring: Based on number of posts
- Quality Assessment: Content evaluation criteria
- Peer Evaluation: Student-to-student feedback

**Best Practices:**
- Create clear participation guidelines
- Model good discussion behavior
- Respond promptly to encourage engagement
- Use threaded discussions for organization
- Provide feedback on participation quality
- Monitor for inappropriate content
- Encourage critical thinking and analysis`,
        feature: 'Discussion Forums',
        category: 'Complete Guide',
        tags: ['discussion', 'forum', 'participation', 'grading', 'moderation', 'engagement']
      },
      {
        id: 'bb_content_organization',
        title: 'Organizing Course Content Effectively',
        url: 'https://help.blackboard.com/Learn/Instructor/Course_Content',
        content: `Effective content organization enhances student learning experience:

**Content Area Structure:**
- **Learning Modules:** Sequential content presentation
- **Folders:** Organize related materials
- **Content Items:** Individual documents, links, media
- **Assignments:** Integrated with Grade Center
- **Tools:** Link to course tools and features

**Content Types:**
1. **Files:** Upload documents, presentations, media
2. **Web Links:** External resources and websites
3. **Item:** Text-based content with rich editor
4. **Audio/Video:** Multimedia content
5. **Image:** Visual materials and graphics

**Advanced Organization:**
- **Adaptive Release:** Show content based on criteria
- **Sequential Navigation:** Force linear progression
- **Content Visibility:** Control what students see
- **Due Dates:** Set deadlines for content review
- **Availability Windows:** Time-bound access

**Best Practices:**
- Use consistent naming conventions
- Create logical folder hierarchies
- Provide clear navigation instructions
- Use descriptive content titles
- Include estimated time requirements
- Add relevant tags and keywords
- Regular content audits and updates
- Test accessibility and mobile compatibility`,
        feature: 'Content Areas',
        category: 'Organization Guide',
        tags: ['content', 'organization', 'modules', 'folders', 'structure', 'navigation']
      },
      {
        id: 'bb_ultra_features',
        title: 'Blackboard Ultra Course Experience Overview',
        url: 'https://help.blackboard.com/Learn/Instructor/Ultra',
        content: `Blackboard Ultra provides a modern, streamlined experience:

**Key Ultra Features:**
- **Responsive Design:** Works on all devices
- **Streamlined Interface:** Simplified navigation
- **Activity Stream:** Real-time updates and notifications
- **Integrated Collaboration:** Built-in video and messaging
- **Smart Content Creation:** Drag-and-drop functionality

**Content Creation in Ultra:**
1. **Documents:** Rich text editor with formatting
2. **Tests:** Streamlined assessment creation
3. **Assignments:** File submission and text entry
4. **Discussions:** Enhanced threading and media
5. **Journals:** Personal reflection spaces

**Gradebook Enhancements:**
- **Quick Grading:** Faster grade entry
- **Inline Feedback:** Comments directly on submissions
- **Video Feedback:** Record personalized responses
- **Mobile Grading:** Grade from any device
- **Smart Notifications:** Automatic updates

**Student Experience:**
- **Course Activity Stream:** Centralized updates
- **Goal Setting:** Track progress and achievements
- **Social Learning:** Enhanced peer interaction
- **Mobile Optimization:** Native mobile experience
- **Accessibility:** Built-in accessibility features

**Migration Considerations:**
- Content automatically converts from Original
- Some features work differently in Ultra
- Third-party tools may need reconfiguration
- Training may be needed for users
- Gradual rollout recommended`,
        feature: 'Ultra Course View',
        category: 'Platform Overview',
        tags: ['ultra', 'modern', 'responsive', 'activity stream', 'mobile', 'collaboration']
      }
    ],
    procedures: [
      {
        id: 'assess_creation_proc',
        feature: 'Assessment Tools',
        title: 'Step-by-Step Assessment Creation',
        steps: [
          'Navigate to Course Content area',
          'Click "+" button and select "Create Assessment"',
          'Choose assessment type (Test, Survey, Assignment)',
          'Enter assessment name and instructions',
          'Set points possible and time limits',
          'Configure availability dates and submission windows',
          'Add questions using various question types',
          'Set up answer randomization if needed',
          'Configure feedback and auto-grading options',
          'Preview the assessment',
          'Make assessment available to students'
        ],
        tips: [
          'Use clear, descriptive assessment names',
          'Always preview before making available',
          'Test time limits with sample content',
          'Provide detailed instructions and examples',
          'Consider accessibility requirements'
        ],
        commonIssues: [
          'Students cannot see assessment - check availability settings',
          'Time limit too restrictive - review based on content complexity',
          'Auto-grading not working - verify question setup',
          'Students getting different question sets - check randomization settings'
        ]
      }
    ],
    testStrategies: [
      {
        id: 'assessment_testing',
        feature: 'Assessment Tools',
        testTypes: ['Functional', 'Usability', 'Performance', 'Security', 'Accessibility'],
        scenarios: [
          {
            name: 'Assessment Creation and Configuration',
            description: 'Test the complete process of creating and configuring an assessment',
            steps: [
              'Login as instructor',
              'Navigate to course content area',
              'Create new assessment with various question types',
              'Configure availability and submission settings',
              'Set up grading and feedback options',
              'Preview assessment as student',
              'Publish assessment'
            ],
            expectedResult: 'Assessment is created successfully and visible to students according to availability settings',
            testData: ['Valid course ID', 'Different question types', 'Various time limit settings', 'Multiple availability configurations']
          },
          {
            name: 'Student Assessment Taking Experience',
            description: 'Test the student experience of taking an assessment',
            steps: [
              'Login as student',
              'Navigate to course content',
              'Access available assessment',
              'Answer questions of different types',
              'Test time limit functionality',
              'Submit assessment',
              'Verify submission confirmation'
            ],
            expectedResult: 'Student can complete and submit assessment successfully within time limits',
            testData: ['Valid student account', 'Sample answers for each question type', 'Time limit test scenarios']
          }
        ],
        riskAreas: [
          'Time limit enforcement and warnings',
          'Auto-save functionality during assessment',
          'Question randomization accuracy',
          'Grade calculation and recording',
          'Accessibility compliance',
          'Mobile device compatibility'
        ]
      }
    ]
  };

  private static ensureInitialized(): void {
    if (!this.initialized) {
      this.knowledgeBase = this.KNOWLEDGE_BASE;
      this.initializeFuse();
      this.initialized = true;
    }
  }

  private static initializeFuse(): void {
    const searchableData = [
      ...this.knowledgeBase.articles.map(article => ({
        type: 'article',
        title: article.title,
        content: article.content,
        feature: article.feature,
        tags: article.tags,
        data: article
      })),
      ...this.knowledgeBase.procedures.map(proc => ({
        type: 'procedure',
        title: proc.title,
        content: proc.steps.join(' ') + ' ' + proc.tips.join(' '),
        feature: proc.feature,
        tags: [],
        data: proc
      })),
      ...this.knowledgeBase.testStrategies.map(strategy => ({
        type: 'testStrategy',
        title: `${strategy.feature} Testing Strategy`,
        content: strategy.scenarios.map(s => s.description).join(' ') + ' ' + strategy.riskAreas.join(' '),
        feature: strategy.feature,
        tags: strategy.testTypes,
        data: strategy
      }))
    ];

    this.fuse = new Fuse(searchableData, {
      keys: [
        { name: 'title', weight: 0.3 },
        { name: 'content', weight: 0.4 },
        { name: 'feature', weight: 0.2 },
        { name: 'tags', weight: 0.1 }
      ],
      threshold: 0.4,
      includeScore: true,
      includeMatches: true
    });
  }

  static getChatHistory(): ChatMessage[] {
    this.ensureInitialized();
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) return [];
    
    try {
      const messages = JSON.parse(stored);
      return messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));
    } catch {
      return [];
    }
  }

  static saveChatHistory(messages: ChatMessage[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(messages));
  }

  static clearChatHistory(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  static async processMessage(
    message: string, 
    context: ChatbotContext = {}
  ): Promise<ChatMessage> {
    this.ensureInitialized();
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));

    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date();

    // Search knowledge base for relevant content
    const searchResults = this.fuse.search(message);
    
    let response: Omit<ChatMessage, 'id' | 'isUser' | 'timestamp'>;

    if (this.isTestPlanRequest(message)) {
      response = await this.generateEnhancedTestPlanResponse(message, context, searchResults);
    } else if (this.isHelpRequest(message)) {
      response = await this.generateEnhancedHelpResponse(message, context, searchResults);
    } else {
      response = await this.generateContextualResponse(message, context, searchResults);
    }

    return {
      ...response,
      id: messageId,
      isUser: false,
      timestamp
    };
  }

  private static isTestPlanRequest(message: string): boolean {
    const testPlanKeywords = [
      'test plan', 'testing', 'test case', 'assessment test', 
      'create test', 'generate test', 'test strategy', 'qa plan',
      'test scenario', 'test automation', 'regression test'
    ];
    return testPlanKeywords.some(keyword => 
      message.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  private static isHelpRequest(message: string): boolean {
    const helpKeywords = [
      'how to', 'help with', 'guide', 'tutorial', 'documentation',
      'learn about', 'explain', 'what is', 'how do I', 'steps to',
      'instructions', 'procedure', 'setup', 'configure'
    ];
    return helpKeywords.some(keyword => 
      message.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  private static async generateEnhancedTestPlanResponse(
    message: string,
    context: ChatbotContext,
    searchResults: any[]
  ): Promise<Omit<ChatMessage, 'id' | 'isUser' | 'timestamp'>> {
    const feature = this.extractBlackboardFeature(message) || context.selectedFeature || 'Assessment Tools';
    
    // Find relevant test strategy from knowledge base
    const testStrategy = searchResults.find(result => 
      result.item.type === 'testStrategy' && 
      result.item.feature === feature
    )?.item.data as TestStrategyDocument;

    let detailedTestPlan: Partial<TestPlan>;
    let content: string;

    if (testStrategy) {
      // Generate detailed test plan based on knowledge base
      detailedTestPlan = {
        title: `${feature} Comprehensive Testing Plan`,
        description: `Detailed testing plan for ${feature} functionality in Blackboard Learn based on current best practices`,
        feature: feature,
        category: 'Functional' as TestCategory,
        priority: 'High' as const,
        estimatedHours: this.calculateEstimatedHours(testStrategy.scenarios.length),
        prerequisites: [
          'Blackboard Learn test environment with admin access',
          'Test course with enrolled instructor and student accounts',
          'Sample content and assessment materials',
          'Various file types for upload testing',
          'Different browser and device configurations'
        ],
        blackboardFeature: feature,
        testCases: testStrategy.scenarios.map((scenario, index) => ({
          id: `tc${index + 1}`,
          title: scenario.name,
          description: scenario.description,
          steps: scenario.steps.map((step, stepIndex) => ({
            id: `s${stepIndex + 1}`,
            stepNumber: stepIndex + 1,
            action: step,
            expectedResult: stepIndex === scenario.steps.length - 1 ? scenario.expectedResult : 'Step completed successfully'
          })),
          expectedResult: scenario.expectedResult,
          priority: 'High' as const
        }))
      };

      content = `I've generated a comprehensive test plan for **${feature}** based on current Blackboard Learn testing strategies:

**Test Plan Overview:**
- **Feature:** ${feature}
- **Priority:** High
- **Estimated Time:** ${detailedTestPlan.estimatedHours} hours
- **Category:** Functional Testing
- **Test Scenarios:** ${testStrategy.scenarios.length}

**Key Test Areas:**
${testStrategy.testTypes.map(type => `• **${type} Testing**`).join('\n')}

**Critical Risk Areas to Focus On:**
${testStrategy.riskAreas.map(risk => `• ${risk}`).join('\n')}

**Test Scenarios Included:**
${testStrategy.scenarios.map((scenario, index) => `${index + 1}. **${scenario.name}** - ${scenario.description}`).join('\n')}

**Prerequisites:**
${detailedTestPlan.prerequisites?.map(p => `• ${p}`).join('\n')}

This test plan is based on real-world Blackboard Learn testing experience and covers the most critical functionality areas. Would you like me to elaborate on any specific test scenario or provide more detailed test steps?`;
    } else {
      // Fallback to generic test plan
      detailedTestPlan = {
        title: `${feature} Testing Plan`,
        description: `Comprehensive testing plan for ${feature} functionality in Blackboard Learn`,
        feature: feature,
        category: 'Functional' as TestCategory,
        priority: 'High' as const,
        estimatedHours: 16,
        prerequisites: [
          'Test environment with admin access',
          'Sample course with enrolled users',
          'Various file types for testing uploads'
        ],
        blackboardFeature: feature,
        testCases: []
      };

      content = `I've generated a test plan for **${feature}** testing:

**Test Plan Overview:**
- **Feature:** ${feature}
- **Priority:** High
- **Estimated Time:** 16 hours
- **Category:** Functional Testing

**Key Test Areas:**
1. **Basic Functionality** - Core feature operations
2. **User Interface** - Navigation and usability
3. **Data Validation** - Input handling and validation
4. **Integration** - Interaction with other Blackboard features
5. **Performance** - Load testing and responsiveness

**Prerequisites:**
${detailedTestPlan.prerequisites?.map(p => `• ${p}`).join('\n')}

Would you like me to provide more specific test scenarios for this feature?`;
    }

    return {
      content,
      type: 'test-plan',
      metadata: {
        testPlan: detailedTestPlan,
        blackboardFeature: feature
      }
    };
  }

  private static async generateEnhancedHelpResponse(
    message: string,
    context: ChatbotContext,
    searchResults: any[]
  ): Promise<Omit<ChatMessage, 'id' | 'isUser' | 'timestamp'>> {
    const bestMatch = searchResults[0];
    
    if (bestMatch && bestMatch.score < 0.5) {
      const matchedItem = bestMatch.item;
      
      if (matchedItem.type === 'article') {
        const article = matchedItem.data as BlackboardHelpArticle;
        return {
          content: `I found detailed documentation for your question about **${article.feature}**:

## ${article.title}

${this.formatContentForResponse(article.content)}

📚 **Full Documentation:** [${article.title}](${article.url})

This information comes directly from Blackboard Learn help documentation. Is there a specific aspect you'd like me to explain further, or would you like help creating test cases for this feature?`,
          type: 'help-article',
          metadata: {
            helpUrl: article.url,
            blackboardFeature: article.feature
          }
        };
      } else if (matchedItem.type === 'procedure') {
        const procedure = matchedItem.data as ProcedureDocument;
        return {
          content: `Here's a step-by-step procedure for **${procedure.title}**:

**Steps to Follow:**
${procedure.steps.map((step, index) => `${index + 1}. ${step}`).join('\n')}

**💡 Pro Tips:**
${procedure.tips.map(tip => `• ${tip}`).join('\n')}

**⚠️ Common Issues to Watch For:**
${procedure.commonIssues.map(issue => `• ${issue}`).join('\n')}

Would you like me to elaborate on any of these steps or help you create a test plan for this process?`,
          type: 'help-article',
          metadata: {
            blackboardFeature: procedure.feature
          }
        };
      }
    }

    // Fallback response for no good matches
    return {
      content: `I'd be happy to help you with Blackboard Learn! I have access to comprehensive documentation covering:

🎓 **Assessment Tools** - Creating tests, quizzes, and assignments
📊 **Gradebook Management** - Advanced grading and calculations  
💬 **Discussion Forums** - Setup, moderation, and best practices
📁 **Content Organization** - Structuring course materials effectively
🚀 **Ultra Experience** - Modern interface features and capabilities

Based on your question, you might be interested in:
${searchResults.slice(0, 3).map(result => `• ${result.item.title}`).join('\n')}

Could you provide more specific details about what you're trying to accomplish? I can then give you detailed, step-by-step guidance.`,
      type: 'text'
    };
  }

  private static async generateContextualResponse(
    message: string,
    context: ChatbotContext,
    searchResults: any[]
  ): Promise<Omit<ChatMessage, 'id' | 'isUser' | 'timestamp'>> {
    const greetings = ['hello', 'hi', 'hey', 'good morning', 'good afternoon'];
    const isGreeting = greetings.some(greeting => 
      message.toLowerCase().includes(greeting)
    );

    if (isGreeting) {
      return {
        content: `Hello! 👋 I'm your enhanced QA Commander AI assistant with access to comprehensive Blackboard Learn documentation and testing strategies.

I can help you with:
🔍 **Expert Guidance** - Detailed procedures from help.blackboard.com
🧪 **Advanced Test Planning** - Real-world testing scenarios and strategies
📋 **Step-by-Step Instructions** - Detailed procedures for any Blackboard feature
🎯 **Best Practices** - Industry-standard approaches and tips

My knowledge base includes detailed information about:
${this.knowledgeBase.articles.map(article => `• ${article.feature}`).join('\n')}

What specific Blackboard Learn topic would you like help with today?`,
        type: 'text'
      };
    }

    // Provide contextual suggestions based on search results
    if (searchResults.length > 0) {
      const topResults = searchResults.slice(0, 3);
      return {
        content: `I found several relevant topics based on your question:

${topResults.map((result, index) => 
  `${index + 1}. **${result.item.title}** (${result.item.feature})`
).join('\n')}

I can provide detailed guidance on any of these topics. Which one would you like to explore further? Or ask me:

• "How do I [specific task]?" for step-by-step instructions
• "Generate a test plan for [feature]" for comprehensive testing strategies
• "Explain [concept]" for detailed explanations

What specific help do you need?`,
        type: 'text'
      };
    }

    return {
      content: `I'm here to provide expert assistance with Blackboard Learn! I have access to detailed documentation and testing strategies for all major features.

Try asking me questions like:
• "How do I create an assessment with multiple question types?"
• "Generate a comprehensive test plan for gradebook functionality"
• "What are the best practices for discussion forum setup?"
• "Explain the Ultra course experience features"

I can provide detailed, step-by-step guidance based on official Blackboard documentation and real-world testing experience. What would you like to know?`,
      type: 'text'
    };
  }

  private static formatContentForResponse(content: string): string {
    // Clean up content formatting for better readability
    return content
      .replace(/\*\*(.*?)\*\*/g, '**$1**') // Preserve bold formatting
      .replace(/(\d+\.)/g, '\n$1') // Add line breaks before numbered lists
      .replace(/\n\s*\n/g, '\n\n') // Clean up multiple line breaks
      .trim();
  }

  private static calculateEstimatedHours(scenarioCount: number): number {
    // Estimate testing hours based on scenario complexity
    const baseHours = 8;
    const hoursPerScenario = 4;
    return baseHours + (scenarioCount * hoursPerScenario);
  }

  private static extractBlackboardFeature(message: string): BlackboardFeature | null {
    const features: BlackboardFeature[] = [
      'Course Management', 'Gradebook', 'Discussion Forums', 'Assignments',
      'Content Areas', 'Announcements', 'Calendar', 'Messages', 'Group Management',
      'Assessment Tools', 'Rubrics', 'SafeAssign', 'Attendance', 'Grade Center',
      'Ultra Course View', 'Original Course View', 'Mobile App', 'Integration Tools',
      'Reports', 'System Administration'
    ];

    const messageLower = message.toLowerCase();
    
    // Direct feature name matches
    for (const feature of features) {
      if (messageLower.includes(feature.toLowerCase())) {
        return feature;
      }
    }

    // Keyword-based feature detection
    const featureKeywords: { [key: string]: BlackboardFeature } = {
      'test': 'Assessment Tools',
      'quiz': 'Assessment Tools',
      'assessment': 'Assessment Tools',
      'exam': 'Assessment Tools',
      'grade': 'Gradebook',
      'grading': 'Gradebook',
      'gradebook': 'Gradebook',
      'discussion': 'Discussion Forums',
      'forum': 'Discussion Forums',
      'content': 'Content Areas',
      'ultra': 'Ultra Course View'
    };

    for (const [keyword, feature] of Object.entries(featureKeywords)) {
      if (messageLower.includes(keyword)) {
        return feature;
      }
    }

    return null;
  }

  static createUserMessage(content: string): ChatMessage {
    return {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content,
      isUser: true,
      timestamp: new Date(),
      type: 'text'
    };
  }
}