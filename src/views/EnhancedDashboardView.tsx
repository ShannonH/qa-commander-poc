import React from 'react';
import { Box, Card, CardContent, Typography, Paper } from '@mui/material';
import {
  Assessment as AssessmentIcon,
  BugReport as BugReportIcon,
  CheckCircle as CheckCircleIcon,
  Speed as SpeedIcon,
} from '@mui/icons-material';
import {
  MetricValue,
  QuickActionLink,
  ActivityItem,
  SectionHeader,
  RiskIndicator,
} from '../components/ThemeComponents';

const EnhancedDashboardView: React.FC = () => {
  // Sample dashboard stats
  const dashboardStats = [
    {
      title: 'User Workflows',
      value: '3',
      icon: <AssessmentIcon />,
      color: 'var(--color-accent-data)',
    },
    {
      title: 'Automation Candidates',
      value: '2',
      icon: <SpeedIcon />,
      color: 'var(--color-accent-primary)',
    },
    {
      title: 'Total Test Plans',
      value: '1',
      icon: <CheckCircleIcon />,
      color: 'var(--color-accent-data)',
    },
    {
      title: 'Active Test Plans',
      value: '0',
      icon: <BugReportIcon />,
      color: 'var(--color-accent-risk)',
      isRisk: true,
    },
  ];

  const recentActivities = [
    'User workflow analysis completed',
    'New test plan created',
    'Risk assessment updated',
    'Blackboard content synchronized',
  ];

  const quickActions = [
    { label: 'Create New Test Plan', path: '/test-plans' },
    { label: 'Analyze Workflows', path: '/tcm' },
    { label: 'View Risk Analysis', path: '/risk-analysis' },
    { label: 'Access AI Chatbot', path: '/ai-chatbot' },
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }} className="corner-brackets">
        <Typography variant="h4" gutterBottom className="holographic-text">
          QA Commander Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Command Center - System Status Overview
        </Typography>
      </Box>

      {/* Main Stats Grid */}
      <Box
        className="dashboard-container"
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(1, 1fr)',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(4, 1fr)',
          },
          gap: 3,
          mb: 4,
        }}
      >
        {dashboardStats.map((stat, index) => (
          <Box key={index} className="metric-card-container">
            <Card>
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}
                >
                  <Box>
                    <Typography color="text.secondary" gutterBottom variant="body2">
                      {stat.title}
                    </Typography>
                    <MetricValue value={stat.value} isRisk={stat.isRisk} />
                  </Box>
                  <Box
                    sx={{
                      color: stat.color,
                      opacity: 0.8,
                      '& svg': { fontSize: 40 },
                    }}
                    aria-label={`${stat.title}: ${stat.value}`}
                  >
                    {stat.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      {/* Secondary Content Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(1, 1fr)',
            md: 'repeat(3, 1fr)',
          },
          gap: 3,
        }}
      >
        {/* Quick Actions */}
        <Box>
          <Paper sx={{ p: 3, height: '100%' }}>
            <SectionHeader>Quick Actions</SectionHeader>
            <Box>
              {quickActions.map((action, index) => (
                <QuickActionLink key={index} href={action.path}>
                  {action.label}
                </QuickActionLink>
              ))}
            </Box>
          </Paper>
        </Box>

        {/* Recent Activity */}
        <Box>
          <Paper sx={{ p: 3, height: '100%' }}>
            <SectionHeader>Recent Activity</SectionHeader>
            <Box>
              {recentActivities.map((activity, index) => (
                <ActivityItem key={index}>
                  <Typography variant="body2" color="text.secondary">
                    {activity}
                  </Typography>
                </ActivityItem>
              ))}
            </Box>
          </Paper>
        </Box>

        {/* Risk Status */}
        <Box>
          <Paper sx={{ p: 3, height: '100%' }}>
            <SectionHeader>Risk Status</SectionHeader>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Critical Issues
                </Typography>
                <RiskIndicator level="high" value="2" />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Warnings
                </Typography>
                <RiskIndicator level="medium" value="5" />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Low Priority
                </Typography>
                <RiskIndicator level="low" value="12" />
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* System Status Info */}
      <Box sx={{ mt: 4 }}>
        <Paper sx={{ p: 3 }}>
          <SectionHeader>System Information</SectionHeader>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(1, 1fr)',
                md: 'repeat(2, 1fr)',
              },
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="body2" color="text.secondary">
                <strong className="text-accent-primary">Last Sync:</strong> 5 minutes ago
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                <strong className="text-accent-primary">Active Users:</strong> 3
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                <strong className="text-accent-primary">System Status:</strong>{' '}
                <span className="text-accent-data">Operational</span>
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                <strong className="text-accent-primary">Uptime:</strong> 99.9%
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default EnhancedDashboardView;
