/**
 * Firebase SDK mock for E2E tests
 * This script is injected into the browser to mock Firebase Auth functionality
 */

export const firebaseMockScript = `
(function() {
  // Only run mocks in test environment
  if (!window.playwrightTest) {
    console.log('Not running Firebase mocks - window.playwrightTest is', window.playwrightTest);
    return;
  }

  // Firebase mocks activated for E2E tests

  // Mock Firebase Auth user data
  const mockUsers = {
    'madrusnl@hotmail.com': {
      uid: 'admin-user-id',
      email: 'madrusnl@hotmail.com',
      displayName: 'Madrusnl Admin',
      emailVerified: true,
      providerData: [
        {
          providerId: 'google.com',
          uid: 'google-admin-id',
          displayName: 'Madrusnl Admin',
          email: 'madrusnl@hotmail.com'
        }
      ]
    },
    'madrus@gmail.com': {
      uid: 'regular-user-id', 
      email: 'madrus@gmail.com',
      displayName: 'Madrus User',
      emailVerified: true,
      providerData: [
        {
          providerId: 'google.com',
          uid: 'google-user-id',
          displayName: 'Madrus User',
          email: 'madrus@gmail.com'
        }
      ]
    }
  };

  // Mock current user state
  let currentUser = null;
  let authStateChangeListeners = [];
  let idTokenChangeListeners = [];

  // Mock Firebase Auth methods
  const mockFirebaseAuth = {
    currentUser,
    
    // Mock Google sign-in popup
    signInWithPopup: async (provider) => {
      console.log('Mock signInWithPopup called');
      
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // For E2E tests, we'll sign in as admin by default
      const email = 'madrusnl@hotmail.com';
      const user = { ...mockUsers[email] };
      
      // Add getIdToken method to user
      user.getIdToken = async () => {
        return 'mock-jwt-header.payload.signature-' + email;
      };
      
      currentUser = user;
      mockFirebaseAuth.currentUser = user;
      
      // Notify listeners
      authStateChangeListeners.forEach(callback => {
        if (typeof callback === 'function') {
          callback(user);
        }
      });
      idTokenChangeListeners.forEach(callback => {
        if (typeof callback === 'function') {
          callback(user);
        }
      });
      
      return {
        user,
        credential: {
          accessToken: 'mock-google-access-token',
          providerId: 'google.com'
        }
      };
    },

    // Mock email/password sign-in
    signInWithEmailAndPassword: async (auth, email, password) => {
      // Mock signInWithEmailAndPassword called
      
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Check if this is a test user with correct password
      // Support both hardcoded users and dynamic test users
      const isValidTestUser = (
        mockUsers[email] || 
        (email.includes('@test.com') && password === 'MyReallyStr0ngPassw0rd!!!')
      );
      
      if (isValidTestUser) {
        // Use existing mock user or create a dynamic one for test emails
        const user = mockUsers[email] ? 
          { ...mockUsers[email] } :
          {
            uid: email.includes('admin') ? 'admin-user-id' : 'regular-user-id',
            email,
            displayName: email.includes('admin') ? 'Test Admin' : 'Test User',
            emailVerified: true,
            providerData: [
              {
                providerId: 'password',
                uid: email,
                displayName: email.includes('admin') ? 'Test Admin' : 'Test User',
                email
              }
            ]
          };
        
        // Add getIdToken method to user
        user.getIdToken = async () => {
          return 'mock-jwt-header.payload.signature-' + email;
        };
        
        currentUser = user;
        mockFirebaseAuth.currentUser = user;
        
        // Notify listeners
        authStateChangeListeners.forEach(callback => {
          if (typeof callback === 'function') {
            callback(user);
          }
        });
        idTokenChangeListeners.forEach(callback => {
          if (typeof callback === 'function') {
            callback(user);
          }
        });
        
        return { user };
      }
      
      // Invalid credentials
      const error = new Error('Invalid email or password');
      error.code = 'auth/invalid-credential';
      throw error;
    },

    // Mock create user with email/password
    createUserWithEmailAndPassword: async (auth, email, password) => {
      console.log('Mock createUserWithEmailAndPassword called with email:', email);
      
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // For testing, create a mock user
      const user = {
        uid: 'new-user-id',
        email,
        displayName: email.split('@')[0],
        emailVerified: false,
        providerData: []
      };
      
      // Add getIdToken method to user
      user.getIdToken = async () => {
        return 'mock-jwt-header.payload.signature-' + email;
      };
      
      currentUser = user;
      mockFirebaseAuth.currentUser = user;
      
      // Notify listeners
      authStateChangeListeners.forEach(callback => {
        if (typeof callback === 'function') {
          callback(user);
        }
      });
      idTokenChangeListeners.forEach(callback => {
        if (typeof callback === 'function') {
          callback(user);
        }
      });
      
      return { user };
    },

    // Mock sign out
    signOut: async () => {
      console.log('Mock signOut called');
      currentUser = null;
      mockFirebaseAuth.currentUser = null;
      
      // Notify listeners
      authStateChangeListeners.forEach(callback => {
        if (typeof callback === 'function') {
          callback(null);
        }
      });
      idTokenChangeListeners.forEach(callback => {
        if (typeof callback === 'function') {
          callback(null);
        }
      });
    },

    // Mock auth state change listener
    onAuthStateChanged: (callback) => {
      authStateChangeListeners.push(callback);
      // Immediately call with current state to set loading: false
      setTimeout(() => {
        if (typeof callback === 'function') {
          callback(currentUser);
        }
      }, 10);
      
      // Return unsubscribe function
      return () => {
        const index = authStateChangeListeners.indexOf(callback);
        if (index > -1) {
          authStateChangeListeners.splice(index, 1);
        }
      };
    },

    // Mock ID token change listener
    onIdTokenChanged: (callback) => {
      idTokenChangeListeners.push(callback);
      // Immediately call with current state
      setTimeout(() => {
        if (typeof callback === 'function') {
          callback(currentUser);
        }
      }, 10);
      
      // Return unsubscribe function
      return () => {
        const index = idTokenChangeListeners.indexOf(callback);
        if (index > -1) {
          idTokenChangeListeners.splice(index, 1);
        }
      };
    }
  };

  // Mock GoogleAuthProvider
  const MockGoogleAuthProvider = function() {
    this.providerId = 'google.com';
    this.addScope = () => this;
    this.setCustomParameters = () => this;
  };
  MockGoogleAuthProvider.credential = () => ({
    providerId: 'google.com',
    signInMethod: 'google.com'
  });

  // Mock Firebase module functions
  const mockFirebaseModule = {
    initializeApp: () => ({
      name: 'mock-app',
      options: {}
    }),
    getAuth: () => mockFirebaseAuth,
    GoogleAuthProvider: MockGoogleAuthProvider,
    signInWithPopup: mockFirebaseAuth.signInWithPopup,
    signInWithEmailAndPassword: (auth, email, password) => mockFirebaseAuth.signInWithEmailAndPassword(auth, email, password),
    createUserWithEmailAndPassword: (auth, email, password) => mockFirebaseAuth.createUserWithEmailAndPassword(auth, email, password),
    signOut: mockFirebaseAuth.signOut,
    onAuthStateChanged: mockFirebaseAuth.onAuthStateChanged
  };

  // Override global Firebase objects
  window.mockFirebaseAuth = mockFirebaseAuth;
  window.mockFirebaseModule = mockFirebaseModule;

  // Override any existing Firebase globals
  if (window.firebase) {
    console.log('Overriding existing global Firebase instance');
    Object.assign(window.firebase, mockFirebaseModule);
  }

  // Set up window properties for client.ts to pick up
  window.mockFirebaseAuth = mockFirebaseAuth;
  window.mockFirebaseModule = mockFirebaseModule;

  // Trigger immediate auth state change to set loading=false
  setTimeout(() => {
    authStateChangeListeners.forEach(callback => {
      if (typeof callback === 'function') {
        callback(null);
      }
    });
  }, 100);
})();
`

/**
 * Get the Firebase mock script as a string for page injection
 */
export function getFirebaseMockScript(): string {
  return firebaseMockScript
}

/**
 * Mock user data for specific test scenarios
 */
export const testUsers = {
  admin: {
    email: 'madrusnl@hotmail.com',
    password: 'MyReallyStr0ngPassw0rd!!!',
    role: 'ADMIN',
  },
  manager: {
    email: 'madrus@gmail.com',
    password: 'MyReallyStr0ngPassw0rd!!!',
    role: 'MANAGER',
  },
} as const
