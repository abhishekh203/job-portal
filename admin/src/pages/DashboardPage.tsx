import { Link } from 'react-router-dom'
import {
  Briefcase,
  Users,
  FileText,
  TrendingUp,
  Eye,
  Clock,
  CheckCircle
} from 'lucide-react'
import { Button } from '../components/ui/button'
import { useDashboardStats } from '../hooks/useApi'

export default function DashboardPage() {
  const { data: stats, isLoading } = useDashboardStats()

  // Mock recent activity data for now
  const recentActivity = [
    {
      type: 'job_created',
      description: 'New job "Senior Developer" was created',
      timestamp: '2 hours ago'
    },
    {
      type: 'application_received',
      description: 'New application received for "Frontend Developer"',
      timestamp: '4 hours ago'
    },
    {
      type: 'user_registered',
      description: 'New user John Doe registered',
      timestamp: '6 hours ago'
    }
  ]

  const statCards = [
    {
      title: 'Total Jobs',
      value: stats?.totalJobs || 0,
      icon: Briefcase,
      color: 'bg-blue-500',
      href: '/jobs'
    },
    {
      title: 'Active Jobs',
      value: stats?.approvedJobs || 0,
      icon: TrendingUp,
      color: 'bg-green-500',
      href: '/jobs?status=active'
    },
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'bg-purple-500',
      href: '/job-seekers'
    },
    {
      title: 'Applications',
      value: stats?.totalApplications || 0,
      icon: FileText,
      color: 'bg-orange-500',
      href: '/applications'
    },
    {
      title: 'Total Views',
      value: stats?.totalViews || 0,
      icon: Eye,
      color: 'bg-cyan-500',
      href: '/jobs'
    }
  ]

  const quickActions = [
    {
      title: 'Create New Job',
      description: 'Post a new job opening',
      icon: Briefcase,
      href: '/jobs/new',
      color: 'bg-blue-500'
    },
    {
      title: 'Write Blog Post',
      description: 'Create a new blog article',
      icon: FileText,
      href: '/blogs/new',
      color: 'bg-green-500'
    },
    {
      title: 'View Analytics',
      description: 'Check platform analytics',
      icon: TrendingUp,
      href: '/analytics',
      color: 'bg-purple-500'
    }
  ]

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome to NayaJagir Admin
        </h1>
        <p className="text-gray-600">
          Manage your job portal efficiently with our comprehensive admin dashboard.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <Link
              key={card.title}
              to={card.href}
              className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <div className={`${card.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              {quickActions.map((action) => {
                const Icon = action.icon
                return (
                  <Link
                    key={action.title}
                    to={action.href}
                    className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <div className={`${action.color} p-2 rounded-lg`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{action.title}</p>
                      <p className="text-xs text-gray-500">{action.description}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                View All
              </Button>
            </div>

            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.slice(0, 5).map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {activity.type === 'job_created' && (
                        <div className="bg-blue-100 p-2 rounded-full">
                          <Briefcase className="h-4 w-4 text-blue-600" />
                        </div>
                      )}
                      {activity.type === 'application_received' && (
                        <div className="bg-green-100 p-2 rounded-full">
                          <FileText className="h-4 w-4 text-green-600" />
                        </div>
                      )}
                      {activity.type === 'user_registered' && (
                        <div className="bg-purple-100 p-2 rounded-full">
                          <Users className="h-4 w-4 text-purple-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500 flex items-center mt-1">
                        <Clock className="h-3 w-3 mr-1" />
                        {activity.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">System Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <span className="text-sm text-gray-700">Database: Online</span>
          </div>
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <span className="text-sm text-gray-700">API: Operational</span>
          </div>
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <span className="text-sm text-gray-700">Storage: Available</span>
          </div>
        </div>
      </div>
    </div>
  )
}
