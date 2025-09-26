import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper,
  Card,
  CardContent,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  LinearProgress,
  CircularProgress,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Computer as ComputerIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  PlayArrow as PlayArrowIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  Terminal as TerminalIcon,
  Build as BuildIcon,
  Settings as SettingsIcon,
  Help as HelpIcon,
} from '@mui/icons-material';
import { MacSetupService } from '../utils/macSetupService';
import { MacSetupProgress, MacSetupStep, MacSystemInfo } from '../types';

interface ValidationResult {
  stepId: string;
  success: boolean;
  message: string;
}

const MacSetupView: React.FC = () => {
  const [progress, setProgress] = useState<MacSetupProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState<string | null>(null);
  const [systemInfo, setSystemInfo] = useState<MacSystemInfo>({});
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [showSystemInfo, setShowSystemInfo] = useState(false);
  const [showTroubleshooting, setShowTroubleshooting] = useState<string | null>(null);

  useEffect(() => {
    initializeSetup();
  }, []);

  const initializeSetup = async () => {
    setLoading(true);
    try {
      // Load existing progress or initialize new
      let setupProgress = MacSetupService.loadProgress();
      if (!setupProgress) {
        setupProgress = MacSetupService.initializeProgress();
      }

      // Get current system info
      const sysInfo = await MacSetupService.getSystemInfo();
      setSystemInfo(sysInfo);
      
      if (setupProgress) {
        setupProgress.systemInfo = sysInfo;
        setProgress(setupProgress);
        MacSetupService.saveProgress(setupProgress);
      }
    } catch (error) {
      console.error('Error initializing setup:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateStep = async (step: MacSetupStep) => {
    if (!progress) return;

    setValidating(step.id);
    
    try {
      // Update step to in-progress
      const updatedProgress = MacSetupService.updateStepStatus(progress, step.id, 'in-progress');
      setProgress(updatedProgress);

      // Run validation
      const result = await MacSetupService.validateStep(step);
      
      // Update step status based on result
      const newStatus = result.success ? 'completed' : 'failed';
      const finalProgress = MacSetupService.updateStepStatus(updatedProgress, step.id, newStatus);
      
      setProgress(finalProgress);
      MacSetupService.saveProgress(finalProgress);

      // Update validation results
      setValidationResults(prev => [
        ...prev.filter(r => r.stepId !== step.id),
        { stepId: step.id, success: result.success, message: result.message }
      ]);

    } catch (error) {
      const failedProgress = MacSetupService.updateStepStatus(progress, step.id, 'failed');
      setProgress(failedProgress);
      MacSetupService.saveProgress(failedProgress);
      
      setValidationResults(prev => [
        ...prev.filter(r => r.stepId !== step.id),
        { stepId: step.id, success: false, message: `Error: ${error}` }
      ]);
    } finally {
      setValidating(null);
    }
  };

  const skipStep = (step: MacSetupStep) => {
    if (!progress) return;
    
    const updatedProgress = MacSetupService.updateStepStatus(progress, step.id, 'skipped');
    setProgress(updatedProgress);
    MacSetupService.saveProgress(updatedProgress);
  };

  const resetSetup = () => {
    MacSetupService.resetProgress();
    initializeSetup();
    setValidationResults([]);
  };

  const runAllValidations = async () => {
    if (!progress) return;

    for (const step of progress.setupSteps) {
      if (step.status !== 'completed') {
        await validateStep(step);
        // Add small delay between validations
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  };

  const getStepIcon = (step: MacSetupStep) => {
    if (validating === step.id) {
      return <CircularProgress size={20} />;
    }

    switch (step.status) {
      case 'completed':
        return <CheckCircleIcon color="success" />;
      case 'failed':
        return <ErrorIcon color="error" />;
      case 'in-progress':
        return <CircularProgress size={20} />;
      case 'skipped':
        return <WarningIcon color="warning" />;
      default:
        return step.isOptional ? <InfoIcon color="info" /> : <ComputerIcon />;
    }
  };

  const getValidationResult = (stepId: string) => {
    return validationResults.find(r => r.stepId === stepId);
  };

  const renderSystemInfoCard = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SettingsIcon />
            System Information
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setShowSystemInfo(true)}
            startIcon={<InfoIcon />}
          >
            View Details
          </Button>
        </Box>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <List dense>
              <ListItem>
                <ListItemText 
                  primary="Operating System" 
                  secondary={systemInfo.osVersion || 'Checking...'} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Architecture" 
                  secondary={systemInfo.architecture || 'Detecting...'} 
                />
              </ListItem>
            </List>
          </Grid>
          <Grid item xs={12} md={6}>
            <List dense>
              <ListItem>
                <ListItemText 
                  primary="Node.js" 
                  secondary={systemInfo.nodeVersion || 'Not detected'} 
                />
                <ListItemSecondaryAction>
                  <Chip 
                    size="small" 
                    color={systemInfo.nodeVersion ? 'success' : 'default'}
                    label={systemInfo.nodeVersion ? 'Installed' : 'Missing'}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Git" 
                  secondary={systemInfo.gitVersion || 'Not detected'} 
                />
                <ListItemSecondaryAction>
                  <Chip 
                    size="small" 
                    color={systemInfo.gitVersion ? 'success' : 'default'}
                    label={systemInfo.gitVersion ? 'Installed' : 'Missing'}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const renderProgressSummary = () => {
    if (!progress) return null;

    const progressPercentage = MacSetupService.getProgressPercentage(progress);
    const completedSteps = progress.setupSteps.filter(s => s.status === 'completed').length;
    const failedSteps = progress.setupSteps.filter(s => s.status === 'failed').length;
    const skippedSteps = progress.setupSteps.filter(s => s.status === 'skipped').length;

    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Setup Progress
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={progressPercentage} 
            sx={{ mb: 2, height: 8, borderRadius: 4 }}
          />
          <Grid container spacing={2}>
            <Grid item xs={3}>
              <Box textAlign="center">
                <Typography variant="h4" color="success.main">{completedSteps}</Typography>
                <Typography variant="caption">Completed</Typography>
              </Box>
            </Grid>
            <Grid item xs={3}>
              <Box textAlign="center">
                <Typography variant="h4" color="error.main">{failedSteps}</Typography>
                <Typography variant="caption">Failed</Typography>
              </Box>
            </Grid>
            <Grid item xs={3}>
              <Box textAlign="center">
                <Typography variant="h4" color="warning.main">{skippedSteps}</Typography>
                <Typography variant="caption">Skipped</Typography>
              </Box>
            </Grid>
            <Grid item xs={3}>
              <Box textAlign="center">
                <Typography variant="h4" color="primary.main">{progressPercentage}%</Typography>
                <Typography variant="caption">Complete</Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  const renderSetupStep = (step: MacSetupStep, index: number) => {
    const validationResult = getValidationResult(step.id);
    
    return (
      <Step key={step.id} expanded={true}>
        <StepLabel
          StepIconComponent={() => getStepIcon(step)}
          optional={step.isOptional && <Typography variant="caption">Optional</Typography>}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {step.title}
            {step.status === 'completed' && <Chip label="Done" size="small" color="success" />}
            {step.status === 'failed' && <Chip label="Failed" size="small" color="error" />}
            {step.status === 'skipped' && <Chip label="Skipped" size="small" color="warning" />}
          </Box>
        </StepLabel>
        <StepContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {step.description}
          </Typography>

          {validationResult && (
            <Alert 
              severity={validationResult.success ? 'success' : 'error'} 
              sx={{ mb: 2 }}
            >
              {validationResult.message}
            </Alert>
          )}

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
            <Button
              variant="contained"
              size="small"
              onClick={() => validateStep(step)}
              disabled={validating === step.id}
              startIcon={validating === step.id ? <CircularProgress size={16} /> : <PlayArrowIcon />}
            >
              {step.status === 'completed' ? 'Re-validate' : 'Validate'}
            </Button>
            
            {step.isOptional && step.status !== 'completed' && (
              <Button
                variant="outlined"
                size="small"
                onClick={() => skipStep(step)}
                disabled={validating === step.id}
              >
                Skip
              </Button>
            )}

            {step.troubleshootingTips && step.troubleshootingTips.length > 0 && (
              <Button
                variant="outlined"
                size="small"
                onClick={() => setShowTroubleshooting(step.id)}
                startIcon={<HelpIcon />}
              >
                Help
              </Button>
            )}
          </Box>

          {step.installCommand && (
            <Accordion sx={{ mt: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TerminalIcon fontSize="small" />
                  Installation Command
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Paper sx={{ p: 2, backgroundColor: 'grey.100' }}>
                  <Typography 
                    variant="body2" 
                    component="code" 
                    sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}
                  >
                    {step.installCommand}
                  </Typography>
                </Paper>
              </AccordionDetails>
            </Accordion>
          )}
        </StepContent>
      </Step>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!progress) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Failed to initialize Mac setup. Please try refreshing the page.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Blackboard Learn Ultra Development Setup
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            onClick={runAllValidations}
            disabled={!!validating}
            startIcon={<BuildIcon />}
          >
            Validate All
          </Button>
          <Button
            variant="outlined"
            onClick={resetSetup}
            startIcon={<RefreshIcon />}
          >
            Reset
          </Button>
        </Box>
      </Box>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Follow this interactive guide to set up your Mac for Blackboard Learn Ultra development. 
        Each step includes validation to ensure your environment is configured correctly for Learn development.
      </Typography>

      {renderSystemInfoCard()}
      {renderProgressSummary()}

      <Paper sx={{ p: 3 }}>
        <Stepper orientation="vertical">
          {progress.setupSteps.map((step, index) => renderSetupStep(step, index))}
        </Stepper>
      </Paper>

      {/* System Info Dialog */}
      <Dialog open={showSystemInfo} onClose={() => setShowSystemInfo(false)} maxWidth="md" fullWidth>
        <DialogTitle>Detailed System Information</DialogTitle>
        <DialogContent>
          <List>
            {Object.entries(systemInfo).map(([key, value]) => (
              <ListItem key={key}>
                <ListItemText 
                  primary={key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                  secondary={value?.toString() || 'Not available'}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSystemInfo(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Troubleshooting Dialog */}
      <Dialog 
        open={!!showTroubleshooting} 
        onClose={() => setShowTroubleshooting(null)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>Troubleshooting Tips</DialogTitle>
        <DialogContent>
          {showTroubleshooting && (
            <List>
              {progress.setupSteps
                .find(s => s.id === showTroubleshooting)
                ?.troubleshootingTips?.map((tip, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <HelpIcon />
                  </ListItemIcon>
                  <ListItemText primary={tip} />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowTroubleshooting(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MacSetupView;