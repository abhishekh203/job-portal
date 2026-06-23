'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  User,
  LogOut,
  FileText,
  Menu,
  Briefcase,
  BookOpen,
  Phone,
  Info,
  LayoutDashboard,
  Building2,
  X,
  Sun,
  Moon,
} from 'lucide-react'
import { useState, useEffect } from 'react'

export function Header() {
  const { user, logout, isAuthenticated } = useAuth()
  const { theme, setTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navigation = [
    { name: 'Jobs', href: '/jobs', icon: Briefcase },
    { name: 'Blogs', href: '/blogs', icon: BookOpen },
    { name: 'About', href: '/about', icon: Info },
    { name: 'Contact', href: '/contact', icon: Phone },
  ]

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-background/95 backdrop-blur-md border-b border-border shadow-sm'
          : 'bg-background border-b border-border/60'
      }`}
    >
      <div className="w-full px-4 sm:px-6 lg:px-10">
        <div className={`flex items-center justify-between transition-all duration-300 ${
          scrolled ? 'h-16' : 'h-20'
        }`}>
          {/* ── Left: logo + primary nav ── */}
          <div className="flex items-center gap-6 lg:gap-10">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group shrink-0">
              <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center shadow-md transition-all duration-300 group-hover:shadow-lg group-hover:scale-105">
                <Briefcase className="h-5 w-5 text-primary-foreground dark:text-white" />
              </div>
              <span className="text-2xl font-bold text-foreground tracking-tight">
                Naya<span className="text-primary">Jagir</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="group relative flex items-center gap-2 px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/60 transition-all duration-200"
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                    <span className="absolute inset-x-0 -bottom-0 h-0.5 scale-x-0 rounded-full bg-primary transition-transform duration-200 group-hover:scale-x-100" />
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* ── Right: auth + theme + mobile toggle ── */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 hover:ring-2 hover:ring-primary/30 transition-all">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user?.profilePicture} alt={user?.email} />
                      <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                        {user?.firstName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-60" align="end" forceMount>
                  <div className="flex items-center gap-3 p-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user?.profilePicture} alt={user?.email} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {user?.firstName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col leading-tight">
                      <p className="font-semibold text-sm text-foreground">
                        {user?.firstName ? `${user.firstName} ${user.lastName}` : 'User'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  {user?.role === 'EMPLOYER' ? (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard/employer" className="flex items-center cursor-pointer">
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          Employer Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard/employer/company" className="flex items-center cursor-pointer">
                          <Building2 className="mr-2 h-4 w-4" />
                          Company Profile
                        </Link>
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard/profile" className="flex items-center cursor-pointer">
                          <User className="mr-2 h-4 w-4" />
                          My Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard/applications" className="flex items-center cursor-pointer">
                          <FileText className="mr-2 h-4 w-4" />
                          My Applications
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="flex items-center cursor-pointer text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Button variant="ghost" asChild className="rounded-lg font-semibold px-5 hover:bg-muted/60">
                  <Link href="/auth/login">Sign In</Link>
                </Button>
                <Button asChild className="rounded-lg px-5 font-semibold gradient-primary text-white shadow-md hover:shadow-lg transition-all duration-200">
                  <Link href="/auth/register">Create Account</Link>
                </Button>
              </div>
            )}

            {/* Theme toggle */}
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                className="rounded-lg h-10 w-10"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden rounded-lg h-10 w-10"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="container mx-auto px-4 py-6 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 text-base font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-xl transition-all duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}

            {!isAuthenticated && (
              <div className="pt-4 border-t border-border space-y-3">
                <Button variant="outline" asChild className="w-full justify-center rounded-xl font-semibold h-12">
                  <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                    Sign In
                  </Link>
                </Button>
                <Button asChild className="w-full justify-center rounded-xl font-semibold h-12 gradient-primary text-white">
                  <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)}>
                    Create Account
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
