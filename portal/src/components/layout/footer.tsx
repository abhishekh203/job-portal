'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Briefcase, Mail, Phone, MapPin, ArrowRight, Linkedin, Twitter, Github } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState } from 'react'

export function Footer() {
  const currentYear = new Date().getFullYear()
  const [email, setEmail] = useState('')

  const footerLinks = {
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Contact', href: '/contact' },
      { name: 'Blog', href: '/blogs' },
    ],
    jobSeekers: [
      { name: 'Browse Jobs', href: '/jobs' },
      { name: 'Career Advice', href: '/blogs' },
      { name: 'Resume Tips', href: '/blogs' },
    ],
    support: [
      { name: 'Help Center', href: '/contact' },
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
    ],
  }

  return (
    <footer className="bg-foreground text-background relative overflow-hidden">
      <Image
        src="/images/job-portal-footer-v1.png"
        alt=""
        fill
        sizes="100vw"
        className="object-cover object-bottom brightness-125 saturate-125"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-foreground/65 via-forest-teal/45 to-foreground/15" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Newsletter Section */}
        <div className="py-12 border-b border-background/10">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-xl font-bold text-background mb-2">Stay Ahead in Your Career</h3>
            <p className="text-background/60 mb-6 text-sm">
              Get weekly job alerts, career advice, and industry insights delivered to your inbox.
            </p>
            <form
              onSubmit={(e) => { e.preventDefault(); setEmail('') }}
              className="flex gap-3 max-w-md mx-auto"
            >
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 h-12 rounded-xl border-background/20 bg-background/10 text-background placeholder:text-background/40 focus:border-primary/50"
              />
              <Button type="submit" className="h-12 rounded-xl px-6 gradient-primary text-white shrink-0">
                Subscribe <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Section */}
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
                <Briefcase className="h-6 w-6 text-primary-foreground dark:text-white" />
              </div>
              <span className="text-xl font-bold text-background">
                Job<span className="text-primary">Portal</span>
              </span>
            </div>
            <p className="text-background/60 text-sm leading-relaxed max-w-xs">
              The professional job platform connecting talented professionals with leading companies worldwide.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-background/50 text-sm">
                <Mail className="h-4 w-4 text-accent shrink-0" />
                <span>hello@nayajagir.com</span>
              </div>
              <div className="flex items-center gap-3 text-background/50 text-sm">
                <Phone className="h-4 w-4 text-accent shrink-0" />
                <span>+977 01-123-4567</span>
              </div>
              <div className="flex items-center gap-3 text-background/50 text-sm">
                <MapPin className="h-4 w-4 text-accent shrink-0" />
                <span>Kathmandu, Nepal</span>
              </div>
            </div>
          </div>

          {Object.entries(footerLinks).map(([key, links]) => (
            <div key={key}>
              <h3 className="font-semibold text-background mb-5 text-sm uppercase tracking-wider">
                {key === 'company' ? 'Company' : key === 'jobSeekers' ? 'For Job Seekers' : 'Support'}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-background/50 hover:text-accent transition-colors duration-200 text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Footer */}
        <div className="py-8 border-t border-background/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-background/40 text-sm text-center md:text-left">
            &copy; {currentYear} NayaJagir. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-background/40 hover:text-accent transition-colors text-sm">
              Privacy
            </Link>
            <Link href="/terms" className="text-background/40 hover:text-accent transition-colors text-sm">
              Terms
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-background/10 flex items-center justify-center hover:bg-accent/20 transition-colors cursor-pointer">
                <Linkedin className="h-4 w-4 text-background/60" />
              </div>
              <div className="w-8 h-8 rounded-lg bg-background/10 flex items-center justify-center hover:bg-accent/20 transition-colors cursor-pointer">
                <Twitter className="h-4 w-4 text-background/60" />
              </div>
              <div className="w-8 h-8 rounded-lg bg-background/10 flex items-center justify-center hover:bg-accent/20 transition-colors cursor-pointer">
                <Github className="h-4 w-4 text-background/60" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
