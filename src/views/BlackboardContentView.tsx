import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Alert,
  CircularProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
  Divider,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  School as SchoolIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  Logout as LogoutIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { BlackboardService } from '../utils/blackboardService';
import {
  BlackboardCredentials,
  BlackboardCourse,
  BlackboardUser,
  BlackboardAssignment,
} from '../types';

interface CreatedContent {
  type: 'course' | 'user' | 'assignment' | 'enrollment';
  id: string;
  name: string;
  details: string;
  timestamp: Date;
}

const BlackboardContentView: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [createdContent, setCreatedContent] = useState<CreatedContent[]>([]);

  // Authentication state
  const [credentials, setCredentials] = useState<BlackboardCredentials>({
    learnUrl: '',
    username: '',
    password: '',
  });

  // Content creation state
  const [selectedContentType, setSelectedContentType] = useState<string>('');
  const [courseData, setCourseData] = useState<BlackboardCourse>({
    externalId: '',
    name: '',
    description: '',
    allowGuests: false,
    readOnly: false,
  });
  
  const [userData, setUserData] = useState<BlackboardUser>({
    externalId: '',
    userName: '',
    email: '',
    firstName: '',
    lastName: '',
    password: '',
  });

  const [assignmentData, setAssignmentData] = useState<BlackboardAssignment>({
    title: '',
    description: '',
    instructions: '',
    grading: {
      points: 100,
      attemptsAllowed: 1,
      scoringModel: 'Highest',
      schema: 'Points',
    },
  });

  const [userCount, setUserCount] = useState(1);
  const [userRole, setUserRole] = useState('Student');
  const [selectedCourseId, setSelectedCourseId] = useState('');

  useEffect(() => {
    // Check if already authenticated
    const session = BlackboardService.getSession();
    if (session) {
      setIsAuthenticated(true);
      setCredentials(session);
      setActiveStep(1);
    }
  }, []);

  const steps = [
    'Authentication',
    'Select Content Type',
    'Configure Content',
    'Review & Create',
  ];

  const contentTypes = [
    { id: 'course', name: 'Create Course', icon: <SchoolIcon />, description: 'Create a new course with basic settings' },
    { id: 'instructor', name: 'Add Instructor', icon: <PersonIcon />, description: 'Create instructor accounts and assign to courses' },
    { id: 'students', name: 'Add Students', icon: <PersonIcon />, description: 'Create student accounts and enroll in courses' },
    { id: 'assignment', name: 'Create Assignment', icon: <AssignmentIcon />, description: 'Add assignments to existing courses' },
  ];

  const handleAuthentication = async () => {
    setIsLoading(true);
    setError(null);

    const result = await BlackboardService.authenticate(credentials);
    
    if (result.success) {
      setIsAuthenticated(true);
      setActiveStep(1);
      setSuccess('Successfully authenticated with Blackboard Learn');
    } else {
      setError(result.error || 'Authentication failed');
    }
    
    setIsLoading(false);
  };

  const handleLogout = () => {
    BlackboardService.clearSession();
    setIsAuthenticated(false);
    setActiveStep(0);
    setCredentials({ learnUrl: '', username: '', password: '' });
    setCreatedContent([]);
  };

  const handleContentTypeSelect = (type: string) => {
    setSelectedContentType(type);
    setActiveStep(2);
    setError(null);
    setSuccess(null);
  };

  const handleCreateCourse = async () => {
    setIsLoading(true);
    setError(null);

    const result = await BlackboardService.createCourse(courseData);
    
    if (result.success) {
      const newContent: CreatedContent = {
        type: 'course',
        id: result.courseId!,
        name: courseData.name,
        details: `External ID: ${courseData.externalId}${result.courseUrl ? ` | Course URL: ${result.courseUrl}` : ''}`,
        timestamp: new Date(),
      };
      setCreatedContent(prev => [...prev, newContent]);
      
      // Enhanced success message with course URL
      const successMessage = result.courseUrl 
        ? `Course "${courseData.name}" created successfully! Visit: ${result.courseUrl}`
        : `Course "${courseData.name}" created successfully`;
      
      setSuccess(successMessage);
      setActiveStep(3);
    } else {
      setError(result.error || 'Failed to create course');
    }
    
    setIsLoading(false);
  };

  const handleCreateUsers = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const createdUsers: CreatedContent[] = [];
      
      for (let i = 0; i < userCount; i++) {
        const userToCreate = {
          ...userData,
          externalId: `${userData.externalId}_${i + 1}`,
          userName: `${userData.userName}_${i + 1}`,
          email: `${userData.userName}_${i + 1}@example.com`,
        };

        const result = await BlackboardService.createUser(userToCreate);
        
        if (result.success) {
          createdUsers.push({
            type: 'user',
            id: result.userId!,
            name: `${userToCreate.firstName} ${userToCreate.lastName}`,
            details: `Role: ${userRole}, Username: ${userToCreate.userName}`,
            timestamp: new Date(),
          });

          // If course is selected, enroll the user
          if (selectedCourseId) {
            await BlackboardService.enrollUser(selectedCourseId, result.userId!, userRole);
          }
        }
      }

      if (createdUsers.length > 0) {
        setCreatedContent(prev => [...prev, ...createdUsers]);
        setSuccess(`Successfully created ${createdUsers.length} user(s)`);
        setActiveStep(3);
      }
    } catch (error) {
      setError('Failed to create users');
    }
    
    setIsLoading(false);
  };

  const handleCreateAssignment = async () => {
    if (!selectedCourseId) {
      setError('Please select a course first');
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await BlackboardService.createAssignment(selectedCourseId, assignmentData);
    
    if (result.success) {
      const newContent: CreatedContent = {
        type: 'assignment',
        id: result.assignmentId!,
        name: assignmentData.title,
        details: `Course: ${selectedCourseId}, Points: ${assignmentData.grading?.points}`,
        timestamp: new Date(),
      };
      setCreatedContent(prev => [...prev, newContent]);
      setSuccess(`Assignment "${assignmentData.title}" created successfully`);
      setActiveStep(3);
    } else {
      setError(result.error || 'Failed to create assignment');
    }
    
    setIsLoading(false);
  };

  const renderAuthenticationStep = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Connect to Blackboard Learn
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Enter your Blackboard Learn instance details and administrator credentials.
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Blackboard Learn URL"
            value={credentials.learnUrl}
            onChange={(e) => setCredentials({ ...credentials, learnUrl: e.target.value })}
            placeholder="https://your-institution.blackboard.com"
            helperText="The full URL to your Blackboard Learn instance"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Administrator Username"
            value={credentials.username}
            onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            type="password"
            label="Password"
            value={credentials.password}
            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
          />
        </Grid>
      </Grid>

      <Box sx={{ mt: 3 }}>
        <Button
          variant="contained"
          onClick={handleAuthentication}
          disabled={isLoading || !credentials.learnUrl || !credentials.username || !credentials.password}
          startIcon={isLoading ? <CircularProgress size={20} /> : undefined}
        >
          {isLoading ? 'Connecting...' : 'Connect to Blackboard Learn'}
        </Button>
      </Box>
    </Box>
  );

  const renderContentTypeSelection = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        What would you like to create?
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Choose the type of content you want to create in Blackboard Learn.
      </Typography>

      <Grid container spacing={2}>
        {contentTypes.map((type) => (
          <Grid item xs={12} md={6} key={type.id}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': { 
                  transform: 'translateY(-2px)',
                  boxShadow: 3
                }
              }}
              onClick={() => handleContentTypeSelect(type.id)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {type.icon}
                  <Typography variant="h6" sx={{ ml: 1 }}>
                    {type.name}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {type.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const renderContentConfiguration = () => {
    switch (selectedContentType) {
      case 'course':
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Create New Course
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Course Name"
                  value={courseData.name}
                  onChange={(e) => setCourseData({ ...courseData, name: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Course ID"
                  value={courseData.externalId}
                  onChange={(e) => setCourseData({ ...courseData, externalId: e.target.value })}
                  helperText="Unique identifier for the course"
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Description"
                  value={courseData.description}
                  onChange={(e) => setCourseData({ ...courseData, description: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={courseData.allowGuests || false}
                      onChange={(e) => setCourseData({ ...courseData, allowGuests: e.target.checked })}
                    />
                  }
                  label="Allow Guest Access"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={courseData.readOnly || false}
                      onChange={(e) => setCourseData({ ...courseData, readOnly: e.target.checked })}
                    />
                  }
                  label="Read Only"
                />
              </Grid>
            </Grid>
            <Box sx={{ mt: 3 }}>
              <Button
                variant="contained"
                onClick={handleCreateCourse}
                disabled={isLoading || !courseData.name || !courseData.externalId}
                startIcon={isLoading ? <CircularProgress size={20} /> : <SchoolIcon />}
              >
                {isLoading ? 'Creating...' : 'Create Course'}
              </Button>
            </Box>
          </Box>
        );

      case 'instructor':
      case 'students':
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Create {selectedContentType === 'instructor' ? 'Instructor' : 'Students'}
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={userData.firstName}
                  onChange={(e) => setUserData({ ...userData, firstName: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={userData.lastName}
                  onChange={(e) => setUserData({ ...userData, lastName: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Username Base"
                  value={userData.userName}
                  onChange={(e) => setUserData({ ...userData, userName: e.target.value })}
                  helperText="Numbers will be appended for multiple users"
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="External ID Base"
                  value={userData.externalId}
                  onChange={(e) => setUserData({ ...userData, externalId: e.target.value })}
                  required
                />
              </Grid>
              {selectedContentType === 'students' && (
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Number of Students"
                    value={userCount}
                    onChange={(e) => setUserCount(Math.max(1, parseInt(e.target.value) || 1))}
                    inputProps={{ min: 1, max: 50 }}
                  />
                </Grid>
              )}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={userRole}
                    label="Role"
                    onChange={(e) => setUserRole(e.target.value)}
                  >
                    {BlackboardService.getAvailableRoles().map((role) => (
                      <MenuItem key={role.id} value={role.id}>
                        {role.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Enroll in Course (Optional)"
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  helperText="Select a course to automatically enroll the user(s)"
                >
                  <MenuItem value="">None</MenuItem>
                  {createdContent
                    .filter(content => content.type === 'course')
                    .map((course) => (
                      <MenuItem key={course.id} value={course.id}>
                        {course.name}
                      </MenuItem>
                    ))}
                </TextField>
              </Grid>
            </Grid>
            <Box sx={{ mt: 3 }}>
              <Button
                variant="contained"
                onClick={handleCreateUsers}
                disabled={isLoading || !userData.firstName || !userData.lastName || !userData.userName}
                startIcon={isLoading ? <CircularProgress size={20} /> : <PersonIcon />}
              >
                {isLoading ? 'Creating...' : `Create ${selectedContentType === 'instructor' ? 'Instructor' : `${userCount} Student(s)`}`}
              </Button>
            </Box>
          </Box>
        );

      case 'assignment':
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Create Assignment
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Course"
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  required
                  helperText="Select the course for this assignment"
                >
                  {createdContent
                    .filter(content => content.type === 'course')
                    .map((course) => (
                      <MenuItem key={course.id} value={course.id}>
                        {course.name}
                      </MenuItem>
                    ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  label="Assignment Title"
                  value={assignmentData.title}
                  onChange={(e) => setAssignmentData({ ...assignmentData, title: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Points"
                  value={assignmentData.grading?.points}
                  onChange={(e) => setAssignmentData({ 
                    ...assignmentData, 
                    grading: { 
                      ...assignmentData.grading!, 
                      points: parseInt(e.target.value) || 0 
                    }
                  })}
                  inputProps={{ min: 0 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Description"
                  value={assignmentData.description}
                  onChange={(e) => setAssignmentData({ ...assignmentData, description: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Instructions"
                  value={assignmentData.instructions}
                  onChange={(e) => setAssignmentData({ ...assignmentData, instructions: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Attempts Allowed"
                  value={assignmentData.grading?.attemptsAllowed}
                  onChange={(e) => setAssignmentData({ 
                    ...assignmentData, 
                    grading: { 
                      ...assignmentData.grading!, 
                      attemptsAllowed: parseInt(e.target.value) || 1 
                    }
                  })}
                  inputProps={{ min: 1 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Scoring Model</InputLabel>
                  <Select
                    value={assignmentData.grading?.scoringModel}
                    label="Scoring Model"
                    onChange={(e) => setAssignmentData({ 
                      ...assignmentData, 
                      grading: { 
                        ...assignmentData.grading!, 
                        scoringModel: e.target.value as any 
                      }
                    })}
                  >
                    <MenuItem value="Highest">Highest</MenuItem>
                    <MenuItem value="Last">Last</MenuItem>
                    <MenuItem value="First">First</MenuItem>
                    <MenuItem value="Average">Average</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <Box sx={{ mt: 3 }}>
              <Button
                variant="contained"
                onClick={handleCreateAssignment}
                disabled={isLoading || !assignmentData.title || !selectedCourseId}
                startIcon={isLoading ? <CircularProgress size={20} /> : <AssignmentIcon />}
              >
                {isLoading ? 'Creating...' : 'Create Assignment'}
              </Button>
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  const renderReviewAndResults = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Created Content
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Review the content that has been successfully created in Blackboard Learn.
      </Typography>

      {createdContent.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">
            No content has been created yet.
          </Typography>
        </Paper>
      ) : (
        <List>
          {createdContent.map((content, index) => (
            <React.Fragment key={index}>
              <ListItem>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip 
                        label={content.type} 
                        size="small" 
                        color="primary" 
                        variant="outlined" 
                      />
                      <Typography variant="subtitle1">{content.name}</Typography>
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {content.details}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Created: {content.timestamp.toLocaleString()}
                      </Typography>
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <CheckCircleIcon color="success" />
                </ListItemSecondaryAction>
              </ListItem>
              {index < createdContent.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      )}

      <Box sx={{ mt: 3 }}>
        <Button
          variant="outlined"
          onClick={() => setActiveStep(1)}
          sx={{ mr: 2 }}
        >
          Create More Content
        </Button>
        <Button
          variant="contained"
          onClick={() => window.location.reload()}
        >
          Start Over
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Blackboard Learn Content Creator
        </Typography>
        {isAuthenticated && (
          <Button
            variant="outlined"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            color="inherit"
          >
            Disconnect
          </Button>
        )}
      </Box>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Create courses, users, and assignments in your Blackboard Learn instance through this guided workflow.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((label, index) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
            <StepContent>
              {index === 0 && renderAuthenticationStep()}
              {index === 1 && renderContentTypeSelection()}
              {index === 2 && renderContentConfiguration()}
              {index === 3 && renderReviewAndResults()}
            </StepContent>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
};

export default BlackboardContentView;