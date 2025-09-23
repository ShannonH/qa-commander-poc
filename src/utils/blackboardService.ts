import { 
  BlackboardCredentials, 
  BlackboardCourse, 
  BlackboardUser, 
  BlackboardAssignment
} from '../types';

export class BlackboardService {
  private static readonly STORAGE_KEY = 'blackboard_session';

  // Authentication methods
  static async authenticate(credentials: BlackboardCredentials): Promise<{ success: boolean; token?: string; error?: string }> {
    try {
      // Simulate authentication process with Blackboard Learn API
      // In a real implementation, this would make actual API calls
      
      // Basic validation
      if (!credentials.learnUrl || !credentials.username || !credentials.password) {
        return { success: false, error: 'All fields are required' };
      }

      if (!this.isValidUrl(credentials.learnUrl)) {
        return { success: false, error: 'Invalid Learn URL format' };
      }

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // For demo purposes, generate a mock token
      const token = `mock_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Store session
      const sessionData = {
        ...credentials,
        token,
        tokenExpiry: new Date(Date.now() + 3600000), // 1 hour from now
        authenticated: true
      };
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sessionData));
      
      return { success: true, token };
    } catch (error) {
      return { success: false, error: 'Authentication failed' };
    }
  }

  static getSession(): BlackboardCredentials | null {
    try {
      const sessionData = localStorage.getItem(this.STORAGE_KEY);
      if (!sessionData) return null;
      
      const session = JSON.parse(sessionData);
      
      // Check if token is expired
      if (session.tokenExpiry && new Date() > new Date(session.tokenExpiry)) {
        this.clearSession();
        return null;
      }
      
      return session;
    } catch {
      return null;
    }
  }

  static clearSession(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  static isAuthenticated(): boolean {
    const session = this.getSession();
    return session !== null && session.authenticated === true;
  }

  // Content creation methods
  static async createCourse(course: BlackboardCourse): Promise<{ success: boolean; courseId?: string; error?: string }> {
    const session = this.getSession();
    if (!session) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock successful course creation
      const courseId = `_${Math.random().toString(36).substr(2, 9)}_1`;
      
      return { 
        success: true, 
        courseId,
      };
    } catch (error) {
      return { success: false, error: 'Failed to create course' };
    }
  }

  static async createUser(user: BlackboardUser): Promise<{ success: boolean; userId?: string; error?: string }> {
    const session = this.getSession();
    if (!session) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Mock successful user creation
      const userId = `_${Math.random().toString(36).substr(2, 9)}_1`;
      
      return { 
        success: true, 
        userId,
      };
    } catch (error) {
      return { success: false, error: 'Failed to create user' };
    }
  }

  static async enrollUser(courseId: string, userId: string, roleId: string): Promise<{ success: boolean; error?: string }> {
    const session = this.getSession();
    if (!session) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 400));
      
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to enroll user' };
    }
  }

  static async createAssignment(courseId: string, assignment: BlackboardAssignment): Promise<{ success: boolean; assignmentId?: string; error?: string }> {
    const session = this.getSession();
    if (!session) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 700));
      
      // Mock successful assignment creation
      const assignmentId = `_${Math.random().toString(36).substr(2, 9)}_1`;
      
      return { 
        success: true, 
        assignmentId,
      };
    } catch (error) {
      return { success: false, error: 'Failed to create assignment' };
    }
  }

  // Utility methods
  private static isValidUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  }

  static async testConnection(learnUrl: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.isValidUrl(learnUrl)) {
        return { success: false, error: 'Invalid URL format' };
      }

      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // For demo purposes, assume connection is successful
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Connection failed' };
    }
  }

  // Mock data for demonstration
  static getAvailableRoles(): Array<{ id: string; name: string }> {
    return [
      { id: 'Student', name: 'Student' },
      { id: 'Instructor', name: 'Instructor' },
      { id: 'TeachingAssistant', name: 'Teaching Assistant' },
      { id: 'CourseBuilder', name: 'Course Builder' },
      { id: 'Grader', name: 'Grader' }
    ];
  }

  static getAvailableTerms(): Array<{ id: string; name: string }> {
    return [
      { id: 'term_2024_spring', name: 'Spring 2024' },
      { id: 'term_2024_summer', name: 'Summer 2024' },
      { id: 'term_2024_fall', name: 'Fall 2024' },
      { id: 'term_2025_spring', name: 'Spring 2025' }
    ];
  }
}