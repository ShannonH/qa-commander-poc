import React, { useState, useEffect } from 'react';
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
  Rating,
  Fab,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  ExpandMore,
  AutoAwesome,
  Build,
} from '@mui/icons-material';
import { UserWorkflow, RiskAnalysisDocument, BlackboardFeature } from '../types';
import { DataService } from '../utils/dataService';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const RiskAnalysisView: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [workflows, setWorkflows] = useState<UserWorkflow[]>([]);
  const [riskDocuments, setRiskDocuments] = useState<RiskAnalysisDocument[]>([]);
  const [openWorkflowDialog, setOpenWorkflowDialog] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<UserWorkflow | null>(null);

  const [workflowFormData, setWorkflowFormData] = useState({
    workflowName: '',
    description: '',
    userStory: '',
    blackboardFeature: 'Course Management' as BlackboardFeature,
    likelihood: 2,
    impact: 2,
    automationReason: '',
  });

  useEffect(() => {
    // Initialize sample data on first load
    DataService.initializeSampleData();
    loadData();
  }, []);

  const loadData = () => {
    setWorkflows(DataService.getUserWorkflows());
    setRiskDocuments(DataService.getRiskDocuments());
  };

  const handleCreateWorkflow = () => {
    setSelectedWorkflow(null);
    setWorkflowFormData({
      workflowName: '',
      description: '',
      userStory: '',
      blackboardFeature: 'Course Management',
      likelihood: 2,
      impact: 2,
      automationReason: '',
    });
    setOpenWorkflowDialog(true);
  };

  const handleEditWorkflow = (workflow: UserWorkflow) => {
    setSelectedWorkflow(workflow);
    setWorkflowFormData({
      workflowName: workflow.workflowName,
      description: workflow.description,
      userStory: workflow.userStory,
      blackboardFeature: workflow.blackboardFeature,
      likelihood: workflow.likelihood,
      impact: workflow.impact,
      automationReason: workflow.automationReason,
    });
    setOpenWorkflowDialog(true);
  };

  const handleSubmitWorkflow = () => {
    const riskScore = workflowFormData.likelihood * workflowFormData.impact;

    const workflow: UserWorkflow = {
      id: selectedWorkflow?.id || Date.now().toString(),
      ...workflowFormData,
      riskScore,
      createdAt: selectedWorkflow?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    DataService.saveUserWorkflow(workflow);
    loadData();
    setOpenWorkflowDialog(false);
  };

  const getAutomationRecommendation = (score: number) => {
    return score >= 1 && score <= 6 ? 'Automate' : 'Manual Only';
  };

  const getAutomationIcon = (score: number) => {
    return score >= 1 && score <= 6 ? <AutoAwesome color="primary" /> : <Build color="secondary" />;
  };

  const getAutomationColor = (score: number) => {
    return score >= 1 && score <= 6 ? 'primary' : 'secondary';
  };

  const getRiskLevelFromScore = (score: number) => {
    if (score <= 2) return { level: 'Critical', color: 'error' };
    if (score <= 4) return { level: 'High', color: 'warning' };
    if (score <= 6) return { level: 'Medium', color: 'info' };
    return { level: 'Low', color: 'success' };
  };

  const blackboardFeatures: BlackboardFeature[] = [
    'Course Management', 'Gradebook', 'Discussion Forums', 'Assignments',
    'Content Areas', 'Announcements', 'Calendar', 'Messages', 'Group Management',
    'Assessment Tools', 'Rubrics', 'SafeAssign', 'Attendance', 'Grade Center',
    'Ultra Course View', 'Original Course View', 'Mobile App', 'Integration Tools',
    'Reports', 'System Administration'
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <div>
          <Typography variant="h4" gutterBottom>
            Risk Analysis
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Analyze user workflows to determine UI test automation strategy
          </Typography>
        </div>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateWorkflow}
        >
          Add User Workflow
        </Button>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)} aria-label="Risk analysis sections">
          <Tab label="User Workflows" {...a11yProps(0)} />
          <Tab label="Risk Analysis Documents" {...a11yProps(1)} />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          {workflows.map((workflow) => {
            const riskLevel = getRiskLevelFromScore(workflow.riskScore);
            const automationStatus = getAutomationRecommendation(workflow.riskScore);
            return (
              <Grid item xs={12} md={6} lg={4} key={workflow.id}>
                <Card>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        {workflow.workflowName}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1}>
                        {getAutomationIcon(workflow.riskScore)}
                        <Chip
                          label={automationStatus}
                          color={getAutomationColor(workflow.riskScore) as any}
                          size="small"
                        />
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {workflow.userStory}
                    </Typography>
                    <Box mt={2} mb={2}>
                      <Chip
                        label={workflow.blackboardFeature}
                        variant="outlined"
                        size="small"
                        sx={{ mr: 1, mb: 1 }}
                      />
                      <Chip
                        label={`Risk: ${riskLevel.level} (${workflow.riskScore})`}
                        color={riskLevel.color as any}
                        size="small"
                        sx={{ mb: 1 }}
                      />
                    </Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Box>
                        <Typography variant="body2" gutterBottom>
                          <strong>Likelihood:</strong> {workflow.likelihood}/4 (1 = Most Likely)
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          <strong>Impact:</strong> {workflow.impact}/4 (1 = Most Impactful)
                        </Typography>
                      </Box>
                      <Rating value={workflow.riskScore / 4} readOnly size="small" max={4} />
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>Automation Rule:</strong> {automationStatus === 'Automate' ? 'Score 1-6: Automate' : 'Score 7-16: Manual Only'}
                    </Typography>
                    {workflow.automationReason && (
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        <strong>Reasoning:</strong> {workflow.automationReason}
                      </Typography>
                    )}
                    <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                      <Typography variant="caption" color="text.secondary">
                        Updated: {workflow.updatedAt.toLocaleDateString()}
                      </Typography>
                      <Button size="small" onClick={() => handleEditWorkflow(workflow)}>
                        Edit
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {riskDocuments.map((document) => (
          <Accordion key={document.id}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
                <Typography variant="h6">{document.title}</Typography>
                <Chip
                  label={`${document.overallRiskLevel} Risk`}
                  color={getRiskLevelFromScore(document.totalRiskScore).color as any}
                  size="small"
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Typography paragraph>{document.description}</Typography>

              <Typography variant="h6" gutterBottom>
                Workflow Analysis ({document.workflows.length} workflows)
              </Typography>

              <TableContainer component={Paper} sx={{ mb: 3 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Workflow</TableCell>
                      <TableCell align="center">Likelihood</TableCell>
                      <TableCell align="center">Impact</TableCell>
                      <TableCell align="center">Risk Score</TableCell>
                      <TableCell align="center">Decision</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {document.workflows.map((workflow) => (
                      <TableRow key={workflow.id}>
                        <TableCell>{workflow.workflowName}</TableCell>
                        <TableCell align="center">{workflow.likelihood}</TableCell>
                        <TableCell align="center">{workflow.impact}</TableCell>
                        <TableCell align="center">
                          <Chip
                            label={workflow.riskScore}
                            color={getRiskLevelFromScore(workflow.riskScore).color as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                            {getAutomationIcon(workflow.riskScore)}
                            {getAutomationRecommendation(workflow.riskScore)}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Typography variant="h6" gutterBottom>
                Recommendations
              </Typography>
              <Typography>{document.recommendations}</Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </TabPanel>

      <Dialog open={openWorkflowDialog} onClose={() => setOpenWorkflowDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedWorkflow ? 'Edit User Workflow' : 'Create New User Workflow'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Workflow Name"
                fullWidth
                value={workflowFormData.workflowName}
                onChange={(e) => setWorkflowFormData({ ...workflowFormData, workflowName: e.target.value })}
                placeholder="e.g., Student Login to Course"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="User Story"
                fullWidth
                value={workflowFormData.userStory}
                onChange={(e) => setWorkflowFormData({ ...workflowFormData, userStory: e.target.value })}
                placeholder="As a [user], I want to [action] so that [benefit]"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={3}
                value={workflowFormData.description}
                onChange={(e) => setWorkflowFormData({ ...workflowFormData, description: e.target.value })}
                placeholder="Detailed description of the workflow steps"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Blackboard Feature</InputLabel>
                <Select
                  value={workflowFormData.blackboardFeature}
                  label="Blackboard Feature"
                  onChange={(e) => setWorkflowFormData({ ...workflowFormData, blackboardFeature: e.target.value as BlackboardFeature })}
                >
                  {blackboardFeatures.map((feature) => (
                    <MenuItem key={feature} value={feature}>{feature}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography gutterBottom>Likelihood of Failure (1-4, 1=Most Likely)</Typography>
              <Rating
                value={workflowFormData.likelihood}
                onChange={(_, value) => setWorkflowFormData({ ...workflowFormData, likelihood: value || 1 })}
                max={4}
              />
              <Typography variant="caption" color="text.secondary">
                How likely is this workflow to fail? (1=Most Likely, 4=Very Unlikely)
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography gutterBottom>Impact if Failure (1-4, 1=Most Impactful)</Typography>
              <Rating
                value={workflowFormData.impact}
                onChange={(_, value) => setWorkflowFormData({ ...workflowFormData, impact: value || 1 })}
                max={4}
              />
              <Typography variant="caption" color="text.secondary">
                How severe would a failure be? (1=Most Impactful, 4=Minimal Impact)
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ p: 2, backgroundColor: 'background.paper', borderRadius: 1, border: 1, borderColor: 'divider' }}>
                <Typography variant="h6" gutterBottom>
                  Risk Score: {workflowFormData.likelihood * workflowFormData.impact}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Risk Level: {getRiskLevelFromScore(workflowFormData.likelihood * workflowFormData.impact).level}
                </Typography>
                <Typography variant="body2" color={getAutomationColor(workflowFormData.likelihood * workflowFormData.impact)}>
                  {getAutomationRecommendation(workflowFormData.likelihood * workflowFormData.impact) === 'Automate'
                    ? 'Score 1-6: Automate'
                    : 'Score 7-16: Manual Only'}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Automation Reasoning"
                fullWidth
                multiline
                rows={3}
                value={workflowFormData.automationReason}
                onChange={(e) => setWorkflowFormData({ ...workflowFormData, automationReason: e.target.value })}
                placeholder="Explain the rationale for the automation recommendation (optional)"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenWorkflowDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmitWorkflow} variant="contained">
            {selectedWorkflow ? 'Update Workflow' : 'Create Workflow'}
          </Button>
        </DialogActions>
      </Dialog>

      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16, display: { md: 'none' } }}
        onClick={handleCreateWorkflow}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default RiskAnalysisView;
