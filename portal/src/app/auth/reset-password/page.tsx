'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { resetPasswordSchema, type ResetPasswordValues } from '@/features/auth/schemas'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Lock, Eye, EyeOff, CheckCircle, Loader2, ArrowRight } from 'lucide-react'
import { api } from '@/lib/api'
import { useAuth } from '@/hooks/use-auth'
import { handleApiError } from '@/lib/error-handler'
import { toast } from 'sonner'

// Force dynamic rendering for this page since it uses searchParams
export const dynamic = 'force-dynamic'

function ResetPasswordContent() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [token, setToken] = useState<string | null>(null)

  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  useEffect(() => {
    const tokenParam = searchParams.get('token')
    if (!tokenParam) {
      toast.error('Invalid reset link')
      router.push('/auth/forgot-password')
      return
    }
    setToken(tokenParam)
  }, [searchParams, router])

  const onSubmit = form.handleSubmit(async (values) => {
    if (!token) {
      toast.error('Invalid reset token')
      return
    }

    try {
      const response = await api.resetPassword(token, values.password)

      // Auto-login the user
      if (response.token) {
        login(response.token, response.user)
        toast.success('Password reset successfully! Welcome back! 🎉')
      }

      setIsSuccess(true)

      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        router.push('/dashboard')
      }, 3000)
    } catch (error) {
      handleApiError(error, 'Failed to reset password')
    }
  })

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-secondary/10 flex items-center justify-center p-4">
        {/* Background Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl float" style={{animationDelay: '2s'}}></div>

        <div className="w-full max-w-md relative">
          <Card className="glass border-0 p-8">
            <CardHeader className="text-center p-0 mb-8">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-lg gradient-accent shadow-lg">
                <CheckCircle className="h-10 w-10 text-accent-foreground" />
              </div>
              <CardTitle className="text-2xl font-bold text-foreground">
                Password Reset! 🎉
              </CardTitle>
            </CardHeader>

            <CardContent className="p-0 text-center space-y-6">
              <p className="text-muted-foreground leading-relaxed">
                Your password has been successfully reset. You're now logged in and ready to explore opportunities!
              </p>

              <div className="p-4 bg-accent/10 rounded-2xl border border-accent/20">
                <p className="text-sm text-accent font-semibold">
                  ✨ Redirecting you to your dashboard in 3 seconds...
                </p>
              </div>

              <Button asChild className="w-full rounded-2xl font-bold gradient-primary hover:scale-105 transition-all duration-200">
                <Link href="/dashboard">
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-secondary/10 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-secondary/10 flex items-center justify-center p-4">
      {/* Background Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-destructive/10 rounded-full blur-3xl float"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl float" style={{animationDelay: '2s'}}></div>

      <div className="w-full max-w-md relative">
        <Card className="glass border-0 p-8">
          <CardHeader className="text-center p-0 mb-8">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-destructive to-cta glow-accent">
              <Lock className="h-10 w-10 text-white" />
            </div>
            <CardTitle className="text-2xl font-black text-foreground">
              Reset Password 🔐
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              Choose a strong password for your account
            </p>
          </CardHeader>

          <CardContent className="p-0">
            <Form {...form}>
              <form onSubmit={onSubmit} className="space-y-6">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-foreground">New Password</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter your new password"
                            className="rounded-2xl border-2 h-12 px-4 pr-12 font-medium"
                            {...field}
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">Must be at least 8 characters long</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-foreground">Confirm Password</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="Confirm your new password"
                            className="rounded-2xl border-2 h-12 px-4 pr-12 font-medium"
                            {...field}
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  className="w-full rounded-2xl font-bold h-12 bg-gradient-to-r from-destructive to-cta hover:scale-105 transition-all duration-200"
                >
                  {form.formState.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-5 w-5" />
                      Reset Password
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Link
            href="/auth/login"
            className="text-muted-foreground hover:text-foreground transition-colors font-medium"
          >
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-secondary/10 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}
