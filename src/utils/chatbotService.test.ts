import { ChatbotService } from './chatbotService';
import { ChatMessage, ChatbotContext } from '../types';

describe('ChatbotService', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Chat History Management', () => {
    it('should return empty array when no chat history exists', () => {
      const history = ChatbotService.getChatHistory();
      expect(history).toEqual([]);
    });

    it('should save and retrieve chat history', () => {
      const messages: ChatMessage[] = [
        {
          id: 'test1',
          content: 'Hello',
          isUser: true,
          timestamp: new Date(),
          type: 'text',
        },
      ];

      ChatbotService.saveChatHistory(messages);
      const retrieved = ChatbotService.getChatHistory();

      expect(retrieved).toHaveLength(1);
      expect(retrieved[0].content).toBe('Hello');
      expect(retrieved[0].isUser).toBe(true);
    });

    it('should clear chat history', () => {
      const messages: ChatMessage[] = [
        {
          id: 'test1',
          content: 'Hello',
          isUser: true,
          timestamp: new Date(),
          type: 'text',
        },
      ];

      ChatbotService.saveChatHistory(messages);
      ChatbotService.clearChatHistory();

      const history = ChatbotService.getChatHistory();
      expect(history).toEqual([]);
    });
  });

  describe('User Message Creation', () => {
    it('should create user message with correct properties', () => {
      const content = 'Test message';
      const message = ChatbotService.createUserMessage(content);

      expect(message.content).toBe(content);
      expect(message.isUser).toBe(true);
      expect(message.type).toBe('text');
      expect(message.id).toBeDefined();
      expect(message.timestamp).toBeInstanceOf(Date);
    });
  });

  describe('Message Processing', () => {
    it('should process help request for assessment tools', async () => {
      const response = await ChatbotService.processMessage('How do I create an assessment?', {
        currentView: 'test-plans',
      });

      expect(response.isUser).toBe(false);
      expect(response.content).toContain('Assessment Tools');
      expect(response.content).toContain('Assessment Creation and Settings');
      expect(response.metadata?.helpUrl).toBeDefined();
    });

    it('should process test plan generation request', async () => {
      const response = await ChatbotService.processMessage(
        'Generate a test plan for gradebook functionality',
        { selectedFeature: 'Gradebook' }
      );

      expect(response.isUser).toBe(false);
      expect(response.type).toBe('test-plan');
      expect(response.content).toContain('test plan for **Gradebook**');
      expect(response.metadata?.testPlan).toBeDefined();
      expect(response.metadata?.blackboardFeature).toBe('Gradebook');
    });

    it('should respond to greeting messages', async () => {
      const response = await ChatbotService.processMessage('Hello');

      expect(response.isUser).toBe(false);
      expect(response.content).toContain('Hello!');
      expect(response.content).toContain('QA Commander AI assistant');
    });

    it('should provide general help for unknown queries', async () => {
      const response = await ChatbotService.processMessage('Random query');

      expect(response.isUser).toBe(false);
      expect(response.content).toContain('assist with Blackboard Learn');
      expect(response.content).toContain('documentation');
    });
  });

  describe('Feature Detection', () => {
    it('should detect gradebook feature in messages', async () => {
      const response = await ChatbotService.processMessage('I need help with gradebook columns');

      expect(response.content).toContain('gradebook');
      expect(response.metadata?.blackboardFeature).toBe('Gradebook');
    });

    it('should detect discussion forums feature in messages', async () => {
      const response = await ChatbotService.processMessage('How do I set up discussion forums?');

      expect(response.content).toContain('Discussion Forums');
      expect(response.metadata?.blackboardFeature).toBe('Discussion Forums');
    });
  });

  describe('Test Plan Generation', () => {
    it('should generate test plan with proper structure', async () => {
      const response = await ChatbotService.processMessage(
        'Create a test plan for assessment tools'
      );

      expect(response.type).toBe('test-plan');
      expect(response.metadata?.testPlan).toBeDefined();

      const testPlan = response.metadata?.testPlan;
      expect(testPlan?.title).toContain('Testing Plan');
      expect(testPlan?.priority).toBe('High');
      expect(testPlan?.category).toBe('Functional');
      expect(testPlan?.estimatedHours).toBe(16);
      expect(testPlan?.prerequisites).toHaveLength(3);
    });
  });
});
