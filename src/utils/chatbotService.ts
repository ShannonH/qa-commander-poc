import { 
  ChatMessage, 
  ChatbotContext, 
  BlackboardHelpArticle, 
  BlackboardFeature, 
  TestPlan,
  TestCategory 
} from '../types';

export class ChatbotService {
  private static readonly STORAGE_KEY = 'chatbot_history';
  
  // Mock Blackboard help articles from help.blackboard.com
  private static readonly HELP_ARTICLES: BlackboardHelpArticle[] = [
    {
      id: '1',
      title: 'Creating and Managing Gradebook Columns',
      url: 'https://help.blackboard.com/Learn/Instructor/Grade/Gradebook_Columns',
      content: 'Learn how to create, edit, and manage gradebook columns in Blackboard Learn. Includes weighted columns, calculated columns, and grade schemas.',
      feature: 'Gradebook',
      category: 'Instructor Guide',
      tags: ['grades', 'columns', 'calculation', 'weighted']
    },
    {
      id: '2',
      title: 'Assessment Creation and Settings',
      url: 'https://help.blackboard.com/Learn/Instructor/Tests_Pools_Surveys',
      content: 'Comprehensive guide for creating assessments including tests, assignments, and surveys. Covers question types, time limits, and availability settings.',
      feature: 'Assessment Tools',
      category: 'Instructor Guide',
      tags: ['assessment', 'tests', 'quiz', 'questions', 'settings']
    },
    {
      id: '3',
      title: 'Discussion Forum Management',
      url: 'https://help.blackboard.com/Learn/Instructor/Interact/Discussions',
      content: 'Create and moderate discussion forums. Set up threaded discussions, anonymous posting, and grading rubrics for discussions.',
      feature: 'Discussion Forums',
      category: 'Instructor Guide',
      tags: ['discussion', 'forums', 'threads', 'moderation']
    },
    {
      id: '4',
      title: 'Course Content Organization',
      url: 'https://help.blackboard.com/Learn/Instructor/Course_Content',
      content: 'Organize course materials using content areas, learning modules, and folders. Upload files, create web links, and structure learning paths.',
      feature: 'Content Areas',
      category: 'Course Management',
      tags: ['content', 'organization', 'folders', 'files']
    },
    {
      id: '5',
      title: 'Ultra Course Experience Overview',
      url: 'https://help.blackboard.com/Learn/Instructor/Ultra/Ultra_Course_View',
      content: 'Introduction to the Ultra Course Experience including navigation, activity stream, and collaboration tools.',
      feature: 'Ultra Course View',
      category: 'Getting Started',
      tags: ['ultra', 'navigation', 'activity stream', 'collaboration']
    }
  ];

  static getChatHistory(): ChatMessage[] {
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
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));

    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date();

    // Process different types of queries
    let response: Omit<ChatMessage, 'id' | 'isUser' | 'timestamp'>;

    if (this.isTestPlanRequest(message)) {
      response = await this.generateTestPlanResponse(message, context);
    } else if (this.isHelpRequest(message)) {
      response = await this.generateHelpResponse(message, context);
    } else {
      response = await this.generateGeneralResponse(message, context);
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
      'create test', 'generate test', 'test strategy', 'qa plan'
    ];
    return testPlanKeywords.some(keyword => 
      message.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  private static isHelpRequest(message: string): boolean {
    const helpKeywords = [
      'how to', 'help with', 'guide', 'tutorial', 'documentation',
      'learn about', 'explain', 'what is', 'how do I'
    ];
    return helpKeywords.some(keyword => 
      message.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  private static async generateTestPlanResponse(
    message: string, 
    context: ChatbotContext
  ): Promise<Omit<ChatMessage, 'id' | 'isUser' | 'timestamp'>> {
    const feature = this.extractBlackboardFeature(message) || context.selectedFeature || 'Assessment Tools';
    
    // Generate a comprehensive test plan
    const testPlan: Partial<TestPlan> = {
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
      testCases: [
        {
          id: 'tc1',
          title: `Basic ${feature} Functionality`,
          description: `Test core functionality of ${feature}`,
          steps: [],
          expectedResult: `${feature} works as expected`,
          priority: 'High' as const
        }
      ]
    };

    return {
      content: `I've generated a test plan for **${feature}** testing. Here's what I recommend:

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
${testPlan.prerequisites?.map(p => `• ${p}`).join('\n')}

Would you like me to elaborate on any specific test scenarios or create detailed test cases for a particular aspect?`,
      type: 'test-plan',
      metadata: {
        testPlan,
        blackboardFeature: feature
      }
    };
  }

  private static generateHelpResponse(
    message: string, 
    context: ChatbotContext
  ): Promise<Omit<ChatMessage, 'id' | 'isUser' | 'timestamp'>> {
    const feature = this.extractBlackboardFeature(message);
    const relevantArticles = feature 
      ? this.HELP_ARTICLES.filter(article => article.feature === feature)
      : this.HELP_ARTICLES.filter(article => 
          article.tags.some(tag => message.toLowerCase().includes(tag))
        );

    if (relevantArticles.length > 0) {
      const article = relevantArticles[0];
      return Promise.resolve({
        content: `I found help documentation for your question about **${article.feature}**:

**${article.title}**

${article.content}

📚 **Full Documentation:** [${article.title}](${article.url})

**Related Topics:**
${article.tags.map(tag => `• ${tag.charAt(0).toUpperCase() + tag.slice(1)}`).join('\n')}

Is there a specific aspect you'd like me to explain further, or would you like help creating test cases for this feature?`,
        type: 'help-article',
        metadata: {
          helpUrl: article.url,
          blackboardFeature: article.feature
        }
      });
    }

    return Promise.resolve({
      content: `I'd be happy to help you with Blackboard Learn! I have access to comprehensive documentation from help.blackboard.com covering:

🎓 **Course Management** - Creating and organizing courses
📊 **Gradebook** - Managing grades and calculations  
💬 **Discussion Forums** - Setting up student discussions
📝 **Assessment Tools** - Creating tests and assignments
📁 **Content Areas** - Organizing course materials
🚀 **Ultra Experience** - Modern interface features

What specific topic would you like help with? I can provide documentation links, explain features, or help you create test plans for any Blackboard functionality.`,
      type: 'text'
    });
  }

  private static async generateGeneralResponse(
    message: string, 
    context: ChatbotContext
  ): Promise<Omit<ChatMessage, 'id' | 'isUser' | 'timestamp'>> {
    const greetings = ['hello', 'hi', 'hey', 'good morning', 'good afternoon'];
    const isGreeting = greetings.some(greeting => 
      message.toLowerCase().includes(greeting)
    );

    if (isGreeting) {
      return Promise.resolve({
        content: `Hello! 👋 I'm your QA Commander AI assistant, here to help with Blackboard Learn testing and documentation.

I can help you with:
🔍 **Finding Help** - Access to help.blackboard.com documentation
🧪 **Test Planning** - Generate comprehensive test plans
📋 **Feature Guidance** - Explain Blackboard Learn features
🎯 **Testing Strategy** - Best practices for QA testing

What would you like assistance with today?`,
        type: 'text'
      });
    }

    return Promise.resolve({
      content: `I'm here to assist with Blackboard Learn testing and documentation. I can help you:

• **Find documentation** from help.blackboard.com
• **Create test plans** for specific features
• **Explain Blackboard functionality** 
• **Suggest testing approaches**

Try asking questions like:
- "How do I create an assessment?"
- "Generate a test plan for gradebook features"
- "Help with discussion forum setup"

What specific help do you need?`,
      type: 'text'
    });
  }

  private static extractBlackboardFeature(message: string): BlackboardFeature | null {
    const features: BlackboardFeature[] = [
      'Course Management', 'Gradebook', 'Discussion Forums', 'Assignments',
      'Content Areas', 'Announcements', 'Calendar', 'Messages', 'Group Management',
      'Assessment Tools', 'Rubrics', 'SafeAssign', 'Attendance', 'Grade Center',
      'Ultra Course View', 'Original Course View', 'Mobile App', 'Integration Tools',
      'Reports', 'System Administration'
    ];

    return features.find(feature => 
      message.toLowerCase().includes(feature.toLowerCase()) ||
      feature.toLowerCase().split(' ').some(word => 
        message.toLowerCase().includes(word)
      )
    ) || null;
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