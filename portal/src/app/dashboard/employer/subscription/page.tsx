'use client'

import { useQuery } from '@tanstack/react-query'
import { employerPlansQuery, employerSubscriptionQuery, useSubscribeToPlan } from '@/features/employer/queries'
import { handleApiError } from '@/lib/error-handler'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Check, Lock, Sparkles, Star, Zap, Shield } from 'lucide-react'
import { toast } from 'sonner'

export default function EmployerSubscriptionPage() {
  const plansQuery = useQuery(employerPlansQuery())
  const subQuery = useQuery(employerSubscriptionQuery())

  const plans = plansQuery.data ?? []
  const subscription = subQuery.data

  const subscribe = useSubscribeToPlan()

  const handleSubscribe = (planId: string) => {
    subscribe.mutate(planId, {
      onSuccess: (result) => toast.success(result.message),
      onError: (error) => handleApiError(error, 'Failed to subscribe'),
    })
  }

  if (plansQuery.isLoading || subQuery.isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (plansQuery.isError || subQuery.isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-muted-foreground">Failed to load subscription data. Please try again.</p>
      </div>
    )
  }

  const currentSub = subscription?.subscription
  const currentPlanId = currentSub?.planId

  const planIcons = [Zap, Star, Shield]

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Subscription Plans</h2>
        <p className="text-muted-foreground mt-1">Choose a plan that fits your hiring needs</p>
      </div>

      {/* Current Plan Banner */}
      {currentSub && (
        <Card className="border-primary/30 bg-primary/[0.03]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Current Plan
              <Badge
                variant={currentSub.status === 'ACTIVE' ? 'default' : 'secondary'}
                className="ml-2 rounded-lg text-xs"
              >
                {currentSub.status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Plan</p>
                <p className="text-sm font-semibold text-foreground">{currentSub.plan?.name || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Jobs Used</p>
                <p className="text-sm font-semibold text-foreground">
                  {currentSub.usage?.jobsUsed ?? '—'}
                  <span className="text-muted-foreground font-normal"> / {currentSub.usage?.jobLimit ?? '∞'}</span>
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Featured Used</p>
                <p className="text-sm font-semibold text-foreground">
                  {currentSub.usage?.featuredUsed ?? '—'}
                  <span className="text-muted-foreground font-normal"> / {currentSub.usage?.featuredJobLimit ?? '∞'}</span>
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Period End</p>
                <p className="text-sm font-semibold text-foreground">
                  {currentSub.currentPeriodEnd ? new Date(currentSub.currentPeriodEnd).toLocaleDateString() : '—'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plans Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {plans.length === 0 ? (
          <p className="text-muted-foreground col-span-3 text-center py-16">
            No subscription plans are available at the moment.
          </p>
        ) : (
          plans.map((plan, index) => {
            const isCurrentPlan = currentPlanId === plan.id
            const isSubscribed = currentSub && currentSub.status === 'ACTIVE'
            const PlanIcon = planIcons[index] || Star

            return (
              <Card
                key={plan.id}
                className={`relative flex flex-col border-2 transition-all ${
                  isCurrentPlan
                    ? 'border-primary shadow-lg shadow-primary/10'
                    : 'border-border/60 hover:border-border'
                }`}
              >
                {isCurrentPlan && (
                  <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full px-4">
                    Current Plan
                  </Badge>
                )}

                <CardHeader className="pb-4">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
                    <PlanIcon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-3">
                    <span className="text-3xl font-bold text-foreground">
                      NPR {plan.price?.toLocaleString()}
                    </span>
                    <span className="text-sm text-muted-foreground ml-1">
                      /{plan.duration === 'YEARLY' ? 'year' : 'month'}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3 text-sm">
                      <Check className="h-4 w-4 text-success mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">
                        {plan.jobLimit != null ? `Up to ${plan.jobLimit} active jobs` : 'Unlimited active jobs'}
                      </span>
                    </li>
                    <li className="flex items-start gap-3 text-sm">
                      <Check className="h-4 w-4 text-success mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">
                        {plan.featuredJobLimit != null ? `Up to ${plan.featuredJobLimit} featured jobs` : 'Unlimited featured jobs'}
                      </span>
                    </li>
                    {plan.features?.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm">
                        <Check className="h-4 w-4 text-success mt-0.5 shrink-0" />
                        <span className="text-muted-foreground">
                          {feature.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  <Button
                    className="w-full rounded-xl"
                    variant={isCurrentPlan ? 'outline' : 'default'}
                    disabled={isCurrentPlan || !!isSubscribed || (subscribe.isPending && subscribe.variables === plan.id)}
                    onClick={() => handleSubscribe(plan.id)}
                  >
                    {subscribe.isPending && subscribe.variables === plan.id ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Processing...
                      </>
                    ) : isCurrentPlan ? (
                      'Current Plan'
                    ) : isSubscribed ? (
                      <>
                        <Lock className="h-4 w-4 mr-2" />
                        Already Subscribed
                      </>
                    ) : (
                      'Subscribe'
                    )}
                  </Button>
                </CardFooter>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
