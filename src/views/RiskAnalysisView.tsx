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
  Rating,
  Fab,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { RiskAnalysis } from '../types';

const RiskAnalysisView: React.FC = () => {
  const [riskAnalyses, setRiskAnalyses] = useState<RiskAnalysis[]>([
    {
      id: '1',
      title: 'User Authentication Security',
      description: 'Risk analysis for authentication module vulnerabilities',
      riskLevel: 'High',
      probability: 3,
      impact: 5,
      mitigation: 'Implement multi-factor authentication and regular security audits',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
    },
    {
      id: '2',
      title: 'Database Performance Under Load',
      description: 'Assessment of database performance risks during peak usage',
      riskLevel: 'Medium',
      probability: 4,
      impact: 3,
      mitigation: 'Implement database optimization and caching strategies',
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-01-20'),
    },
  ]);

  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    riskLevel: 'Medium' as RiskAnalysis['riskLevel'],
    probability: 3,
    impact: 3,
    mitigation: '',
  });

  const handleSubmit = () => {
    const newRiskAnalysis: RiskAnalysis = {
      id: Date.now().toString(),
      ...formData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setRiskAnalyses([...riskAnalyses, newRiskAnalysis]);
    setOpen(false);
    setFormData({
      title: '',
      description: '',
      riskLevel: 'Medium',
      probability: 3,
      impact: 3,
      mitigation: '',
    });
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Critical': return 'error';
      case 'High': return 'warning';
      case 'Medium': return 'info';
      case 'Low': return 'success';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <div>
          <Typography variant="h4" gutterBottom>
            Risk Analysis
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage risk assessments for risk-based testing strategies
          </Typography>
        </div>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpen(true)}
        >
          Create Risk Analysis
        </Button>
      </Box>

      <Grid container spacing={3}>
        {riskAnalyses.map((risk) => (
          <Grid item xs={12} md={6} key={risk.id}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Typography variant="h6" component="div">
                    {risk.title}
                  </Typography>
                  <Chip
                    label={risk.riskLevel}
                    color={getRiskColor(risk.riskLevel) as any}
                    size="small"
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {risk.description}
                </Typography>
                <Box mt={2}>
                  <Typography variant="body2" gutterBottom>
                    <strong>Probability:</strong>
                    <Rating value={risk.probability} readOnly size="small" sx={{ ml: 1 }} />
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Impact:</strong>
                    <Rating value={risk.impact} readOnly size="small" sx={{ ml: 1 }} />
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Mitigation:</strong> {risk.mitigation}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Created: {risk.createdAt.toLocaleDateString()}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Risk Analysis</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Title"
                fullWidth
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Risk Level</InputLabel>
                <Select
                  value={formData.riskLevel}
                  label="Risk Level"
                  onChange={(e) => setFormData({ ...formData, riskLevel: e.target.value as any })}
                >
                  <MenuItem value="Low">Low</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                  <MenuItem value="Critical">Critical</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography gutterBottom>Probability (1-5)</Typography>
              <Rating
                value={formData.probability}
                onChange={(_, value) => setFormData({ ...formData, probability: value || 3 })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography gutterBottom>Impact (1-5)</Typography>
              <Rating
                value={formData.impact}
                onChange={(_, value) => setFormData({ ...formData, impact: value || 3 })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Mitigation Strategy"
                fullWidth
                multiline
                rows={3}
                value={formData.mitigation}
                onChange={(e) => setFormData({ ...formData, mitigation: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            Create Risk Analysis
          </Button>
        </DialogActions>
      </Dialog>

      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16, display: { md: 'none' } }}
        onClick={() => setOpen(true)}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default RiskAnalysisView;