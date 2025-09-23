import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AIChatbotView from '../views/AIChatbotView';

// Mock scrollIntoView for test environment
Object.defineProperty(Element.prototype, 'scrollIntoView', {
  value: jest.fn(),
  writable: true
});

// Mock the enhanced chatbot service
jest.mock('../utils/enhancedChatbotService', () => ({
  EnhancedChatbotService: {
    getChatHistory: jest.fn(() => []),
    saveChatHistory: jest.fn(),
    clearChatHistory: jest.fn(),
    createUserMessage: jest.fn((content) => ({
      id: 'test-user-msg',
      content,
      isUser: true,
      timestamp: new Date(),
      type: 'text'
    })),
    processMessage: jest.fn(() => Promise.resolve({
      id: 'test-ai-msg',
      content: 'Enhanced AI response with detailed guidance',
      isUser: false,
      timestamp: new Date(),
      type: 'text'
    }))
  }
}));

describe('AIChatbotView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders AI Assistant interface', () => {
    render(<AIChatbotView />);
    
    expect(screen.getByText('AI Assistant')).toBeInTheDocument();
    expect(screen.getByText('Enhanced AI Expert with Comprehensive Knowledge Base')).toBeInTheDocument();
    expect(screen.getByText('Quick Actions:')).toBeInTheDocument();
  });

  it('displays welcome message on first load', () => {
    render(<AIChatbotView />);
    
    expect(screen.getByText(/Welcome to QA Commander AI Assistant/)).toBeInTheDocument();
    expect(screen.getByText(/I'm your enhanced Blackboard Learn expert/)).toBeInTheDocument();
  });

  it('has quick action buttons', () => {
    render(<AIChatbotView />);
    
    expect(screen.getByText('Assessment Creation')).toBeInTheDocument();
    expect(screen.getByText('Gradebook Test Plan')).toBeInTheDocument();
    expect(screen.getByText('Discussion Setup')).toBeInTheDocument();
  });

  it('has input field', () => {
    render(<AIChatbotView />);
    
    const inputField = screen.getByPlaceholderText(/Ask me about Blackboard Learn procedures/);
    expect(inputField).toBeInTheDocument();
  });

  it('has clear chat button', () => {
    render(<AIChatbotView />);
    
    const clearButton = screen.getByText('Clear Chat');
    expect(clearButton).toBeInTheDocument();
  });

  it('shows timestamp for messages', () => {
    render(<AIChatbotView />);
    
    // The welcome message should have a timestamp
    const timestampElements = screen.getAllByText(/\d{1,2}:\d{2}:\d{2}\s*(AM|PM)/);
    expect(timestampElements.length).toBeGreaterThan(0);
  });

  it('fills input when quick action button is clicked', () => {
    render(<AIChatbotView />);
    
    const assessmentButton = screen.getByText('Assessment Creation');
    const inputField = screen.getByPlaceholderText(/Ask me about Blackboard Learn procedures/);
    
    fireEvent.click(assessmentButton);
    
    expect(inputField).toHaveValue('How do I create an assessment with different question types in Blackboard?');
  });

  it('displays usage instructions', () => {
    render(<AIChatbotView />);
    
    expect(screen.getByText('Press Enter to send, Shift+Enter for new line')).toBeInTheDocument();
  });
});