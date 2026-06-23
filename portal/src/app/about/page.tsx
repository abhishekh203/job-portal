import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  Target,
  Heart,
  Award,
  TrendingUp,
  Globe,
  Shield,
  Zap,
  ArrowRight,
  CheckCircle
} from 'lucide-react'

export default function AboutPage() {
  const stats = [
    { label: 'Active Job Seekers', value: '50,000+', icon: Users },
    { label: 'Partner Companies', value: '1,200+', icon: Globe },
    { label: 'Successful Placements', value: '25,000+', icon: Award },
    { label: 'Countries Served', value: '15+', icon: TrendingUp },
  ]

  const values = [
    {
      icon: Target,
      title: 'Mission-Driven',
      description: 'We believe everyone deserves meaningful work that aligns with their skills and aspirations.',
    },
    {
      icon: Heart,
      title: 'People-First',
      description: 'Our platform is built with genuine care for both job seekers and employers.',
    },
    {
      icon: Shield,
      title: 'Trust & Security',
      description: 'We maintain the highest standards of data security and privacy protection.',
    },
    {
      icon: Zap,
      title: 'Innovation',
      description: 'We continuously evolve our platform with cutting-edge technology and user feedback.',
    },
  ]

  const team = [
    {
      name: 'Sarah Johnson',
      role: 'CEO & Founder',
      bio: 'Former HR executive with 15+ years of experience in talent acquisition and career development.',
      image: '/team/sarah.jpg',
    },
    {
      name: 'Michael Chen',
      role: 'CTO',
      bio: 'Tech leader passionate about building scalable platforms that connect people with opportunities.',
      image: '/team/michael.jpg',
    },
    {
      name: 'Emily Rodriguez',
      role: 'Head of Product',
      bio: 'Product strategist focused on creating intuitive experiences for job seekers and employers.',
      image: '/team/emily.jpg',
    },
    {
      name: 'David Kim',
      role: 'Head of Growth',
      bio: 'Growth expert helping companies and candidates discover each other more effectively.',
      image: '/team/david.jpg',
    },
  ]

  const milestones = [
    {
      year: '2020',
      title: 'Company Founded',
      description: 'Started with a vision to revolutionize job searching and hiring.',
    },
    {
      year: '2021',
      title: 'First 1,000 Users',
      description: 'Reached our first milestone of 1,000 active job seekers.',
    },
    {
      year: '2022',
      title: 'Series A Funding',
      description: 'Secured funding to expand our platform and team.',
    },
    {
      year: '2023',
      title: 'International Expansion',
      description: 'Launched in 10+ countries across Asia and Europe.',
    },
    {
      year: '2024',
      title: 'AI-Powered Matching',
      description: 'Introduced advanced AI algorithms for better job matching.',
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-background via-background to-muted/30 py-20 border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              About{' '}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                NayaJagir
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              We&apos;re on a mission to connect talented professionals with meaningful opportunities,
              making the job search process more efficient and rewarding for everyone.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/jobs">
                  Explore Opportunities
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-4xl mx-auto">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div key={index} className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <div className="text-3xl font-bold text-foreground mb-2">{stat.value}</div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid gap-12 lg:grid-cols-2 items-center">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-6">Our Mission</h2>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  At NayaJagir, we believe that finding the right job shouldn&apos;t be a struggle.
                  Our mission is to bridge the gap between talented professionals and forward-thinking
                  companies, creating opportunities that drive both individual growth and business success.
                </p>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  We&apos;re committed to building a platform that not only connects people with jobs,
                  but helps them discover careers that align with their values, skills, and aspirations.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span className="text-foreground">Transparent and fair hiring processes</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span className="text-foreground">Equal opportunities for all candidates</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span className="text-foreground">Continuous innovation and improvement</span>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-square bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center">
                  <div className="text-center">
                    <Target className="h-24 w-24 text-primary mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-foreground mb-2">Our Vision</h3>
                    <p className="text-muted-foreground max-w-xs">
                      To become the world&apos;s most trusted platform for career advancement and talent acquisition.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-foreground mb-4">Our Values</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                These core values guide everything we do and shape the culture we&apos;re building.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {values.map((value, index) => {
                const Icon = value.icon
                return (
                  <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                    <CardContent className="pt-8 pb-6">
                      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                        <Icon className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-3">
                        {value.title}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {value.description}
                      </p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-foreground mb-4">Our Journey</h2>
              <p className="text-xl text-muted-foreground">
                Key milestones in our mission to transform the job market.
              </p>
            </div>
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex gap-6 items-start">
                  <div className="flex-shrink-0">
                    <Badge variant="secondary" className="text-lg px-4 py-2">
                      {milestone.year}
                    </Badge>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {milestone.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {milestone.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-foreground mb-4">Meet Our Team</h2>
              <p className="text-xl text-muted-foreground">
                The passionate people behind NayaJagir&apos;s success.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {team.map((member, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="pt-8 pb-6">
                    <div className="w-24 h-24 rounded-full bg-primary/10 mx-auto mb-6 flex items-center justify-center">
                      <Users className="h-12 w-12 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      {member.name}
                    </h3>
                    <p className="text-primary font-medium mb-3">
                      {member.role}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {member.bio}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of professionals who have found their dream jobs through NayaJagir.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/auth/register">
                  Get Started Today
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/jobs">Browse Jobs</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
