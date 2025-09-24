import React, { useEffect, useState } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  IconButton,
} from '@mui/material';
import {
  AutoAwesome,
  Assignment,
  TrendingUp,
  PlayArrow,
} from '@mui/icons-material';
import { DataService } from '../utils/dataService';

const DashboardView: React.FC = () => {
  const [stats, setStats] = useState({
    totalWorkflows: 0,
    totalTestPlans: 0,
    automationCandidates: 0,
    activeTestPlans: 0,
  });

  useEffect(() => {
    // Initialize sample data and load stats
    DataService.initializeSampleData();
    const currentStats = DataService.getStats();
    setStats(currentStats);
  }, []);

  const dashboardStats = [
    {
      title: 'User Workflows',
      value: stats.totalWorkflows.toString(),
      icon: <TrendingUp />,
      color: '#1976d2',
    },
    {
      title: 'Automation Candidates',
      value: stats.automationCandidates.toString(),
      icon: <AutoAwesome />,
      color: '#388e3c',
    },
    {
      title: 'Test Plans',
      value: stats.totalTestPlans.toString(),
      icon: <Assignment />,
      color: '#f57c00',
    },
    {
      title: 'Active Tests',
      value: stats.activeTestPlans.toString(),
      icon: <PlayArrow />,
      color: '#9c27b0',
    },
  ];

  return (
    <Box>
      <Box component="header" sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Welcome to QA Commander - Your Quality Assurance Management Platform
        </Typography>
      </Box>

      <Box component="section" aria-labelledby="stats-heading">
        <Typography 
          variant="h5" 
          component="h2" 
          id="stats-heading" 
          sx={{ 
            mb: 2, 
            position: 'absolute',
            left: '-9999px',
            width: '1px',
            height: '1px',
            overflow: 'hidden'
          }}
        >
          Statistics Overview
        </Typography>

        <Grid container spacing={3} sx={{ mt: 2 }}>
        {dashboardStats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      {stat.title}
                    </Typography>
                    <Typography variant="h5" component="div">
                      {stat.value}
                    </Typography>
                  </Box>
                  <IconButton 
                    sx={{ color: stat.color }}
                    aria-label={`${stat.title}: ${stat.value}`}
                    disabled
                  >
                    {stat.icon}
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      </Box>

      <Grid container spacing={3} component="section" aria-labelledby="activity-heading" sx={{ mt: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 300 }}>
            <Typography variant="h6" component="h2" id="activity-heading" gutterBottom>
              Recent Activity
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                • User workflow analysis for "Student Login" created
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                • "Instructor Creates Assignment" marked for automation
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                • Risk analysis document updated for Course Management
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                • 3 new workflows added to "Discussion Forums" analysis
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 300 }}>
            <Typography variant="h6" component="h2" gutterBottom>
              Quick Actions
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Get started with common tasks:
              </Typography>
              <Typography variant="body2" color="primary" sx={{ mt: 1, cursor: 'pointer' }}>
                → Analyze user workflow for automation
              </Typography>
              <Typography variant="body2" color="primary" sx={{ mt: 1, cursor: 'pointer' }}>
                → Create risk analysis document
              </Typography>
              <Typography variant="body2" color="primary" sx={{ mt: 1, cursor: 'pointer' }}>
                → Add test plan for Blackboard feature
              </Typography>
              <Typography variant="body2" color="primary" sx={{ mt: 1, cursor: 'pointer' }}>
                → Review automation candidates
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardView;