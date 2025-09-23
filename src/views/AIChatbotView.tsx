import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  IconButton,
  List,
  ListItem,
  Avatar,
  Chip,
  Button,
  Card,
  CardContent,
  Divider,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Send as SendIcon,
  SmartToy as BotIcon,
  Person as PersonIcon,
  ExpandMore,
  Launch as LaunchIcon,
  Assignment as TestPlanIcon,
  Help as HelpIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { ChatMessage, ChatbotContext } from '../types';
import { EnhancedChatbotService } from '../utils/enhancedChatbotService';

const AIChatbotView: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const context: ChatbotContext = {
    currentView: 'ai-chatbot',
    userGoal: 'general-help'
  };

  useEffect(() => {
    // Load chat history on component mount
    const history = EnhancedChatbotService.getChatHistory();
    setMessages(history || []);
    
    // Add welcome message if no history
    if (!history || history.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        content: `Welcome to QA Commander AI Assistant! 🤖

I'm your enhanced Blackboard Learn expert with access to comprehensive documentation and real-world testing strategies. I can provide:

🔍 **Expert Documentation** - Detailed guidance from help.blackboard.com
🧪 **Advanced Test Planning** - Real-world testing scenarios with specific steps
📋 **Step-by-Step Procedures** - Detailed instructions for any Blackboard feature
🎯 **Best Practices** - Industry-standard approaches and professional tips
⚠️ **Common Issues** - Solutions to frequently encountered problems

**I know about:**
• Assessment Tools & Testing Strategies
• Advanced Gradebook Management  
• Discussion Forum Setup & Moderation
• Content Organization Best Practices
• Ultra Course Experience Features

Try asking me:
- "How do I create an assessment with different question types?"
- "Generate a comprehensive test plan for gradebook functionality"
- "What are the step-by-step procedures for discussion forum setup?"

What would you like help with today?`,
        isUser: false,
        timestamp: new Date(),
        type: 'text'
      };
      setMessages([welcomeMessage]);
    }
  }, []);

  useEffect(() => {
    // Scroll to bottom when messages change
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Save messages to localStorage whenever they change
    if (messages.length > 0) {
      EnhancedChatbotService.saveChatHistory(messages);
    }
  }, [messages]);

  const scrollToBottom = () => {
    try {
      messagesEndRef.current?.scrollIntoView?.({ behavior: 'smooth' });
    } catch (error) {
      // Ignore scroll errors in test environment
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = EnhancedChatbotService.createUserMessage(inputMessage.trim());
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await EnhancedChatbotService.processMessage(inputMessage.trim(), context);
      setMessages(prev => [...prev, response]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        isUser: false,
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    EnhancedChatbotService.clearChatHistory();
    setInputMessage('');
  };

  const renderMessage = (message: ChatMessage) => {
    const isUser = message.isUser;
    
    return (
      <ListItem
        key={message.id}
        sx={{
          display: 'flex',
          justifyContent: isUser ? 'flex-end' : 'flex-start',
          alignItems: 'flex-start',
          py: 1,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: isUser ? 'row-reverse' : 'row',
            alignItems: 'flex-start',
            maxWidth: '80%',
            gap: 1,
          }}
        >
          <Avatar
            sx={{
              bgcolor: isUser ? 'primary.main' : 'secondary.main',
              width: 32,
              height: 32,
            }}
          >
            {isUser ? <PersonIcon /> : <BotIcon />}
          </Avatar>
          
          <Card
            sx={{
              bgcolor: isUser ? 'primary.light' : 'grey.100',
              color: isUser ? 'primary.contrastText' : 'text.primary',
              borderRadius: 2,
              maxWidth: '100%',
            }}
          >
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Typography
                variant="body1"
                sx={{
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {message.content}
              </Typography>
              
              {message.metadata && (
                <Box sx={{ mt: 2 }}>
                  {message.metadata.helpUrl && (
                    <Button
                      size="small"
                      startIcon={<LaunchIcon />}
                      href={message.metadata.helpUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ mt: 1 }}
                    >
                      View Full Documentation
                    </Button>
                  )}
                  
                  {message.metadata.testPlan && (
                    <Accordion sx={{ mt: 1 }}>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <TestPlanIcon fontSize="small" />
                          View Generated Test Plan Details
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Box>
                          <Typography variant="subtitle2" gutterBottom>
                            Test Plan: {message.metadata.testPlan.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" paragraph>
                            {message.metadata.testPlan.description}
                          </Typography>
                          {message.metadata.testPlan.prerequisites && (
                            <Box>
                              <Typography variant="body2" fontWeight="medium">Prerequisites:</Typography>
                              {message.metadata.testPlan.prerequisites.map((prereq, index) => (
                                <Typography key={index} variant="body2" sx={{ ml: 2 }}>
                                  • {prereq}
                                </Typography>
                              ))}
                            </Box>
                          )}
                        </Box>
                      </AccordionDetails>
                    </Accordion>
                  )}
                  
                  {message.metadata.blackboardFeature && (
                    <Chip
                      label={message.metadata.blackboardFeature}
                      size="small"
                      color="primary"
                      sx={{ mt: 1 }}
                    />
                  )}
                </Box>
              )}
              
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', mt: 1, textAlign: 'right' }}
              >
                {message.timestamp.toLocaleTimeString()}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </ListItem>
    );
  };

  return (
    <Box sx={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Paper
        sx={{
          p: 2,
          mb: 2,
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <BotIcon />
          <Box>
            <Typography variant="h5" fontWeight="bold">
              AI Assistant
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Enhanced AI Expert with Comprehensive Knowledge Base
            </Typography>
          </Box>
        </Box>
        
        <Button
          variant="outlined"
          color="inherit"
          size="small"
          startIcon={<ClearIcon />}
          onClick={handleClearChat}
          disabled={messages.length === 0}
        >
          Clear Chat
        </Button>
      </Paper>

      {/* Quick Actions */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Quick Actions:
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<HelpIcon />}
            onClick={() => setInputMessage('How do I create an assessment with different question types in Blackboard?')}
          >
            Assessment Creation
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<TestPlanIcon />}
            onClick={() => setInputMessage('Generate a comprehensive test plan for gradebook functionality with detailed scenarios')}
          >
            Gradebook Test Plan
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<HelpIcon />}
            onClick={() => setInputMessage('What are the step-by-step procedures for setting up discussion forums?')}
          >
            Discussion Setup
          </Button>
        </Box>
      </Box>

      {/* Messages Area */}
      <Paper
        sx={{
          flexGrow: 1,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box
          sx={{
            flexGrow: 1,
            overflow: 'auto',
            maxHeight: 'calc(100vh - 300px)',
          }}
        >
          <List sx={{ p: 1 }}>
            {messages.map(renderMessage)}
            {isLoading && (
              <ListItem sx={{ justifyContent: 'flex-start' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}>
                    <BotIcon />
                  </Avatar>
                  <Card sx={{ bgcolor: 'grey.100' }}>
                    <CardContent sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={16} />
                      <Typography variant="body2" color="text.secondary">
                        Thinking...
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              </ListItem>
            )}
            <div ref={messagesEndRef} />
          </List>
        </Box>

        <Divider />

        {/* Input Area */}
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
            <TextField
              ref={inputRef}
              fullWidth
              multiline
              maxRows={4}
              placeholder="Ask me about Blackboard Learn procedures, testing strategies, or request detailed guidance..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              variant="outlined"
              size="small"
            />
            <IconButton
              color="primary"
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              sx={{ mb: 0.5 }}
            >
              <SendIcon />
            </IconButton>
          </Box>
          
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Press Enter to send, Shift+Enter for new line
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default AIChatbotView;