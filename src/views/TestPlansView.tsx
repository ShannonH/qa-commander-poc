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
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ExpandMore,
  Edit as EditIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { TestPlan, TestCategory, BlackboardFeature } from '../types';

const TestPlansView: React.FC = () => {
  const [testPlans, setTestPlans] = useState<TestPlan[]>([
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
  ]);

  const [open, setOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<TestPlan | null>(null);
  const [viewMode, setViewMode] = useState<'create' | 'edit' | 'view'>('create');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    feature: '',
    category: 'Functional' as TestCategory,
    priority: 'Medium' as TestPlan['priority'],
    estimatedHours: 8,
    prerequisites: [''],
    blackboardFeature: 'Course Management' as BlackboardFeature,
    assignee: '',
  });

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
      category: 'Functional',
      priority: 'Medium',
      estimatedHours: 8,
      prerequisites: [''],
      blackboardFeature: 'Course Management',
      assignee: '',
    });
    setOpen(true);
  };

  const handleEdit = (plan: TestPlan) => {
    setViewMode('edit');
    setSelectedPlan(plan);
    setFormData({
      title: plan.title,
      description: plan.description,
      feature: plan.feature,
      category: plan.category,
      priority: plan.priority,
      estimatedHours: plan.estimatedHours,
      prerequisites: plan.prerequisites,
      blackboardFeature: plan.blackboardFeature,
      assignee: plan.assignee || '',
    });
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
      setTestPlans([...testPlans, newTestPlan]);
    } else if (viewMode === 'edit' && selectedPlan) {
      setTestPlans(testPlans.map(plan => 
        plan.id === selectedPlan.id 
          ? { ...plan, ...formData, updatedAt: new Date() }
          : plan
      ));
    }
    setOpen(false);
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
          <Grid item xs={12} md={6} lg={4} key={plan.id}>
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
          {viewMode === 'view' && selectedPlan ? (
            <Box>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h5" gutterBottom>{selectedPlan.title}</Typography>
                <Typography variant="body1" paragraph>{selectedPlan.description}</Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2"><strong>Category:</strong> {selectedPlan.category}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2"><strong>Priority:</strong> {selectedPlan.priority}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2"><strong>Blackboard Feature:</strong> {selectedPlan.blackboardFeature}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2"><strong>Estimated Hours:</strong> {selectedPlan.estimatedHours}h</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2"><strong>Status:</strong> {selectedPlan.status}</Typography>
                  </Grid>
                  {selectedPlan.assignee && (
                    <Grid item xs={6}>
                      <Typography variant="body2"><strong>Assignee:</strong> {selectedPlan.assignee}</Typography>
                    </Grid>
                  )}
                </Grid>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="h6" gutterBottom>Prerequisites</Typography>
                <List dense>
                  {selectedPlan.prerequisites.map((prereq, index) => (
                    <ListItem key={index}>
                      <ListItemText primary={`• ${prereq}`} />
                    </ListItem>
                  ))}
                </List>
                
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Test Cases ({selectedPlan.testCases.length})</Typography>
                {selectedPlan.testCases.map((testCase) => (
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
          ) : (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  label="Title"
                  fullWidth
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  disabled={viewMode === 'view'}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Description"
                  fullWidth
                  multiline
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  disabled={viewMode === 'view'}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Feature"
                  fullWidth
                  value={formData.feature}
                  onChange={(e) => setFormData({ ...formData, feature: e.target.value })}
                  disabled={viewMode === 'view'}
                />
              </Grid>
              <Grid item xs={12} md={6}>
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
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={formData.category}
                    label="Category"
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as TestCategory })}
                    disabled={viewMode === 'view'}
                  >
                    {categories.map((category) => (
                      <MenuItem key={category} value={category}>{category}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
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
              <Grid item xs={12} md={4}>
                <TextField
                  label="Estimated Hours"
                  type="number"
                  fullWidth
                  value={formData.estimatedHours}
                  onChange={(e) => setFormData({ ...formData, estimatedHours: parseInt(e.target.value) || 0 })}
                  disabled={viewMode === 'view'}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Assignee"
                  fullWidth
                  value={formData.assignee}
                  onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                  disabled={viewMode === 'view'}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Prerequisites</Typography>
                {formData.prerequisites.map((prereq, index) => (
                  <Box key={index} display="flex" alignItems="center" gap={1} mb={1}>
                    <TextField
                      fullWidth
                      placeholder="Enter prerequisite"
                      value={prereq}
                      onChange={(e) => updatePrerequisite(index, e.target.value)}
                      disabled={viewMode === 'view'}
                    />
                    {viewMode !== 'view' && (
                      <IconButton 
                        onClick={() => removePrerequisite(index)} 
                        disabled={formData.prerequisites.length === 1}
                        aria-label={`Remove prerequisite ${index + 1}`}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Box>
                ))}
                {viewMode !== 'view' && (
                  <Button onClick={addPrerequisite} size="small">
                    Add Prerequisite
                  </Button>
                )}
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>
            {viewMode === 'view' ? 'Close' : 'Cancel'}
          </Button>
          {viewMode !== 'view' && (
            <Button onClick={handleSubmit} variant="contained">
              {viewMode === 'create' ? 'Create Test Plan' : 'Update Test Plan'}
            </Button>
          )}
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