import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Fab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Checkbox,
  FormControlLabel,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ExpandMore,
  Edit as EditIcon,
  Visibility as ViewIcon,
  GetApp as ExportIcon,
  Analytics as AnalyticsIcon,
  ViewModule as CardViewIcon,
  ViewList as TableViewIcon,
} from '@mui/icons-material';
import { TestPlan, TestCategory, TestScenario, BlackboardFeature, StrategyChecklistItem, AcceptanceCriteria } from '../types';
import { DataService } from '../utils/dataService';

const TestPlansView: React.FC = () => {
  const [testPlans, setTestPlans] = useState<TestPlan[]>([]);

  React.useEffect(() => {
    // Clear existing data and reinitialize to fix any structure issues
    DataService.clearTestPlans();
    DataService.initializeSampleData();
    loadData();
  }, []);

  const loadData = () => {
    setTestPlans(DataService.getTestPlans());
  };

  // Strategy checklist management
  const getDefaultStrategyChecklist = (): StrategyChecklistItem[] => [
    { id: 'sc1', category: 'test_types', item: 'Functional testing of core workflows', checked: false },
    { id: 'sc2', category: 'test_types', item: 'Integration testing with external systems', checked: false },
    { id: 'sc3', category: 'test_types', item: 'Usability and user experience testing', checked: false },
    { id: 'sc4', category: 'test_types', item: 'Accessibility testing (WCAG compliance)', checked: false },
    { id: 'sc5', category: 'test_types', item: 'Performance and load testing', checked: false },
    { id: 'sc6', category: 'test_types', item: 'Security and data protection testing', checked: false },
    { id: 'sc7', category: 'automation', item: 'Automate critical user paths', checked: false },
    { id: 'sc8', category: 'automation', item: 'Automated regression testing', checked: false },
    { id: 'sc9', category: 'automation', item: 'Cross-browser automated testing', checked: false },
    { id: 'sc10', category: 'automation', item: 'API testing automation', checked: false },
    { id: 'sc11', category: 'risk_management', item: 'Test edge cases and error conditions', checked: false },
    { id: 'sc12', category: 'risk_management', item: 'Data integrity and backup testing', checked: false },
    { id: 'sc13', category: 'risk_management', item: 'Concurrent user scenarios', checked: false },
    { id: 'sc14', category: 'risk_management', item: 'Network interruption and recovery', checked: false },
    { id: 'sc15', category: 'tools', item: 'Database verification and monitoring', checked: false },
    { id: 'sc16', category: 'tools', item: 'Log analysis and error tracking', checked: false },
    { id: 'sc17', category: 'tools', item: 'Performance monitoring tools', checked: false },
    { id: 'sc18', category: 'coverage', item: 'Test all supported browsers', checked: false },
    { id: 'sc19', category: 'coverage', item: 'Mobile device compatibility', checked: false },
    { id: 'sc20', category: 'coverage', item: 'Different user roles and permissions', checked: false },
    { id: 'sc21', category: 'process', item: 'Smoke testing for each build', checked: false },
    { id: 'sc22', category: 'process', item: 'User acceptance testing involvement', checked: false },
    { id: 'sc23', category: 'process', item: 'Documentation and knowledge transfer', checked: false }
  ];

  const updateStrategyChecklistItem = (itemId: string, field: keyof StrategyChecklistItem, value: any) => {
    const updatedChecklist = formData.strategyChecklist.map(item => 
      item.id === itemId ? { ...item, [field]: value } : item
    );
    setFormData({ ...formData, strategyChecklist: updatedChecklist });
  };

  const addCustomStrategyItem = (category: StrategyChecklistItem['category']) => {
    const newItem: StrategyChecklistItem = {
      id: `custom_${Date.now()}`,
      category,
      item: 'Custom strategy item',
      checked: false,
      notes: ''
    };
    setFormData({
      ...formData,
      strategyChecklist: [...formData.strategyChecklist, newItem]
    });
  };

  // Export functionality
  const generatePDF = async (testPlan: TestPlan) => {
    try {
      // Simple text-based export for now - could be enhanced with a proper PDF library
      const content = `
TEST PLAN: ${testPlan.title}
======================================

Description: ${testPlan.description}
Feature: ${testPlan.feature}
Priority: ${testPlan.priority}
Estimated Hours: ${testPlan.estimatedHours}

OBJECTIVE:
${testPlan.objective}

IN SCOPE:
${(testPlan.inScope || []).map(item => `• ${item}`).join('\n')}

OUT OF SCOPE:
${(testPlan.outOfScope || []).map(item => `• ${item}`).join('\n')}

PREREQUISITES:
${(testPlan.prerequisites || []).map(item => `• ${item}`).join('\n')}

STRATEGY:
${testPlan.testStrategy}

Strategy Checklist:
${(testPlan.strategyChecklist || []).map(item => `${item.checked ? '☑' : '☐'} ${item.item} ${item.notes ? `(${item.notes})` : ''}`).join('\n')}

TEST SCENARIOS:
${(testPlan.testScenarios || []).map((scenario, index) => `
${index + 1}. Given: ${scenario.given}
   When: ${scenario.when}
   Then: ${scenario.then}
   Priority: ${scenario.priority}
   ${scenario.notes ? `Notes: ${scenario.notes}` : ''}
`).join('\n')}

ENVIRONMENT REQUIREMENTS:
${(testPlan.testEnvironmentRequirements || []).map(item => `• ${item}`).join('\n')}

DATA REQUIREMENTS:
${(testPlan.testDataRequirements || []).map(item => `• ${item}`).join('\n')}

SUCCESS CRITERIA:
${(testPlan.successCriteria || []).map(item => `• ${item}`).join('\n')}
      `;

      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `TestPlan_${testPlan.title.replace(/\s+/g, '_')}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating export file');
    }
  };

  // Generate risk analysis from test plan
  const generateRiskAnalysis = (testPlan: TestPlan) => {
    try {
      // Create workflows from acceptance criteria, not scenarios
      const workflows: any[] = [];
      
      (testPlan.testScenarios || []).forEach(scenario => {
        // Validate that scenario has userStoryId
        if (!scenario.userStoryId) {
          alert(`Error: Scenario "${scenario.given}" is missing a User Story ID. Please add User Story IDs to all scenarios before generating risk analysis.`);
          throw new Error('Missing User Story ID');
        }
        
        (scenario.acceptanceCriteria || []).forEach(ac => {
          const defaultRiskScore = 4; // Medium risk as starting point
          const defaultTier = 'Tier 2: HIGH';
          
          const workflow = {
            id: ac.id, // Use AC ID as workflow ID
            workflowName: ac.description,
            description: `Acceptance criteria from scenario: ${scenario.given} → ${scenario.when} → ${scenario.then}`,
            userStoryId: scenario.userStoryId, // Link to User Story ID
            userStory: `Given ${scenario.given}, when ${scenario.when}, then ${scenario.then}`,
            blackboardFeature: testPlan.blackboardFeature,
            likelihood: 2,
            impact: 2,
            riskScore: defaultRiskScore,
            testingTier: defaultTier,
            deliverables: 'UI Automation, Exploratory Testing',
            automationReason: 'Generated from acceptance criteria - requires review and assessment',
            sourceTestPlanId: testPlan.id,
            sourceScenarioId: scenario.id,
            sourceAcceptanceCriteriaId: ac.id,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          
          workflows.push(workflow);
        });
      });

      if (workflows.length === 0) {
        alert('No acceptance criteria found to generate risk analysis. Please add acceptance criteria to your test scenarios first.');
        return;
      }

      // Save all workflows
      workflows.forEach(workflow => DataService.saveUserWorkflow(workflow));
      
      // Create risk analysis document
      const riskDocument = {
        id: `ra_${Date.now()}`,
        title: `Risk Analysis: ${testPlan.title}`,
        description: `Generated risk analysis document based on acceptance criteria for ${testPlan.feature}`,
        blackboardFeature: testPlan.blackboardFeature,
        workflows: workflows,
        overallRiskLevel: 'Medium' as const,
        totalRiskScore: workflows.reduce((sum, w) => sum + w.riskScore, 0),
        recommendations: 'Review and adjust impact/likelihood scores for each acceptance criteria workflow. Focus automation on high-frequency, stable workflows.',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      DataService.saveRiskDocument(riskDocument);
      
      alert(`Generated risk analysis with ${workflows.length} acceptance criteria workflows. Check the Risk Analysis section to review and adjust the scoring.`);
    } catch (error) {
      console.error('Error generating risk analysis:', error);
      // Error already alerted above
    }
  };

  const [open, setOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<TestPlan | null>(null);
  const [viewMode, setViewMode] = useState<'create' | 'edit' | 'view'>('create');
  const [displayMode, setDisplayMode] = useState<'cards' | 'table'>('cards');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    feature: '',
    blackboardFeature: 'Course Management' as BlackboardFeature,
    category: 'Functional' as TestCategory,
    priority: 'Medium' as TestPlan['priority'],
    valueStream: '',
    objective: '',
    inScope: [''] as string[],
    outOfScope: [''] as string[],
    prerequisites: [''] as string[],
    testStrategy: '',
    strategyChecklist: [] as StrategyChecklistItem[],
    testScenarios: [] as TestScenario[],
    testEnvironmentRequirements: [''] as string[],
    testDataRequirements: [''] as string[],
    successCriteria: [''] as string[],
    estimatedHours: 8,
    assignee: '',
  });

  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    'Feature Overview',
    'Objective',
    'Test Scope', 
    'Strategy',
    'Test Scenarios',
    'Environment & Data',
    'Success Criteria',
    'Review'
  ];

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const renderViewMode = (plan: TestPlan) => {
    return (
      <Box>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom>{plan.title}</Typography>
          <Typography variant="body1" paragraph>{plan.description}</Typography>
          
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={6}>
              <Typography variant="body2"><strong>Feature:</strong> {plan.feature}</Typography>
            </Grid>
            <Grid size={6}>
              <Typography variant="body2"><strong>Category:</strong> {plan.category}</Typography>
            </Grid>
            <Grid size={6}>
              <Typography variant="body2"><strong>Priority:</strong> {plan.priority}</Typography>
            </Grid>
            <Grid size={6}>
              <Typography variant="body2"><strong>Blackboard Feature:</strong> {plan.blackboardFeature}</Typography>
            </Grid>
            <Grid size={6}>
              <Typography variant="body2"><strong>Estimated Hours:</strong> {plan.estimatedHours}h</Typography>
            </Grid>
            <Grid size={6}>
              <Typography variant="body2"><strong>Status:</strong> {plan.status}</Typography>
            </Grid>
            {plan.assignee && (
              <Grid size={6}>
                <Typography variant="body2"><strong>Assignee:</strong> {plan.assignee}</Typography>
              </Grid>
            )}
          </Grid>
        </Paper>

        {plan.objective && (
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom color="primary">Objective</Typography>
            <Typography variant="body2">{plan.objective}</Typography>
          </Paper>
        )}

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom color="primary">Test Scope</Typography>
          
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>In Scope</Typography>
          <List dense>
            {(plan.inScope || []).map((item, index) => (
              <ListItem key={index}>
                <ListItemText primary={`• ${item}`} />
              </ListItem>
            ))}
          </List>
          
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>Out of Scope</Typography>
          <List dense>
            {(plan.outOfScope || []).map((item, index) => (
              <ListItem key={index}>
                <ListItemText primary={`• ${item}`} />
              </ListItem>
            ))}
          </List>
          
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>Prerequisites</Typography>
          <List dense>
            {(plan.prerequisites || []).map((prereq, index) => (
              <ListItem key={index}>
                <ListItemText primary={`• ${prereq}`} />
              </ListItem>
            ))}
          </List>
        </Paper>

        {(plan.testStrategy || plan.strategyChecklist?.length > 0) && (
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom color="primary">Test Strategy</Typography>
            {plan.testStrategy && (
              <Typography variant="body2" paragraph>{plan.testStrategy}</Typography>
            )}
            {plan.strategyChecklist && plan.strategyChecklist.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>Strategy Checklist</Typography>
                {['test_types', 'automation', 'risk_management', 'tools', 'coverage', 'process'].map(category => {
                  const categoryItems = (plan.strategyChecklist || []).filter(item => item.category === category);
                  if (categoryItems.length === 0) return null;
                  
                  return (
                    <Box key={category} sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ textTransform: 'capitalize', fontWeight: 'bold' }}>
                        {category.replace('_', ' ')}
                      </Typography>
                      {categoryItems.map(item => (
                        <Box key={item.id} sx={{ ml: 2, display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2">
                            {item.checked ? '☑️' : '☐'} {item.item}
                            {item.notes && ` (${item.notes})`}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  );
                })}
              </Box>
            )}
          </Paper>
        )}

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom color="primary">Test Scenarios ({plan.testScenarios.length})</Typography>
          {(plan.testScenarios || []).map((scenario, index) => (
            <Accordion key={scenario.id}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography>Scenario {index + 1}: {scenario.given}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box>
                  {scenario.userStoryId && (
                    <Typography variant="body2" gutterBottom><strong>User Story ID:</strong> {scenario.userStoryId}</Typography>
                  )}
                  <Typography variant="body2" gutterBottom><strong>Given:</strong> {scenario.given}</Typography>
                  <Typography variant="body2" gutterBottom><strong>When:</strong> {scenario.when}</Typography>
                  <Typography variant="body2" gutterBottom><strong>Then:</strong> {scenario.then}</Typography>
                  <Typography variant="body2" gutterBottom><strong>Priority:</strong> {scenario.priority}</Typography>
                  {scenario.notes && (
                    <Typography variant="body2" gutterBottom><strong>Notes:</strong> {scenario.notes}</Typography>
                  )}
                  
                  {scenario.acceptanceCriteria && scenario.acceptanceCriteria.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom><strong>Acceptance Criteria ({scenario.acceptanceCriteria.length}):</strong></Typography>
                      {scenario.acceptanceCriteria.map((ac, acIndex) => (
                        <Box key={ac.id} sx={{ ml: 2, mb: 1, p: 1, backgroundColor: 'background.default', borderRadius: 1 }}>
                          <Typography variant="body2" gutterBottom>
                            <strong>Test Case ID:</strong> {ac.id}
                          </Typography>
                          <Typography variant="body2" gutterBottom>
                            <strong>Description:</strong> {ac.description}
                          </Typography>
                          {ac.notes && (
                            <Typography variant="body2" color="text.secondary">
                              <strong>Notes:</strong> {ac.notes}
                            </Typography>
                          )}
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </Paper>

        <Grid container spacing={2}>
          <Grid size={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom color="primary">Environment Requirements</Typography>
              <List dense>
                {(plan.testEnvironmentRequirements || []).map((item, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={`• ${item}`} />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
          <Grid size={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom color="primary">Data Requirements</Typography>
              <List dense>
                {(plan.testDataRequirements || []).map((item, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={`• ${item}`} />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>

        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom color="primary">Success Criteria</Typography>
          <List dense>
            {(plan.successCriteria || []).map((item, index) => (
              <ListItem key={index}>
                <ListItemText primary={`• ${item}`} />
              </ListItem>
            ))}
          </List>
        </Paper>

        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom color="primary">Test Cases ({plan.testCases.length})</Typography>
          {(plan.testCases || []).map((testCase) => (
            <Accordion key={testCase.id}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography>{testCase.title}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" paragraph>{testCase.description}</Typography>
                <Typography variant="body2"><strong>Expected Result:</strong> {testCase.expectedResult}</Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Paper>

        <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            startIcon={<ExportIcon />}
            onClick={() => generatePDF(plan)}
          >
            Export PDF
          </Button>
          <Button
            variant="contained"
            startIcon={<AnalyticsIcon />}
            onClick={() => generateRiskAnalysis(plan)}
            color="primary"
          >
            Generate Risk Analysis
          </Button>
        </Box>
      </Box>
    );
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0: // Feature Overview
        return (
          <Grid container spacing={3}>
            <Grid size={12}>
              <Typography variant="h6" gutterBottom color="primary">
                1. Feature Overview
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Define the basic information about what feature you're testing.
              </Typography>
            </Grid>
            <Grid size={12}>
              <TextField
                label="Test Plan Title *"
                fullWidth
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Gradebook Feature Testing"
                disabled={viewMode === 'view'}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                label="Description *"
                fullWidth
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of what the feature does"
                disabled={viewMode === 'view'}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Feature Name *"
                fullWidth
                value={formData.feature}
                onChange={(e) => setFormData({ ...formData, feature: e.target.value })}
                placeholder="e.g., Grade Management"
                disabled={viewMode === 'view'}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Blackboard Feature Category *</InputLabel>
                <Select
                  value={formData.blackboardFeature}
                  label="Blackboard Feature Category"
                  onChange={(e) => setFormData({ ...formData, blackboardFeature: e.target.value as BlackboardFeature })}
                  disabled={viewMode === 'view'}
                >
                  {blackboardFeatures.map((feature) => (
                    <MenuItem key={feature} value={feature}>{feature}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Test Category</InputLabel>
                <Select
                  value={formData.category}
                  label="Test Category"
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as TestCategory })}
                  disabled={viewMode === 'view'}
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={formData.priority}
                  label="Priority"
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as TestPlan['priority'] })}
                  disabled={viewMode === 'view'}
                >
                  <MenuItem value="Low">Low</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                  <MenuItem value="Critical">Critical</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={12}>
              <TextField
                label="Value Stream"
                fullWidth
                value={formData.valueStream || ''}
                onChange={(e) => setFormData({ ...formData, valueStream: e.target.value })}
                placeholder="e.g., Teaching & Learning, Student Success, Administrative Operations"
                disabled={viewMode === 'view'}
                helperText="Specify the value stream this test plan belongs to for organizational context"
              />
            </Grid>
          </Grid>
        );

      case 1: // Objective
        return (
          <Grid container spacing={3}>
            <Grid size={12}>
              <Typography variant="h6" gutterBottom color="primary">
                2. Objective
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Define the primary goal and purpose of this test plan.
              </Typography>
            </Grid>
            <Grid size={12}>
              <TextField
                label="Test Objective *"
                fullWidth
                multiline
                rows={4}
                value={formData.objective}
                onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                placeholder="Validate all core functionality to ensure it meets Blackboard Learn standards. Include what you want to accomplish with this testing effort."
                disabled={viewMode === 'view'}
                helperText="Describe the main goal of your testing effort. What do you want to validate or achieve?"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Estimated Hours"
                type="number"
                fullWidth
                value={formData.estimatedHours}
                onChange={(e) => setFormData({ ...formData, estimatedHours: parseInt(e.target.value) || 0 })}
                disabled={viewMode === 'view'}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Assignee"
                fullWidth
                value={formData.assignee}
                onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                disabled={viewMode === 'view'}
                placeholder="QA Engineer name"
              />
            </Grid>
          </Grid>
        );

      case 2: // Test Scope
        return (
          <Grid container spacing={3}>
            <Grid size={12}>
              <Typography variant="h6" gutterBottom color="primary">
                3. Test Scope
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Define what will and won't be tested, plus any prerequisites.
              </Typography>
            </Grid>
            
            <Grid size={12}>
              <Typography variant="subtitle1" gutterBottom>In Scope</Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                What will be tested as part of this test plan?
              </Typography>
              {formData.inScope.map((item, index) => (
                <Box key={index} display="flex" alignItems="center" gap={1} mb={1}>
                  <TextField
                    fullWidth
                    placeholder="e.g., Grade entry and editing workflows"
                    value={item}
                    onChange={(e) => updateArrayItem('inScope', index, e.target.value)}
                    disabled={viewMode === 'view'}
                  />
                  {viewMode !== 'view' && (
                    <IconButton 
                      onClick={() => removeArrayItem('inScope', index)} 
                      disabled={formData.inScope.length === 1}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Box>
              ))}
              {viewMode !== 'view' && (
                <Button onClick={() => addArrayItem('inScope')} size="small" startIcon={<AddIcon />}>
                  Add In-Scope Item
                </Button>
              )}
            </Grid>

            <Grid size={12}>
              <Typography variant="subtitle1" gutterBottom>Out of Scope</Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                What will NOT be tested in this test plan?
              </Typography>
              {formData.outOfScope.map((item, index) => (
                <Box key={index} display="flex" alignItems="center" gap={1} mb={1}>
                  <TextField
                    fullWidth
                    placeholder="e.g., Third-party integrations"
                    value={item}
                    onChange={(e) => updateArrayItem('outOfScope', index, e.target.value)}
                    disabled={viewMode === 'view'}
                  />
                  {viewMode !== 'view' && (
                    <IconButton 
                      onClick={() => removeArrayItem('outOfScope', index)} 
                      disabled={formData.outOfScope.length === 1}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Box>
              ))}
              {viewMode !== 'view' && (
                <Button onClick={() => addArrayItem('outOfScope')} size="small" startIcon={<AddIcon />}>
                  Add Out-of-Scope Item
                </Button>
              )}
            </Grid>

            <Grid size={12}>
              <Typography variant="subtitle1" gutterBottom>Prerequisites</Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                What needs to be ready before testing can begin?
              </Typography>
              {formData.prerequisites.map((prereq, index) => (
                <Box key={index} display="flex" alignItems="center" gap={1} mb={1}>
                  <TextField
                    fullWidth
                    placeholder="e.g., Test environment setup"
                    value={prereq}
                    onChange={(e) => updateArrayItem('prerequisites', index, e.target.value)}
                    disabled={viewMode === 'view'}
                  />
                  {viewMode !== 'view' && (
                    <IconButton 
                      onClick={() => removeArrayItem('prerequisites', index)} 
                      disabled={formData.prerequisites.length === 1}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Box>
              ))}
              {viewMode !== 'view' && (
                <Button onClick={() => addArrayItem('prerequisites')} size="small" startIcon={<AddIcon />}>
                  Add Prerequisite
                </Button>
              )}
            </Grid>
          </Grid>
        );

      case 3: // Strategy
        return (
          <Grid container spacing={3}>
            <Grid size={12}>
              <Typography variant="h6" gutterBottom color="primary">
                4. Test Strategy
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Define your testing approach and select applicable strategies from the checklist below.
              </Typography>
            </Grid>
            
            <Grid size={12}>
              <TextField
                label="Strategy Overview"
                fullWidth
                multiline
                rows={3}
                value={formData.testStrategy}
                onChange={(e) => setFormData({ ...formData, testStrategy: e.target.value })}
                placeholder="Provide a high-level overview of your testing approach..."
                disabled={viewMode === 'view'}
                helperText="Brief description of your overall testing strategy and focus areas."
              />
            </Grid>

            <Grid size={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Strategy Checklist
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Select applicable testing strategies and add notes where needed. This checklist helps ensure comprehensive test coverage.
              </Typography>
              
              {['test_types', 'automation', 'risk_management', 'tools', 'coverage', 'process'].map(category => {
                const categoryItems = formData.strategyChecklist.filter(item => item.category === category);
                if (categoryItems.length === 0) return null;
                
                return (
                  <Box key={category} sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ 
                      textTransform: 'capitalize', 
                      fontWeight: 'bold',
                      color: 'primary.main',
                      mb: 1
                    }}>
                      {category.replace('_', ' ')}
                    </Typography>
                    <Paper sx={{ p: 2, backgroundColor: 'background.default' }}>
                      {categoryItems.map(item => (
                        <Box key={item.id} sx={{ mb: 1 }}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={item.checked}
                                onChange={(e) => updateStrategyChecklistItem(item.id, 'checked', e.target.checked)}
                                disabled={viewMode === 'view'}
                              />
                            }
                            label={item.item}
                          />
                          {item.checked && (
                            <TextField
                              fullWidth
                              size="small"
                              placeholder="Add implementation notes..."
                              value={item.notes || ''}
                              onChange={(e) => updateStrategyChecklistItem(item.id, 'notes', e.target.value)}
                              disabled={viewMode === 'view'}
                              sx={{ ml: 4, mt: 1 }}
                            />
                          )}
                        </Box>
                      ))}
                      {viewMode !== 'view' && (
                        <Button
                          size="small"
                          startIcon={<AddIcon />}
                          onClick={() => addCustomStrategyItem(category as StrategyChecklistItem['category'])}
                          sx={{ mt: 1 }}
                        >
                          Add Custom {category.replace('_', ' ')} Item
                        </Button>
                      )}
                    </Paper>
                  </Box>
                );
              })}
            </Grid>
          </Grid>
        );

      case 4: // Test Scenarios
        return (
          <Grid container spacing={3}>
            <Grid size={12}>
              <Typography variant="h6" gutterBottom color="primary">
                5. Test Scenarios (Given/When/Then)
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Define test scenarios that will be used for risk analysis workflows. These form the foundation for both test execution and risk analysis.
              </Typography>
            </Grid>
            {formData.testScenarios.map((scenario, index) => (
              <Grid size={12} key={scenario.id}>
                <Paper sx={{ p: 3, mb: 2, backgroundColor: 'background.default' }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="subtitle1">Scenario {index + 1}</Typography>
                    {viewMode !== 'view' && (
                      <IconButton 
                        onClick={() => removeTestScenario(index)}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Box>
                  <Grid container spacing={2}>
                    <Grid size={12}>
                      <TextField
                        fullWidth
                        label="User Story ID *"
                        placeholder="e.g., AB12345"
                        value={scenario.userStoryId || ''}
                        onChange={(e) => updateTestScenario(index, 'userStoryId', e.target.value.toUpperCase())}
                        disabled={viewMode === 'view'}
                        helperText="Format: AB##### (e.g., AB12345) - Required for linking to Risk Analysis"
                        error={scenario.userStoryId && !/^AB\d{5}$/.test(scenario.userStoryId)}
                      />
                    </Grid>
                    <Grid size={12}>
                      <TextField
                        fullWidth
                        label="Given (Initial condition) *"
                        placeholder="e.g., An instructor has entered a grade into the gradebook cell"
                        value={scenario.given}
                        onChange={(e) => updateTestScenario(index, 'given', e.target.value)}
                        disabled={viewMode === 'view'}
                        multiline
                        rows={2}
                      />
                    </Grid>
                    <Grid size={12}>
                      <TextField
                        fullWidth
                        label="When (Action or trigger) *"
                        placeholder="e.g., They hit enter or click away from the cell"
                        value={scenario.when}
                        onChange={(e) => updateTestScenario(index, 'when', e.target.value)}
                        disabled={viewMode === 'view'}
                        multiline
                        rows={2}
                      />
                    </Grid>
                    <Grid size={12}>
                      <TextField
                        fullWidth
                        label="Then (Expected outcome) * - Single Assertion Only"
                        placeholder="e.g., The grade is saved to the database and displayed correctly"
                        value={scenario.then}
                        onChange={(e) => updateTestScenario(index, 'then', e.target.value)}
                        disabled={viewMode === 'view'}
                        multiline
                        rows={2}
                        helperText="This is the atomic unit for risk assessment. Ensure it describes ONE clear, verifiable outcome."
                        error={scenario.then && (scenario.then.toLowerCase().includes(' and ') || scenario.then.split(',').length > 2)}
                      />
                      {scenario.then && (scenario.then.toLowerCase().includes(' and ') || scenario.then.split(',').length > 2) && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                          Warning: 'Then' statement should contain a single assertion. Consider splitting into multiple acceptance criteria.
                        </Typography>
                      )}
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <FormControl fullWidth>
                        <InputLabel>Priority</InputLabel>
                        <Select
                          value={scenario.priority}
                          label="Priority"
                          onChange={(e) => updateTestScenario(index, 'priority', e.target.value)}
                          disabled={viewMode === 'view'}
                        >
                          <MenuItem value="Low">Low</MenuItem>
                          <MenuItem value="Medium">Medium</MenuItem>
                          <MenuItem value="High">High</MenuItem>
                          <MenuItem value="Critical">Critical</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label="Notes (optional)"
                        value={scenario.notes || ''}
                        onChange={(e) => updateTestScenario(index, 'notes', e.target.value)}
                        disabled={viewMode === 'view'}
                        placeholder="Additional context or rationale"
                      />
                    </Grid>
                    
                    {/* Acceptance Criteria Section */}
                    <Grid size={12}>
                      <Typography variant="h6" gutterBottom sx={{ mt: 2, mb: 1 }}>
                        Acceptance Criteria (Workflows)
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        These acceptance criteria become the individual workflows in risk analysis. Each gets a unique ID for test automation.
                      </Typography>
                      
                      {(scenario.acceptanceCriteria || []).map((ac, acIndex) => (
                        <Box key={ac.id} sx={{ mb: 2, p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                            <Typography variant="subtitle2">AC #{acIndex + 1} - ID: {ac.id}</Typography>
                            {viewMode !== 'view' && (
                              <IconButton 
                                size="small" 
                                onClick={() => removeAcceptanceCriteria(index, acIndex)}
                                aria-label={`Remove acceptance criteria ${acIndex + 1}`}
                              >
                                <DeleteIcon />
                              </IconButton>
                            )}
                          </Box>
                          <Grid container spacing={2}>
                            <Grid size={12}>
                              <TextField
                                fullWidth
                                label="Description *"
                                value={ac.description}
                                onChange={(e) => updateAcceptanceCriteria(index, acIndex, 'description', e.target.value)}
                                disabled={viewMode === 'view'}
                                placeholder="e.g., Folder icon changes state to indicate expanded/collapsed status"
                                multiline
                                rows={2}
                              />
                            </Grid>
                            <Grid size={12}>
                              <TextField
                                fullWidth
                                label="Notes"
                                value={ac.notes || ''}
                                onChange={(e) => updateAcceptanceCriteria(index, acIndex, 'notes', e.target.value)}
                                disabled={viewMode === 'view'}
                                placeholder="Implementation notes"
                              />
                            </Grid>
                          </Grid>
                        </Box>
                      ))}
                      
                      {viewMode !== 'view' && (
                        <Button 
                          onClick={() => addAcceptanceCriteria(index)} 
                          size="small" 
                          startIcon={<AddIcon />}
                          variant="outlined"
                        >
                          Add Acceptance Criteria
                        </Button>
                      )}
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            ))}
            {viewMode !== 'view' && (
              <Grid size={12}>
                <Button onClick={addTestScenario} size="large" startIcon={<AddIcon />} fullWidth variant="outlined">
                  Add Test Scenario
                </Button>
              </Grid>
            )}
          </Grid>
        );

      case 5: // Environment & Data
        return (
          <Grid container spacing={3}>
            <Grid size={12}>
              <Typography variant="h6" gutterBottom color="primary">
                6. Test Environment & Data Requirements
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Specify what environment setup and test data you need.
              </Typography>
            </Grid>
            
            <Grid size={12}>
              <Typography variant="subtitle1" gutterBottom>Test Environment Requirements</Typography>
              {formData.testEnvironmentRequirements.map((item, index) => (
                <Box key={index} display="flex" alignItems="center" gap={1} mb={1}>
                  <TextField
                    fullWidth
                    placeholder="e.g., Blackboard Learn Ultra test instance"
                    value={item}
                    onChange={(e) => updateArrayItem('testEnvironmentRequirements', index, e.target.value)}
                    disabled={viewMode === 'view'}
                  />
                  {viewMode !== 'view' && (
                    <IconButton 
                      onClick={() => removeArrayItem('testEnvironmentRequirements', index)} 
                      disabled={formData.testEnvironmentRequirements.length === 1}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Box>
              ))}
              {viewMode !== 'view' && (
                <Button onClick={() => addArrayItem('testEnvironmentRequirements')} size="small" startIcon={<AddIcon />}>
                  Add Environment Requirement
                </Button>
              )}
            </Grid>

            <Grid size={12}>
              <Typography variant="subtitle1" gutterBottom>Test Data Requirements</Typography>
              {formData.testDataRequirements.map((item, index) => (
                <Box key={index} display="flex" alignItems="center" gap={1} mb={1}>
                  <TextField
                    fullWidth
                    placeholder="e.g., Sample course with enrolled students"
                    value={item}
                    onChange={(e) => updateArrayItem('testDataRequirements', index, e.target.value)}
                    disabled={viewMode === 'view'}
                  />
                  {viewMode !== 'view' && (
                    <IconButton 
                      onClick={() => removeArrayItem('testDataRequirements', index)} 
                      disabled={formData.testDataRequirements.length === 1}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Box>
              ))}
              {viewMode !== 'view' && (
                <Button onClick={() => addArrayItem('testDataRequirements')} size="small" startIcon={<AddIcon />}>
                  Add Data Requirement
                </Button>
              )}
            </Grid>
          </Grid>
        );

      case 6: // Success Criteria
        return (
          <Grid container spacing={3}>
            <Grid size={12}>
              <Typography variant="h6" gutterBottom color="primary">
                7. Success Criteria
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Define what constitutes successful completion of this test plan.
              </Typography>
            </Grid>
            
            <Grid size={12}>
              {formData.successCriteria.map((item, index) => (
                <Box key={index} display="flex" alignItems="center" gap={1} mb={1}>
                  <TextField
                    fullWidth
                    placeholder="e.g., All critical scenarios pass without data loss"
                    value={item}
                    onChange={(e) => updateArrayItem('successCriteria', index, e.target.value)}
                    disabled={viewMode === 'view'}
                  />
                  {viewMode !== 'view' && (
                    <IconButton 
                      onClick={() => removeArrayItem('successCriteria', index)} 
                      disabled={formData.successCriteria.length === 1}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Box>
              ))}
              {viewMode !== 'view' && (
                <Button onClick={() => addArrayItem('successCriteria')} size="small" startIcon={<AddIcon />}>
                  Add Success Criterion
                </Button>
              )}
            </Grid>
          </Grid>
        );

      case 7: // Review
        return (
          <Grid container spacing={3}>
            <Grid size={12}>
              <Typography variant="h6" gutterBottom color="primary">
                8. Review & Submit
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Review your test plan before creating it.
              </Typography>
            </Grid>
            <Grid size={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>{formData.title}</Typography>
                <Typography variant="body1" paragraph>{formData.description}</Typography>
                
                <Grid container spacing={2}>
                  <Grid size={6}>
                    <Typography variant="body2"><strong>Feature:</strong> {formData.feature}</Typography>
                  </Grid>
                  <Grid size={6}>
                    <Typography variant="body2"><strong>Priority:</strong> {formData.priority}</Typography>
                  </Grid>
                  <Grid size={6}>
                    <Typography variant="body2"><strong>Blackboard Feature:</strong> {formData.blackboardFeature}</Typography>
                  </Grid>
                  <Grid size={6}>
                    <Typography variant="body2"><strong>Estimated Hours:</strong> {formData.estimatedHours}h</Typography>
                  </Grid>
                </Grid>

                <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Objective</Typography>
                <Typography variant="body2" paragraph>{formData.objective}</Typography>

                <Typography variant="subtitle1" sx={{ mb: 1 }}>Test Scenarios</Typography>
                <Typography variant="body2" color="text.secondary">{formData.testScenarios.length} scenarios defined</Typography>
                
                <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Success Criteria</Typography>
                <Typography variant="body2" color="text.secondary">{formData.successCriteria.length} criteria defined</Typography>
              </Paper>
            </Grid>
          </Grid>
        );

      default:
        return <Typography>Unknown step</Typography>;
    }
  };

  const categories: TestCategory[] = [
    'Functional', 'Integration', 'Performance', 'Security', 'Usability',
    'Accessibility', 'API', 'Database', 'UI/UX', 'Mobile', 'Cross-browser'
  ];

  const blackboardFeatures: BlackboardFeature[] = [
    'Course Management', 'Gradebook', 'Discussion Forums', 'Assignments',
    'Content Areas', 'Announcements', 'Calendar', 'Messages', 'Group Management',
    'Assessment Tools', 'Rubrics', 'SafeAssign', 'Attendance', 'Grade Center',
    'Ultra Course View', 'Original Course View', 'Mobile App', 'Integration Tools',
    'Reports', 'System Administration'
  ];

  const handleCreateNew = () => {
    setViewMode('create');
    setSelectedPlan(null);
    setFormData({
      title: '',
      description: '',
      feature: '',
      blackboardFeature: 'Course Management',
      category: 'Functional',
      priority: 'Medium',
      objective: '',
      inScope: [''],
      outOfScope: [''],
      prerequisites: [''],
      testStrategy: '',
      strategyChecklist: getDefaultStrategyChecklist(),
      testScenarios: [],
      testEnvironmentRequirements: [''],
      testDataRequirements: [''],
      successCriteria: [''],
      estimatedHours: 8,
      assignee: '',
    });
    setActiveStep(0);
    setOpen(true);
  };

  const handleEdit = (plan: TestPlan) => {
    setViewMode('edit');
    setSelectedPlan(plan);
    setFormData({
      title: plan.title,
      description: plan.description,
      feature: plan.feature,
      blackboardFeature: plan.blackboardFeature,
      category: plan.category,
      priority: plan.priority,
      valueStream: plan.valueStream || '',
      objective: plan.objective,
      inScope: plan.inScope,
      outOfScope: plan.outOfScope,
      prerequisites: plan.prerequisites,
      testStrategy: plan.testStrategy,
      strategyChecklist: plan.strategyChecklist,
      testScenarios: plan.testScenarios,
      testEnvironmentRequirements: plan.testEnvironmentRequirements,
      testDataRequirements: plan.testDataRequirements,
      successCriteria: plan.successCriteria,
      estimatedHours: plan.estimatedHours,
      assignee: plan.assignee || '',
    });
    setActiveStep(0);
    setOpen(true);
  };

  const handleView = (plan: TestPlan) => {
    setViewMode('view');
    setSelectedPlan(plan);
    setOpen(true);
  };

  const handleDelete = (plan: TestPlan) => {
    if (window.confirm(`Are you sure you want to delete the test plan "${plan.title}"?`)) {
      DataService.deleteTestPlan(plan.id);
      loadData();
    }
  };

  const handleSubmit = () => {
    if (viewMode === 'create') {
      const newTestPlan: TestPlan = {
        id: Date.now().toString(),
        ...formData,
        testCases: [],
        status: 'Draft',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      DataService.saveTestPlan(newTestPlan);
    } else if (viewMode === 'edit' && selectedPlan) {
      const updatedPlan = { ...selectedPlan, ...formData, updatedAt: new Date() };
      DataService.saveTestPlan(updatedPlan);
    }
    loadData();
    setOpen(false);
  };

  const addTestScenario = () => {
    const newScenario: TestScenario = {
      id: Date.now().toString(),
      userStoryId: '', // Required field
      given: '',
      when: '',
      then: '',
      priority: 'Medium',
      acceptanceCriteria: [],
      notes: ''
    };
    setFormData({
      ...formData,
      testScenarios: [...formData.testScenarios, newScenario]
    });
  };

  const addAcceptanceCriteria = (scenarioIndex: number) => {
    const newAC: AcceptanceCriteria = {
      id: DataService.generateTestCaseId(),
      description: '',
      notes: ''
    };
    
    const updatedScenarios = [...formData.testScenarios];
    updatedScenarios[scenarioIndex].acceptanceCriteria = [
      ...updatedScenarios[scenarioIndex].acceptanceCriteria,
      newAC
    ];
    
    setFormData({ ...formData, testScenarios: updatedScenarios });
  };

  const updateAcceptanceCriteria = (scenarioIndex: number, acIndex: number, field: keyof AcceptanceCriteria, value: string) => {
    const updatedScenarios = [...formData.testScenarios];
    updatedScenarios[scenarioIndex].acceptanceCriteria[acIndex] = {
      ...updatedScenarios[scenarioIndex].acceptanceCriteria[acIndex],
      [field]: value
    };
    setFormData({ ...formData, testScenarios: updatedScenarios });
  };

  const removeAcceptanceCriteria = (scenarioIndex: number, acIndex: number) => {
    const updatedScenarios = [...formData.testScenarios];
    updatedScenarios[scenarioIndex].acceptanceCriteria = updatedScenarios[scenarioIndex].acceptanceCriteria.filter((_, i) => i !== acIndex);
    setFormData({ ...formData, testScenarios: updatedScenarios });
  };

  const updateTestScenario = (index: number, field: keyof TestScenario, value: string) => {
    const newScenarios = [...formData.testScenarios];
    if (field === 'acceptanceCriteria') {
      // Handle acceptance criteria separately
      return;
    }
    newScenarios[index] = { ...newScenarios[index], [field]: value };
    setFormData({ ...formData, testScenarios: newScenarios });
  };

  const removeTestScenario = (index: number) => {
    setFormData({
      ...formData,
      testScenarios: formData.testScenarios.filter((_, i) => i !== index)
    });
  };

  const addPrerequisite = () => {
    setFormData({
      ...formData,
      prerequisites: [...formData.prerequisites, '']
    });
  };

  const updatePrerequisite = (index: number, value: string) => {
    const newPrerequisites = [...formData.prerequisites];
    newPrerequisites[index] = value;
    setFormData({ ...formData, prerequisites: newPrerequisites });
  };

  const removePrerequisite = (index: number) => {
    setFormData({
      ...formData,
      prerequisites: formData.prerequisites.filter((_, i) => i !== index)
    });
  };

  // Helper functions for managing array fields
  const addArrayItem = (field: keyof typeof formData, value: string = '') => {
    setFormData({
      ...formData,
      [field]: [...(formData[field] as string[]), value]
    });
  };

  const updateArrayItem = (field: keyof typeof formData, index: number, value: string) => {
    const newArray = [...(formData[field] as string[])];
    newArray[index] = value;
    setFormData({ ...formData, [field]: newArray });
  };

  const removeArrayItem = (field: keyof typeof formData, index: number) => {
    const newArray = (formData[field] as string[]).filter((_, i) => i !== index);
    setFormData({ ...formData, [field]: newArray });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'error';
      case 'High': return 'warning';
      case 'Medium': return 'info';
      case 'Low': return 'success';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'success';
      case 'In Progress': return 'primary';
      case 'Review': return 'warning';
      case 'Draft': return 'default';
      case 'Approved': return 'info';
      case 'Archived': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <div>
          <Typography variant="h4" gutterBottom>
            Test Plans
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage test plans for Blackboard Learn/Ultra features
          </Typography>
        </div>
        <Box display="flex" alignItems="center" gap={2}>
          <ToggleButtonGroup
            value={displayMode}
            exclusive
            onChange={(_, newMode) => newMode && setDisplayMode(newMode)}
            aria-label="view mode"
          >
            <ToggleButton value="cards" aria-label="card view">
              <CardViewIcon />
            </ToggleButton>
            <ToggleButton value="table" aria-label="table view">
              <TableViewIcon />
            </ToggleButton>
          </ToggleButtonGroup>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateNew}
          >
            Create Test Plan
          </Button>
        </Box>
      </Box>

      {displayMode === 'table' ? (
        <Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Feature</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Scenarios</TableCell>
                  <TableCell>Acceptance Criteria</TableCell>
                  <TableCell>Assignee</TableCell>
                  <TableCell>Updated</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {testPlans.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((plan) => {
                  const totalAC = plan.testScenarios.reduce((sum, scenario) => 
                    sum + (scenario.acceptanceCriteria?.length || 0), 0
                  );
                  
                  return (
                    <TableRow key={plan.id}>
                      <TableCell>
                        <Box>
                          <Typography variant="subtitle2">{plan.title}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {plan.description.length > 100 
                              ? `${plan.description.substring(0, 100)}...` 
                              : plan.description}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{plan.blackboardFeature}</TableCell>
                      <TableCell>
                        <Chip 
                          label={plan.priority}
                          color={getPriorityColor(plan.priority) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={plan.status}
                          color={getStatusColor(plan.status) as any}
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{plan.testScenarios.length}</TableCell>
                      <TableCell>{totalAC}</TableCell>
                      <TableCell>{plan.assignee || '-'}</TableCell>
                      <TableCell>{plan.updatedAt.toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Box display="flex" gap={1}>
                          <Tooltip title="View Details">
                            <IconButton size="small" onClick={() => handleView(plan)}>
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton size="small" onClick={() => handleEdit(plan)}>
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Export PDF">
                            <IconButton size="small" onClick={() => generatePDF(plan)}>
                              <ExportIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Generate Risk Analysis">
                            <IconButton size="small" onClick={() => generateRiskAnalysis(plan)}>
                              <AnalyticsIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton size="small" color="error" onClick={() => handleDelete(plan)}>
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            component="div"
            count={testPlans.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(0);
            }}
          />
        </Box>
      ) : (
        <Grid container spacing={3}>
        {testPlans.map((plan) => (
          <Grid size={{ xs: 12, md: 6, lg: 4 }} key={plan.id}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    {plan.title}
                  </Typography>
                  <Box>
                    <Tooltip title="View Details">
                      <IconButton 
                        size="small" 
                        onClick={() => handleView(plan)}
                        aria-label={`View test plan: ${plan.title}`}
                      >
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit Test Plan">
                      <IconButton 
                        size="small" 
                        onClick={() => handleEdit(plan)}
                        aria-label={`Edit test plan: ${plan.title}`}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Export PDF">
                      <IconButton 
                        size="small" 
                        onClick={() => generatePDF(plan)}
                        aria-label={`Export test plan: ${plan.title}`}
                      >
                        <ExportIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Generate Risk Analysis">
                      <IconButton 
                        size="small" 
                        onClick={() => generateRiskAnalysis(plan)}
                        aria-label={`Generate risk analysis for: ${plan.title}`}
                        color="primary"
                      >
                        <AnalyticsIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Test Plan">
                      <IconButton 
                        size="small" 
                        onClick={() => handleDelete(plan)}
                        aria-label={`Delete test plan: ${plan.title}`}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {plan.description}
                </Typography>
                
                <Box mt={2} mb={2}>
                  <Chip
                    label={plan.category}
                    variant="outlined"
                    size="small"
                    sx={{ mr: 1, mb: 1 }}
                  />
                  <Chip
                    label={plan.priority}
                    color={getPriorityColor(plan.priority) as any}
                    size="small"
                    sx={{ mr: 1, mb: 1 }}
                  />
                  <Chip
                    label={plan.status}
                    color={getStatusColor(plan.status) as any}
                    variant="outlined"
                    size="small"
                    sx={{ mb: 1 }}
                  />
                </Box>
                
                <Typography variant="body2" gutterBottom>
                  <strong>Feature:</strong> {plan.blackboardFeature}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Estimated Hours:</strong> {plan.estimatedHours}h
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Test Cases:</strong> {plan.testCases.length}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Test Scenarios:</strong> {plan.testScenarios.length}
                </Typography>
                {plan.assignee && (
                  <Typography variant="body2" gutterBottom>
                    <strong>Assignee:</strong> {plan.assignee}
                  </Typography>
                )}
                <Typography variant="caption" color="text.secondary">
                  Updated: {plan.updatedAt.toLocaleDateString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      )}

      <Dialog 
        open={open} 
        onClose={() => setOpen(false)} 
        maxWidth="lg" 
        fullWidth
        aria-labelledby="dialog-title"
        aria-describedby="dialog-description"
      >
        <DialogTitle id="dialog-title">
          {viewMode === 'create' && 'Create New Test Plan'}
          {viewMode === 'edit' && 'Edit Test Plan'}
          {viewMode === 'view' && 'Test Plan Details'}
        </DialogTitle>
        <DialogContent>

            <Box sx={{ mt: 1 }}>
              {viewMode === 'view' ? (
                // Comprehensive structured view
                selectedPlan && renderViewMode(selectedPlan)
              ) : (
                // Interactive stepper for create/edit
                <Stepper activeStep={activeStep} orientation="vertical">
                  {steps.map((label, index) => (
                    <Step key={label}>
                      <StepLabel>{label}</StepLabel>
                      <StepContent>
                        {renderStepContent(index)}
                        <Box sx={{ mb: 2, mt: 3 }}>
                          <div>
                            <Button
                              variant="contained"
                              onClick={index === steps.length - 1 ? handleSubmit : handleNext}
                              sx={{ mt: 1, mr: 1 }}
                            >
                              {index === steps.length - 1 ? 
                                (viewMode === 'create' ? 'Create Test Plan' : 'Update Test Plan') : 
                                'Continue'
                              }
                            </Button>
                            <Button
                              disabled={index === 0}
                              onClick={handleBack}
                              sx={{ mt: 1, mr: 1 }}
                            >
                              Back
                            </Button>
                          </div>
                        </Box>
                      </StepContent>
                    </Step>
                  ))}
                </Stepper>
              )}
            </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpen(false);
            setActiveStep(0);
          }}>
            {viewMode === 'view' ? 'Close' : 'Cancel'}
          </Button>
        </DialogActions>
      </Dialog>

      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16, display: { md: 'none' } }}
        onClick={handleCreateNew}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default TestPlansView;