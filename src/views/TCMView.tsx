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
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  PlayArrow as ExecuteIcon,
  Refresh as RefreshIcon,
  ViewModule as CardViewIcon,
  ViewList as TableViewIcon,
  Search as SearchIcon,
  ExpandMore,
  CheckCircle as PassedIcon,
  Error as FailedIcon,
  Block as BlockedIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { TCMTestCase, UserWorkflow, TestPlan } from '../types';
import { DataService } from '../utils/dataService';
import Fuse from 'fuse.js';

const TCMView: React.FC = () => {
  const [testCases, setTestCases] = useState<TCMTestCase[]>([]);
  const [workflows, setWorkflows] = useState<UserWorkflow[]>([]);
  const [testPlans, setTestPlans] = useState<TestPlan[]>([]);
  const [filteredTestCases, setFilteredTestCases] = useState<TCMTestCase[]>([]);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTier, setFilterTier] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedTestCase, setSelectedTestCase] = useState<TCMTestCase | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [testCases, searchQuery, filterTier, filterStatus]);

  const loadData = () => {
    const tcmCases = DataService.getTCMTestCases();
    const wf = DataService.getUserWorkflows();
    const tp = DataService.getTestPlans();
    
    setTestCases(tcmCases);
    setWorkflows(wf);
    setTestPlans(tp);
    setFilteredTestCases(tcmCases);
  };

  const applyFilters = () => {
    let filtered = [...testCases];

    // Filter by tier
    if (filterTier !== 'all') {
      filtered = filtered.filter(tc => tc.testingTier === filterTier);
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(tc => tc.status === filterStatus);
    }

    // Apply search
    if (searchQuery.trim()) {
      const fuse = new Fuse(filtered, {
        keys: ['title', 'description', 'acceptanceCriteria', 'adoNumber', 'id'],
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

  const handleViewTestCase = (testCase: TCMTestCase) => {
    setSelectedTestCase(testCase);
    setViewDialogOpen(true);
  };

  const handleUpdateStatus = (testCase: TCMTestCase, newStatus: TCMTestCase['status']) => {
    const updatedTestCase = {
      ...testCase,
      status: newStatus,
      lastExecuted: newStatus === 'Passed' || newStatus === 'Failed' ? new Date() : testCase.lastExecuted,
      updatedAt: new Date(),
    };
    DataService.saveTCMTestCase(updatedTestCase);
    loadData();
  };

  const handleDeleteTestCase = (testCaseId: string) => {
    if (window.confirm('Are you sure you want to delete this test case?')) {
      DataService.deleteTCMTestCase(testCaseId);
      loadData();
    }
  };

  const getStatusColor = (status: TCMTestCase['status']) => {
    switch (status) {
      case 'Passed': return 'success';
      case 'Failed': return 'error';
      case 'Blocked': return 'warning';
      case 'In Progress': return 'info';
      case 'Ready': return 'primary';
      default: return 'default';
    }
  };

  const getTierColor = (tier: string) => {
    if (tier.includes('CRITICAL')) return 'error';
    if (tier.includes('HIGH')) return 'warning';
    return 'info';
  };

  const getStatusIcon = (status: TCMTestCase['status']) => {
    switch (status) {
      case 'Passed': return <PassedIcon />;
      case 'Failed': return <FailedIcon />;
      case 'Blocked': return <BlockedIcon />;
      default: return null;
    }
  };

  // Group test cases by Given/When/Then scenario
  const groupedTestCases = filteredTestCases.reduce((groups, testCase) => {
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

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <div>
          <Typography variant="h4" gutterBottom>
            Test Case Management (TCM)
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage test cases generated from Tier 1 & 2 acceptance criteria
          </Typography>
        </div>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={handleGenerateTestCases}
        >
          Generate Test Cases
        </Button>
      </Box>

      {/* Search and Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
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
          <Grid item xs={12} md={3}>
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
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Filter by Status</InputLabel>
              <Select
                value={filterStatus}
                label="Filter by Status"
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="Draft">Draft</MenuItem>
                <MenuItem value="Ready">Ready</MenuItem>
                <MenuItem value="In Progress">In Progress</MenuItem>
                <MenuItem value="Passed">Passed</MenuItem>
                <MenuItem value="Failed">Failed</MenuItem>
                <MenuItem value="Blocked">Blocked</MenuItem>
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
              <Typography variant="h6">
                {filteredTestCases.filter(tc => tc.status === 'Passed').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Passed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">
                {filteredTestCases.filter(tc => tc.status === 'Failed').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Failed
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
      </Grid>

      {/* View Mode Toggle */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">
          Test Cases ({filteredTestCases.length})
        </Typography>
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

      {/* Grouped by Scenario View */}
      {Object.entries(groupedTestCases).map(([key, group]) => (
        <Accordion key={key} defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box>
              <Typography variant="h6">
                {group.adoNumber && <Chip label={group.adoNumber} size="small" sx={{ mr: 1 }} />}
                <strong>GIVEN</strong> {group.scenario.given} <strong>WHEN</strong> {group.scenario.when} <strong>THEN</strong> {group.scenario.then}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {group.testCases.length} test case{group.testCases.length !== 1 ? 's' : ''}
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Test Case ID</TableCell>
                    <TableCell>Acceptance Criteria</TableCell>
                    <TableCell align="center">Impact</TableCell>
                    <TableCell align="center">Likelihood</TableCell>
                    <TableCell align="center">Risk Factor</TableCell>
                    <TableCell align="center">Tier</TableCell>
                    <TableCell align="center">Status</TableCell>
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
                          {testCase.acceptanceCriteria}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={testCase.impact} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={testCase.likelihood} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={testCase.riskScore} 
                          size="small"
                          color={testCase.riskScore <= 4 ? 'error' : testCase.riskScore <= 8 ? 'warning' : 'info'}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={testCase.testingTier.split(':')[0]}
                          size="small"
                          color={getTierColor(testCase.testingTier) as any}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={testCase.status}
                          size="small"
                          color={getStatusColor(testCase.status) as any}
                          icon={getStatusIcon(testCase.status)}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="View Details">
                          <IconButton size="small" onClick={() => handleViewTestCase(testCase)}>
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Execute Test">
                          <IconButton 
                            size="small" 
                            onClick={() => handleUpdateStatus(testCase, 'In Progress')}
                          >
                            <ExecuteIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Test Case">
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

      {filteredTestCases.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No test cases found
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Click "Generate Test Cases" to create test cases from your Tier 1 and Tier 2 workflows.
          </Typography>
          <Button variant="contained" startIcon={<RefreshIcon />} onClick={handleGenerateTestCases}>
            Generate Test Cases
          </Button>
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
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="h6">Test Case {selectedTestCase?.id}</Typography>
            <Chip
              label={selectedTestCase?.status}
              size="small"
              color={getStatusColor(selectedTestCase?.status || 'Draft') as any}
            />
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedTestCase && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Title:</strong> {selectedTestCase.title}
              </Typography>
              
              {selectedTestCase.adoNumber && (
                <Typography variant="body2" gutterBottom>
                  <strong>ADO Number:</strong> {selectedTestCase.adoNumber}
                </Typography>
              )}

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

              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                Acceptance Criteria
              </Typography>
              <Typography variant="body2" paragraph>
                {selectedTestCase.acceptanceCriteria}
              </Typography>

              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>Impact:</strong> {selectedTestCase.impact}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>Likelihood:</strong> {selectedTestCase.likelihood}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>Risk Score:</strong> {selectedTestCase.riskScore}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>Testing Tier:</strong> {selectedTestCase.testingTier}
                  </Typography>
                </Grid>
              </Grid>

              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                Deliverables
              </Typography>
              <Typography variant="body2" paragraph>
                {selectedTestCase.deliverables}
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

              {selectedTestCase.lastExecuted && (
                <Typography variant="caption" color="text.secondary">
                  Last executed: {selectedTestCase.lastExecuted.toLocaleString()}
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          <Button
            variant="outlined"
            color="success"
            onClick={() => {
              if (selectedTestCase) {
                handleUpdateStatus(selectedTestCase, 'Passed');
                setViewDialogOpen(false);
              }
            }}
          >
            Mark as Passed
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={() => {
              if (selectedTestCase) {
                handleUpdateStatus(selectedTestCase, 'Failed');
                setViewDialogOpen(false);
              }
            }}
          >
            Mark as Failed
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TCMView;
