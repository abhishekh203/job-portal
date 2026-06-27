'use client'

import { ReactNode, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  LayoutDashboard,
  Briefcase,
  Building2,
  LogOut,
  CreditCard,
  Menu,
  X,
  ChevronRight,
  Bell,
  Plus,
  ExternalLink,
} from 'lucide-react'

interface EmployerLayoutProps {
  children: ReactNode
}

export default function EmployerLayout({ children }: EmployerLayoutProps) {
  const { user, logout, loading } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard/employer',
      icon: LayoutDashboard,
      current: pathname === '/dashboard/employer',
    },
    {
      name: 'My Jobs',
      href: '/dashboard/employer/jobs',
      icon: Briefcase,
      current: pathname.startsWith('/dashboard/employer/jobs'),
    },
    {
      name: 'Company Profile',
      href: '/dashboard/employer/company',
      icon: Building2,
      current: pathname === '/dashboard/employer/company',
    },
    {
      name: 'Subscription',
      href: '/dashboard/employer/subscription',
      icon: CreditCard,
      current: pathname === '/dashboard/employer/subscription',
    },
  ]

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (user.role !== 'EMPLOYER') {
    router.push('/dashboard/profile')
    return null
  }

  const initials = user.companyName
    ? user.companyName.charAt(0).toUpperCase()
    : user.email?.charAt(0).toUpperCase() || 'E'

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-card transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between border-b border-border px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
              <Briefcase className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">DarbarJob</span>
          </Link>
          <Button variant="ghost" size="icon" className="lg:hidden h-8 w-8" onClick={() => setSidebarOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Company Card */}
        <div className="border-b border-border px-6 py-5">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 shrink-0 rounded-lg">
              <AvatarImage src={user.companyLogo} alt={user.companyName || 'Company'} />
              <AvatarFallback className="rounded-lg bg-primary/10 text-primary text-sm font-semibold">{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">
                {user.companyName || 'Your Company'}
              </p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  item.current
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.name}
                {item.current && <ChevronRight className="h-4 w-4 ml-auto" />}
              </Link>
            )
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-border p-4 space-y-2">
          <Button variant="default" size="sm" asChild className="w-full justify-start rounded-lg">
            <Link href="/dashboard/employer/jobs/new">
              <Plus className="h-4 w-4 mr-2" />
              Post a Job
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild className="w-full justify-start rounded-lg">
            <Link href="/">
              <ExternalLink className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
          <Button variant="ghost" size="sm" onClick={logout} className="w-full justify-start rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10">
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 lg:pl-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 backdrop-blur-sm px-4 lg:px-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="lg:hidden h-9 w-9" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-foreground hidden sm:block">
                {navigation.find(n => n.current)?.name || 'Employer Dashboard'}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full relative">
              <Bell className="h-4 w-4" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />
            </Button>
            <Avatar
              className="h-8 w-8 cursor-pointer rounded-lg"
              onClick={() => router.push('/dashboard/employer/company')}
            >
              <AvatarImage src={user.companyLogo} alt="" />
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold rounded-lg">{initials}</AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Page Content */}
        <div className="dashboard-content">
          {children}
        </div>
      </div>
    </div>
  )
}
