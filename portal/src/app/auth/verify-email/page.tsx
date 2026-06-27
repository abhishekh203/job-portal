'use client'

import { useEffect, useState, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, XCircle, Loader2, Mail, ArrowRight, PartyPopper, Sparkles, Lightbulb, Search } from 'lucide-react'
import { api } from '@/lib/api'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'
import { handleApiError } from '@/lib/error-handler'

// Force dynamic rendering for this page since it uses searchParams
export const dynamic = 'force-dynamic'

function VerifyEmailContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const hasVerifiedRef = useRef(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()

  useEffect(() => {
    const token = searchParams.get('token')

    if (!token) {
      setStatus('error')
      setMessage('Invalid verification link. Please check your email and try again.')
      return
    }

    const verifyEmail = async () => {
      // Prevent multiple verification attempts using ref
      if (hasVerifiedRef.current) return
      hasVerifiedRef.current = true

      try {
        const response = await api.verifyEmail(token)

        // Auto-login the user
        if (response.token) {
          login(response.token, response.user)
          toast.success('Email verified successfully! Welcome to DarbarJob!')
        }

        setStatus('success')
        setMessage(response.message)

        // Redirect to dashboard profile after 3 seconds
        setTimeout(() => {
          router.push('/dashboard/profile')
        }, 3000)

      } catch (error: any) {
        setStatus('error')
        setMessage(error.message || 'Failed to verify email. The link may be expired or invalid.')
        handleApiError(error, 'Email verification failed')
      }
    }

    verifyEmail()
  }, [searchParams, login, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-secondary/10 flex items-center justify-center p-4">
      {/* Background Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl float"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl float" style={{animationDelay: '2s'}}></div>

      <div className="w-full max-w-md relative">
        <Card className="glass border-0 p-8">
          <CardHeader className="text-center p-0 mb-8">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-lg gradient-primary shadow-lg">
              {status === 'loading' && <Loader2 className="h-10 w-10 text-primary-foreground animate-spin" />}
              {status === 'success' && <CheckCircle className="h-10 w-10 text-primary-foreground" />}
              {status === 'error' && <XCircle className="h-10 w-10 text-primary-foreground" />}
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              {status === 'loading' && 'Verifying Email...'}
              {status === 'success' && (
                <span className="flex items-center gap-2">
                  Email Verified! <PartyPopper className="h-6 w-6" />
                </span>
              )}
              {status === 'error' && 'Verification Failed'}
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0 text-center space-y-6">
            <p className="text-muted-foreground leading-relaxed">
              {message}
            </p>

            {status === 'success' && (
              <div className="space-y-4">
                <div className="p-4 bg-accent/10 rounded-2xl border border-accent/20">
                  <p className="text-sm text-accent font-semibold flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Redirecting you to your dashboard in 3 seconds...
                  </p>
                </div>
                <Button asChild className="w-full rounded-2xl font-bold gradient-primary hover:scale-105 transition-all duration-200">
                  <Link href="/dashboard/profile">
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-4">
                <div className="p-4 bg-destructive/10 rounded-2xl border border-destructive/20">
                  <p className="text-sm text-destructive font-semibold flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Need help? Contact our support team.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button variant="outline" asChild className="flex-1 rounded-2xl font-semibold">
                    <Link href="/auth/register">
                      <Mail className="mr-2 h-4 w-4" />
                      Resend Email
                    </Link>
                  </Button>
                  <Button asChild className="flex-1 rounded-2xl font-bold gradient-primary">
                    <Link href="/auth/login">
                      Try Login
                    </Link>
                  </Button>
                </div>
              </div>
            )}

            {status === 'loading' && (
              <div className="space-y-4">
                <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20">
                  <p className="text-sm text-primary font-semibold flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    Checking your verification token...
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground transition-colors font-medium"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-secondary/10 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}
