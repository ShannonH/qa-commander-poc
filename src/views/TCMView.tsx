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
  List,
  ListItem,
  ListItemText,
  Divider,
  Checkbox,
  FormControlLabel,
  Tabs,
  Tab,
  Slider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  ViewModule as CardViewIcon,
  ViewList as TableViewIcon,
  Search as SearchIcon,
  Delete as DeleteIcon,
  GetApp as ExportIcon,
  FolderOpen as CollectionIcon,
  ContentCopy as CopyIcon,
  AutoAwesome,
  Build,
  ExpandMore,
} from '@mui/icons-material';
import {
  TCMTestCase,
  TCMCollection,
  UserWorkflow,
  TestPlan,
  TestStep,
  BlackboardFeature,
  TestScenario,
} from '../types';
import { DataService } from '../utils/dataService';
import Fuse from 'fuse.js';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tcm-tabpanel-${index}`}
      aria-labelledby={`tcm-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `tcm-tab-${index}`,
    'aria-controls': `tcm-tabpanel-${index}`,
  };
}

const TCMView: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [testCases, setTestCases] = useState<TCMTestCase[]>([]);
  const [collections, setCollections] = useState<TCMCollection[]>([]);
  const [workflows, setWorkflows] = useState<UserWorkflow[]>([]);
  const [testPlans, setTestPlans] = useState<TestPlan[]>([]);
  const [filteredTestCases, setFilteredTestCases] = useState<TCMTestCase[]>([]);

  // Workflow-specific state
  const [filteredWorkflows, setFilteredWorkflows] = useState<UserWorkflow[]>([]);
  const [workflowSearchQuery, setWorkflowSearchQuery] = useState('');
  const [workflowsViewMode, setWorkflowsViewMode] = useState<'cards' | 'table'>('cards');
  const [workflowsPage, setWorkflowsPage] = useState(0);
  const [workflowsRowsPerPage, setWorkflowsRowsPerPage] = useState(10);
  const [openWorkflowDialog, setOpenWorkflowDialog] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<UserWorkflow | null>(null);
  const [openImportDialog, setOpenImportDialog] = useState(false);
  const [workflowFormData, setWorkflowFormData] = useState({
    userStoryId: '',
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
  });

  // Test case-specific state
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTier, setFilterTier] = useState<string>('all');
  const [selectedTestCase, setSelectedTestCase] = useState<TCMTestCase | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [collectionDialogOpen, setCollectionDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<TCMCollection | null>(null);

  // Form states
  const [editFormData, setEditFormData] = useState<Partial<TCMTestCase>>({});
  const [collectionFormData, setCollectionFormData] = useState({
    name: '',
    description: '',
    selectedTestCaseIds: [] as string[],
  });
  const [selectedTestCasesForExport, setSelectedTestCasesForExport] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [testCases, searchQuery, filterTier]);

  useEffect(() => {
    // Apply workflow search
    if (workflowSearchQuery.trim()) {
      const fuse = new Fuse(workflows, {
        keys: ['workflowName', 'description', 'userStory', 'blackboardFeature', 'id'],
        threshold: 0.3,
      });
      const results = fuse.search(workflowSearchQuery);
      setFilteredWorkflows(results.map(result => result.item));
    } else {
      setFilteredWorkflows(workflows);
    }
    setWorkflowsPage(0);
  }, [workflowSearchQuery, workflows]);

  const loadData = () => {
    const tcmCases = DataService.getTCMTestCases();
    const wf = DataService.getUserWorkflows();
    const tp = DataService.getTestPlans();
    const coll = DataService.getTCMCollections();

    setTestCases(tcmCases);
    setWorkflows(wf);
    setTestPlans(tp);
    setCollections(coll);
    setFilteredTestCases(tcmCases);
    setFilteredWorkflows(wf);
  };

  const applyFilters = () => {
    let filtered = [...testCases];

    // Filter by tier
    if (filterTier !== 'all') {
      filtered = filtered.filter(tc => tc.testingTier === filterTier);
    }

    // Apply search
    if (searchQuery.trim()) {
      const fuse = new Fuse(filtered, {
        keys: ['title', 'description', 'acceptanceCriteria', 'userStoryId', 'id', 'tags'],
        threshold: 0.3,
      });
      const results = fuse.search(searchQuery);
      filtered = results.map(result => result.item);
    }

    setFilteredTestCases(filtered);
    setPage(0);
  };

  const handleGenerateTestCases = () => {
    const newTestCases = DataService.generateTCMTestCasesFromWorkflows(workflows, testPlans);
    if (newTestCases.length > 0) {
      alert(`Generated ${newTestCases.length} new test cases from Tier 1 and Tier 2 workflows.`);
      loadData();
    } else {
      alert('No new test cases to generate. All Tier 1 & 2 workflows already have test cases.');
    }
  };

  const handleCreateTestCase = () => {
    setSelectedTestCase(null);
    setEditFormData({
      id: DataService.generateTestCaseId(),
      title: '',
      description: '',
      givenWhenThen: { given: '', when: '', then: '' },
      testSteps: [{ id: '1', stepNumber: 1, action: '', expectedResult: '' }],
      expectedResult: '',
      tags: [],
      prerequisites: [],
      notes: '',
    });
    setEditDialogOpen(true);
  };

  const handleEditTestCase = (testCase: TCMTestCase) => {
    setSelectedTestCase(testCase);
    setEditFormData(testCase);
    setEditDialogOpen(true);
  };

  const handleSaveTestCase = () => {
    if (!editFormData.title || !editFormData.description) {
      alert('Please fill in required fields (Title and Description)');
      return;
    }

    const testCase: TCMTestCase = {
      id: editFormData.id || DataService.generateTestCaseId(),
      title: editFormData.title!,
      description: editFormData.description!,
      sourceWorkflowId: editFormData.sourceWorkflowId,
      sourceTestPlanId: editFormData.sourceTestPlanId,
      sourceScenarioId: editFormData.sourceScenarioId,
      userStoryId: editFormData.userStoryId,
      givenWhenThen: editFormData.givenWhenThen || { given: '', when: '', then: '' },
      riskScore: editFormData.riskScore,
      testingTier: editFormData.testingTier,
      likelihood: editFormData.likelihood,
      impact: editFormData.impact,
      automationRecommendation: editFormData.automationRecommendation,
      testSteps: editFormData.testSteps || [],
      expectedResult: editFormData.expectedResult || '',
      prerequisites: editFormData.prerequisites,
      tags: editFormData.tags,
      notes: editFormData.notes,
      createdAt: selectedTestCase?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    DataService.saveTCMTestCase(testCase);
    loadData();
    setEditDialogOpen(false);
  };

  const handleViewTestCase = (testCase: TCMTestCase) => {
    setSelectedTestCase(testCase);
    setViewDialogOpen(true);
  };

  const handleDeleteTestCase = (testCaseId: string) => {
    if (window.confirm('Are you sure you want to delete this test case?')) {
      DataService.deleteTCMTestCase(testCaseId);
      loadData();
    }
  };

  const handleCreateCollection = () => {
    setSelectedCollection(null);
    setCollectionFormData({
      name: '',
      description: '',
      selectedTestCaseIds: [],
    });
    setCollectionDialogOpen(true);
  };

  const handleSaveCollection = () => {
    if (!collectionFormData.name) {
      alert('Please provide a collection name');
      return;
    }

    const collection: TCMCollection = {
      id: selectedCollection?.id || Date.now().toString(),
      name: collectionFormData.name,
      description: collectionFormData.description,
      testCaseIds: collectionFormData.selectedTestCaseIds,
      createdAt: selectedCollection?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    DataService.saveTCMCollection(collection);
    loadData();
    setCollectionDialogOpen(false);
  };

  const handleDeleteCollection = (collectionId: string) => {
    if (window.confirm('Are you sure you want to delete this collection?')) {
      DataService.deleteTCMCollection(collectionId);
      loadData();
    }
  };

  const handleExportPDF = (testCasesToExport: TCMTestCase[]) => {
    const content = generateExportContent(testCasesToExport, 'pdf');
    downloadFile(content, 'test-cases.txt', 'text/plain');
  };

  const handleExportMarkdown = (testCasesToExport: TCMTestCase[]) => {
    const content = generateExportContent(testCasesToExport, 'markdown');
    downloadFile(content, 'test-cases.md', 'text/markdown');
  };

  const handleExportChromeExtension = (testCasesToExport: TCMTestCase[]) => {
    const content = testCasesToExport
      .map((tc, index) => `${index + 1}. ${tc.title} - ${tc.description}`)
      .join('\n');
    downloadFile(content, 'test-cases-chrome-ext.txt', 'text/plain');
  };

  const generateExportContent = (testCasesToExport: TCMTestCase[], format: 'pdf' | 'markdown') => {
    if (format === 'markdown') {
      return testCasesToExport
        .map(tc => {
          let md = `# ${tc.title}\n\n`;
          md += `**Test Case ID:** ${tc.id}\n\n`;
          md += `**Description:** ${tc.description}\n\n`;

          if (tc.userStoryId) {
            md += `**User Story ID:** ${tc.userStoryId}\n\n`;
          }

          if (tc.givenWhenThen) {
            md += `## Scenario\n\n`;
            md += `**Given:** ${tc.givenWhenThen.given}\n\n`;
            md += `**When:** ${tc.givenWhenThen.when}\n\n`;
            md += `**Then:** ${tc.givenWhenThen.then}\n\n`;
          }

          if (tc.prerequisites && tc.prerequisites.length > 0) {
            md += `## Prerequisites\n\n`;
            tc.prerequisites.forEach(prereq => {
              md += `- ${prereq}\n`;
            });
            md += '\n';
          }

          md += `## Test Steps\n\n`;
          tc.testSteps.forEach(step => {
            md += `### Step ${step.stepNumber}\n`;
            md += `**Action:** ${step.action}\n\n`;
            md += `**Expected Result:** ${step.expectedResult}\n\n`;
          });

          md += `## Expected Result\n\n${tc.expectedResult}\n\n`;

          if (tc.notes) {
            md += `## Notes\n\n${tc.notes}\n\n`;
          }

          md += `---\n\n`;
          return md;
        })
        .join('\n');
    } else {
      // PDF format (text-based for now)
      return testCasesToExport
        .map(tc => {
          let text = `TEST CASE: ${tc.title}\n`;
          text += `${'='.repeat(80)}\n\n`;
          text += `Test Case ID: ${tc.id}\n`;
          text += `Description: ${tc.description}\n`;

          if (tc.userStoryId) {
            text += `User Story ID: ${tc.userStoryId}\n`;
          }

          if (tc.givenWhenThen) {
            text += `\nSCENARIO:\n`;
            text += `  Given: ${tc.givenWhenThen.given}\n`;
            text += `  When: ${tc.givenWhenThen.when}\n`;
            text += `  Then: ${tc.givenWhenThen.then}\n`;
          }

          if (tc.prerequisites && tc.prerequisites.length > 0) {
            text += `\nPREREQUISITES:\n`;
            tc.prerequisites.forEach((prereq, idx) => {
              text += `  ${idx + 1}. ${prereq}\n`;
            });
          }

          text += `\nTEST STEPS:\n`;
          tc.testSteps.forEach(step => {
            text += `  Step ${step.stepNumber}:\n`;
            text += `    Action: ${step.action}\n`;
            text += `    Expected: ${step.expectedResult}\n\n`;
          });

          text += `EXPECTED RESULT:\n${tc.expectedResult}\n`;

          if (tc.notes) {
            text += `\nNOTES:\n${tc.notes}\n`;
          }

          text += `\n${'='.repeat(80)}\n\n`;
          return text;
        })
        .join('\n');
    }
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const addTestStep = () => {
    const currentSteps = editFormData.testSteps || [];
    const newStep: TestStep = {
      id: (currentSteps.length + 1).toString(),
      stepNumber: currentSteps.length + 1,
      action: '',
      expectedResult: '',
    };
    setEditFormData({
      ...editFormData,
      testSteps: [...currentSteps, newStep],
    });
  };

  const updateTestStep = (index: number, field: 'action' | 'expectedResult', value: string) => {
    const updatedSteps = [...(editFormData.testSteps || [])];
    updatedSteps[index] = {
      ...updatedSteps[index],
      [field]: value,
    };
    setEditFormData({ ...editFormData, testSteps: updatedSteps });
  };

  const removeTestStep = (index: number) => {
    const updatedSteps = (editFormData.testSteps || []).filter((_, i) => i !== index);
    // Renumber steps
    updatedSteps.forEach((step, idx) => {
      step.stepNumber = idx + 1;
      step.id = (idx + 1).toString();
    });
    setEditFormData({ ...editFormData, testSteps: updatedSteps });
  };

  const getTierColor = (tier?: string) => {
    if (!tier) return 'default';
    if (tier.includes('CRITICAL')) return 'error';
    if (tier.includes('HIGH')) return 'warning';
    return 'info';
  };

  // Paginate test cases
  const paginatedTestCases = filteredTestCases.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Workflow helper functions
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

  // Workflow handlers
  const handleImportFromTestPlans = () => {
    setOpenImportDialog(true);
  };

  const importTestScenario = (testPlan: TestPlan, scenario: TestScenario) => {
    const riskScore = 2 * 2;
    const testingTier = getTestingTierFromRiskScore(riskScore);

    const newWorkflow: UserWorkflow = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      workflowName: `${scenario.given} → ${scenario.when} → ${scenario.then}`,
      description: `Imported from test plan: ${testPlan.title}`,
      userStoryId: scenario.userStoryId || '',
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
      sourceTestPlanId: selectedWorkflow?.sourceTestPlanId,
      sourceScenarioId: selectedWorkflow?.sourceScenarioId,
      createdAt: selectedWorkflow?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    DataService.saveUserWorkflow(workflow);
    loadData();
    setOpenWorkflowDialog(false);
  };

  const handleDeleteWorkflow = (workflowId: string) => {
    if (window.confirm('Are you sure you want to delete this workflow?')) {
      DataService.deleteUserWorkflow(workflowId);
      loadData();
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <div>
          <Typography variant="h4" gutterBottom>
            Test Case Management & Workflows
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage workflows and their generated test cases
          </Typography>
        </div>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          aria-label="TCM sections"
        >
          <Tab label="Test Cases" {...a11yProps(0)} />
          <Tab label="Workflows" {...a11yProps(1)} />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        {/* Test Cases Tab Content */}
        <Box display="flex" justifyContent="flex-end" alignItems="center" mb={2}>
          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              startIcon={<CollectionIcon />}
              onClick={handleCreateCollection}
            >
              New Collection
            </Button>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleGenerateTestCases}
            >
              Generate from Workflows
            </Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateTestCase}>
              New Test Case
            </Button>
          </Box>
        </Box>

        {/* Collections Section */}
        {collections.length > 0 && (
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Test Case Collections
            </Typography>
            <Grid container spacing={2}>
              {collections.map(collection => {
                const collectionTestCases = testCases.filter(tc =>
                  collection.testCaseIds.includes(tc.id)
                );
                return (
                  <Grid size={{ xs: 12, md: 6, lg: 4 }} key={collection.id}>
                    <Card>
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="start">
                          <Typography variant="h6">{collection.name}</Typography>
                          <Box>
                            <Tooltip title="Export">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setSelectedTestCasesForExport(collection.testCaseIds);
                                  setExportDialogOpen(true);
                                }}
                              >
                                <ExportIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteCollection(collection.id)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {collection.description}
                        </Typography>
                        <Chip
                          label={`${collectionTestCases.length} test case${collectionTestCases.length !== 1 ? 's' : ''}`}
                          size="small"
                          sx={{ mt: 1 }}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Paper>
        )}

        {/* Search and Filters */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 8 }}>
              <TextField
                fullWidth
                placeholder="Search test cases..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
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
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth>
                <InputLabel>Filter by Tier</InputLabel>
                <Select
                  value={filterTier}
                  label="Filter by Tier"
                  onChange={e => setFilterTier(e.target.value)}
                >
                  <MenuItem value="all">All Tiers</MenuItem>
                  <MenuItem value="Tier 1: CRITICAL">Tier 1: CRITICAL</MenuItem>
                  <MenuItem value="Tier 2: HIGH">Tier 2: HIGH</MenuItem>
                  <MenuItem value="Tier 3: STANDARD">Tier 3: STANDARD</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {/* Statistics */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="h6">{filteredTestCases.length}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Test Cases
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="h6">{collections.length}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Collections
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="h6">
                  {filteredTestCases.filter(tc => tc.testingTier === 'Tier 1: CRITICAL').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Critical Tests
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="h6">
                  {filteredTestCases.filter(tc => !tc.givenWhenThen).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Manual Cases
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* View Mode Toggle */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Test Cases ({filteredTestCases.length})</Typography>
          <Box display="flex" gap={2} alignItems="center">
            <Button
              variant="outlined"
              startIcon={<ExportIcon />}
              onClick={() => {
                setSelectedTestCasesForExport(filteredTestCases.map(tc => tc.id));
                setExportDialogOpen(true);
              }}
            >
              Export All
            </Button>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(_, newMode) => newMode && setViewMode(newMode)}
              aria-label="view mode"
            >
              <ToggleButton value="cards" aria-label="card view">
                <CardViewIcon />
              </ToggleButton>
              <ToggleButton value="table" aria-label="table view">
                <TableViewIcon />
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Box>

        {/* Test Cases Display */}
        {viewMode === 'cards' ? (
          /* Card View */
          <Grid container spacing={2}>
            {paginatedTestCases.map(testCase => (
              <Grid size={{ xs: 12, md: 6, lg: 4 }} key={testCase.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                      <Typography
                        variant="h6"
                        component="div"
                        sx={{ fontWeight: 'bold', color: 'primary.main' }}
                      >
                        {testCase.id}
                      </Typography>
                      {testCase.testingTier && (
                        <Chip
                          label={testCase.testingTier.split(':')[0]}
                          size="small"
                          color={getTierColor(testCase.testingTier) as any}
                        />
                      )}
                    </Box>

                    <Typography variant="h6" gutterBottom sx={{ fontSize: '1rem' }}>
                      {testCase.title}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 2,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {testCase.description}
                    </Typography>

                    {testCase.userStoryId && (
                      <Chip
                        label={testCase.userStoryId}
                        size="small"
                        variant="outlined"
                        sx={{ mb: 1, mr: 1 }}
                      />
                    )}

                    <Box display="flex" gap={1} alignItems="center" mt={2}>
                      <Chip
                        label={`${testCase.testSteps.length} steps`}
                        size="small"
                        variant="outlined"
                      />
                      {testCase.givenWhenThen && (
                        <Chip label="From scenario" size="small" variant="outlined" color="info" />
                      )}
                    </Box>
                  </CardContent>

                  <Box sx={{ p: 2, pt: 0, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                    <Tooltip title="View Details">
                      <IconButton size="small" onClick={() => handleViewTestCase(testCase)}>
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => handleEditTestCase(testCase)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteTestCase(testCase.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          /* List/Table View */
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Test Case ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                    Steps
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                    Tier
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedTestCases.map(testCase => (
                  <TableRow key={testCase.id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body2" fontWeight="bold" color="primary">
                          {testCase.id}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {testCase.title}
                      </Typography>
                      {testCase.givenWhenThen && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                          sx={{ mt: 0.5 }}
                        >
                          Scenario: {testCase.givenWhenThen.given.substring(0, 50)}...
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {testCase.description}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={testCase.testSteps.length} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell align="center">
                      {testCase.testingTier && (
                        <Chip
                          label={testCase.testingTier.split(':')[0]}
                          size="small"
                          color={getTierColor(testCase.testingTier) as any}
                        />
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Box display="flex" gap={0.5} justifyContent="center">
                        <Tooltip title="View Details">
                          <IconButton size="small" onClick={() => handleViewTestCase(testCase)}>
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => handleEditTestCase(testCase)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteTestCase(testCase.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Pagination */}
        {filteredTestCases.length > 0 && (
          <Box display="flex" justifyContent="center" mt={3}>
            <TablePagination
              component="div"
              count={filteredTestCases.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[10, 25, 50, 100]}
            />
          </Box>
        )}

        {filteredTestCases.length === 0 && (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No test cases found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Create test cases manually or generate them from Tier 1 and Tier 2 workflows.
            </Typography>
            <Box display="flex" gap={2} justifyContent="center">
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleGenerateTestCases}
              >
                Generate from Workflows
              </Button>
              <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateTestCase}>
                Create Manually
              </Button>
            </Box>
          </Paper>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {/* Workflows Tab Content */}
        <Box mb={2}>
          <TextField
            fullWidth
            placeholder="Search workflows by name, description, or acceptance criteria..."
            value={workflowSearchQuery}
            onChange={e => setWorkflowSearchQuery(e.target.value)}
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
            <Button variant="outlined" startIcon={<AddIcon />} onClick={handleImportFromTestPlans}>
              Import from Test Plans
            </Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateWorkflow}>
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
                  {filteredWorkflows
                    .slice(
                      workflowsPage * workflowsRowsPerPage,
                      workflowsPage * workflowsRowsPerPage + workflowsRowsPerPage
                    )
                    .map(workflow => {
                      const riskLevel = getRiskLevelFromScore(workflow.riskScore);
                      const automationStatus = getAutomationRecommendation(workflow.riskScore);

                      return (
                        <TableRow key={workflow.id}>
                          <TableCell>
                            <Box>
                              <Typography variant="subtitle2">{workflow.workflowName}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {workflow.description && workflow.description.length > 60
                                  ? `${workflow.description.substring(0, 60)}...`
                                  : workflow.description || ''}
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
                              label={workflow.testingTier || 'N/A'}
                              color={
                                workflow.testingTier?.includes('CRITICAL')
                                  ? 'error'
                                  : workflow.testingTier?.includes('HIGH')
                                    ? 'warning'
                                    : 'info'
                              }
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
                            <Box display="flex" gap={1}>
                              <Tooltip title="Edit Workflow">
                                <IconButton
                                  size="small"
                                  onClick={() => handleEditWorkflow(workflow)}
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete Workflow">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleDeleteWorkflow(workflow.id)}
                                >
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

            <Box display="flex" justifyContent="center" mt={3}>
              <TablePagination
                component="div"
                count={filteredWorkflows.length}
                page={workflowsPage}
                onPageChange={(_, newPage) => setWorkflowsPage(newPage)}
                rowsPerPage={workflowsRowsPerPage}
                onRowsPerPageChange={event => {
                  setWorkflowsRowsPerPage(parseInt(event.target.value, 10));
                  setWorkflowsPage(0);
                }}
              />
            </Box>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredWorkflows
              .slice(
                workflowsPage * workflowsRowsPerPage,
                workflowsPage * workflowsRowsPerPage + workflowsRowsPerPage
              )
              .map(workflow => {
                const riskLevel = getRiskLevelFromScore(workflow.riskScore);
                const automationStatus = getAutomationRecommendation(workflow.riskScore);
                return (
                  <Grid size={{ xs: 12, md: 6, lg: 4 }} key={workflow.id}>
                    <Card>
                      <CardContent>
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="flex-start"
                          mb={2}
                        >
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
                          {workflow.description}
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
                            label={workflow.testingTier || 'N/A'}
                            color={
                              workflow.testingTier?.includes('CRITICAL')
                                ? 'error'
                                : workflow.testingTier?.includes('HIGH')
                                  ? 'warning'
                                  : 'info'
                            }
                            size="small"
                            sx={{ mb: 1 }}
                          />
                        </Box>
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                          mb={2}
                        >
                          <Box>
                            <Typography variant="body2" gutterBottom>
                              <strong>Likelihood:</strong> {workflow.likelihood}/4 (1 = Most Likely)
                            </Typography>
                            <Typography variant="body2" gutterBottom>
                              <strong>Impact:</strong> {workflow.impact}/4 (1 = Most Impactful)
                            </Typography>
                            <Typography variant="body2" gutterBottom>
                              <strong>Risk Score:</strong> {workflow.riskScore}
                            </Typography>
                          </Box>
                        </Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          <strong>Deliverables:</strong> {workflow.deliverables}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          <strong>Automation Rule:</strong>{' '}
                          {automationStatus === 'Automate'
                            ? 'Score 1-6: Automate'
                            : 'Score 7-16: Manual Only'}
                        </Typography>
                        {workflow.automationRationale && (
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            <strong>Reasoning:</strong> {workflow.automationRationale}
                          </Typography>
                        )}
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                          mt={2}
                        >
                          <Typography variant="caption" color="text.secondary">
                            Updated: {workflow.updatedAt.toLocaleDateString()}
                          </Typography>
                          <Box display="flex" gap={1}>
                            <IconButton size="small" onClick={() => handleEditWorkflow(workflow)}>
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteWorkflow(workflow.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
          </Grid>
        )}

        {workflowsViewMode === 'cards' && filteredWorkflows.length > 10 && (
          <Box display="flex" justifyContent="center" mt={3}>
            <TablePagination
              component="div"
              count={filteredWorkflows.length}
              page={workflowsPage}
              onPageChange={(_, newPage) => setWorkflowsPage(newPage)}
              rowsPerPage={workflowsRowsPerPage}
              onRowsPerPageChange={event => {
                setWorkflowsRowsPerPage(parseInt(event.target.value, 10));
                setWorkflowsPage(0);
              }}
            />
          </Box>
        )}
      </TabPanel>

      {/* View Test Case Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1} justifyContent="space-between">
            <Typography variant="h6">Test Case {selectedTestCase?.id}</Typography>
            {selectedTestCase?.testingTier && (
              <Chip
                label={selectedTestCase.testingTier}
                size="small"
                color={getTierColor(selectedTestCase.testingTier) as any}
              />
            )}
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedTestCase && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedTestCase.title}
              </Typography>

              <Typography variant="body1" sx={{ mb: 2 }}>
                {selectedTestCase.description}
              </Typography>

              {selectedTestCase.userStoryId && (
                <Typography variant="body2" gutterBottom>
                  <strong>User Story ID:</strong> {selectedTestCase.userStoryId}
                </Typography>
              )}

              {selectedTestCase.givenWhenThen && (
                <Paper sx={{ p: 2, my: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Scenario
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>GIVEN:</strong> {selectedTestCase.givenWhenThen.given}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>WHEN:</strong> {selectedTestCase.givenWhenThen.when}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>THEN:</strong> {selectedTestCase.givenWhenThen.then}
                  </Typography>
                </Paper>
              )}

              {selectedTestCase.prerequisites && selectedTestCase.prerequisites.length > 0 && (
                <>
                  <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                    Prerequisites
                  </Typography>
                  <List dense>
                    {selectedTestCase.prerequisites.map((prereq, idx) => (
                      <ListItem key={idx}>
                        <ListItemText primary={`${idx + 1}. ${prereq}`} />
                      </ListItem>
                    ))}
                  </List>
                </>
              )}

              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                Test Steps
              </Typography>
              {selectedTestCase.testSteps.map(step => (
                <Paper key={step.id} sx={{ p: 2, mb: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Step {step.stepNumber}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Action:</strong> {step.action}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Expected Result:</strong> {step.expectedResult}
                  </Typography>
                </Paper>
              ))}

              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                Expected Result
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                {selectedTestCase.expectedResult}
              </Typography>

              {selectedTestCase.notes && (
                <>
                  <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                    Notes
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {selectedTestCase.notes}
                  </Typography>
                </>
              )}

              {selectedTestCase.tags && selectedTestCase.tags.length > 0 && (
                <Box mt={2}>
                  <Typography variant="subtitle2" gutterBottom>
                    Tags
                  </Typography>
                  {selectedTestCase.tags.map((tag, idx) => (
                    <Chip key={idx} label={tag} size="small" sx={{ mr: 1, mb: 1 }} />
                  ))}
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

              <Grid container spacing={2}>
                {selectedTestCase.riskScore && (
                  <Grid size={6}>
                    <Typography variant="body2">
                      <strong>Risk Score:</strong> {selectedTestCase.riskScore}
                    </Typography>
                  </Grid>
                )}
                {selectedTestCase.likelihood && (
                  <Grid size={6}>
                    <Typography variant="body2">
                      <strong>Likelihood:</strong> {selectedTestCase.likelihood}
                    </Typography>
                  </Grid>
                )}
                {selectedTestCase.impact && (
                  <Grid size={6}>
                    <Typography variant="body2">
                      <strong>Impact:</strong> {selectedTestCase.impact}
                    </Typography>
                  </Grid>
                )}
                {selectedTestCase.automationRecommendation && (
                  <Grid size={12}>
                    <Typography variant="body2">
                      <strong>Automation:</strong> {selectedTestCase.automationRecommendation}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => {
              setViewDialogOpen(false);
              handleEditTestCase(selectedTestCase!);
            }}
          >
            Edit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit/Create Test Case Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{selectedTestCase ? 'Edit Test Case' : 'Create New Test Case'}</DialogTitle>
        <DialogContent dividers sx={{ pt: 3 }}>
          <Grid container spacing={3}>
            <Grid size={12}>
              <TextField
                label="Test Case ID"
                fullWidth
                value={editFormData.id || ''}
                disabled
                helperText="Auto-generated"
              />
            </Grid>
            <Grid size={12}>
              <TextField
                label="Title *"
                fullWidth
                value={editFormData.title || ''}
                onChange={e => setEditFormData({ ...editFormData, title: e.target.value })}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                label="Description *"
                fullWidth
                multiline
                rows={3}
                value={editFormData.description || ''}
                onChange={e => setEditFormData({ ...editFormData, description: e.target.value })}
              />
            </Grid>
            <Grid size={12}>
              <Typography variant="subtitle2" gutterBottom>
                Test Scenario (Given/When/Then)
              </Typography>
            </Grid>
            <Grid size={12}>
              <TextField
                label="Given (Preconditions)"
                fullWidth
                multiline
                rows={2}
                value={editFormData.givenWhenThen?.given || ''}
                onChange={e =>
                  setEditFormData({
                    ...editFormData,
                    givenWhenThen: {
                      ...editFormData.givenWhenThen!,
                      given: e.target.value,
                    },
                  })
                }
              />
            </Grid>
            <Grid size={12}>
              <TextField
                label="When (Action)"
                fullWidth
                multiline
                rows={2}
                value={editFormData.givenWhenThen?.when || ''}
                onChange={e =>
                  setEditFormData({
                    ...editFormData,
                    givenWhenThen: {
                      ...editFormData.givenWhenThen!,
                      when: e.target.value,
                    },
                  })
                }
              />
            </Grid>
            <Grid size={12}>
              <TextField
                label="Then (Expected Outcome)"
                fullWidth
                multiline
                rows={2}
                value={editFormData.givenWhenThen?.then || ''}
                onChange={e =>
                  setEditFormData({
                    ...editFormData,
                    givenWhenThen: {
                      ...editFormData.givenWhenThen!,
                      then: e.target.value,
                    },
                  })
                }
              />
            </Grid>

            <Grid size={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                Test Steps
              </Typography>
              {(editFormData.testSteps || []).map((step, index) => (
                <Paper key={step.id} sx={{ p: 2, mb: 2 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      Step {step.stepNumber}
                    </Typography>
                    <IconButton size="small" onClick={() => removeTestStep(index)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                  <TextField
                    label="Action"
                    fullWidth
                    value={step.action}
                    onChange={e => updateTestStep(index, 'action', e.target.value)}
                    sx={{ mb: 2 }}
                    multiline
                    rows={2}
                  />
                  <TextField
                    label="Expected Result"
                    fullWidth
                    value={step.expectedResult}
                    onChange={e => updateTestStep(index, 'expectedResult', e.target.value)}
                    multiline
                    rows={2}
                  />
                </Paper>
              ))}
              <Button
                startIcon={<AddIcon />}
                onClick={addTestStep}
                variant="outlined"
                sx={{ mt: 1 }}
              >
                Add Test Step
              </Button>
            </Grid>

            <Grid size={12}>
              <Divider sx={{ my: 2 }} />
              <TextField
                label="Expected Result"
                fullWidth
                multiline
                rows={2}
                value={editFormData.expectedResult || ''}
                onChange={e => setEditFormData({ ...editFormData, expectedResult: e.target.value })}
                helperText="Overall expected outcome of the test case"
              />
            </Grid>

            <Grid size={12}>
              <TextField
                label="Notes"
                fullWidth
                multiline
                rows={3}
                value={editFormData.notes || ''}
                onChange={e => setEditFormData({ ...editFormData, notes: e.target.value })}
                helperText="Additional notes or special considerations"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveTestCase}>
            {selectedTestCase ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Collection Dialog */}
      <Dialog
        open={collectionDialogOpen}
        onClose={() => setCollectionDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedCollection ? 'Edit Collection' : 'Create New Collection'}
        </DialogTitle>
        <DialogContent dividers sx={{ pt: 3 }}>
          <Grid container spacing={3}>
            <Grid size={12}>
              <TextField
                label="Collection Name *"
                fullWidth
                value={collectionFormData.name}
                onChange={e =>
                  setCollectionFormData({ ...collectionFormData, name: e.target.value })
                }
              />
            </Grid>
            <Grid size={12}>
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={2}
                value={collectionFormData.description}
                onChange={e =>
                  setCollectionFormData({ ...collectionFormData, description: e.target.value })
                }
              />
            </Grid>
            <Grid size={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, mb: 1 }}>
                Select Test Cases
              </Typography>
              <Box
                sx={{
                  maxHeight: 300,
                  overflowY: 'auto',
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                  p: 2,
                }}
              >
                {testCases.map(tc => (
                  <FormControlLabel
                    key={tc.id}
                    control={
                      <Checkbox
                        checked={collectionFormData.selectedTestCaseIds.includes(tc.id)}
                        onChange={e => {
                          const checked = e.target.checked;
                          setCollectionFormData({
                            ...collectionFormData,
                            selectedTestCaseIds: checked
                              ? [...collectionFormData.selectedTestCaseIds, tc.id]
                              : collectionFormData.selectedTestCaseIds.filter(id => id !== tc.id),
                          });
                        }}
                      />
                    }
                    label={`${tc.id} - ${tc.title}`}
                    sx={{ display: 'block', mb: 1 }}
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setCollectionDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveCollection}>
            {selectedCollection ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Export Dialog */}
      <Dialog
        open={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Export Test Cases</DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom>
            {selectedTestCasesForExport.length} test case
            {selectedTestCasesForExport.length !== 1 ? 's' : ''} selected for export
          </Typography>
          <Box mt={3} display="flex" flexDirection="column" gap={2}>
            <Button
              variant="outlined"
              startIcon={<ExportIcon />}
              onClick={() => {
                const testCasesToExport = testCases.filter(tc =>
                  selectedTestCasesForExport.includes(tc.id)
                );
                handleExportPDF(testCasesToExport);
                setExportDialogOpen(false);
              }}
              fullWidth
            >
              Export as PDF/Text
            </Button>
            <Button
              variant="outlined"
              startIcon={<ExportIcon />}
              onClick={() => {
                const testCasesToExport = testCases.filter(tc =>
                  selectedTestCasesForExport.includes(tc.id)
                );
                handleExportMarkdown(testCasesToExport);
                setExportDialogOpen(false);
              }}
              fullWidth
            >
              Export as Markdown
            </Button>
            <Button
              variant="outlined"
              startIcon={<CopyIcon />}
              onClick={() => {
                const testCasesToExport = testCases.filter(tc =>
                  selectedTestCasesForExport.includes(tc.id)
                );
                handleExportChromeExtension(testCasesToExport);
                setExportDialogOpen(false);
              }}
              fullWidth
            >
              Export for Chrome Extension
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Workflow Dialog */}
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
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenWorkflowDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmitWorkflow} variant="contained">
            {selectedWorkflow ? 'Update Workflow' : 'Create Workflow'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Import from Test Plans Dialog */}
      <Dialog
        open={openImportDialog}
        onClose={() => setOpenImportDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Import Test Scenarios from Test Plans</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Select test scenarios from existing test plans to create workflows
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
    </Box>
  );
};

export default TCMView;
