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
  CheckBox,
} from '@mui/icons-material';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import RiskAnalysisView from '../views/RiskAnalysisView';
import TestPlansView from '../views/TestPlansView';
import TestCaseManagementView from '../views/TestCaseManagementView';
import UnderConstructionView from '../views/UnderConstructionView';
import DashboardView from '../views/DashboardView';
import BlackboardContentView from '../views/BlackboardContentView';
import AIChatbotView from '../views/AIChatbotView';
import { ColorModeContext } from '../App';

const drawerWidth = 240;

const Layout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const colorMode = useContext(ColorModeContext);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/' },
    { text: 'Risk Analysis', icon: <Assessment />, path: '/risk-analysis' },
    { text: 'Test Plans', icon: <Assignment />, path: '/test-plans' },
    { text: 'Test Case Management', icon: <CheckBox />, path: '/test-cases' },
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
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          QA Commander
        </Typography>
      </Toolbar>
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleNavigation(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
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
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
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
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        aria-label="Main navigation"
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
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        id="main-content"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        <Routes>
          <Route path="/" element={<DashboardView />} />
          <Route path="/risk-analysis" element={<RiskAnalysisView />} />
          <Route path="/test-plans" element={<TestPlansView />} />
          <Route path="/test-cases" element={<TestCaseManagementView />} />
          <Route path="/blackboard-content" element={<BlackboardContentView />} />
          <Route path="/ai-assistant" element={<AIChatbotView />} />
          <Route path="/jenkins-analysis" element={<UnderConstructionView />} />
        </Routes>
      </Box>
    </Box>
  );
};

export default Layout;