import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Chip,
} from '@mui/material';
import { Construction, Timeline, BugReport, Analytics } from '@mui/icons-material';

const UnderConstructionView: React.FC = () => {
  const upcomingFeatures = [
    {
      title: 'Jenkins Log Parser',
      description: 'Automated parsing and analysis of Jenkins build logs',
      progress: 25,
      status: 'In Development',
      icon: <Analytics />,
    },
    {
      title: 'Build Failure Analytics',
      description: 'Intelligent analysis of build failures with pattern recognition',
      progress: 10,
      status: 'Planning',
      icon: <BugReport />,
    },
    {
      title: 'Performance Trending',
      description: 'Track build performance trends and bottlenecks over time',
      progress: 5,
      status: 'Research',
      icon: <Timeline />,
    },
  ];

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={3}>
        <Construction sx={{ fontSize: 40, mr: 2, color: 'warning.main' }} />
        <div>
          <Typography variant="h4" gutterBottom>
            Jenkins Analysis Tool
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Advanced Jenkins log analysis and build intelligence - Coming Soon!
          </Typography>
        </div>
      </Box>

      <Paper sx={{ p: 4, mb: 4, textAlign: 'center' }}>
        <Construction sx={{ fontSize: 80, color: 'warning.main', mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          Under Active Development
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          We're building an intelligent Jenkins analysis tool that will help you:
        </Typography>
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="body2">
              🔍 <strong>Analyze Build Logs</strong>
              <br />
              Automatically parse and categorize build failures
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="body2">
              📊 <strong>Performance Insights</strong>
              <br />
              Track build times and identify bottlenecks
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="body2">
              🚨 <strong>Failure Patterns</strong>
              <br />
              Detect recurring issues and suggest fixes
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Typography variant="h5" gutterBottom>
        Planned Features
      </Typography>
      <Grid container spacing={3}>
        {upcomingFeatures.map((feature, index) => (
          <Grid size={{ xs: 12, md: 4 }} key={index}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  {feature.icon}
                  <Typography variant="h6" sx={{ ml: 1 }}>
                    {feature.title}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {feature.description}
                </Typography>
                <Box mb={2}>
                  <Chip
                    label={feature.status}
                    size="small"
                    color={
                      feature.status === 'In Development'
                        ? 'primary'
                        : feature.status === 'Planning'
                          ? 'warning'
                          : 'default'
                    }
                  />
                </Box>
                <Box>
                  <Typography variant="body2" gutterBottom>
                    Progress: {feature.progress}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={feature.progress}
                    color={
                      feature.progress > 20 ? 'primary' : feature.progress > 5 ? 'warning' : 'error'
                    }
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Coming Soon Features
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="body2" gutterBottom>
              ✅ Real-time Jenkins webhook integration
            </Typography>
            <Typography variant="body2" gutterBottom>
              ✅ Build failure classification and tagging
            </Typography>
            <Typography variant="body2" gutterBottom>
              ✅ Historical trend analysis
            </Typography>
            <Typography variant="body2" gutterBottom>
              ✅ Automated failure notifications
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="body2" gutterBottom>
              ✅ Custom dashboard widgets
            </Typography>
            <Typography variant="body2" gutterBottom>
              ✅ Integration with test planning
            </Typography>
            <Typography variant="body2" gutterBottom>
              ✅ Machine learning failure prediction
            </Typography>
            <Typography variant="body2" gutterBottom>
              ✅ Team collaboration features
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Box mt={4} textAlign="center">
        <Typography variant="body2" color="text.secondary">
          Expected release: Q2 2024 | Follow our progress for updates
        </Typography>
      </Box>
    </Box>
  );
};

export default UnderConstructionView;
