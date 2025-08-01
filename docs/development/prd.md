# Product Requirements Document (PRD)

## Tournament Management System - Tournado

### Executive Summary

Tournado is a comprehensive tournament management system designed to streamline soccer tournament operations from team registration through live match tracking and public results viewing. The system serves multiple user roles with distinct needs, providing a modern, mobile-first experience with multi-language support.

### Product Vision

**Vision Statement**: To provide the most intuitive and comprehensive tournament management platform that serves administrators, referees, team leaders, and the public with real-time tournament information and seamless user experiences.

**Mission**: Eliminate the complexity of tournament management while providing transparency and engagement for all stakeholders.

---

## Current State Analysis

### ✅ Implemented Features

**Foundation Layer**

- [x] **Authentication System**: Cookie-based authentication with 5 user roles defined in schema (ADMIN, TOURNAMENT_MANAGER, REFEREE_COORDINATOR, REFEREE, PUBLIC)
- [x] **Multi-language Support**: Dutch, English, French, Arabic, Turkish with RTL support for Arabic
- [x] **Mobile-First PWA**: Responsive design with offline capabilities, service worker, installable
- [x] **Database Schema**: Complete data model for tournaments, teams, matches, and scoring

**Tournament Management**

- [x] **Tournament CRUD**: Create, read, update, delete tournaments with categories and divisions
- [x] **Admin Dashboard**: Centralized management interface (`/a7k9m2x5p8w1n4q6r3y8b5t1`)
- [x] **Navigation System**: Role-based menu system with authentication awareness
- [x] **Mobile Swipe-to-Delete**: Touch-optimized tournament management

**Team Registration System**

- [x] **Public Team Registration**: Unauthenticated users can register teams with contact information
- [x] **Team Viewing**: Public can view team lists with filtering
- [x] **Contact Management**: TeamLeader model stores contact information (not user accounts)
- [x] **Team Categories & Divisions**: Full enum system (JO8-JO19, MO8-MO19, Veterans, 6-tier divisions)
- [x] **Advanced Team Forms**: Enhanced team registration with real-time validation

**Technical Infrastructure**

- [x] **Modern Stack**: React Router v7, TypeScript, Tailwind CSS, Prisma ORM
- [x] **Testing Suite**: 584+ unit tests (Vitest) + comprehensive E2E tests (Playwright)
- [x] **CI/CD Pipeline**: Automated testing and deployment with Slack notifications
- [x] **State Management**: Zustand with SSR-safe hydration and persistence
- [x] **Theme System**: Dark/light mode with system detection
- [x] **Form Validation**: Advanced validation with panel-based progression
- [x] **Mobile Navigation**: Bottom navigation bar with proper touch handling
- [x] **MCP Testing Server**: AI-assisted testing with production-ready NPM package

**Dark Mode**

- [x] **Uniform Styling**: Many pages and components need proper light/dark mode styling

**Authentication & Authorization**

- [x] **Role-Based Access Control**: Schema defines 5 roles but enforcement not implemented
- [x] **User Role Differentiation**: Currently all authenticated users redirect to admin panel
- [x] **Permission System**: Need to implement role-based permissions

### 🔄 In Progress Features

### 📋 Planned Features (PRD Scope)

**Core Pool System (Phase 2)**

- [ ] **Pool Creation**: Automated team grouping based on categories and divisions
- [ ] **Pool Management**: Admin tools for pool organization and team assignment
- [ ] **Basic Match Generation**: Simple match creation within pools
- [ ] **Score Management**: Referee score entry and validation

**Advanced Features (Later Phases)**

- [ ] **Bracket Generation**: Swiss tournament and knockout bracket algorithms
- [ ] **Live Updates**: Real-time match results and standings
- [ ] **Public Dashboard**: Live tournament following for spectators
- [ ] **Classification System**: Dynamic rankings and pool standings

---

## User Personas & Use Cases

### 1. Tournament Administrator (ADMIN Role)

**Authentication**: Required
**Primary Goals**: Complete tournament setup and oversight
**Key Features Needed**:

- [x] Tournament creation with categories and divisions
- [ ] Team pool management and organization
- [ ] Match scheduling within pools
- [ ] Real-time tournament monitoring
- [ ] Results validation and publication
- [ ] Team approval and organization

### 2. Tournament Manager (MANAGER Role)

**Authentication**: Required
**Primary Goals**: Operational tournament management
**Key Features Needed**:

- [ ] Pool creation and management tools
- [ ] Team coordination and communication
- [ ] Results publication
- [ ] Tournament configuration assistance
- [ ] Referee scheduling and assignment
- [ ] Match assignment dashboard
- [ ] Communication with referees
- [ ] Referee performance tracking

### 3. Referee (REFEREE Role)

**Authentication**: Required
**Primary Goals**: Quick and accurate score entry
**Key Features Needed**:

- [ ] Mobile-optimized score entry interface
- [ ] Match assignment dashboard
- [ ] Quick match status updates (postponed, cancelled)
- [ ] Offline score entry with sync capabilities

### 4. Registered Public Users (PUBLIC Role)

**Authentication**: Required
**Primary Goals**: Enhanced tournament following
**Key Features Needed**:

- [ ] Personalized tournament dashboard
- [ ] Favorite team tracking
- [ ] Notification preferences
- [ ] Match alerts and updates

### 5. Team Leaders (Unauthenticated Public)

**Authentication**: Not required
**Primary Goals**: Team registration and basic tournament information
**Key Features Needed**:

- [x] Team registration for tournaments (contact form only)
- [x] View team information
- [ ] Basic tournament schedule viewing
- [ ] Contact tournament officials

### 6. General Public/Spectators (Unauthenticated)

**Authentication**: Not required
**Primary Goals**: Following tournament progress and results
**Key Features Needed**:

- [ ] Live tournament dashboard
- [ ] Real-time match results
- [ ] Team standings and classifications
- [ ] Match schedules and field information

---

## Feature Roadmap

### Phase 1: Role-Based Access Control (Q1 2025)

**Priority**: Critical
**Timeline**: 3-4 weeks

#### 1.1 Authentication System Implementation

- [x] **Role-Based Routing**: Implement proper role-based access control
- [x] **User Role Management**: Different access levels per role
- [x] **Admin Panel Restriction**: Only ADMIN, MANAGER, and REFEREE roles access Admin Panel
- [x] **Public Access**: Unauthenticated users can register teams and view tournaments

#### 1.2 Permission System

- [ ] **Route Protection**: Implement role-based route protection
- [ ] **Feature Permissions**: Role-specific feature access
- [ ] **User Management**: Admin ability to manage user roles
- [ ] **Access Control Tests**: Comprehensive testing of role permissions

#### 1.3 Team Registration Enhancement

- [x] **Unauthenticated Registration**: Streamlined team registration without login
- [x] **Contact Information**: TeamLeader model as contact info only
- [ ] **Admin Team Review**: Admin workflow for reviewing team registrations
- [ ] **Registration Status**: Track team approval status

### Phase 2: Pool Creation & Management (Q2 2025)

**Priority**: Critical
**Timeline**: 6-8 weeks

#### 2.1 Pool Creation Engine

- [ ] **Pool Creation**: Automatic team grouping based on categories and divisions
- [ ] **Field Assignment**: Multi-field scheduling with time slot management
- [ ] **Conflict Resolution**: Automatic detection and resolution of scheduling conflicts
- [ ] **Team Approval**: Admin approval workflow for team registrations

#### 2.2 Score Entry Interface

- [ ] **Referee Dashboard**: Match assignment and score entry interface
- [ ] **Mobile Score Entry**: Touch-optimized scoring with validation
- [ ] **Offline Support**: Score entry with background sync
- [ ] **Match Status Management**: Real-time status updates (upcoming, playing, completed)

#### 2.3 Basic Live Updates

- [ ] **Real-time Score Broadcasting**: WebSocket-based live updates
- [ ] **Match Status Tracking**: Live match progress indicators
- [ ] **Basic Notifications**: Score update alerts for interested parties

### Phase 3: Public Engagement (Q3 2025)

**Priority**: High
**Timeline**: 4-5 weeks

#### 3.1 Public Tournament Dashboard

- [ ] **Live Tournament View**: Real-time tournament overview
- [ ] **Match Results Display**: Comprehensive results with match details
- [ ] **Team Performance**: Individual team statistics and history
- [x] **Search and Filter**: Easy navigation through tournament data

#### 3.2 Classification System

- [ ] **Dynamic Rankings**: Real-time pool standings calculation
- [ ] **Promotion/Relegation**: Automatic division movement tracking
- [ ] **Performance Metrics**: Team and player statistics
- [ ] **Historical Data**: Tournament history and comparisons

#### 3.3 Enhanced Mobile Experience

- [x] **Progressive Web App**: Enhanced offline capabilities
- [ ] **Push Notifications**: Match alerts and score updates
- [x] **Home Screen Integration**: Quick access to tournament info
- [x] **Swipe Gestures**: Intuitive navigation between matches and standings

### Phase 4: Advanced Tournament Features (Q4 2025)

**Priority**: Medium
**Timeline**: 6-8 weeks

#### 4.1 Bracket Generation & Advanced Tournament Types

- [ ] **Bracket Generation**: Swiss tournament and knockout bracket algorithms
- [ ] **Multiple Tournament Formats**: Round-robin, knockout, Swiss system
- [ ] **Multi-stage Tournaments**: Group phase + knockout combinations
- [ ] **Playoff Systems**: Configurable playoff structures
- [ ] **Custom Scoring**: Different point systems per tournament

#### 4.2 Communication System

- [ ] **In-app Messaging**: Communication between authenticated users
- [ ] **Announcements**: Tournament-wide notifications
- [ ] **Email Integration**: Automated match reminders and results
- [ ] **Contact Forms**: Communication for unauthenticated users

#### 4.3 Reporting and Analytics

- [ ] **Tournament Reports**: Comprehensive tournament summaries
- [ ] **Performance Analytics**: Team and player performance insights
- [ ] **Export Functionality**: Data export for external analysis
- [ ] **Custom Dashboards**: Role-specific information views

### Phase 5: Extended Functionality (Q1 2026)

**Priority**: Low
**Timeline**: 8-10 weeks

#### 5.1 Advanced Administration

- [ ] **Multi-tournament Management**: Season-long tournament series
- [ ] **Referee Scheduling**: Automated referee assignment
- [ ] **Equipment Management**: Field and equipment tracking
- [ ] **Financial Tracking**: Tournament fee and payment management

#### 5.2 Integration Capabilities

- [ ] **Third-party Integrations**: External tournament platforms
- [ ] **API Development**: Public API for tournament data
- [ ] **Calendar Integration**: Match schedule exports
- [ ] **Social Media**: Automated result sharing

#### 5.3 Enhanced User Experience

- [x] **Customizable Themes**: Tournament-specific branding (Dark/Light mode implemented)
- [ ] **Advanced Search**: Full-text search across tournament data
- [ ] **Favorites System**: Personalized team and tournament following
- [x] **Accessibility**: Enhanced screen reader and keyboard support

---

## Technical Requirements

### Current Technical Architecture

#### Authentication System

- **Current State**: Cookie-based sessions with all authenticated users redirecting to admin panel
- **Role System**: 5 roles defined in schema but not implemented in application logic
- **Access Control**: Route-based protection exists but not role-specific

#### Data Models

- **User Model**: Authentication accounts with role assignment (not enforced)
- **TeamLeader Model**: Contact information only - not linked to user accounts
- **Tournament Model**: JSON-based divisions and categories (SQLite limitation)
- **Match/MatchScore Models**: Scoring system foundation (not yet utilized)

#### Current Routes

- **Public**: `/`, `/teams`, `/about`, `/auth/*`
- **Authenticated**: `/profile`, `/settings`, `/a7k9m2x5p8w1n4q6r3y8b5t1/*` (all roles)
- **Admin**: `/a7k9m2x5p8w1n4q6r3y8b5t1/tournaments/*` (ADMIN role required but not enforced)

### Current Architecture Limitations

- **Role Implementation**: Roles defined in schema but not enforced in application
- **Access Control**: All authenticated users currently access admin panel
- **Team Registration**: Public registration works but lacks approval workflow
- **Match System**: Database schema exists but no pool/match management logic

### Architecture Requirements

- [x] **Scalability**: Support for 100+ concurrent users during live tournaments
- [x] **Performance**: <2 second page load times, <500ms API responses
- [x] **Reliability**: 99.9% uptime during tournament periods
- [ ] **Security**: Role-based access control with secure authentication

### Platform Requirements

- [x] **Mobile-First**: Responsive design with touch-optimized interfaces
- [x] **Progressive Web App**: Offline capabilities and home screen installation
- [x] **Multi-language**: Support for 5+ languages with RTL support for Arabic
- [x] **Cross-browser**: Support for modern browsers (Chrome, Firefox, Safari, Edge)

### Data Requirements

- [ ] **Real-time Updates**: WebSocket connections for live data (Not Yet Implemented)
- [x] **Offline Support**: Local storage with background synchronization
- [x] **Data Integrity**: Transactional updates with rollback capabilities
- [x] **Backup Strategy**: Daily automated backups with point-in-time recovery

### Integration Requirements

- [ ] **Email Services**: Automated notifications and communications
- [ ] **Push Notifications**: Real-time alerts for mobile devices
- [x] **Analytics**: User behavior tracking and tournament insights
- [ ] **Export Formats**: CSV, PDF, and JSON data exports

---

## Success Metrics

### User Engagement Metrics

- **Daily Active Users**: Target 80%+ of registered users during tournaments
- **Session Duration**: Average 10+ minutes per session
- **Feature Adoption**: 70%+ of users utilizing core features
- **User Retention**: 85%+ return rate for multi-day tournaments

### Operational Metrics

- **Tournament Setup Time**: <30 minutes for standard tournaments
- **Score Entry Speed**: <60 seconds per match result
- **Data Accuracy**: 99.9% accuracy in match results and standings
- **System Uptime**: 99.9% availability during tournament periods

### Performance Metrics

- **Page Load Time**: <2 seconds for all pages
- **API Response Time**: <500ms for all endpoints
- **Mobile Performance**: Lighthouse score >90 for mobile
- **Offline Capability**: 100% score entry functionality offline

### Business Metrics

- **Tournament Completion Rate**: 95%+ tournaments completed successfully
- **User Satisfaction**: 4.5+ rating from post-tournament surveys
- **Support Tickets**: <5% of users requiring technical support
- **Feature Requests**: Track and prioritize user-requested features

---

## Risk Assessment

### Technical Risks

- **Role System Refactoring**: Significant changes to current authentication flow
- **Real-time Data Complexity**: WebSocket implementation challenges
- **Offline Sync Conflicts**: Data consistency during offline usage
- **Scalability Concerns**: High concurrent user loads during tournaments
- **Mobile Performance**: Complex calculations on mobile devices

### Business Risks

- **User Adoption**: Resistance to new systems from existing users
- **Competition**: Existing tournament management solutions
- **Feature Scope**: Over-engineering vs. user needs balance
- **Maintenance**: Long-term support and feature development

### Mitigation Strategies

- **Incremental Rollout**: Phase-based implementation with user feedback
- **Performance Testing**: Load testing before major tournaments
- **User Training**: Comprehensive documentation and support
- **Fallback Systems**: Manual processes for critical failures

---

## Implementation Timeline

### Q1 2025: Authentication & Access Control

- **Weeks 1-2**: Role-based access control implementation
- **Weeks 3-4**: User role management and permissions
- **Weeks 5-6**: Team registration workflow and admin approval

### Q2 2025: Pool Creation & Management

- **Weeks 1-3**: Pool creation engine development
- **Weeks 4-6**: Score entry interface and referee dashboard
- **Weeks 7-8**: Basic live updates and WebSocket implementation

### Q3 2025: Public Features

- **Weeks 1-2**: Public tournament dashboard
- **Weeks 3-4**: Classification system and dynamic rankings
- **Weeks 5-6**: Enhanced mobile experience and PWA features

### Q4 2025: Advanced Features

- **Weeks 1-3**: Bracket generation and advanced tournament types
- **Weeks 4-6**: Communication system and notifications
- **Weeks 7-8**: Reporting and analytics dashboard

### Q1 2026: Extended Functionality

- **Weeks 1-3**: Advanced administration features
- **Weeks 4-6**: Integration capabilities and API development
- **Weeks 7-8**: Enhanced user experience and accessibility

---

## Conclusion

This PRD outlines a comprehensive roadmap for completing the Tournado tournament management system. The critical first phase focuses on implementing the role-based access control system that is defined in the schema but not yet enforced in the application.

**Key Architectural Principles**:

- **ADMIN/TOURNAMENT_MANAGER**: Full tournament and pool management capabilities
- **REFEREE_COORDINATOR**: Referee assignment and coordination
- **REFEREE**: Score entry and match management
- **PUBLIC (Authenticated)**: Enhanced tournament following with personalization
- **Team Leaders (Unauthenticated)**: Contact-based team registration only
- **General Public (Unauthenticated)**: Tournament viewing and basic information

**Critical First Steps**:

1. Implement role-based access control system
2. Focus Phase 2 on pool creation and management
3. Add bracket generation in Phase 4 once pool system is stable
4. Build comprehensive tournament management platform

**Pool-First Approach**:

- Phase 2 focuses on pool creation and basic match management
- Bracket generation moved to Phase 4 for better stability
- Provides immediate value with simpler tournament formats

The focus on mobile-first design, real-time updates, and multi-language support positions Tournado as a modern solution for tournament management in an increasingly digital world.

**Next Steps**:

1. Review and approve this PRD with stakeholders
2. Begin Phase 1 development with role-based access control
3. Design pool creation algorithms for Phase 2
4. Prepare for beta testing with real tournaments in Q3 2025
