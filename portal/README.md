# JobPortal Frontend

A modern, responsive job portal frontend built with Next.js 15, TypeScript, and Tailwind CSS.

## 🚀 Features

### 🌟 Core Features
- **Modern UI/UX** - Clean, professional design with Tailwind CSS and ShadCN UI
- **Responsive Design** - Mobile-first approach, works on all devices
- **SEO Optimized** - Dynamic metadata, OpenGraph tags, and structured data
- **Performance** - Built with Next.js 15 App Router for optimal performance

### 🔐 Authentication
- JWT-based authentication with localStorage
- User registration and login
- Protected routes for dashboard pages
- Profile completion tracking

### 💼 Job Features
- **Job Listings** - Advanced filtering (location, category, salary, experience)
- **Job Details** - Comprehensive job information with apply functionality
- **Job Search** - Real-time search with pagination
- **Job Applications** - Apply with cover letters, track application status

### 👤 User Dashboard
- **Profile Management** - Complete profile with skills, experience, education
- **File Uploads** - Resume and profile picture upload
- **Application Tracking** - View all job applications and their status
- **Profile Completion** - Progress tracking with completion requirements

### 📝 Content
- **Blog System** - Career advice and industry insights
- **Contact Page** - Contact form with office information
- **About Page** - Company information and team details

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: ShadCN UI
- **State Management**: TanStack Query (React Query)
- **Authentication**: JWT with localStorage
- **Icons**: Lucide React
- **Notifications**: Sonner

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Update the environment variables:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## 📱 Pages Overview

### Public Pages
- **Home (/)** - Landing page with featured jobs and company stats
- **Jobs (/jobs)** - Job listings with advanced filtering
- **Job Details (/jobs/[slug])** - Individual job pages with apply functionality
- **Blogs (/blogs)** - Career advice and industry insights
- **Blog Details (/blogs/[slug])** - Individual blog posts
- **About (/about)** - Company information and team
- **Contact (/contact)** - Contact form and office information

### Authentication Pages
- **Login (/auth/login)** - User login
- **Register (/auth/register)** - User registration

### Protected Dashboard Pages
- **Profile (/dashboard/profile)** - User profile management
- **Applications (/dashboard/applications)** - Job application tracking

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:5000/api` |
| `NEXT_PUBLIC_APP_URL` | Frontend app URL | `http://localhost:3000` |
| `NEXT_PUBLIC_APP_NAME` | Application name | `JobPortal` |

## 🎨 Design System

### Colors
- **Primary**: Blue-based color scheme
- **Background**: Clean white/gray backgrounds
- **Accents**: Subtle gradients and shadows

### Components
- **Cards**: Clean, shadowed containers
- **Buttons**: Multiple variants (primary, outline, ghost)
- **Forms**: Consistent input styling with validation
- **Navigation**: Responsive header with mobile menu

## 🔒 Authentication Flow

1. **Registration**: Users create accounts with email, password, and optional details
2. **Login**: JWT token stored in localStorage
3. **Protected Routes**: Automatic redirection for unauthenticated users
4. **Profile Completion**: Required before job applications
5. **Token Management**: Automatic token refresh and logout

## 📊 Key Features

### Job Search & Filtering
- Real-time search across job titles and companies
- Advanced filters: location, category, job type, work type, experience level, salary range
- Pagination for efficient loading
- Relevance-based job ordering

### Profile Management
- Personal information with skills management
- Work history and education sections
- Resume and profile picture upload
- Visual completion progress tracking

### Application System
- One-click application with optional cover letter
- Real-time status tracking (pending, reviewed, shortlisted, hired)
- Complete application history with filtering
- Application statistics and metrics

## 🚀 Performance

- Next.js App Router for server-side rendering
- Automatic code splitting
- TanStack Query for efficient data caching
- Optimized bundle sizes

## 🔮 Future Enhancements

- Image optimization with Next.js Image component
- Real-time notifications via WebSocket
- Advanced search with Elasticsearch
- Social login integration
- Mobile app development
- Analytics and user insights
