'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRequireAuth } from '@/hooks/use-auth'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import {
  Upload,
  FileText,
  Loader2,
  CheckCircle,
  PartyPopper,
  Globe,
  Linkedin,
  Github,
  Eye,
  User,
} from 'lucide-react'
import { api, type UserProfile, getExperienceLabel } from '@/lib/api'
import { handleApiError } from '@/lib/error-handler'
import { toast } from 'sonner'

const urlRegex = /^https?:\/\/.+/
const phoneRegex = /^\+?[\d\s()-]+$/

const profileSchema = z
  .object({
    firstName: z.string().trim().min(1, 'First name is required'),
    lastName: z.string().trim().min(1, 'Last name is required'),
    phone: z.string().optional(),
    bio: z.string().max(500, 'Bio must be under 500 chars').optional(),
    skills: z.array(z.string()),
    experience: z.string().optional(),
    education: z.string().optional(),
    location: z.string().max(100, 'Location must be under 100 chars').optional(),
    website: z.string().optional(),
    linkedin: z.string().optional(),
    github: z.string().optional(),
  })
  .superRefine((v, ctx) => {
    if (v.phone && v.phone.trim() && !phoneRegex.test(v.phone)) {
      ctx.addIssue({ code: 'custom', path: ['phone'], message: 'Please enter a valid phone number' })
    }
    if (v.website && v.website.trim() && !urlRegex.test(v.website)) {
      ctx.addIssue({ code: 'custom', path: ['website'], message: 'Please enter a valid URL (starting with http:// or https://)' })
    }
    if (v.linkedin && v.linkedin.trim() && !urlRegex.test(v.linkedin)) {
      ctx.addIssue({ code: 'custom', path: ['linkedin'], message: 'Please enter a valid LinkedIn URL' })
    }
    if (v.github && v.github.trim() && !urlRegex.test(v.github)) {
      ctx.addIssue({ code: 'custom', path: ['github'], message: 'Please enter a valid GitHub URL' })
    }
  })
type ProfileFormValues = z.infer<typeof profileSchema>

const profileFormDefaults: ProfileFormValues = {
  firstName: '',
  lastName: '',
  phone: '',
  bio: '',
  skills: [],
  experience: '',
  education: '',
  location: '',
  website: '',
  linkedin: '',
  github: '',
}

function ProfilePageContent() {
  const { user, loading, updateUserProfile } = useRequireAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const isWelcome = searchParams.get('welcome') === 'true'
  const queryClient = useQueryClient()

  const [skillInput, setSkillInput] = useState('')
  const profilePicRef = useRef<HTMLInputElement>(null)
  const resumeRef = useRef<HTMLInputElement>(null)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: profileFormDefaults,
  })

  // Employers manage their company profile elsewhere.
  useEffect(() => {
    if (!loading && user?.role === 'EMPLOYER') {
      router.replace('/dashboard/employer/company')
    }
  }, [user, loading, router])

  // Pre-fill once the authenticated user is available.
  useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        bio: user.bio || '',
        skills: user.skills || [],
        experience: user.experience || '',
        education: user.education || '',
        location: user.location || '',
        website: user.website || '',
        linkedin: user.linkedin || '',
        github: user.github || '',
      })
    }
  }, [user, form])

  const updateProfileMutation = useMutation({
    mutationFn: (data: Partial<UserProfile>) => api.updateProfile(data),
    onSuccess: (response) => {
      toast.success(response.message || 'Profile updated successfully!')
      updateUserProfile(response.user)
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
    onError: (error) => handleApiError(error, 'Failed to update profile'),
  })

  // Strip empty optional links before sending to the backend.
  const toUpdatePayload = (values: ProfileFormValues): Partial<UserProfile> => ({
    ...values,
    website: values.website?.trim() || undefined,
    linkedin: values.linkedin?.trim() || undefined,
    github: values.github?.trim() || undefined,
    phone: values.phone?.trim() || undefined,
  })

  const uploadFileMutation = useMutation({
    mutationFn: ({ file, type }: { file: File; type: 'resume' | 'profile-picture' }) =>
      api.uploadFile(file, type),
    onSuccess: (data, variables) => {
      // Persist the new file URL alongside the current (unsaved) form values.
      const payload = toUpdatePayload(form.getValues())
      if (variables.type === 'resume') {
        updateProfileMutation.mutate({ ...payload, resume: data.url })
      } else {
        updateProfileMutation.mutate({ ...payload, profilePicture: data.url })
      }
    },
    onError: (error) => handleApiError(error, 'Failed to upload file'),
  })

  const values = form.watch()
  const skills = values.skills || []

  const handleAddSkill = () => {
    const skill = skillInput.trim()
    if (skill && !skills.includes(skill)) {
      form.setValue('skills', [...skills, skill])
      setSkillInput('')
    }
  }

  const handleRemoveSkill = (skillToRemove: string) => {
    form.setValue('skills', skills.filter((s) => s !== skillToRemove))
  }

  const onSubmit = form.handleSubmit((vals) => {
    updateProfileMutation.mutate(toUpdatePayload(vals))
  })

  const triggerFileUpload = (type: 'resume' | 'profile-picture') => {
    if (type === 'resume') resumeRef.current?.click()
    else profilePicRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'resume' | 'profile-picture') => {
    const file = e.target.files?.[0]
    if (file) uploadFileMutation.mutate({ file, type })
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const completionItems: [string, string, boolean][] = [
    ['firstName', 'First Name', !!values.firstName],
    ['lastName', 'Last Name', !!values.lastName],
    ['bio', 'Bio', !!values.bio],
    ['skills', 'Skills', skills.length > 0],
    ['location', 'Location', !!values.location],
    ['resume', 'Resume', !!user.resume],
  ]
  const completedCount = completionItems.filter(([, , done]) => done).length
  const completionPct = Math.round((completedCount / completionItems.length) * 100)

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Profile</h2>
        <p className="text-muted-foreground mt-1">Manage your personal information, skills, and resume.</p>
      </div>

      {isWelcome && (
        <Card className="border border-border/60">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <PartyPopper className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-2">Welcome to DarbarJob!</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Complete your profile to unlock the full potential of our platform.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">Profile Completion</span>
                    <span className="text-primary font-semibold">{completionPct}%</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                      style={{ width: `${completionPct}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Sidebar */}
        <div className="space-y-6">
          {/* Avatar Card */}
          <Card className="border border-border/60">
            <CardContent className="p-6 text-center">
              <div className="relative inline-block mb-4">
                <Avatar className="w-24 h-24 ring-4 ring-primary/10">
                  <AvatarImage src={user.profilePicture} alt="" />
                  <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                    {user.email?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  className="absolute -bottom-1 -right-1 rounded-full w-9 h-9 p-0 gradient-primary shadow-md"
                  onClick={() => triggerFileUpload('profile-picture')}
                  disabled={uploadFileMutation.isPending}
                >
                  {uploadFileMutation.isPending
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <Upload className="h-4 w-4" />
                  }
                </Button>
              </div>
              <input ref={profilePicRef} type="file" accept="image/*" className="hidden" onChange={e => handleFileChange(e, 'profile-picture')} />

              <h3 className="font-semibold text-foreground">
                {values.firstName ? `${values.firstName} ${values.lastName || ''}` : 'Your Name'}
              </h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>

              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {user.experienceLevel && (
                  <Badge variant="secondary" className="rounded-lg text-xs">
                    {getExperienceLabel(user.experienceLevel)}
                  </Badge>
                )}
                <Badge
                  variant={user.profileCompleted ? 'default' : 'secondary'}
                  className={`rounded-lg text-xs ${user.profileCompleted ? 'bg-success/10 text-success' : ''}`}
                >
                  {user.profileCompleted ? 'Complete' : 'Incomplete'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Resume Card */}
          <Card className="border border-border/60">
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Resume
              </CardTitle>
            </CardHeader>
            <CardContent>
              {user.resume ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-success/5 border border-success/20 rounded-xl">
                    <CheckCircle className="h-5 w-5 text-success shrink-0" />
                    <span className="text-sm font-medium text-success">Resume uploaded</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild className="flex-1 rounded-lg text-xs h-9">
                      <a href={user.resume} target="_blank" rel="noopener noreferrer">
                        <Eye className="h-3 w-3 mr-1.5" /> View
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => triggerFileUpload('resume')} disabled={uploadFileMutation.isPending} className="flex-1 rounded-lg text-xs h-9">
                      {uploadFileMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1.5" /> : <Upload className="h-3 w-3 mr-1.5" />}
                      Update
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-4 bg-muted/30 rounded-xl text-center">
                    <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No resume uploaded</p>
                  </div>
                  <Button variant="outline" className="w-full rounded-xl h-10 text-sm" onClick={() => triggerFileUpload('resume')} disabled={uploadFileMutation.isPending}>
                    {uploadFileMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                    Upload Resume
                  </Button>
                </div>
              )}
              <input ref={resumeRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={e => handleFileChange(e, 'resume')} />
            </CardContent>
          </Card>

          {/* Completion Checklist */}
          <Card className="border border-border/60">
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                Completion Checklist
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {completionItems.map(([key, label, done]) => (
                <div key={key} className="flex items-center gap-3">
                  <div className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 ${done ? 'bg-success' : 'bg-muted'}`}>
                    {done ? <CheckCircle className="h-3 w-3 text-success-foreground" /> : <div className="h-2 w-2 rounded-full bg-muted-foreground/40" />}
                  </div>
                  <span className={`text-sm ${done ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>{label}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Social Links Display */}
          {(values.website || values.linkedin || values.github) && (
            <Card className="border border-border/60">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Social Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {values.website && (
                  <a href={values.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors text-sm text-muted-foreground">
                    <Globe className="h-4 w-4" /> Website
                  </a>
                )}
                {values.linkedin && (
                  <a href={values.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors text-sm text-muted-foreground">
                    <Linkedin className="h-4 w-4" /> LinkedIn
                  </a>
                )}
                {values.github && (
                  <a href={values.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors text-sm text-muted-foreground">
                    <Github className="h-4 w-4" /> GitHub
                  </a>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card className="border border-border/60">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={onSubmit} className="space-y-8">
                  <div className="space-y-5">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Basic Information</h3>
                    <div className="grid sm:grid-cols-2 gap-5">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="John" className="h-11 rounded-xl" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Doe" className="h-11 rounded-xl" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="+1 (555) 123-4567" className="h-11 rounded-xl" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-5">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">About You</h3>
                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bio *</FormLabel>
                          <FormControl>
                            <Textarea rows={4} placeholder="Tell us about yourself..." className="rounded-xl resize-none" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location *</FormLabel>
                          <FormControl>
                            <Input placeholder="City, Country" className="h-11 rounded-xl" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-5">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Skills *</h3>
                    <div>
                      <div className="flex gap-2 mb-3">
                        <Input
                          value={skillInput}
                          onChange={e => setSkillInput(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                          placeholder="Type a skill and press Enter"
                          className="h-11 rounded-xl"
                        />
                        <Button type="button" onClick={handleAddSkill} className="rounded-xl h-11 px-5 gradient-primary">Add</Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {skills.map(skill => (
                          <Badge key={skill} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground font-medium text-sm">
                            {skill}
                            <button type="button" onClick={() => handleRemoveSkill(skill)} className="hover:text-destructive transition-colors text-muted-foreground">&times;</button>
                          </Badge>
                        ))}
                      </div>
                      {skills.length === 0 && (
                        <p className="text-xs text-muted-foreground mt-2">Add skills like &ldquo;JavaScript&rdquo;, &ldquo;Project Management&rdquo;, etc.</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-5">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Experience & Education</h3>
                    <FormField
                      control={form.control}
                      name="experience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Work Experience</FormLabel>
                          <FormControl>
                            <Textarea rows={4} placeholder="Describe your work experience..." className="rounded-xl resize-none" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="education"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Education</FormLabel>
                          <FormControl>
                            <Textarea rows={3} placeholder="Your educational background..." className="rounded-xl resize-none" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-5">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Social Links</h3>
                    <p className="text-xs text-muted-foreground -mt-3">Optional — won&rsquo;t affect profile completion.</p>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="website"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Website</FormLabel>
                            <FormControl>
                              <Input placeholder="https://" className="h-11 rounded-xl" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="linkedin"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>LinkedIn</FormLabel>
                            <FormControl>
                              <Input placeholder="https://linkedin.com/" className="h-11 rounded-xl" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="github"
                        render={({ field }) => (
                          <FormItem className="sm:col-span-2">
                            <FormLabel>GitHub</FormLabel>
                            <FormControl>
                              <Input placeholder="https://github.com/" className="h-11 rounded-xl" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full h-12 rounded-xl gradient-primary shadow-md hover:shadow-lg transition-all" disabled={updateProfileMutation.isPending}>
                    {updateProfileMutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : <>Save Changes</>}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <ProfilePageContent />
    </Suspense>
  )
}
