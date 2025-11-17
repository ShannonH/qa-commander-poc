import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
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
  Slider,
  Fab,
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
  InputAdornment,
  Link,
  Checkbox,
  FormControlLabel,
  Alert,
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
  Search as SearchIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Block as BlockIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import {
  UserWorkflow,
  RiskAnalysisDocument,
  BlackboardFeature,
  TestPlan,
  TestScenario,
} from '../types';
import Fuse from 'fuse.js';
import { DataService } from '../utils/dataService';

// Helper function to generate ADO work item URL from User Story ID
const getAdoUrl = (userStoryId: string): string => {
  // Extract the numeric part from the User Story ID (e.g., "AB#1234567" -> "1234567")
  const match = userStoryId.match(/^AB#(\d{7})$/);
  if (match) {
    return `https://dev.azure.com/AnthologyInc-01/Learn/_workitems/edit/${match[1]}`;
  }
  return '';
};

const RiskAnalysisView: React.FC = () => {
  const [workflows, setWorkflows] = useState<UserWorkflow[]>([]);
  const [riskDocuments, setRiskDocuments] = useState<RiskAnalysisDocument[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<RiskAnalysisDocument[]>([]);
  const [testPlans, setTestPlans] = useState<TestPlan[]>([]);
  const [openWorkflowDialog, setOpenWorkflowDialog] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<UserWorkflow | null>(null);
  const [openDocumentDialog, setOpenDocumentDialog] = useState(false);
  const [openImportDialog, setOpenImportDialog] = useState(false);

  // Search states
  const [documentSearchQuery, setDocumentSearchQuery] = useState('');

  // View mode states for each tab
  const [documentsViewMode, setDocumentsViewMode] = useState<'cards' | 'table'>('cards');

  // Pagination states
  const [documentsPage, setDocumentsPage] = useState(0);
  const [documentsRowsPerPage, setDocumentsRowsPerPage] = useState(10);

  // Document view modal states
  const [viewDocumentOpen, setViewDocumentOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<RiskAnalysisDocument | null>(null);
  const [editingWorkflowId, setEditingWorkflowId] = useState<string | null>(null);
  const [editingWorkflowData, setEditingWorkflowData] = useState<{
    impact: number;
    likelihood: number;
  } | null>(null);
  const [editingStoryNameId, setEditingStoryNameId] = useState<string | null>(null);
  const [editingStoryNameValue, setEditingStoryNameValue] = useState<string>('');

  const [workflowFormData, setWorkflowFormData] = useState({
    userStoryId: '', // User Story ID
    workflowName: '',
    description: '',
    riskStatement: '',
    businessImpact: '',
    blackboardFeature: 'Course Management' as BlackboardFeature,
    likelihood: 2,
    impact: 2,
    testingTier: 'Tier 2: HIGH' as UserWorkflow['testingTier'],
    deliverables: 'UI Automation, Exploratory Testing',
    automationRationale: '',
    isNonAutomatable: false,
    nonAutomatableReason: '',
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

  useEffect(() => {
    // Apply document search
    if (documentSearchQuery.trim()) {
      const fuse = new Fuse(riskDocuments, {
        keys: ['title', 'description', 'blackboardFeature', 'recommendations'],
        threshold: 0.3,
      });
      const results = fuse.search(documentSearchQuery);
      setFilteredDocuments(results.map(result => result.item));
    } else {
      setFilteredDocuments(riskDocuments);
    }
    setDocumentsPage(0);
  }, [documentSearchQuery, riskDocuments]);

  const loadData = () => {
    const wf = DataService.getUserWorkflows();
    const rd = DataService.getRiskDocuments();
    const tp = DataService.getTestPlans();

    setWorkflows(wf);
    setRiskDocuments(rd);
    setFilteredDocuments(rd);
    setTestPlans(tp);
  };

  const getTestingTierFromRiskScore = (score: number): UserWorkflow['testingTier'] => {
    if (score <= 4) return 'Tier 1: CRITICAL';
    if (score <= 8) return 'Tier 2: HIGH';
    return 'Tier 3: STANDARD';
  };

  const getDefaultDeliverables = (tier: UserWorkflow['testingTier']): string => {
    switch (tier) {
      case 'Tier 1: CRITICAL':
        return 'Unit Test, UI Automation (UIA), Exploratory Testing (ET), TCM Test Case';
      case 'Tier 2: HIGH':
        return 'Unit Test (recommended), UI Automation (UIA), Exploratory Testing (ET), TCM Test Case';
      case 'Tier 3: STANDARD':
        return 'Unit Test (encouraged), Manual Golden Path, Exploratory Testing (optional)';
      default:
        return 'Manual Testing';
    }
  };

  const importTestScenario = (testPlan: TestPlan, scenario: TestScenario) => {
    const riskScore = 2 * 2; // Default values
    const testingTier = getTestingTierFromRiskScore(riskScore);

    const newWorkflow: UserWorkflow = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      workflowName: `${scenario.given} → ${scenario.when} → ${scenario.then}`,
      description: `Imported from test plan: ${testPlan.title}`,
      userStoryId: scenario.userStoryId || '', // Link to User Story ID
      blackboardFeature: testPlan.blackboardFeature,
      riskStatement: 'Imported from test plan - requires risk assessment',
      businessImpact: 'Imported from test plan - requires impact assessment',
      likelihood: 2,
      impact: 2,
      riskScore,
      testingTier,
      deliverables: getDefaultDeliverables(testingTier),
      automationRecommendation: riskScore <= 6 ? 'Automate' : 'Manual Only',
      automationRationale: 'Imported from test plan, needs review',
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
      userStoryId: '',
      workflowName: '',
      description: '',
      riskStatement: '',
      businessImpact: '',
      blackboardFeature: 'Course Management',
      likelihood: 2,
      impact: 2,
      testingTier: 'Tier 2: HIGH',
      deliverables: 'UI Automation, Exploratory Testing',
      automationRationale: '',
      isNonAutomatable: false,
      nonAutomatableReason: '',
    });
    setOpenWorkflowDialog(true);
  };

  const handleEditWorkflow = (workflow: UserWorkflow) => {
    setSelectedWorkflow(workflow);
    setWorkflowFormData({
      userStoryId: workflow.userStoryId,
      workflowName: workflow.workflowName,
      description: workflow.description,
      riskStatement: workflow.riskStatement,
      businessImpact: workflow.businessImpact,
      blackboardFeature: workflow.blackboardFeature,
      likelihood: workflow.likelihood,
      impact: workflow.impact,
      testingTier: workflow.testingTier,
      deliverables: workflow.deliverables,
      automationRationale: workflow.automationRationale,
      isNonAutomatable: workflow.isNonAutomatable || false,
      nonAutomatableReason: workflow.nonAutomatableReason || '',
    });
    setOpenWorkflowDialog(true);
  };

  const handleSubmitWorkflow = () => {
    const riskScore = workflowFormData.likelihood * workflowFormData.impact;
    const testingTier = getTestingTierFromRiskScore(riskScore);
    const deliverables = workflowFormData.deliverables || getDefaultDeliverables(testingTier);
    const automationRecommendation = riskScore <= 6 ? 'Automate' : 'Manual Only';

    const workflow: UserWorkflow = {
      id: selectedWorkflow?.id || Date.now().toString(),
      userStoryId: workflowFormData.userStoryId,
      workflowName: workflowFormData.workflowName,
      description: workflowFormData.description,
      riskStatement: workflowFormData.riskStatement,
      businessImpact: workflowFormData.businessImpact,
      blackboardFeature: workflowFormData.blackboardFeature,
      likelihood: workflowFormData.likelihood,
      impact: workflowFormData.impact,
      riskScore,
      testingTier,
      deliverables,
      automationRecommendation,
      automationRationale: workflowFormData.automationRationale,
      isNonAutomatable: workflowFormData.isNonAutomatable,
      nonAutomatableReason: workflowFormData.nonAutomatableReason,
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
    const selectedWorkflows = workflows.filter(wf =>
      documentFormData.selectedWorkflowIds.includes(wf.id)
    );
    if (selectedWorkflows.length === 0) return;
    const totalRiskScore = selectedWorkflows.reduce((sum, wf) => sum + wf.riskScore, 0);
    let overallRiskLevel: RiskAnalysisDocument['overallRiskLevel'];
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

  const handleDownloadDocument = (doc: RiskAnalysisDocument) => {
    const content = `
Risk Analysis Document Export
============================

Title: ${doc.title}
Description: ${doc.description}
Feature: ${doc.blackboardFeature}
Overall Risk Level: ${doc.overallRiskLevel}
Total Risk Score: ${doc.totalRiskScore}
Created: ${doc.createdAt.toLocaleDateString()}

Workflows Summary:
${doc.workflows
  .map(
    (wf, index) => `
${index + 1}. ${wf.workflowName}
   - Description: ${wf.description}
   - Risk Statement: ${wf.riskStatement}
   - Business Impact: ${wf.businessImpact}
   - Risk Score: ${wf.riskScore} (Impact: ${wf.impact}, Likelihood: ${wf.likelihood})
   - Testing Tier: ${wf.testingTier}
   - Deliverables: ${wf.deliverables}
   - Automation: ${wf.isNonAutomatable ? 'Manual Only (Cannot Automate)' : wf.automationRecommendation}
   - Rationale: ${wf.automationRationale || 'N/A'}${wf.isNonAutomatable ? `\n   - Non-Automatable Reason: ${wf.nonAutomatableReason || 'N/A'}` : ''}
`
  )
  .join('')}

Recommendations:
${doc.recommendations}

Export Date: ${new Date().toLocaleString()}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = `risk-analysis-${doc.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.txt`;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleDeleteDocument = (documentId: string) => {
    if (window.confirm('Are you sure you want to delete this risk analysis document?')) {
      DataService.deleteRiskDocument(documentId);
      loadData();
    }
  };

  const handleStartEditingWorkflow = (workflow: UserWorkflow) => {
    setEditingWorkflowId(workflow.id);
    setEditingWorkflowData({
      impact: workflow.impact,
      likelihood: workflow.likelihood,
    });
  };

  const handleCancelEditingWorkflow = () => {
    setEditingWorkflowId(null);
    setEditingWorkflowData(null);
  };

  const handleSaveWorkflowRiskFactors = (workflow: UserWorkflow) => {
    if (!editingWorkflowData || !selectedDocument) return;

    const riskScore = editingWorkflowData.likelihood * editingWorkflowData.impact;
    const testingTier = getTestingTierFromRiskScore(riskScore);
    const deliverables = getDefaultDeliverables(testingTier);

    const updatedWorkflow: UserWorkflow = {
      ...workflow,
      impact: editingWorkflowData.impact,
      likelihood: editingWorkflowData.likelihood,
      riskScore,
      testingTier,
      deliverables,
      updatedAt: new Date(),
    };

    // Update the workflow in the current document
    const updatedWorkflows = selectedDocument.workflows.map(wf =>
      wf.id === workflow.id ? updatedWorkflow : wf
    );

    // Recalculate document-level risk metrics
    const totalRiskScore = updatedWorkflows.reduce((sum, wf) => sum + wf.riskScore, 0);
    const avgRiskScore = totalRiskScore / updatedWorkflows.length;
    const overallRiskLevel =
      avgRiskScore <= 2
        ? 'Critical'
        : avgRiskScore <= 4
          ? 'High'
          : avgRiskScore <= 6
            ? 'Medium'
            : 'Low';

    const updatedDocument: RiskAnalysisDocument = {
      ...selectedDocument,
      workflows: updatedWorkflows,
      totalRiskScore,
      overallRiskLevel: overallRiskLevel as 'Low' | 'Medium' | 'High' | 'Critical',
      updatedAt: new Date(),
    };

    // Save the updated document
    DataService.saveRiskDocument(updatedDocument);

    // Also update the workflow globally and sync to other documents
    DataService.saveUserWorkflow(updatedWorkflow);

    // Update the selected document in state
    setSelectedDocument(updatedDocument);

    setEditingWorkflowId(null);
    setEditingWorkflowData(null);
    loadData();
  };

  const handleStartEditingStoryName = (userStoryId: string) => {
    setEditingStoryNameId(userStoryId);
    setEditingStoryNameValue(selectedDocument?.userStoryNames?.[userStoryId] || '');
  };

  const handleSaveStoryName = () => {
    if (!selectedDocument || !editingStoryNameId) return;

    const trimmedValue = editingStoryNameValue.trim();
    
    // Create a copy of userStoryNames, removing empty values
    const updatedUserStoryNames = { ...selectedDocument.userStoryNames };
    if (trimmedValue) {
      updatedUserStoryNames[editingStoryNameId] = trimmedValue;
    } else {
      // Remove the entry if the value is empty
      delete updatedUserStoryNames[editingStoryNameId];
    }

    const updatedDocument: RiskAnalysisDocument = {
      ...selectedDocument,
      userStoryNames: updatedUserStoryNames,
      updatedAt: new Date(),
    };

    DataService.saveRiskDocument(updatedDocument);
    setSelectedDocument(updatedDocument);
    setEditingStoryNameId(null);
    setEditingStoryNameValue('');
  };

  const handleCancelEditingStoryName = () => {
    setEditingStoryNameId(null);
    setEditingStoryNameValue('');
  };

  const getAutomationRecommendation = (score: number, isNonAutomatable?: boolean) => {
    if (isNonAutomatable) {
      return 'Manual Only (Cannot Automate)';
    }
    return score >= 1 && score <= 6 ? 'Automate' : 'Manual Only';
  };

  const getAutomationIcon = (score: number, isNonAutomatable?: boolean) => {
    if (isNonAutomatable) {
      return <BlockIcon color="error" />;
    }
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

  const getRiskColor = (score: number) => {
    if (score <= 2) return 'error';
    if (score <= 4) return 'warning';
    if (score <= 6) return 'info';
    return 'success';
  };

  const groupWorkflowsByUserStoryAndScenario = (
    workflows: UserWorkflow[],
    testPlans: TestPlan[]
  ) => {
    // First group by User Story ID (Level 1)
    const userStoryGroups: {
      [userStoryId: string]: {
        userStoryId: string;
        scenarios: {
          [scenarioKey: string]: { scenario: TestScenario | null; workflows: UserWorkflow[] };
        };
      };
    } = {};

    workflows.forEach(workflow => {
      const userStoryId = workflow.userStoryId || 'NO_USER_STORY';

      // Initialize user story group if it doesn't exist
      if (!userStoryGroups[userStoryId]) {
        userStoryGroups[userStoryId] = {
          userStoryId,
          scenarios: {},
        };
      }

      // If workflow has source test plan and scenario, group by those
      if (workflow.sourceTestPlanId && workflow.sourceScenarioId) {
        const testPlan = testPlans.find(tp => tp.id === workflow.sourceTestPlanId);
        if (testPlan) {
          const scenario = testPlan.testScenarios?.find(ts => ts.id === workflow.sourceScenarioId);
          if (scenario) {
            const scenarioKey = `${workflow.sourceTestPlanId}-${workflow.sourceScenarioId}`;

            if (!userStoryGroups[userStoryId].scenarios[scenarioKey]) {
              userStoryGroups[userStoryId].scenarios[scenarioKey] = {
                scenario,
                workflows: [],
              };
            }

            userStoryGroups[userStoryId].scenarios[scenarioKey].workflows.push(workflow);
          }
        }
      } else {
        // Workflow was created manually (not from test plan)
        // Group it under a "Manual Workflows" scenario
        const scenarioKey = 'manual-workflows';

        if (!userStoryGroups[userStoryId].scenarios[scenarioKey]) {
          userStoryGroups[userStoryId].scenarios[scenarioKey] = {
            scenario: null, // No source scenario for manually created workflows
            workflows: [],
          };
        }

        userStoryGroups[userStoryId].scenarios[scenarioKey].workflows.push(workflow);
      }
    });

    return userStoryGroups;
  };

  const blackboardFeatures: BlackboardFeature[] = [
    'Course Management',
    'Gradebook',
    'Discussion Forums',
    'Assignments',
    'Content Areas',
    'Announcements',
    'Calendar',
    'Messages',
    'Group Management',
    'Assessment Tools',
    'Rubrics',
    'SafeAssign',
    'Attendance',
    'Grade Center',
    'Ultra Course View',
    'Original Course View',
    'Mobile App',
    'Integration Tools',
    'Reports',
    'System Administration',
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

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Typography variant="h5" sx={{ pb: 2 }}>
          Risk Analysis Documents
        </Typography>
      </Box>

      {/* Search bar for documents */}
      <Box mb={2}>
        <TextField
          fullWidth
          placeholder="Search risk analysis documents..."
          value={documentSearchQuery}
          onChange={e => setDocumentSearchQuery(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>

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
                {filteredDocuments
                  .slice(
                    documentsPage * documentsRowsPerPage,
                    documentsPage * documentsRowsPerPage + documentsRowsPerPage
                  )
                  .map(document => (
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
                            <IconButton
                              size="small"
                              onClick={() => handleDownloadDocument(document)}
                            >
                              <ExportIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteDocument(document.id)}
                            >
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
            count={filteredDocuments.length}
            page={documentsPage}
            onPageChange={(_, newPage) => setDocumentsPage(newPage)}
            rowsPerPage={documentsRowsPerPage}
            onRowsPerPageChange={event => {
              setDocumentsRowsPerPage(parseInt(event.target.value, 10));
              setDocumentsPage(0);
            }}
          />
        </Box>
      ) : (
        <Box>
          {filteredDocuments.map(document => (
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
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography sx={{ mb: 0 }}>{document.description}</Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<ViewIcon />}
                    onClick={() => handleViewDocument(document)}
                  >
                    View/Edit Details
                  </Button>
                </Box>

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
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {document.workflows.map(workflow => (
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
                              {getAutomationIcon(workflow.riskScore, workflow.isNonAutomatable)}
                              {getAutomationRecommendation(workflow.riskScore, workflow.isNonAutomatable)}
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title="Edit Workflow">
                              <IconButton size="small" onClick={() => handleEditWorkflow(workflow)}>
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
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

      <Dialog
        open={openWorkflowDialog}
        onClose={() => setOpenWorkflowDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedWorkflow ? 'Edit User Workflow' : 'Create New User Workflow'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={12}>
              <TextField
                label="User Story ID *"
                fullWidth
                value={workflowFormData.userStoryId || ''}
                onChange={e =>
                  setWorkflowFormData({
                    ...workflowFormData,
                    userStoryId: e.target.value.toUpperCase(),
                  })
                }
                placeholder="e.g., AB#1234567"
                helperText="Format: AB#1234567 (e.g., AB#1234567) - Required for linking"
                error={
                  !!(
                    workflowFormData.userStoryId && !/^AB#\d{7}$/.test(workflowFormData.userStoryId)
                  )
                }
              />
            </Grid>
            <Grid size={12}>
              <TextField
                label="Workflow Name"
                fullWidth
                value={workflowFormData.workflowName}
                onChange={e =>
                  setWorkflowFormData({ ...workflowFormData, workflowName: e.target.value })
                }
                placeholder="e.g., Student Login to Course"
              />
            </Grid>
            <Grid size={12}>
              <TextField
                label="Risk Statement"
                fullWidth
                value={workflowFormData.riskStatement}
                onChange={e =>
                  setWorkflowFormData({ ...workflowFormData, riskStatement: e.target.value })
                }
                placeholder="What could go wrong? (e.g., Students unable to submit assignments)"
                helperText="Describe the potential failure or risk"
              />
            </Grid>
            <Grid size={12}>
              <TextField
                label="Business Impact"
                fullWidth
                value={workflowFormData.businessImpact}
                onChange={e =>
                  setWorkflowFormData({ ...workflowFormData, businessImpact: e.target.value })
                }
                placeholder="Why does it matter? (e.g., Lost grades, support tickets, student complaints)"
                helperText="Explain the business consequences if this fails"
              />
            </Grid>
            <Grid size={12}>
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={3}
                value={workflowFormData.description}
                onChange={e =>
                  setWorkflowFormData({ ...workflowFormData, description: e.target.value })
                }
                placeholder="Detailed description of the workflow steps"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Blackboard Feature</InputLabel>
                <Select
                  value={workflowFormData.blackboardFeature}
                  label="Blackboard Feature"
                  onChange={e =>
                    setWorkflowFormData({
                      ...workflowFormData,
                      blackboardFeature: e.target.value as BlackboardFeature,
                    })
                  }
                >
                  {blackboardFeatures.map(feature => (
                    <MenuItem key={feature} value={feature}>
                      {feature}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography gutterBottom>Likelihood of Failure</Typography>
              <Box sx={{ px: 2 }}>
                <Slider
                  value={workflowFormData.likelihood}
                  onChange={(_, value) =>
                    setWorkflowFormData({ ...workflowFormData, likelihood: value as number })
                  }
                  min={1}
                  max={4}
                  step={1}
                  marks={[
                    { value: 1, label: 'Most Likely' },
                    { value: 2, label: 'Likely' },
                    { value: 3, label: 'Unlikely' },
                    { value: 4, label: 'Very Unlikely' },
                  ]}
                  valueLabelDisplay="auto"
                />
              </Box>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                How likely is this workflow to fail? (1=Most Likely, 4=Very Unlikely)
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography gutterBottom>Impact if Failure</Typography>
              <Box sx={{ px: 2 }}>
                <Slider
                  value={workflowFormData.impact}
                  onChange={(_, value) =>
                    setWorkflowFormData({ ...workflowFormData, impact: value as number })
                  }
                  min={1}
                  max={4}
                  step={1}
                  marks={[
                    { value: 1, label: 'Critical' },
                    { value: 2, label: 'High' },
                    { value: 3, label: 'Medium' },
                    { value: 4, label: 'Low' },
                  ]}
                  valueLabelDisplay="auto"
                />
              </Box>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                How severe would a failure be? (1=Most Impactful, 4=Minimal Impact)
              </Typography>
            </Grid>
            <Grid size={12}>
              <Box
                sx={{
                  p: 2,
                  backgroundColor: 'background.paper',
                  borderRadius: 1,
                  border: 1,
                  borderColor: 'divider',
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Risk Score: {workflowFormData.likelihood * workflowFormData.impact}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Risk Level:{' '}
                  {
                    getRiskLevelFromScore(workflowFormData.likelihood * workflowFormData.impact)
                      .level
                  }
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Testing Tier:{' '}
                  {getTestingTierFromRiskScore(
                    workflowFormData.likelihood * workflowFormData.impact
                  )}
                </Typography>
                <Typography
                  variant="body2"
                  color={getAutomationColor(workflowFormData.likelihood * workflowFormData.impact)}
                >
                  {getAutomationRecommendation(
                    workflowFormData.likelihood * workflowFormData.impact
                  ) === 'Automate'
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
                onChange={e =>
                  setWorkflowFormData({ ...workflowFormData, deliverables: e.target.value })
                }
                placeholder="e.g., Unit Test, UI Automation, Exploratory Testing"
                helperText="Specify the testing deliverables required for this workflow"
              />
            </Grid>
            <Grid size={12}>
              <TextField
                label="Automation Rationale"
                fullWidth
                multiline
                rows={3}
                value={workflowFormData.automationRationale}
                onChange={e =>
                  setWorkflowFormData({ ...workflowFormData, automationRationale: e.target.value })
                }
                placeholder="Explain why this should/shouldn't be automated (optional)"
                helperText="Provide reasoning for automation recommendation"
              />
            </Grid>
            <Grid size={12}>
              <Box
                sx={{
                  p: 2,
                  backgroundColor: 'background.paper',
                  borderRadius: 1,
                  border: 1,
                  borderColor: 'divider',
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={workflowFormData.isNonAutomatable}
                      onChange={e =>
                        setWorkflowFormData({
                          ...workflowFormData,
                          isNonAutomatable: e.target.checked,
                        })
                      }
                    />
                  }
                  label="Mark as Non-Automatable (Cannot be automated despite risk score)"
                />
                <Typography variant="caption" color="text.secondary" display="block" sx={{ ml: 4 }}>
                  Use this for high-risk tests that technically should be automated but cannot be due
                  to technical limitations (e.g., requires external email, third-party accounts, etc.)
                </Typography>
                {workflowFormData.isNonAutomatable && (
                  <Box sx={{ mt: 2 }}>
                    <Alert severity="warning" sx={{ mb: 2 }}>
                      This test is marked as high-risk but non-automatable. Manual testing will be
                      required.
                    </Alert>
                    <TextField
                      label="Reason for Non-Automation *"
                      fullWidth
                      multiline
                      rows={3}
                      value={workflowFormData.nonAutomatableReason}
                      onChange={e =>
                        setWorkflowFormData({
                          ...workflowFormData,
                          nonAutomatableReason: e.target.value,
                        })
                      }
                      placeholder="e.g., Requires external email account verification, Depends on third-party service with no API"
                      helperText="Explain why automation is not possible for this test"
                      required
                    />
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenWorkflowDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleSubmitWorkflow} 
            variant="contained"
            disabled={workflowFormData.isNonAutomatable && !workflowFormData.nonAutomatableReason?.trim()}
          >
            {selectedWorkflow ? 'Update Workflow' : 'Create Workflow'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openDocumentDialog}
        onClose={() => setOpenDocumentDialog(false)}
        maxWidth="md"
        fullWidth
      >
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
                onChange={e =>
                  setDocumentFormData({ ...documentFormData, description: e.target.value })
                }
              />
            </Grid>
            <Grid size={12}>
              <Typography gutterBottom>Select Workflows to Include</Typography>
              <Box
                sx={{
                  maxHeight: 200,
                  overflowY: 'auto',
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                  p: 1,
                }}
              >
                {workflows.length === 0 && (
                  <Typography color="text.secondary">No workflows available.</Typography>
                )}
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
                            : prev.selectedWorkflowIds.filter(id => id !== wf.id),
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
          <Button
            onClick={handleSubmitDocument}
            variant="contained"
            disabled={!documentFormData.title || documentFormData.selectedWorkflowIds.length === 0}
          >
            Create Document
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openImportDialog}
        onClose={() => setOpenImportDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Import Test Scenarios from Test Plans</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Select test scenarios from existing test plans to create risk analysis workflows
          </Typography>
          <Box sx={{ maxHeight: 400, overflowY: 'auto', mt: 2 }}>
            {testPlans.map(testPlan => (
              <Accordion key={testPlan.id}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="h6">
                    {testPlan.title} ({testPlan.testScenarios.length} scenarios)
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {testPlan.testScenarios.map(scenario => (
                    <Paper
                      key={scenario.id}
                      sx={{ p: 2, mb: 2, backgroundColor: 'background.default' }}
                    >
                      <Typography variant="body2" gutterBottom>
                        <strong>Given:</strong> {scenario.given}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        <strong>When:</strong> {scenario.when}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        <strong>Then:</strong> {scenario.then}
                      </Typography>
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
                    <Typography color="text.secondary">
                      No test scenarios defined for this test plan.
                    </Typography>
                  )}
                </AccordionDetails>
              </Accordion>
            ))}
            {testPlans.length === 0 && (
              <Typography color="text.secondary">
                No test plans available. Create test plans first to import scenarios.
              </Typography>
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
              <Chip label={selectedDocument?.blackboardFeature} variant="outlined" size="small" />
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
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>Created:</strong> {selectedDocument.createdAt.toLocaleDateString()}
              </Typography>

              {/* Level 1 Grouping: By User Story ID */}
              {Object.entries(
                groupWorkflowsByUserStoryAndScenario(selectedDocument.workflows, testPlans)
              ).map(([userStoryId, userStoryGroup]) => (
                <Box key={userStoryId} sx={{ mb: 4 }}>
                  {/* User Story ID Header - Level 1 */}
                  <Paper
                    sx={{ p: 2, mb: 2, bgcolor: 'primary.main', color: 'primary.contrastText' }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="h5" sx={{ fontWeight: 'bold', flexShrink: 0 }}>
                        User Story:{' '}
                        <Link
                          href={getAdoUrl(userStoryId)}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ color: 'inherit', textDecoration: 'underline' }}
                        >
                          {userStoryId}
                        </Link>
                      </Typography>
                      {editingStoryNameId === userStoryId ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                          <TextField
                            size="small"
                            fullWidth
                            placeholder="Add story name..."
                            value={editingStoryNameValue}
                            onChange={e => setEditingStoryNameValue(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') handleSaveStoryName();
                              if (e.key === 'Escape') handleCancelEditingStoryName();
                            }}
                            aria-label="Edit user story name"
                            inputProps={{
                              'aria-describedby': 'story-name-help',
                            }}
                            sx={{
                              '& .MuiInputBase-root': {
                                color: 'primary.contrastText',
                                bgcolor: 'rgba(255, 255, 255, 0.15)',
                              },
                              '& .MuiInputBase-input::placeholder': {
                                color: 'rgba(255, 255, 255, 0.7)',
                                opacity: 1,
                              },
                            }}
                          />
                          <IconButton
                            size="small"
                            onClick={handleSaveStoryName}
                            sx={{ color: 'primary.contrastText' }}
                            aria-label="Save story name"
                          >
                            <SaveIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={handleCancelEditingStoryName}
                            sx={{ color: 'primary.contrastText' }}
                            aria-label="Cancel editing story name"
                          >
                            <CloseIcon />
                          </IconButton>
                        </Box>
                      ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                          <Typography variant="body1" sx={{ fontStyle: 'italic', opacity: 0.9 }}>
                            {selectedDocument?.userStoryNames?.[userStoryId] || 'No story name'}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => handleStartEditingStoryName(userStoryId)}
                            sx={{ color: 'primary.contrastText' }}
                            aria-label="Edit user story name"
                          >
                            <EditIcon />
                          </IconButton>
                        </Box>
                      )}
                    </Box>
                    <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                      {Object.values(userStoryGroup.scenarios).reduce(
                        (sum, s) => sum + s.workflows.length,
                        0
                      )}{' '}
                      workflow(s) across {Object.keys(userStoryGroup.scenarios).length} section(s)
                    </Typography>
                  </Paper>

                  {/* Level 2 Grouping: By Scenario (GIVEN/WHEN/THEN) */}
                  {Object.entries(userStoryGroup.scenarios).map(([scenarioKey, group]) => (
                    <Accordion key={scenarioKey} defaultExpanded sx={{ mb: 2, ml: 3 }}>
                      <AccordionSummary
                        expandIcon={<ExpandMore />}
                        sx={{
                          bgcolor: 'action.hover',
                          '&:hover': {
                            bgcolor: 'action.selected',
                          },
                        }}
                      >
                        <Box sx={{ width: '100%' }}>
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: 'bold', color: 'text.primary' }}
                          >
                            {group.scenario
                              ? `Scenario: ${group.scenario.title || 'Full Workflow'}`
                              : 'Manually Created Workflows'}
                          </Typography>
                          {group.scenario && (
                            <>
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                <strong>GIVEN</strong> {group.scenario.given}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                <strong>WHEN</strong> {group.scenario.when}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                <strong>THEN</strong> {group.scenario.then}
                              </Typography>
                            </>
                          )}
                          {!group.scenario && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                              Workflows created directly (not imported from test plans)
                            </Typography>
                          )}
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails sx={{ p: 0 }}>
                        {/* Assessment Unit: G/W/T Workflow - The atomic unit for risk */}
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow sx={{ bgcolor: 'action.hover' }}>
                                <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                                  G/W/T Workflow - Atomic Risk Unit
                                </TableCell>
                                <TableCell
                                  align="center"
                                  sx={{ fontWeight: 'bold', color: 'text.primary' }}
                                >
                                  Impact (I)
                                  <br />
                                  (1-4)
                                </TableCell>
                                <TableCell
                                  align="center"
                                  sx={{ fontWeight: 'bold', color: 'text.primary' }}
                                >
                                  Likelihood (L)
                                  <br />
                                  (1-4)
                                </TableCell>
                                <TableCell
                                  align="center"
                                  sx={{ fontWeight: 'bold', color: 'text.primary' }}
                                >
                                  Risk Factor
                                  <br />
                                  (I × L)
                                </TableCell>
                                <TableCell
                                  align="center"
                                  sx={{ fontWeight: 'bold', color: 'text.primary' }}
                                >
                                  Mandatory Tier
                                </TableCell>
                                <TableCell
                                  align="center"
                                  sx={{ fontWeight: 'bold', color: 'text.primary' }}
                                >
                                  Automation Status
                                </TableCell>
                                <TableCell
                                  align="center"
                                  sx={{ fontWeight: 'bold', color: 'text.primary' }}
                                >
                                  Deliverables
                                </TableCell>
                                <TableCell
                                  align="center"
                                  sx={{ fontWeight: 'bold', color: 'text.primary' }}
                                >
                                  Actions
                                </TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {group.workflows.map(workflow => (
                                <TableRow
                                  key={workflow.id}
                                  sx={{ '&:nth-of-type(even)': { bgcolor: 'action.hover' } }}
                                >
                                  <TableCell>
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                      {workflow.workflowName}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      Test Case ID: {workflow.id}
                                    </Typography>
                                  </TableCell>
                                  <TableCell align="center">
                                    {editingWorkflowId === workflow.id && editingWorkflowData ? (
                                      <Box sx={{ px: 1, minWidth: 200, py: 3 }}>
                                        <Slider
                                          value={editingWorkflowData.impact}
                                          onChange={(_, value) =>
                                            setEditingWorkflowData({
                                              ...editingWorkflowData,
                                              impact: value as number,
                                            })
                                          }
                                          min={1}
                                          max={4}
                                          step={1}
                                          marks={[
                                            { value: 1, label: 'Critical' },
                                            { value: 2, label: 'High' },
                                            { value: 3, label: 'Medium' },
                                            { value: 4, label: 'Low' },
                                          ]}
                                          valueLabelDisplay="auto"
                                          sx={{
                                            '& .MuiSlider-markLabel': {
                                              fontSize: '0.7rem',
                                              whiteSpace: 'nowrap',
                                            },
                                          }}
                                        />
                                      </Box>
                                    ) : (
                                      <Typography variant="body2" fontWeight="bold">
                                        {workflow.impact}
                                      </Typography>
                                    )}
                                  </TableCell>
                                  <TableCell align="center">
                                    {editingWorkflowId === workflow.id && editingWorkflowData ? (
                                      <Box sx={{ px: 1, minWidth: 200, py: 3 }}>
                                        <Slider
                                          value={editingWorkflowData.likelihood}
                                          onChange={(_, value) =>
                                            setEditingWorkflowData({
                                              ...editingWorkflowData,
                                              likelihood: value as number,
                                            })
                                          }
                                          min={1}
                                          max={4}
                                          step={1}
                                          marks={[
                                            { value: 1, label: 'Most Likely' },
                                            { value: 2, label: 'Likely' },
                                            { value: 3, label: 'Unlikely' },
                                            { value: 4, label: 'Very Unlikely' },
                                          ]}
                                          valueLabelDisplay="auto"
                                          sx={{
                                            '& .MuiSlider-markLabel': {
                                              fontSize: '0.65rem',
                                              whiteSpace: 'nowrap',
                                            },
                                          }}
                                        />
                                      </Box>
                                    ) : (
                                      <Typography variant="body2" fontWeight="bold">
                                        {workflow.likelihood}
                                      </Typography>
                                    )}
                                  </TableCell>
                                  <TableCell align="center">
                                    <Chip
                                      label={
                                        editingWorkflowId === workflow.id && editingWorkflowData
                                          ? editingWorkflowData.likelihood *
                                            editingWorkflowData.impact
                                          : workflow.riskScore
                                      }
                                      color={
                                        (editingWorkflowId === workflow.id && editingWorkflowData
                                          ? editingWorkflowData.likelihood *
                                            editingWorkflowData.impact
                                          : workflow.riskScore) <= 4
                                          ? 'error'
                                          : (editingWorkflowId === workflow.id &&
                                              editingWorkflowData
                                                ? editingWorkflowData.likelihood *
                                                  editingWorkflowData.impact
                                                : workflow.riskScore) <= 8
                                            ? 'warning'
                                            : 'info'
                                      }
                                      size="small"
                                      sx={{ fontWeight: 'bold', minWidth: '40px' }}
                                    />
                                  </TableCell>
                                  <TableCell align="center">
                                    <Chip
                                      label={
                                        editingWorkflowId === workflow.id && editingWorkflowData
                                          ? getTestingTierFromRiskScore(
                                              editingWorkflowData.likelihood *
                                                editingWorkflowData.impact
                                            )
                                          : workflow.testingTier
                                      }
                                      color={
                                        (editingWorkflowId === workflow.id && editingWorkflowData
                                          ? getTestingTierFromRiskScore(
                                              editingWorkflowData.likelihood *
                                                editingWorkflowData.impact
                                            )
                                          : workflow.testingTier
                                        ).includes('CRITICAL')
                                          ? 'error'
                                          : (editingWorkflowId === workflow.id &&
                                              editingWorkflowData
                                                ? getTestingTierFromRiskScore(
                                                    editingWorkflowData.likelihood *
                                                      editingWorkflowData.impact
                                                  )
                                                : workflow.testingTier
                                              ).includes('HIGH')
                                            ? 'warning'
                                            : 'info'
                                      }
                                      size="small"
                                    />
                                  </TableCell>
                                  <TableCell align="center">
                                    <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                                      {workflow.isNonAutomatable ? (
                                        <Tooltip title={workflow.nonAutomatableReason || 'Cannot be automated'}>
                                          <Box display="flex" alignItems="center" gap={0.5}>
                                            <BlockIcon color="error" fontSize="small" />
                                            <Chip 
                                              label="Manual Only" 
                                              color="error" 
                                              size="small"
                                              sx={{ fontWeight: 'bold' }}
                                            />
                                          </Box>
                                        </Tooltip>
                                      ) : (
                                        <Box display="flex" alignItems="center" gap={0.5}>
                                          {getAutomationIcon(
                                            editingWorkflowId === workflow.id && editingWorkflowData
                                              ? editingWorkflowData.likelihood * editingWorkflowData.impact
                                              : workflow.riskScore
                                          )}
                                          <Chip
                                            label={getAutomationRecommendation(
                                              editingWorkflowId === workflow.id && editingWorkflowData
                                                ? editingWorkflowData.likelihood * editingWorkflowData.impact
                                                : workflow.riskScore
                                            )}
                                            color={
                                              (editingWorkflowId === workflow.id && editingWorkflowData
                                                ? editingWorkflowData.likelihood * editingWorkflowData.impact
                                                : workflow.riskScore) <= 6
                                                ? 'primary'
                                                : 'secondary'
                                            }
                                            size="small"
                                          />
                                        </Box>
                                      )}
                                    </Box>
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                                      {editingWorkflowId === workflow.id && editingWorkflowData
                                        ? getDefaultDeliverables(
                                            getTestingTierFromRiskScore(
                                              editingWorkflowData.likelihood *
                                                editingWorkflowData.impact
                                            )
                                          )
                                        : workflow.deliverables}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    {editingWorkflowId === workflow.id ? (
                                      <Box display="flex" gap={1}>
                                        <Tooltip title="Save">
                                          <IconButton
                                            size="small"
                                            color="primary"
                                            onClick={() => handleSaveWorkflowRiskFactors(workflow)}
                                          >
                                            <SaveIcon />
                                          </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Cancel">
                                          <IconButton
                                            size="small"
                                            onClick={handleCancelEditingWorkflow}
                                          >
                                            <DeleteIcon />
                                          </IconButton>
                                        </Tooltip>
                                      </Box>
                                    ) : (
                                      <Tooltip title="Edit Risk Factors">
                                        <IconButton
                                          size="small"
                                          onClick={() => handleStartEditingWorkflow(workflow)}
                                        >
                                          <EditIcon />
                                        </IconButton>
                                      </Tooltip>
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Box>
              ))}

              {selectedDocument.recommendations && (
                <Box mt={3}>
                  <Typography variant="h6" gutterBottom>
                    Recommendations
                  </Typography>
                  <Paper
                    sx={{
                      p: 2,
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Typography variant="body2">{selectedDocument.recommendations}</Typography>
                  </Paper>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDocumentOpen(false)}>Close</Button>
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
