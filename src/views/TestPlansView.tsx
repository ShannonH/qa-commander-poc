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
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ExpandMore,
  Edit as EditIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { TestPlan, TestCategory, TestScenario, BlackboardFeature } from '../types';
import { DataService } from '../utils/dataService';

const TestPlansView: React.FC = () => {
  const [testPlans, setTestPlans] = useState<TestPlan[]>([]);

  React.useEffect(() => {
    // Initialize sample data on first load
    DataService.initializeSampleData();
    loadData();
  }, []);

  const loadData = () => {
    setTestPlans(DataService.getTestPlans());
  };

  const [open, setOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<TestPlan | null>(null);
  const [viewMode, setViewMode] = useState<'create' | 'edit' | 'view'>('create');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    feature: '',
    blackboardFeature: 'Course Management' as BlackboardFeature,
    category: 'Functional' as TestCategory,
    priority: 'Medium' as TestPlan['priority'],
    objective: '',
    inScope: [''] as string[],
    outOfScope: [''] as string[],
    prerequisites: [''] as string[],
    testStrategy: '',
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
            {plan.inScope.map((item, index) => (
              <ListItem key={index}>
                <ListItemText primary={`• ${item}`} />
              </ListItem>
            ))}
          </List>
          
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>Out of Scope</Typography>
          <List dense>
            {plan.outOfScope.map((item, index) => (
              <ListItem key={index}>
                <ListItemText primary={`• ${item}`} />
              </ListItem>
            ))}
          </List>
          
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>Prerequisites</Typography>
          <List dense>
            {plan.prerequisites.map((prereq, index) => (
              <ListItem key={index}>
                <ListItemText primary={`• ${prereq}`} />
              </ListItem>
            ))}
          </List>
        </Paper>

        {plan.testStrategy && (
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom color="primary">Test Strategy</Typography>
            <Typography variant="body2">{plan.testStrategy}</Typography>
          </Paper>
        )}

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom color="primary">Test Scenarios ({plan.testScenarios.length})</Typography>
          {plan.testScenarios.map((scenario, index) => (
            <Accordion key={scenario.id}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography>Scenario {index + 1}: {scenario.given}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box>
                  <Typography variant="body2" gutterBottom><strong>Given:</strong> {scenario.given}</Typography>
                  <Typography variant="body2" gutterBottom><strong>When:</strong> {scenario.when}</Typography>
                  <Typography variant="body2" gutterBottom><strong>Then:</strong> {scenario.then}</Typography>
                  <Typography variant="body2" gutterBottom><strong>Priority:</strong> {scenario.priority}</Typography>
                  {scenario.notes && (
                    <Typography variant="body2" gutterBottom><strong>Notes:</strong> {scenario.notes}</Typography>
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
                {plan.testEnvironmentRequirements.map((item, index) => (
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
                {plan.testDataRequirements.map((item, index) => (
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
            {plan.successCriteria.map((item, index) => (
              <ListItem key={index}>
                <ListItemText primary={`• ${item}`} />
              </ListItem>
            ))}
          </List>
        </Paper>

        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom color="primary">Test Cases ({plan.testCases.length})</Typography>
          {plan.testCases.map((testCase) => (
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
                Describe your overall approach to testing this feature.
              </Typography>
            </Grid>
            <Grid size={12}>
              <TextField
                label="Test Strategy *"
                fullWidth
                multiline
                rows={5}
                value={formData.testStrategy}
                onChange={(e) => setFormData({ ...formData, testStrategy: e.target.value })}
                placeholder="Describe your testing approach: combination of automated and manual testing, risk-based focus areas, testing techniques, etc."
                disabled={viewMode === 'view'}
                helperText="Include testing approaches, automation strategy, risk-based priorities, and key techniques you'll use."
              />
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
                        label="Then (Expected outcome) *"
                        placeholder="e.g., The grade is saved to the database and displayed correctly"
                        value={scenario.then}
                        onChange={(e) => updateTestScenario(index, 'then', e.target.value)}
                        disabled={viewMode === 'view'}
                        multiline
                        rows={2}
                      />
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
      objective: plan.objective,
      inScope: plan.inScope,
      outOfScope: plan.outOfScope,
      prerequisites: plan.prerequisites,
      testStrategy: plan.testStrategy,
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
      given: '',
      when: '',
      then: '',
      priority: 'Medium',
      notes: ''
    };
    setFormData({
      ...formData,
      testScenarios: [...formData.testScenarios, newScenario]
    });
  };

  const updateTestScenario = (index: number, field: keyof TestScenario, value: string) => {
    const newScenarios = [...formData.testScenarios];
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
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateNew}
        >
          Create Test Plan
        </Button>
      </Box>

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
                    <IconButton 
                      size="small" 
                      onClick={() => handleView(plan)}
                      aria-label={`View test plan: ${plan.title}`}
                    >
                      <ViewIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => handleEdit(plan)}
                      aria-label={`Edit test plan: ${plan.title}`}
                    >
                      <EditIcon />
                    </IconButton>
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