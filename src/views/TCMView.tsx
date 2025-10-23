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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Divider,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  ViewModule as CardViewIcon,
  ViewList as TableViewIcon,
  Search as SearchIcon,
  ExpandMore,
  Delete as DeleteIcon,
  GetApp as ExportIcon,
  FolderOpen as CollectionIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material';
import { TCMTestCase, TCMCollection, UserWorkflow, TestPlan, TestStep } from '../types';
import { DataService } from '../utils/dataService';
import Fuse from 'fuse.js';

const TCMView: React.FC = () => {
  const [testCases, setTestCases] = useState<TCMTestCase[]>([]);
  const [collections, setCollections] = useState<TCMCollection[]>([]);
  const [workflows, setWorkflows] = useState<UserWorkflow[]>([]);
  const [testPlans, setTestPlans] = useState<TestPlan[]>([]);
  const [filteredTestCases, setFilteredTestCases] = useState<TCMTestCase[]>([]);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');
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
        keys: ['title', 'description', 'acceptanceCriteria', 'adoNumber', 'id', 'tags'],
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
      acceptanceCriteria: '',
      testSteps: [
        { id: '1', stepNumber: 1, action: '', expectedResult: '' }
      ],
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
      sourceTestPlanId: editFormData.sourceTestPlanId,
      sourceScenarioId: editFormData.sourceScenarioId,
      sourceAcceptanceCriteriaId: editFormData.sourceAcceptanceCriteriaId,
      adoNumber: editFormData.adoNumber,
      givenWhenThen: editFormData.givenWhenThen,
      acceptanceCriteria: editFormData.acceptanceCriteria || '',
      riskScore: editFormData.riskScore,
      testingTier: editFormData.testingTier,
      likelihood: editFormData.likelihood,
      impact: editFormData.impact,
      deliverables: editFormData.deliverables,
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
    const content = testCasesToExport.map((tc, index) => 
      `${index + 1}. ${tc.title} - ${tc.description}`
    ).join('\n');
    downloadFile(content, 'test-cases-chrome-ext.txt', 'text/plain');
  };

  const generateExportContent = (testCasesToExport: TCMTestCase[], format: 'pdf' | 'markdown') => {
    if (format === 'markdown') {
      return testCasesToExport.map(tc => {
        let md = `# ${tc.title}\n\n`;
        md += `**Test Case ID:** ${tc.id}\n\n`;
        md += `**Description:** ${tc.description}\n\n`;
        
        if (tc.adoNumber) {
          md += `**ADO Number:** ${tc.adoNumber}\n\n`;
        }
        
        if (tc.givenWhenThen) {
          md += `## Scenario\n\n`;
          md += `**Given:** ${tc.givenWhenThen.given}\n\n`;
          md += `**When:** ${tc.givenWhenThen.when}\n\n`;
          md += `**Then:** ${tc.givenWhenThen.then}\n\n`;
        }
        
        md += `**Acceptance Criteria:** ${tc.acceptanceCriteria}\n\n`;
        
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
      }).join('\n');
    } else {
      // PDF format (text-based for now)
      return testCasesToExport.map(tc => {
        let text = `TEST CASE: ${tc.title}\n`;
        text += `${'='.repeat(80)}\n\n`;
        text += `Test Case ID: ${tc.id}\n`;
        text += `Description: ${tc.description}\n`;
        
        if (tc.adoNumber) {
          text += `ADO Number: ${tc.adoNumber}\n`;
        }
        
        if (tc.givenWhenThen) {
          text += `\nSCENARIO:\n`;
          text += `  Given: ${tc.givenWhenThen.given}\n`;
          text += `  When: ${tc.givenWhenThen.when}\n`;
          text += `  Then: ${tc.givenWhenThen.then}\n`;
        }
        
        text += `\nAcceptance Criteria: ${tc.acceptanceCriteria}\n`;
        
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
      }).join('\n');
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

  // Group test cases by Given/When/Then scenario
  const groupedTestCases = filteredTestCases.reduce((groups, testCase) => {
    if (!testCase.givenWhenThen) return groups;
    
    const key = `${testCase.sourceTestPlanId}-${testCase.sourceScenarioId}`;
    if (!groups[key]) {
      groups[key] = {
        scenario: testCase.givenWhenThen,
        adoNumber: testCase.adoNumber,
        testCases: [],
      };
    }
    groups[key].testCases.push(testCase);
    return groups;
  }, {} as Record<string, { scenario: { given: string; when: string; then: string }; adoNumber?: string; testCases: TCMTestCase[] }>);

  // Ungrouped test cases (manually created)
  const ungroupedTestCases = filteredTestCases.filter(tc => !tc.givenWhenThen);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <div>
          <Typography variant="h4" gutterBottom>
            Test Case Repository
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Central repository of test cases with detailed steps for execution
          </Typography>
        </div>
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
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateTestCase}
          >
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
                <Grid item xs={12} md={6} lg={4} key={collection.id}>
                  <Card>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="start">
                        <Typography variant="h6">{collection.name}</Typography>
                        <Box>
                          <Tooltip title="Export">
                            <IconButton size="small" onClick={() => {
                              setSelectedTestCasesForExport(collection.testCaseIds);
                              setExportDialogOpen(true);
                            }}>
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
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              placeholder="Search test cases..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Filter by Tier</InputLabel>
              <Select
                value={filterTier}
                label="Filter by Tier"
                onChange={(e) => setFilterTier(e.target.value)}
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
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">{filteredTestCases.length}</Typography>
              <Typography variant="body2" color="text.secondary">
                Total Test Cases
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">{collections.length}</Typography>
              <Typography variant="body2" color="text.secondary">
                Collections
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
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
        <Grid item xs={6} md={3}>
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
        <Typography variant="h6">
          Test Cases ({filteredTestCases.length})
        </Typography>
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

      {/* Grouped by Scenario View */}
      {Object.entries(groupedTestCases).map(([key, group]) => (
        <Accordion key={key} defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', pr: 2 }}>
              <Box>
                <Typography variant="h6">
                  {group.adoNumber && <Chip label={group.adoNumber} size="small" sx={{ mr: 1 }} />}
                  <strong>GIVEN</strong> {group.scenario.given} <strong>WHEN</strong> {group.scenario.when} <strong>THEN</strong> {group.scenario.then}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {group.testCases.length} test case{group.testCases.length !== 1 ? 's' : ''}
                </Typography>
              </Box>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Test Case ID</TableCell>
                    <TableCell>Title</TableCell>
                    <TableCell>Acceptance Criteria</TableCell>
                    <TableCell align="center">Steps</TableCell>
                    <TableCell align="center">Tier</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {group.testCases.map((testCase) => (
                    <TableRow key={testCase.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {testCase.id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {testCase.title}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {testCase.acceptanceCriteria}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={testCase.testSteps.length}
                          size="small"
                          variant="outlined"
                        />
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
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </Accordion>
      ))}

      {/* Ungrouped Test Cases */}
      {ungroupedTestCases.length > 0 && (
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box sx={{ width: '100%' }}>
              <Typography variant="h6">
                Manual Test Cases
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {ungroupedTestCases.length} test case{ungroupedTestCases.length !== 1 ? 's' : ''}
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Test Case ID</TableCell>
                    <TableCell>Title</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell align="center">Steps</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ungroupedTestCases.map((testCase) => (
                    <TableRow key={testCase.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {testCase.id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {testCase.title}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {testCase.description}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={testCase.testSteps.length}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
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
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </Accordion>
      )}

      {filteredTestCases.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No test cases found
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Create test cases manually or generate them from Tier 1 and Tier 2 workflows.
          </Typography>
          <Box display="flex" gap={2} justifyContent="center">
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={handleGenerateTestCases}>
              Generate from Workflows
            </Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateTestCase}>
              Create Manually
            </Button>
          </Box>
        </Paper>
      )}

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
              
              <Typography variant="body1" paragraph>
                {selectedTestCase.description}
              </Typography>

              {selectedTestCase.adoNumber && (
                <Typography variant="body2" gutterBottom>
                  <strong>ADO Number:</strong> {selectedTestCase.adoNumber}
                </Typography>
              )}

              {selectedTestCase.givenWhenThen && (
                <Paper sx={{ p: 2, my: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="subtitle2" gutterBottom>Scenario</Typography>
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

              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                Acceptance Criteria
              </Typography>
              <Typography variant="body2" paragraph>
                {selectedTestCase.acceptanceCriteria}
              </Typography>

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
              {selectedTestCase.testSteps.map((step, idx) => (
                <Paper key={step.id} sx={{ p: 2, mb: 1, bgcolor: 'grey.50' }}>
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
              <Typography variant="body2" paragraph>
                {selectedTestCase.expectedResult}
              </Typography>

              {selectedTestCase.notes && (
                <>
                  <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                    Notes
                  </Typography>
                  <Typography variant="body2" paragraph>
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
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      <strong>Risk Score:</strong> {selectedTestCase.riskScore}
                    </Typography>
                  </Grid>
                )}
                {selectedTestCase.likelihood && (
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      <strong>Likelihood:</strong> {selectedTestCase.likelihood}
                    </Typography>
                  </Grid>
                )}
                {selectedTestCase.impact && (
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      <strong>Impact:</strong> {selectedTestCase.impact}
                    </Typography>
                  </Grid>
                )}
                {selectedTestCase.deliverables && (
                  <Grid item xs={12}>
                    <Typography variant="body2">
                      <strong>Deliverables:</strong> {selectedTestCase.deliverables}
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
        <DialogTitle>
          {selectedTestCase ? 'Edit Test Case' : 'Create New Test Case'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Test Case ID"
                fullWidth
                value={editFormData.id || ''}
                disabled
                helperText="Auto-generated"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Title *"
                fullWidth
                value={editFormData.title || ''}
                onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description *"
                fullWidth
                multiline
                rows={3}
                value={editFormData.description || ''}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Acceptance Criteria"
                fullWidth
                multiline
                rows={2}
                value={editFormData.acceptanceCriteria || ''}
                onChange={(e) => setEditFormData({ ...editFormData, acceptanceCriteria: e.target.value })}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Test Steps
              </Typography>
              {(editFormData.testSteps || []).map((step, index) => (
                <Paper key={step.id} sx={{ p: 2, mb: 2 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="subtitle2">Step {step.stepNumber}</Typography>
                    <IconButton size="small" onClick={() => removeTestStep(index)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                  <TextField
                    label="Action"
                    fullWidth
                    value={step.action}
                    onChange={(e) => updateTestStep(index, 'action', e.target.value)}
                    sx={{ mb: 1 }}
                  />
                  <TextField
                    label="Expected Result"
                    fullWidth
                    value={step.expectedResult}
                    onChange={(e) => updateTestStep(index, 'expectedResult', e.target.value)}
                  />
                </Paper>
              ))}
              <Button startIcon={<AddIcon />} onClick={addTestStep}>
                Add Test Step
              </Button>
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Expected Result"
                fullWidth
                multiline
                rows={2}
                value={editFormData.expectedResult || ''}
                onChange={(e) => setEditFormData({ ...editFormData, expectedResult: e.target.value })}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Notes"
                fullWidth
                multiline
                rows={3}
                value={editFormData.notes || ''}
                onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
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
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Collection Name *"
                fullWidth
                value={collectionFormData.name}
                onChange={(e) => setCollectionFormData({ ...collectionFormData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={2}
                value={collectionFormData.description}
                onChange={(e) => setCollectionFormData({ ...collectionFormData, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Select Test Cases
              </Typography>
              <Box sx={{ maxHeight: 300, overflowY: 'auto', border: 1, borderColor: 'divider', borderRadius: 1, p: 1 }}>
                {testCases.map(tc => (
                  <FormControlLabel
                    key={tc.id}
                    control={
                      <Checkbox
                        checked={collectionFormData.selectedTestCaseIds.includes(tc.id)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setCollectionFormData({
                            ...collectionFormData,
                            selectedTestCaseIds: checked
                              ? [...collectionFormData.selectedTestCaseIds, tc.id]
                              : collectionFormData.selectedTestCaseIds.filter(id => id !== tc.id)
                          });
                        }}
                      />
                    }
                    label={`${tc.id} - ${tc.title}`}
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
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
            {selectedTestCasesForExport.length} test case{selectedTestCasesForExport.length !== 1 ? 's' : ''} selected for export
          </Typography>
          <Box mt={3} display="flex" flexDirection="column" gap={2}>
            <Button
              variant="outlined"
              startIcon={<ExportIcon />}
              onClick={() => {
                const testCasesToExport = testCases.filter(tc => selectedTestCasesForExport.includes(tc.id));
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
                const testCasesToExport = testCases.filter(tc => selectedTestCasesForExport.includes(tc.id));
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
                const testCasesToExport = testCases.filter(tc => selectedTestCasesForExport.includes(tc.id));
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
    </Box>
  );
};

export default TCMView;
