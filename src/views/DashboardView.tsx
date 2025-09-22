import React from 'react';
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
  Assessment,
  Assignment,
  TrendingUp,
  BugReport,
} from '@mui/icons-material';

const DashboardView: React.FC = () => {
  const stats = [
    {
      title: 'Risk Analyses',
      value: '12',
      icon: <Assessment />,
      color: '#1976d2',
    },
    {
      title: 'Test Plans',
      value: '8',
      icon: <Assignment />,
      color: '#388e3c',
    },
    {
      title: 'Active Tests',
      value: '24',
      icon: <TrendingUp />,
      color: '#f57c00',
    },
    {
      title: 'Issues Found',
      value: '3',
      icon: <BugReport />,
      color: '#d32f2f',
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Welcome to QA Commander - Your Quality Assurance Management Platform
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {stats.map((stat, index) => (
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
                  <IconButton sx={{ color: stat.color }}>
                    {stat.icon}
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 300 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                • Risk analysis created for "User Authentication Module"
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                • Test plan updated for "Gradebook Feature"
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                • 3 new test cases added to "Discussion Forums"
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                • Bug report filed for "Calendar Integration"
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 300 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Get started with common tasks:
              </Typography>
              <Typography variant="body2" color="primary" sx={{ mt: 1, cursor: 'pointer' }}>
                → Create new risk analysis
              </Typography>
              <Typography variant="body2" color="primary" sx={{ mt: 1, cursor: 'pointer' }}>
                → Add test plan for Blackboard feature
              </Typography>
              <Typography variant="body2" color="primary" sx={{ mt: 1, cursor: 'pointer' }}>
                → Review pending test cases
              </Typography>
              <Typography variant="body2" color="primary" sx={{ mt: 1, cursor: 'pointer' }}>
                → View Jenkins analysis (coming soon)
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardView;