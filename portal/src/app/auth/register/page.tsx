'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth, useRedirectIfAuthenticated } from '@/hooks/use-auth'
import { registerSchema, type RegisterValues } from '@/features/auth/schemas'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Separator } from '@/components/ui/separator'
import { Eye, EyeOff, Loader2, Briefcase, Building2 } from 'lucide-react'

export default function RegisterPage() {
  useRedirectIfAuthenticated()

  const { register: registerUser, registerEmployer, loading } = useAuth()
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'jobseeker',
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      experienceLevel: '',
      companyName: '',
      companyDescription: '',
      companyWebsite: '',
      companySize: '',
      industry: '',
    },
  })

  const role = form.watch('role')

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      if (values.role === 'employer') {
        await registerEmployer({
          fullName: values.fullName,
          email: values.email,
          password: values.password,
          phone: values.phone,
          companyName: values.companyName!,
          companyDescription: values.companyDescription || undefined,
          companyWebsite: values.companyWebsite || undefined,
          companySize: values.companySize || undefined,
          industry: values.industry || undefined,
        })
      } else {
        await registerUser({
          fullName: values.fullName,
          email: values.email,
          password: values.password,
          phone: values.phone,
          experienceLevel: values.experienceLevel || undefined,
        })
      }
    } catch {
      // Error is already handled in the auth hook
    }
  })

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <Briefcase className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">JobPortal</span>
          </Link>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
            <CardDescription className="text-center">
              Choose your account type to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={role} onValueChange={(v) => form.setValue('role', v as 'jobseeker' | 'employer')} className="mb-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="jobseeker" className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Job Seeker
                </TabsTrigger>
                <TabsTrigger value="employer" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Employer
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <Form {...form}>
              <form onSubmit={onSubmit} className="space-y-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="Enter your full name" disabled={loading} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Enter your email" disabled={loading} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number *</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="Enter your phone number" disabled={loading} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {role === 'employer' ? (
                  <>
                    <Separator className="my-4" />
                    <p className="text-sm font-medium text-muted-foreground">Company Information</p>

                    <FormField
                      control={form.control}
                      name="companyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Name *</FormLabel>
                          <FormControl>
                            <Input type="text" placeholder="Enter your company name" disabled={loading} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="companyDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Description</FormLabel>
                          <FormControl>
                            <Input type="text" placeholder="Brief description of your company" disabled={loading} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="companyWebsite"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Website</FormLabel>
                          <FormControl>
                            <Input type="url" placeholder="https://example.com" disabled={loading} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="companySize"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company Size</FormLabel>
                            <Select value={field.value} onValueChange={field.onChange} disabled={loading}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select size" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="1-10">1-10</SelectItem>
                                <SelectItem value="11-50">11-50</SelectItem>
                                <SelectItem value="51-200">51-200</SelectItem>
                                <SelectItem value="201-500">201-500</SelectItem>
                                <SelectItem value="500+">500+</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="industry"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Industry</FormLabel>
                            <FormControl>
                              <Input type="text" placeholder="e.g. Technology" disabled={loading} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </>
                ) : (
                  <FormField
                    control={form.control}
                    name="experienceLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Experience Level</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange} disabled={loading}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your experience level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="STUDENT">Student / Currently Studying</SelectItem>
                            <SelectItem value="FRESHER">Fresher</SelectItem>
                            <SelectItem value="INTERNSHIP_ONLY">Internship Experience Only</SelectItem>
                            <SelectItem value="ZERO_TO_ONE_YEAR">0–1 Year</SelectItem>
                            <SelectItem value="ONE_TO_THREE_YEARS">1–3 Years</SelectItem>
                            <SelectItem value="THREE_TO_FIVE_YEARS">3–5 Years</SelectItem>
                            <SelectItem value="FIVE_PLUS_YEARS">5+ Years</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password *</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Create a password"
                            disabled={loading}
                            {...field}
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={loading}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">Must be at least 6 characters long</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password *</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Confirm your password" disabled={loading} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    role === 'employer' ? 'Create Employer Account' : 'Create Account'
                  )}
                </Button>
              </form>
            </Form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Already have an account?
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/auth/login">
                    Sign In
                  </Link>
                </Button>
              </div>
            </div>

            <div className="mt-6 text-center text-xs text-muted-foreground">
              By creating an account, you agree to our{' '}
              <Link href="/terms" className="hover:text-foreground transition-colors">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
