# Smart Task Manager

A modern, full-stack task management application built with Next.js, featuring intelligent task assignment, team collaboration, and real-time workload balancing.

![Next.js](https://img.shields.io/badge/Next.js-16.0.8-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![MongoDB](https://img.shields.io/badge/MongoDB-8.20.0-green?style=flat-square&logo=mongodb)
![Redux](https://img.shields.io/badge/Redux_Toolkit-2.10.1-purple?style=flat-square&logo=redux)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0-38bdf8?style=flat-square&logo=tailwindcss)

## Features

### Core Functionality
- **User Authentication** - Secure login/register with JWT and bcrypt
- **Team Management** - Create teams and add members with roles and task capacities
- **Project Management** - Organize tasks within projects linked to teams
- **Smart Task Assignment** - Auto-assign tasks based on member workload and capacity
- **Task Tracking** - Manage tasks with priorities (Low/Medium/High) and statuses (Pending/In Progress/Done)
- **Workload Balancing** - Automatic task reassignment to prevent member overload
- **Activity Logging** - Track all task reassignments and changes

### UI/UX Features
- **Modern Dark Theme** - Sleek glassmorphism design with backdrop blur effects
- **Fully Responsive** - Optimized for mobile, tablet, and desktop devices
- **Skeleton Loading** - Smooth loading states without full-page spinners
- **Interactive Modals** - Responsive modals for creating/editing tasks and projects
- **Real-time Feedback** - Toast notifications for all user actions
- **Capacity Warnings** - Visual indicators when team members are overloaded

## Tech Stack

### Frontend
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS 4
- **State Management:** Redux Toolkit with Redux Persist
- **UI Components:** Lucide React Icons, Sonner (Toast notifications)
- **Utilities:** clsx, tailwind-merge

### Backend
- **Runtime:** Node.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT + bcryptjs
- **API:** Next.js API Routes

## Installation

### Prerequisites
- Node.js 20+ installed
- MongoDB instance (local or cloud)

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/kader009/smart-task.git
   cd smart-task
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### Getting Started

1. **Register/Login** - Create an account or login with existing credentials
2. **Create a Team** - Navigate to Teams page and create your first team
3. **Add Team Members** - Add members with their roles and task capacities
4. **Create a Project** - Link a project to your team
5. **Add Tasks** - Create tasks with titles, descriptions, priorities, and assign to team members
6. **Auto-assign** - Use the auto-assign feature to balance workload automatically
7. **Reassign Tasks** - Click "Reassign Tasks" on the dashboard to rebalance overloaded members


## Authentication Flow

1. User registers with email and password
2. Password is hashed using bcrypt
3. JWT token is generated and stored in Redux + localStorage (via redux-persist)
4. Protected routes check for valid token
5. Token is sent with API requests for authentication

## Task Assignment Logic

### Auto-assign Feature
- Calculates current task load for each team member
- Selects member with lowest load relative to capacity
- Shows capacity warnings if member is at/over capacity

### Auto-reassignment
- Identifies overloaded members (tasks > capacity)
- Reassigns Low and Medium priority tasks to members with free capacity
- Logs all reassignments in activity log

## Design System

- **Colors:** Dark theme with gray-900 base, indigo accents
- **Typography:** Inter font family
- **Effects:** Backdrop blur, glassmorphism, smooth transitions
- **Responsive:** Mobile-first approach with Tailwind breakpoints

## Responsive Design

- **Mobile:** Hamburger menu, stacked layouts, touch-friendly buttons
- **Tablet:** Adaptive grid layouts, optimized spacing
- **Desktop:** Full sidebar, multi-column layouts, hover effects

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```


## Author

**Kader**
- GitHub: [@kader009](https://github.com/kader009)


**Built with ❤️ using Next.js and TypeScript**
