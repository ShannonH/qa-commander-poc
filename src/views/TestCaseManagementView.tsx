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
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  ExpandMore,
  ViewModule as CardViewIcon,
  ViewList as TableViewIcon,
} from '@mui/icons-material';
import { TestCase, TestStep, BlackboardFeature } from '../types';
import { DataService } from '../utils/dataService';

const TestCaseManagementView: React.FC = () => {
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedTestCase, setSelectedTestCase] = useState<TestCase | null>(null);
  const [viewMode, setViewMode] = useState<'create' | 'edit' | 'view'>('create');
  const [displayMode, setDisplayMode] = useState<'cards' | 'table'>('cards');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  React.useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // Get all test cases from all test plans
    const allTestPlans = DataService.getTestPlans();
    const allTestCases: TestCase[] = [];
    allTestPlans.forEach(plan => {
      if (plan.testCases && plan.testCases.length > 0) {
        allTestCases.push(...plan.testCases);
      }
    });
    setTestCases(allTestCases);
  };

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    steps: [] as TestStep[],
    expectedResult: '',
    priority: 'Medium' as TestCase['priority'],
    blackboardFeature: 'Course Management' as BlackboardFeature,
    tags: [] as string[],
    prerequisites: '',
    testData: '',
  });

  const blackboardFeatures: BlackboardFeature[] = [
    'Course Management', 'Gradebook', 'Discussion Forums', 'Assignments',
    'Content Areas', 'Announcements', 'Calendar', 'Messages', 'Group Management',
    'Assessment Tools', 'Rubrics', 'SafeAssign', 'Attendance', 'Grade Center',
    'Ultra Course View', 'Original Course View', 'Mobile App', 'Integration Tools',
    'Reports', 'System Administration'
  ];

  const handleCreateNew = () => {
    setViewMode('create');
    setSelectedTestCase(null);
    setFormData({
      title: '',
      description: '',
      steps: [],
      expectedResult: '',
      priority: 'Medium',
      blackboardFeature: 'Course Management',
      tags: [],
      prerequisites: '',
      testData: '',
    });
    setOpen(true);
  };

  const handleEdit = (testCase: TestCase) => {
    setViewMode('edit');
    setSelectedTestCase(testCase);
    setFormData({
      title: testCase.title,
      description: testCase.description,
      steps: testCase.steps || [],
      expectedResult: testCase.expectedResult,
      priority: testCase.priority,
      blackboardFeature: (testCase as any).blackboardFeature || 'Course Management',
      tags: (testCase as any).tags || [],
      prerequisites: (testCase as any).prerequisites || '',
      testData: (testCase as any).testData || '',
    });
    setOpen(true);
  };

  const handleView = (testCase: TestCase) => {
    setViewMode('view');
    setSelectedTestCase(testCase);
    setOpen(true);
  };

  const handleSubmit = () => {
    if (viewMode === 'create') {
      const newTestCase: TestCase = {
        id: `tc_${Date.now()}`,
        title: formData.title,
        description: formData.description,
        steps: formData.steps,
        expectedResult: formData.expectedResult,
        priority: formData.priority,
        ...(formData.blackboardFeature && { blackboardFeature: formData.blackboardFeature }),
        ...(formData.tags.length > 0 && { tags: formData.tags }),
        ...(formData.prerequisites && { prerequisites: formData.prerequisites }),
        ...(formData.testData && { testData: formData.testData }),
      } as TestCase;
      
      // For now, we'll add it to the first test plan or create a default one
      const testPlans = DataService.getTestPlans();
      if (testPlans.length > 0) {
        const firstPlan = testPlans[0];
        firstPlan.testCases = [...(firstPlan.testCases || []), newTestCase];
        DataService.saveTestPlan(firstPlan);
      }
    } else if (viewMode === 'edit' && selectedTestCase) {
      // Update the test case in its parent test plan
      const testPlans = DataService.getTestPlans();
      for (const plan of testPlans) {
        const index = plan.testCases?.findIndex(tc => tc.id === selectedTestCase.id);
        if (index !== undefined && index >= 0) {
          const updatedTestCase: TestCase = {
            ...selectedTestCase,
            title: formData.title,
            description: formData.description,
            steps: formData.steps,
            expectedResult: formData.expectedResult,
            priority: formData.priority,
            ...(formData.blackboardFeature && { blackboardFeature: formData.blackboardFeature }),
            ...(formData.tags && { tags: formData.tags }),
            ...(formData.prerequisites && { prerequisites: formData.prerequisites }),
            ...(formData.testData && { testData: formData.testData }),
          };
          plan.testCases[index] = updatedTestCase;
          DataService.saveTestPlan(plan);
          break;
        }
      }
    }
    loadData();
    setOpen(false);
  };

  const handleDelete = (testCase: TestCase) => {
    if (window.confirm(`Are you sure you want to delete test case "${testCase.title}"?`)) {
      const testPlans = DataService.getTestPlans();
      for (const plan of testPlans) {
        const index = plan.testCases?.findIndex(tc => tc.id === testCase.id);
        if (index !== undefined && index >= 0) {
          plan.testCases.splice(index, 1);
          DataService.saveTestPlan(plan);
          break;
        }
      }
      loadData();
    }
  };

  const addStep = () => {
    const newStep: TestStep = {
      id: `step_${Date.now()}`,
      stepNumber: formData.steps.length + 1,
      action: '',
      expectedResult: '',
    };
    setFormData({
      ...formData,
      steps: [...formData.steps, newStep]
    });
  };

  const updateStep = (index: number, field: keyof TestStep, value: string) => {
    const updatedSteps = [...formData.steps];
    if (field !== 'id' && field !== 'stepNumber') {
      updatedSteps[index] = { ...updatedSteps[index], [field]: value };
    }
    setFormData({ ...formData, steps: updatedSteps });
  };

  const removeStep = (index: number) => {
    const updatedSteps = formData.steps.filter((_, i) => i !== index);
    // Renumber steps
    updatedSteps.forEach((step, i) => {
      step.stepNumber = i + 1;
    });
    setFormData({ ...formData, steps: updatedSteps });
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

  const renderViewMode = (testCase: TestCase) => {
    const fullTestCase = testCase as any; // To access extended properties
    return (
      <Box>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom>{testCase.title}</Typography>
          <Typography variant="body1" paragraph>{testCase.description}</Typography>
          
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={6}>
              <Typography variant="body2"><strong>Priority:</strong> <Chip label={testCase.priority} color={getPriorityColor(testCase.priority) as any} size="small" /></Typography>
            </Grid>
            {fullTestCase.blackboardFeature && (
              <Grid size={6}>
                <Typography variant="body2"><strong>Blackboard Feature:</strong> {fullTestCase.blackboardFeature}</Typography>
              </Grid>
            )}
          </Grid>

          {fullTestCase.prerequisites && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom><strong>Prerequisites:</strong></Typography>
              <Typography variant="body2">{fullTestCase.prerequisites}</Typography>
            </Box>
          )}

          {fullTestCase.testData && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom><strong>Test Data:</strong></Typography>
              <Typography variant="body2">{fullTestCase.testData}</Typography>
            </Box>
          )}
        </Paper>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom color="primary">Test Steps ({testCase.steps?.length || 0})</Typography>
          {(testCase.steps || []).map((step, index) => (
            <Box key={step.id} sx={{ mb: 2, p: 2, backgroundColor: 'background.default', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>Step {step.stepNumber}</Typography>
              <Typography variant="body2" gutterBottom><strong>Action:</strong> {step.action}</Typography>
              <Typography variant="body2"><strong>Expected Result:</strong> {step.expectedResult}</Typography>
            </Box>
          ))}
          {(!testCase.steps || testCase.steps.length === 0) && (
            <Typography variant="body2" color="text.secondary">No steps defined</Typography>
          )}
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom color="primary">Overall Expected Result</Typography>
          <Typography variant="body2">{testCase.expectedResult}</Typography>
        </Paper>
      </Box>
    );
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <div>
          <Typography variant="h4" gutterBottom>
            Test Case Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage all test cases as the single source of truth
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
            Create Test Case
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
                  <TableCell>Description</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Steps</TableCell>
                  <TableCell>Feature</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {testCases.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((testCase) => (
                  <TableRow key={testCase.id}>
                    <TableCell>
                      <Typography variant="subtitle2">{testCase.title}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {testCase.description.length > 100 
                          ? `${testCase.description.substring(0, 100)}...` 
                          : testCase.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={testCase.priority}
                        color={getPriorityColor(testCase.priority) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{testCase.steps?.length || 0}</TableCell>
                    <TableCell>{(testCase as any).blackboardFeature || '-'}</TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <Tooltip title="View Details">
                          <IconButton size="small" onClick={() => handleView(testCase)}>
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => handleEdit(testCase)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" onClick={() => handleDelete(testCase)} color="error">
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            component="div"
            count={testCases.length}
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
          {testCases.length === 0 ? (
            <Grid size={12}>
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No test cases yet
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Create your first test case to get started
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleCreateNew}
                >
                  Create Test Case
                </Button>
              </Paper>
            </Grid>
          ) : (
            testCases.map((testCase) => (
              <Grid size={{ xs: 12, md: 6, lg: 4 }} key={testCase.id}>
                <Card>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        {testCase.title}
                      </Typography>
                      <Box>
                        <Tooltip title="View Details">
                          <IconButton 
                            size="small" 
                            onClick={() => handleView(testCase)}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton 
                            size="small" 
                            onClick={() => handleEdit(testCase)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton 
                            size="small" 
                            onClick={() => handleDelete(testCase)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {testCase.description}
                    </Typography>
                    
                    <Box mt={2} mb={2}>
                      <Chip
                        label={testCase.priority}
                        color={getPriorityColor(testCase.priority) as any}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      {(testCase as any).blackboardFeature && (
                        <Chip
                          label={(testCase as any).blackboardFeature}
                          variant="outlined"
                          size="small"
                        />
                      )}
                    </Box>
                    
                    <Typography variant="body2" gutterBottom>
                      <strong>Steps:</strong> {testCase.steps?.length || 0}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>Expected Result:</strong> {testCase.expectedResult.substring(0, 100)}{testCase.expectedResult.length > 100 ? '...' : ''}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      )}

      <Dialog 
        open={open} 
        onClose={() => setOpen(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          {viewMode === 'create' && 'Create New Test Case'}
          {viewMode === 'edit' && 'Edit Test Case'}
          {viewMode === 'view' && 'Test Case Details'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {viewMode === 'view' ? (
              selectedTestCase && renderViewMode(selectedTestCase)
            ) : (
              <Grid container spacing={3}>
                <Grid size={12}>
                  <TextField
                    label="Test Case Title *"
                    fullWidth
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                    disabled={viewMode === 'view'}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel>Priority</InputLabel>
                    <Select
                      value={formData.priority}
                      label="Priority"
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as TestCase['priority'] })}
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
                  <FormControl fullWidth>
                    <InputLabel>Blackboard Feature</InputLabel>
                    <Select
                      value={formData.blackboardFeature}
                      label="Blackboard Feature"
                      onChange={(e) => setFormData({ ...formData, blackboardFeature: e.target.value as BlackboardFeature })}
                      disabled={viewMode === 'view'}
                    >
                      {blackboardFeatures.map((feature) => (
                        <MenuItem key={feature} value={feature}>{feature}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={12}>
                  <TextField
                    label="Prerequisites"
                    fullWidth
                    multiline
                    rows={2}
                    value={formData.prerequisites}
                    onChange={(e) => setFormData({ ...formData, prerequisites: e.target.value })}
                    disabled={viewMode === 'view'}
                    placeholder="What needs to be set up before running this test?"
                  />
                </Grid>

                <Grid size={12}>
                  <TextField
                    label="Test Data"
                    fullWidth
                    multiline
                    rows={2}
                    value={formData.testData}
                    onChange={(e) => setFormData({ ...formData, testData: e.target.value })}
                    disabled={viewMode === 'view'}
                    placeholder="What test data is needed?"
                  />
                </Grid>

                <Grid size={12}>
                  <Divider sx={{ my: 2 }} />
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">Test Steps</Typography>
                    {viewMode !== 'view' && (
                      <Button
                        startIcon={<AddIcon />}
                        onClick={addStep}
                        variant="outlined"
                        size="small"
                      >
                        Add Step
                      </Button>
                    )}
                  </Box>

                  {formData.steps.map((step, index) => (
                    <Paper key={step.id} sx={{ p: 2, mb: 2, backgroundColor: 'background.default' }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="subtitle2">Step {step.stepNumber}</Typography>
                        {viewMode !== 'view' && (
                          <IconButton 
                            size="small" 
                            onClick={() => removeStep(index)}
                            disabled={formData.steps.length === 0}
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </Box>
                      <Grid container spacing={2}>
                        <Grid size={12}>
                          <TextField
                            label="Action *"
                            fullWidth
                            multiline
                            rows={2}
                            value={step.action}
                            onChange={(e) => updateStep(index, 'action', e.target.value)}
                            disabled={viewMode === 'view'}
                            placeholder="Describe the action to perform"
                          />
                        </Grid>
                        <Grid size={12}>
                          <TextField
                            label="Expected Result *"
                            fullWidth
                            multiline
                            rows={2}
                            value={step.expectedResult}
                            onChange={(e) => updateStep(index, 'expectedResult', e.target.value)}
                            disabled={viewMode === 'view'}
                            placeholder="What should happen after this step?"
                          />
                        </Grid>
                      </Grid>
                    </Paper>
                  ))}

                  {formData.steps.length === 0 && (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                      No steps added yet. Click "Add Step" to create test steps.
                    </Typography>
                  )}
                </Grid>

                <Grid size={12}>
                  <Divider sx={{ my: 2 }} />
                  <TextField
                    label="Overall Expected Result *"
                    fullWidth
                    multiline
                    rows={3}
                    value={formData.expectedResult}
                    onChange={(e) => setFormData({ ...formData, expectedResult: e.target.value })}
                    disabled={viewMode === 'view'}
                    placeholder="What is the overall expected outcome of this test case?"
                  />
                </Grid>
              </Grid>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>
            {viewMode === 'view' ? 'Close' : 'Cancel'}
          </Button>
          {viewMode !== 'view' && (
            <Button onClick={handleSubmit} variant="contained">
              {viewMode === 'create' ? 'Create' : 'Save'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TestCaseManagementView;
