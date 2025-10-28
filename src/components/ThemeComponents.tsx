/**
 * Theme Utility Components and Helpers for QA Commander
 * Command Center Aesthetic
 */

import React from 'react';
import { Box, Typography, Link, BoxProps, TypographyProps, LinkProps } from '@mui/material';

/**
 * Metric Value Component with glow effect
 */
interface MetricValueProps extends TypographyProps {
  value: string | number;
  isRisk?: boolean;
}

export const MetricValue: React.FC<MetricValueProps> = ({ value, isRisk = false, ...props }) => {
  return (
    <Typography
      variant="h2"
      className={isRisk ? 'metric-value risk-metric' : 'metric-value'}
      {...props}
    >
      {value}
    </Typography>
  );
};

/**
 * Quick Action Link with arrow and hover effects
 */
interface QuickActionLinkProps extends Omit<LinkProps, 'className'> {
  children: React.ReactNode;
}

export const QuickActionLink: React.FC<QuickActionLinkProps> = ({ children, ...props }) => {
  return (
    <Link
      className="quick-action-link"
      underline="none"
      sx={{ display: 'block', mb: 1 }}
      {...props}
    >
      <span>{children}</span>
    </Link>
  );
};

/**
 * Activity Item with dashed border
 */
interface ActivityItemProps extends BoxProps {
  children: React.ReactNode;
}

export const ActivityItem: React.FC<ActivityItemProps> = ({ children, ...props }) => {
  return (
    <Box className="activity-item" {...props}>
      {children}
    </Box>
  );
};

/**
 * Data Card with command center styling
 */
interface DataCardProps extends BoxProps {
  children: React.ReactNode;
  glowEffect?: boolean;
}

export const DataCard: React.FC<DataCardProps> = ({ children, glowEffect = false, ...props }) => {
  return (
    <Box
      className={glowEffect ? 'border-glow' : ''}
      sx={{
        p: 2,
        borderRadius: 1,
        height: '100%',
      }}
      {...props}
    >
      {children}
    </Box>
  );
};

/**
 * Risk Indicator Component
 */
interface RiskIndicatorProps {
  level: 'high' | 'medium' | 'low';
  value: string | number;
}

export const RiskIndicator: React.FC<RiskIndicatorProps> = ({ level, value }) => {
  const getColor = () => {
    switch (level) {
      case 'high':
        return 'var(--color-accent-risk)';
      case 'medium':
        return 'var(--color-accent-data)';
      case 'low':
        return 'var(--color-accent-primary)';
      default:
        return 'inherit';
    }
  };

  return (
    <Typography
      variant="h3"
      className={level === 'high' ? 'risk-metric glow-risk' : ''}
      sx={{ color: getColor() }}
    >
      {value}
    </Typography>
  );
};

/**
 * Utility function to get theme-aware colors
 */
export const getThemeColor = (colorType: 'primary' | 'data' | 'risk'): string => {
  switch (colorType) {
    case 'primary':
      return 'var(--color-accent-primary)';
    case 'data':
      return 'var(--color-accent-data)';
    case 'risk':
      return 'var(--color-accent-risk)';
    default:
      return 'var(--color-text)';
  }
};

/**
 * Section Header with command center styling
 */
interface SectionHeaderProps extends TypographyProps {
  children: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ children, ...props }) => {
  return (
    <Typography
      variant="h5"
      gutterBottom
      className="section-header-3d"
      sx={{
        borderBottom: '2px solid var(--color-accent-primary)',
        pb: 1,
        mb: 2,
        textTransform: 'uppercase',
        letterSpacing: '1px',
        fontWeight: 600,
      }}
      {...props}
    >
      {children}
    </Typography>
  );
};
