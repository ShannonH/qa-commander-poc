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
  ToggleButton,
  ToggleButtonGroup,
  TablePagination,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  Add as AddIcon,
  ExpandMore,
  AutoAwesome,
  Build,
  ViewModule as CardViewIcon,
  ViewList as TableViewIcon,
  Visibility as ViewIcon,
  GetApp as ExportIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { UserWorkflow, RiskAnalysisDocument, BlackboardFeature, TestPlan, TestScenario } from '../types';
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
  const [testPlans, setTestPlans] = useState<TestPlan[]>([]);
  const [openWorkflowDialog, setOpenWorkflowDialog] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<UserWorkflow | null>(null);
  const [openDocumentDialog, setOpenDocumentDialog] = useState(false);
  const [openImportDialog, setOpenImportDialog] = useState(false);

  // View mode states for each tab
  const [documentsViewMode, setDocumentsViewMode] = useState<'cards' | 'table'>('cards');
  const [workflowsViewMode, setWorkflowsViewMode] = useState<'cards' | 'table'>('cards');

  // Pagination states
  const [documentsPage, setDocumentsPage] = useState(0);
  const [documentsRowsPerPage, setDocumentsRowsPerPage] = useState(10);
  const [workflowsPage, setWorkflowsPage] = useState(0);
  const [workflowsRowsPerPage, setWorkflowsRowsPerPage] = useState(10);

  // Document view modal states
  const [viewDocumentOpen, setViewDocumentOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<RiskAnalysisDocument | null>(null);

  const [workflowFormData, setWorkflowFormData] = useState({
    workflowName: '',
    description: '',
    userStory: '',
    blackboardFeature: 'Course Management' as BlackboardFeature,
    likelihood: 2,
    impact: 2,
    testingTier: 'Tier 2: HIGH' as UserWorkflow['testingTier'],
    deliverables: 'UI Automation, Exploratory Testing',
    automationReason: '',
  });

  const [documentFormData, setDocumentFormData] = useState({
    title: '',
    description: '',
    selectedWorkflowIds: [] as string[],
  });

  useEffect(() => {
    // Initialize sample data on first load
    DataService.initializeSampleData();
    loadData();
  }, []);

  const loadData = () => {
    setWorkflows(DataService.getUserWorkflows());
    setRiskDocuments(DataService.getRiskDocuments());
    setTestPlans(DataService.getTestPlans());
  };

  const getTestingTierFromRiskScore = (score: number): UserWorkflow['testingTier'] => {
    if (score <= 4) return 'Tier 1: CRITICAL';
    if (score <= 8) return 'Tier 2: HIGH';
    return 'Tier 3: MEDIUM/LOW';
  };

  const getDefaultDeliverables = (tier: UserWorkflow['testingTier']): string => {
    switch (tier) {
      case 'Tier 1: CRITICAL':
        return 'Unit Test, UI Automation, Exploratory Testing';
      case 'Tier 2: HIGH':
        return 'UI Automation, Exploratory Testing';
      case 'Tier 3: MEDIUM/LOW':
        return 'Manual Testing';
      default:
        return 'Manual Testing';
    }
  };

  const handleImportFromTestPlans = () => {
    setOpenImportDialog(true);
  };

  const importTestScenario = (testPlan: TestPlan, scenario: TestScenario) => {
    const riskScore = 2 * 2; // Default values
    const testingTier = getTestingTierFromRiskScore(riskScore);

    const newWorkflow: UserWorkflow = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      workflowName: `${scenario.given} → ${scenario.when} → ${scenario.then}`,
      description: `Imported from test plan: ${testPlan.title}`,
      userStory: `Given ${scenario.given}, when ${scenario.when}, then ${scenario.then}`,
      blackboardFeature: testPlan.blackboardFeature,
      likelihood: 2,
      impact: 2,
      riskScore,
      testingTier,
      deliverables: getDefaultDeliverables(testingTier),
      automationReason: 'Imported from test plan, needs review',
      sourceTestPlanId: testPlan.id,
      sourceScenarioId: scenario.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    DataService.saveUserWorkflow(newWorkflow);
    loadData();
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
      testingTier: 'Tier 2: HIGH',
      deliverables: 'UI Automation, Exploratory Testing',
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
      testingTier: workflow.testingTier,
      deliverables: workflow.deliverables,
      automationReason: workflow.automationReason,
    });
    setOpenWorkflowDialog(true);
  };

  const handleSubmitWorkflow = () => {
    const riskScore = workflowFormData.likelihood * workflowFormData.impact;
    const testingTier = getTestingTierFromRiskScore(riskScore);
    const deliverables = workflowFormData.deliverables || getDefaultDeliverables(testingTier);

    const workflow: UserWorkflow = {
      id: selectedWorkflow?.id || Date.now().toString(),
      ...workflowFormData,
      riskScore,
      testingTier,
      deliverables,
      sourceTestPlanId: selectedWorkflow?.sourceTestPlanId,
      sourceScenarioId: selectedWorkflow?.sourceScenarioId,
      createdAt: selectedWorkflow?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    DataService.saveUserWorkflow(workflow);
    loadData();
    setOpenWorkflowDialog(false);
  };

  const handleCreateDocument = () => {
    setDocumentFormData({ title: '', description: '', selectedWorkflowIds: [] });
    setOpenDocumentDialog(true);
  };

  const handleSubmitDocument = () => {
    const selectedWorkflows = workflows.filter(wf => documentFormData.selectedWorkflowIds.includes(wf.id));
    if (selectedWorkflows.length === 0) return;
    const totalRiskScore = selectedWorkflows.reduce((sum, wf) => sum + wf.riskScore, 0);
    let overallRiskLevel: RiskAnalysisDocument['overallRiskLevel'] = 'Low';
    if (totalRiskScore <= 2) overallRiskLevel = 'Critical';
    else if (totalRiskScore <= 4) overallRiskLevel = 'High';
    else if (totalRiskScore <= 6) overallRiskLevel = 'Medium';
    else overallRiskLevel = 'Low';
    const newDoc: RiskAnalysisDocument = {
      id: Date.now().toString(),
      title: documentFormData.title,
      description: documentFormData.description,
      blackboardFeature: selectedWorkflows[0]?.blackboardFeature || 'Course Management',
      workflows: selectedWorkflows,
      overallRiskLevel,
      totalRiskScore,
      recommendations: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    DataService.saveRiskDocument(newDoc);
    loadData();
    setOpenDocumentDialog(false);
  };

  const handleViewDocument = (document: RiskAnalysisDocument) => {
    setSelectedDocument(document);
    setViewDocumentOpen(true);
  };

  const handleDownloadDocument = (document: RiskAnalysisDocument) => {
    const content = `
Risk Analysis Document Export
============================

Title: ${document.title}
Description: ${document.description}
Feature: ${document.blackboardFeature}
Overall Risk Level: ${document.overallRiskLevel}
Total Risk Score: ${document.totalRiskScore}
Created: ${document.createdAt.toLocaleDateString()}

Workflows Summary:
${document.workflows.map((wf, index) => `
${index + 1}. ${wf.workflowName}
   - Description: ${wf.description}
   - User Story: ${wf.userStory}
   - Risk Score: ${wf.riskScore} (Impact: ${wf.impact}, Likelihood: ${wf.likelihood})
   - Testing Tier: ${wf.testingTier}
   - Deliverables: ${wf.deliverables}
   - Automation Recommendation: ${wf.automationRecommendation || 'N/A'}
`).join('')}

Recommendations:
${document.recommendations}

Export Date: ${new Date().toLocaleString()}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `risk-analysis-${document.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
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

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'success';
      case 'in progress': return 'info';
      case 'review': return 'warning';
      case 'draft': return 'default';
      case 'approved': return 'primary';
      case 'archived': return 'default';
      default: return 'default';
    }
  };

  const getRiskLevelFromScore = (score: number) => {
    if (score <= 2) return { level: 'Critical', color: 'error' };
    if (score <= 4) return { level: 'High', color: 'warning' };
    if (score <= 6) return { level: 'Medium', color: 'info' };
    return { level: 'Low', color: 'success' };
  };

  const getRiskColor = (score: number) => {
    if (score <= 2) return 'error';
    if (score <= 4) return 'warning'; 
    if (score <= 6) return 'info';
    return 'success';
  };

  const groupWorkflowsByScenario = (workflows: UserWorkflow[], testPlans: TestPlan[]) => {
    const grouped: { [scenarioKey: string]: { scenario: TestScenario; workflows: UserWorkflow[] } } = {};
    
    workflows.forEach(workflow => {
      if (workflow.sourceTestPlanId && workflow.sourceScenarioId) {
        const testPlan = testPlans.find(tp => tp.id === workflow.sourceTestPlanId);
        if (testPlan) {
          const scenario = testPlan.testScenarios?.find(ts => ts.id === workflow.sourceScenarioId);
          if (scenario) {
            const key = `${workflow.sourceTestPlanId}-${workflow.sourceScenarioId}`;
            if (!grouped[key]) {
              grouped[key] = { scenario, workflows: [] };
            }
            grouped[key].workflows.push(workflow);
          }
        }
      }
    });
    
    return Object.values(grouped);
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
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)} aria-label="Risk analysis sections">
          <Tab label="Risk Analysis Documents" {...a11yProps(0)} />
          <Tab label="User Workflows" {...a11yProps(1)} />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <ToggleButtonGroup
            value={documentsViewMode}
            exclusive
            onChange={(_, newMode) => newMode && setDocumentsViewMode(newMode)}
            aria-label="documents view mode"
          >
            <ToggleButton value="cards" aria-label="card view">
              <CardViewIcon />
            </ToggleButton>
            <ToggleButton value="table" aria-label="table view">
              <TableViewIcon />
            </ToggleButton>
          </ToggleButtonGroup>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateDocument}>
            Add Risk Analysis Document
          </Button>
        </Box>

        {documentsViewMode === 'table' ? (
          <Box>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Feature</TableCell>
                    <TableCell>Workflows Count</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {riskDocuments.slice(documentsPage * documentsRowsPerPage, documentsPage * documentsRowsPerPage + documentsRowsPerPage).map((document) => (
                    <TableRow key={document.id}>
                      <TableCell>
                        <Box>
                          <Typography variant="subtitle2">{document.title}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {document.description.length > 80
                              ? `${document.description.substring(0, 80)}...`
                              : document.description}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{document.blackboardFeature}</TableCell>
                      <TableCell>{document.workflows.length}</TableCell>
                      <TableCell>{document.createdAt.toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Box display="flex" gap={1}>
                          <Tooltip title="View Details">
                            <IconButton size="small" onClick={() => handleViewDocument(document)}>
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Download">
                            <IconButton size="small" onClick={() => handleDownloadDocument(document)}>
                              <ExportIcon />
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
              count={riskDocuments.length}
              page={documentsPage}
              onPageChange={(_, newPage) => setDocumentsPage(newPage)}
              rowsPerPage={documentsRowsPerPage}
              onRowsPerPageChange={(event) => {
                setDocumentsRowsPerPage(parseInt(event.target.value, 10));
                setDocumentsPage(0);
              }}
            />
          </Box>
        ) : (
          <Box>
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
          </Box>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <ToggleButtonGroup
            value={workflowsViewMode}
            exclusive
            onChange={(_, newMode) => newMode && setWorkflowsViewMode(newMode)}
            aria-label="workflows view mode"
          >
            <ToggleButton value="cards" aria-label="card view">
              <CardViewIcon />
            </ToggleButton>
            <ToggleButton value="table" aria-label="table view">
              <TableViewIcon />
            </ToggleButton>
          </ToggleButtonGroup>
          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleImportFromTestPlans}
            >
              Import from Test Plans
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateWorkflow}
            >
              Add User Workflow
            </Button>
          </Box>
        </Box>

        {workflowsViewMode === 'table' ? (
          <Box>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Workflow Name</TableCell>
                    <TableCell>Feature</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell>Risk Score</TableCell>
                    <TableCell>Testing Tier</TableCell>
                    <TableCell>Automation</TableCell>
                    <TableCell>Updated</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {workflows.slice(workflowsPage * workflowsRowsPerPage, workflowsPage * workflowsRowsPerPage + workflowsRowsPerPage).map((workflow) => {
                    const riskLevel = getRiskLevelFromScore(workflow.riskScore);
                    const automationStatus = getAutomationRecommendation(workflow.riskScore);

                    return (
                      <TableRow key={workflow.id}>
                        <TableCell>
                          <Box>
                            <Typography variant="subtitle2">{workflow.workflowName}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {workflow.description.length > 60
                                ? `${workflow.description.substring(0, 60)}...`
                                : workflow.description}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{workflow.blackboardFeature}</TableCell>
                        <TableCell>
                          <Chip
                            label={riskLevel.level}
                            color={riskLevel.color as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
                            {workflow.riskScore}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={workflow.testingTier}
                            color={workflow.testingTier.includes('CRITICAL') ? 'error' : workflow.testingTier.includes('HIGH') ? 'warning' : 'info'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            {getAutomationIcon(workflow.riskScore)}
                            <Typography variant="body2">{automationStatus}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{workflow.updatedAt.toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Tooltip title="Edit Workflow">
                            <Button size="small" onClick={() => handleEditWorkflow(workflow)}>
                              Edit
                            </Button>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={workflows.length}
              page={workflowsPage}
              onPageChange={(_, newPage) => setWorkflowsPage(newPage)}
              rowsPerPage={workflowsRowsPerPage}
              onRowsPerPageChange={(event) => {
                setWorkflowsRowsPerPage(parseInt(event.target.value, 10));
                setWorkflowsPage(0);
              }}
            />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {workflows.map((workflow) => {
            const riskLevel = getRiskLevelFromScore(workflow.riskScore);
            const automationStatus = getAutomationRecommendation(workflow.riskScore);
            return (
              <Grid size={{ xs: 12, md: 6, lg: 4 }} key={workflow.id}>
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
                        sx={{ mr: 1, mb: 1 }}
                      />
                      <Chip
                        label={workflow.testingTier}
                        color={workflow.testingTier.includes('CRITICAL') ? 'error' : workflow.testingTier.includes('HIGH') ? 'warning' : 'info'}
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
                      <strong>Deliverables:</strong> {workflow.deliverables}
                    </Typography>
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
        )}
      </TabPanel>

      <Dialog open={openWorkflowDialog} onClose={() => setOpenWorkflowDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedWorkflow ? 'Edit User Workflow' : 'Create New User Workflow'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={12}>
              <TextField
                label="Workflow Name"
                fullWidth
                value={workflowFormData.workflowName}
                onChange={(e) => setWorkflowFormData({ ...workflowFormData, workflowName: e.target.value })}
                placeholder="e.g., Student Login to Course"
              />
            </Grid>
            <Grid size={12}>
              <TextField
                label="User Story"
                fullWidth
                value={workflowFormData.userStory}
                onChange={(e) => setWorkflowFormData({ ...workflowFormData, userStory: e.target.value })}
                placeholder="As a [user], I want to [action] so that [benefit]"
              />
            </Grid>
            <Grid size={12}>
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
            <Grid size={{ xs: 12, md: 6 }}>
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
            <Grid size={{ xs: 12, md: 6 }}>
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
            <Grid size={{ xs: 12, md: 6 }}>
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
            <Grid size={12}>
              <Box sx={{ p: 2, backgroundColor: 'background.paper', borderRadius: 1, border: 1, borderColor: 'divider' }}>
                <Typography variant="h6" gutterBottom>
                  Risk Score: {workflowFormData.likelihood * workflowFormData.impact}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Risk Level: {getRiskLevelFromScore(workflowFormData.likelihood * workflowFormData.impact).level}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Testing Tier: {getTestingTierFromRiskScore(workflowFormData.likelihood * workflowFormData.impact)}
                </Typography>
                <Typography variant="body2" color={getAutomationColor(workflowFormData.likelihood * workflowFormData.impact)}>
                  {getAutomationRecommendation(workflowFormData.likelihood * workflowFormData.impact) === 'Automate'
                    ? 'Score 1-6: Automate'
                    : 'Score 7-16: Manual Only'}
                </Typography>
              </Box>
            </Grid>
            <Grid size={12}>
              <TextField
                label="Required Deliverables"
                fullWidth
                multiline
                rows={2}
                value={workflowFormData.deliverables}
                onChange={(e) => setWorkflowFormData({ ...workflowFormData, deliverables: e.target.value })}
                placeholder="e.g., Unit Test, UI Automation, Exploratory Testing"
                helperText="Specify the testing deliverables required for this workflow"
              />
            </Grid>
            <Grid size={12}>
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

      <Dialog open={openDocumentDialog} onClose={() => setOpenDocumentDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Risk Analysis Document</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={12}>
              <TextField
                label="Title"
                fullWidth
                value={documentFormData.title}
                onChange={e => setDocumentFormData({ ...documentFormData, title: e.target.value })}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={2}
                value={documentFormData.description}
                onChange={e => setDocumentFormData({ ...documentFormData, description: e.target.value })}
              />
            </Grid>
            <Grid size={12}>
              <Typography gutterBottom>Select Workflows to Include</Typography>
              <Box sx={{ maxHeight: 200, overflowY: 'auto', border: 1, borderColor: 'divider', borderRadius: 1, p: 1 }}>
                {workflows.length === 0 && <Typography color="text.secondary">No workflows available.</Typography>}
                {workflows.map(wf => (
                  <Box key={wf.id} display="flex" alignItems="center" mb={1}>
                    <input
                      type="checkbox"
                      checked={documentFormData.selectedWorkflowIds.includes(wf.id)}
                      onChange={e => {
                        const checked = e.target.checked;
                        setDocumentFormData(prev => ({
                          ...prev,
                          selectedWorkflowIds: checked
                            ? [...prev.selectedWorkflowIds, wf.id]
                            : prev.selectedWorkflowIds.filter(id => id !== wf.id)
                        }));
                      }}
                      id={`workflow-checkbox-${wf.id}`}
                    />
                    <label htmlFor={`workflow-checkbox-${wf.id}`} style={{ marginLeft: 8 }}>
                      {wf.workflowName} (Risk: {wf.riskScore})
                    </label>
                  </Box>
                ))}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDocumentDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmitDocument} variant="contained" disabled={!documentFormData.title || documentFormData.selectedWorkflowIds.length === 0}>
            Create Document
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openImportDialog} onClose={() => setOpenImportDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Import Test Scenarios from Test Plans</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Select test scenarios from existing test plans to create risk analysis workflows
          </Typography>
          <Box sx={{ maxHeight: 400, overflowY: 'auto', mt: 2 }}>
            {testPlans.map((testPlan) => (
              <Accordion key={testPlan.id}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="h6">{testPlan.title} ({testPlan.testScenarios.length} scenarios)</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {testPlan.testScenarios.map((scenario) => (
                    <Paper key={scenario.id} sx={{ p: 2, mb: 2, backgroundColor: 'background.default' }}>
                      <Typography variant="body2" gutterBottom><strong>Given:</strong> {scenario.given}</Typography>
                      <Typography variant="body2" gutterBottom><strong>When:</strong> {scenario.when}</Typography>
                      <Typography variant="body2" gutterBottom><strong>Then:</strong> {scenario.then}</Typography>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                        <Chip label={scenario.priority} size="small" />
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => importTestScenario(testPlan, scenario)}
                        >
                          Import as Workflow
                        </Button>
                      </Box>
                    </Paper>
                  ))}
                  {testPlan.testScenarios.length === 0 && (
                    <Typography color="text.secondary">No test scenarios defined for this test plan.</Typography>
                  )}
                </AccordionDetails>
              </Accordion>
            ))}
            {testPlans.length === 0 && (
              <Typography color="text.secondary">No test plans available. Create test plans first to import scenarios.</Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenImportDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Elegant Document View Modal */}
      <Dialog 
        open={viewDocumentOpen} 
        onClose={() => setViewDocumentOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box>
            <Typography variant="h5" component="div" gutterBottom>
              {selectedDocument?.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedDocument?.description}
            </Typography>
            <Box display="flex" gap={2} mt={2}>
              <Chip 
                label={selectedDocument?.blackboardFeature} 
                variant="outlined" 
                size="small" 
              />
              <Chip 
                label={selectedDocument?.overallRiskLevel} 
                color={getRiskColor(selectedDocument?.totalRiskScore || 0)} 
                size="small" 
              />
              <Chip 
                label={`Risk Score: ${selectedDocument?.totalRiskScore}`} 
                variant="outlined" 
                size="small" 
              />
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ maxHeight: '70vh' }}>
          {selectedDocument && (
            <Box>
              <Typography variant="body1" paragraph>
                <strong>Created:</strong> {selectedDocument.createdAt.toLocaleDateString()}
              </Typography>
              
              {groupWorkflowsByScenario(selectedDocument.workflows, testPlans).map((group, index) => (
                <Accordion key={index} defaultExpanded sx={{ mb: 3 }}>
                  <AccordionSummary 
                    expandIcon={<ExpandMore />}
                    sx={{ 
                      bgcolor: 'grey.50',
                      '&:hover': {
                        bgcolor: 'grey.100',
                      },
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                      <strong>GIVEN</strong> {group.scenario.given} <strong>WHEN</strong> {group.scenario.when} <strong>THEN</strong> {group.scenario.then}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ p: 0 }}>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ bgcolor: 'grey.50' }}>
                            <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                              Acceptance Criteria
                            </TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                              Likelihood
                            </TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                              Impact
                            </TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                              Risk Factor
                            </TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                              Testing Tier
                            </TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                              Testing Types
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {group.workflows.map((workflow) => (
                            <TableRow key={workflow.id} sx={{ '&:nth-of-type(even)': { bgcolor: 'grey.25' } }}>
                              <TableCell>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {workflow.description}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                <Chip 
                                  label={workflow.likelihood === 1 ? 'Low' : workflow.likelihood === 2 ? 'Medium' : workflow.likelihood === 3 ? 'High' : 'Critical'} 
                                  color={workflow.likelihood <= 2 ? 'success' : workflow.likelihood === 3 ? 'warning' : 'error'}
                                  size="small"
                                  variant="outlined"
                                />
                              </TableCell>
                              <TableCell align="center">
                                <Chip 
                                  label={workflow.impact === 1 ? 'Low' : workflow.impact === 2 ? 'Medium' : workflow.impact === 3 ? 'High' : 'Critical'} 
                                  color={workflow.impact <= 2 ? 'success' : workflow.impact === 3 ? 'warning' : 'error'}
                                  size="small"
                                  variant="outlined"
                                />
                              </TableCell>
                              <TableCell align="center">
                                <Chip 
                                  label={workflow.riskScore} 
                                  color={workflow.riskScore <= 2 ? 'success' : workflow.riskScore <= 6 ? 'warning' : 'error'}
                                  size="small"
                                  sx={{ fontWeight: 'bold', minWidth: '40px' }}
                                />
                              </TableCell>
                              <TableCell align="center">
                                <Chip 
                                  label={workflow.testingTier.includes('1') ? 'Unit' : workflow.testingTier.includes('2') ? 'Integration' : 'E2E'} 
                                  color={
                                    workflow.testingTier.includes('CRITICAL') ? 'error' :
                                    workflow.testingTier.includes('HIGH') ? 'warning' : 'info'
                                  }
                                  size="small"
                                />
                              </TableCell>
                              <TableCell align="center">
                                <Box display="flex" flexWrap="wrap" gap={0.5} justifyContent="center">
                                  {workflow.riskScore <= 2 && (
                                    <>
                                      <Chip label="Functional" size="small" variant="outlined" />
                                      <Chip label="Security" size="small" variant="outlined" />
                                    </>
                                  )}
                                  {workflow.riskScore <= 6 && workflow.riskScore > 2 && (
                                    <>
                                      <Chip label="Performance" size="small" variant="outlined" />
                                      <Chip label="Functional" size="small" variant="outlined" />
                                    </>
                                  )}
                                  {workflow.riskScore > 6 && (
                                    <>
                                      <Chip label="Accessibility" size="small" variant="outlined" />
                                      <Chip label="Functional" size="small" variant="outlined" />
                                    </>
                                  )}
                                </Box>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </AccordionDetails>
                </Accordion>
              ))}
              
              {selectedDocument.recommendations && (
                <Box mt={3}>
                  <Typography variant="h6" gutterBottom>
                    Recommendations
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    bgcolor: 'grey.50', 
                    p: 2, 
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'grey.200'
                  }}>
                    {selectedDocument.recommendations}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDocumentOpen(false)}>
            Close
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
