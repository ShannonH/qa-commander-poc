import React, { useState, useContext } from 'react';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Assessment,
  Assignment,
  Construction,
  Dashboard,
  School,
  SmartToy,
  Brightness4,
  Brightness7,
  CheckBox as TCMIcon,
} from '@mui/icons-material';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import RiskAnalysisView from '../views/RiskAnalysisView';
import TestPlansView from '../views/TestPlansView';
import TCMView from '../views/TCMView';
import UnderConstructionView from '../views/UnderConstructionView';
import DashboardView from '../views/DashboardView';
import BlackboardContentView from '../views/BlackboardContentView';
import AIChatbotView from '../views/AIChatbotView';
import { ColorModeContext } from '../App';

const drawerWidth = 240;
const collapsedDrawerWidth = 56;

const Layout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const colorMode = useContext(ColorModeContext);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleCollapseToggle = () => {
    setCollapsed(prev => !prev);
  };

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/' },
    { text: 'Test Plans', icon: <Assignment />, path: '/test-plans' },
    { text: 'Risk Analysis', icon: <Assessment />, path: '/risk-analysis' },
    { text: 'Test Case Management', icon: <TCMIcon />, path: '/tcm' },
    { text: 'Blackboard Content', icon: <School />, path: '/blackboard-content' },
    { text: 'AI Assistant', icon: <SmartToy />, path: '/ai-assistant' },
    { text: 'Jenkins Analysis', icon: <Construction />, path: '/jenkins-analysis' },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const drawer = (
    <div>
      <Toolbar sx={{ justifyContent: collapsed ? 'center' : 'flex-start', px: [1] }}>
        <IconButton
          onClick={handleCollapseToggle}
          aria-label={collapsed ? 'Expand drawer' : 'Collapse drawer'}
          sx={{ color: '#ffffff' }}
        >
          {collapsed ? <MenuIcon /> : <MenuIcon sx={{ transform: 'rotate(180deg)' }} />}
        </IconButton>
        {!collapsed && (
          <Typography variant="h6" noWrap component="div" sx={{ ml: 1 }}>
            QA Commander
          </Typography>
        )}
      </Toolbar>
      <List>
        {menuItems.map(item => (
          <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleNavigation(item.path)}
              sx={{
                minHeight: 48,
                justifyContent: collapsed ? 'center' : 'initial',
                px: 2.5,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: collapsed ? 'auto' : 3,
                  justifyContent: 'center',
                }}
              >
                {item.icon}
              </ListItemIcon>
              {!collapsed && <ListItemText primary={item.text} />}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      {/* Skip to main content link for keyboard users */}
      <Box
        component="a"
        href="#main-content"
        sx={{
          position: 'absolute',
          left: '-9999px',
          top: 'auto',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
          zIndex: 999999,
          '&:focus': {
            position: 'fixed',
            top: 0,
            left: 0,
            width: 'auto',
            height: 'auto',
            padding: '8px 16px',
            backgroundColor: 'primary.main',
            color: 'primary.contrastText',
            textDecoration: 'none',
            border: '2px solid',
            borderColor: 'primary.contrastText',
          },
        }}
      >
        Skip to main content
      </Box>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${collapsed ? collapsedDrawerWidth : drawerWidth}px)` },
          ml: { md: `${collapsed ? collapsedDrawerWidth : drawerWidth}px` },
          transition: 'width 0.2s, margin-left 0.2s',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Quality Assurance Management Platform
          </Typography>
          <IconButton
            sx={{ ml: 1 }}
            color="inherit"
            onClick={colorMode.toggleColorMode}
            aria-label={`Switch to ${colorMode.mode === 'dark' ? 'light' : 'dark'} mode`}
          >
            {colorMode.mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{
          width: { md: collapsed ? collapsedDrawerWidth : drawerWidth },
          flexShrink: { md: 0 },
        }}
        aria-label="Main navigation"
        aria-expanded={!collapsed}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: collapsed ? collapsedDrawerWidth : drawerWidth,
              transition: 'width 0.2s',
              overflowX: 'hidden',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      {/* ARIA live region for announcing drawer state changes */}
      <Box
        sx={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
        aria-live="polite"
      >
        {collapsed ? 'Navigation drawer collapsed' : 'Navigation drawer expanded'}
      </Box>
      <Box
        component="main"
        id="main-content"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${collapsed ? collapsedDrawerWidth : drawerWidth}px)` },
          transition: 'width 0.2s',
        }}
      >
        <Toolbar />
        <Routes>
          <Route path="/" element={<DashboardView />} />
          <Route path="/risk-analysis" element={<RiskAnalysisView />} />
          <Route path="/test-plans" element={<TestPlansView />} />
          <Route path="/tcm" element={<TCMView />} />
          <Route path="/blackboard-content" element={<BlackboardContentView />} />
          <Route path="/ai-assistant" element={<AIChatbotView />} />
          <Route path="/jenkins-analysis" element={<UnderConstructionView />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Box>
    </Box>
  );
};

export default Layout;
