'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useRequireAuth } from '@/hooks/use-auth'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

import {
  Mail,
  Phone,
  MapPin,
  Upload,
  FileText,
  Loader2,
  CheckCircle,
  AlertCircle,
  PartyPopper,
  TrendingUp,
  Sparkles,
  MessageSquare,
  PenTool,
  Lightbulb,
  Rocket,
  Briefcase,
  GraduationCap,
  Globe,
  Linkedin,
  Github,
  Eye,
  User
} from 'lucide-react'
import { api, UserProfile, getExperienceLabel } from '@/lib/api'
import { toast } from 'sonner'

export default function ProfilePage() {
  function ProfilePageContent() {
  const { user, loading, updateUserProfile } = useRequireAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const isWelcome = searchParams.get('welcome') === 'true'
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!loading && user?.role === 'EMPLOYER') {
      router.replace('/dashboard/employer/company')
    }
  }, [user, loading, router])



  const [formData, setFormData] = useState<Partial<UserProfile>>({
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
  })
  const [skillInput, setSkillInput] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const profilePicRef = useRef<HTMLInputElement>(null)
  const resumeRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (user) {
      setFormData({
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
  }, [user])

  const updateProfileMutation = useMutation({
    mutationFn: (data: Partial<UserProfile>) => api.updateProfile(data),
    onSuccess: (response) => {
      toast.success(response.message || 'Profile updated successfully!')
      // Update the user in Zustand store instead of making API call
      updateUserProfile(response.user)
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update profile')
    }
  })

  const uploadFileMutation = useMutation({
    mutationFn: ({ file, type }: { file: File; type: 'resume' | 'profile-picture' }) =>
      api.uploadFile(file, type),
    onSuccess: (data, variables) => {
      // Preserve current form data and only update the specific file field
      const updateData = {
        ...formData,
        website: formData.website?.trim() || undefined,
        linkedin: formData.linkedin?.trim() || undefined,
        github: formData.github?.trim() || undefined,
        phone: formData.phone?.trim() || undefined,
      }

      if (variables.type === 'resume') {
        updateProfileMutation.mutate({ ...updateData, resume: data.url })
      } else {
        updateProfileMutation.mutate({ ...updateData, profilePicture: data.url })
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to upload file')
    }
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleAddSkill = () => {
    const skill = skillInput.trim()
    if (skill && !(formData.skills || []).includes(skill)) {
      setFormData(prev => ({
        ...prev,
        skills: [...(prev.skills || []), skill]
      }))
      setSkillInput('')
    }
  }

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills?.filter(s => s !== skillToRemove) || []
    }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName?.trim()) newErrors.firstName = 'First name is required'
    if (!formData.lastName?.trim()) newErrors.lastName = 'Last name is required'
    if (formData.bio && formData.bio.length > 500) newErrors.bio = 'Bio must be under 500 chars'
    if (formData.location && formData.location.length > 100) newErrors.location = 'Location must be under 100 chars'

    // Phone validation (optional)
    if (formData.phone && formData.phone.trim() && !/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number'
    }

    // URL validation for social links (optional)
    const urlRegex = /^https?:\/\/.+/
    if (formData.website && formData.website.trim() && !urlRegex.test(formData.website)) {
      newErrors.website = 'Please enter a valid URL (starting with http:// or https://)'
    }
    if (formData.linkedin && formData.linkedin.trim() && !urlRegex.test(formData.linkedin)) {
      newErrors.linkedin = 'Please enter a valid LinkedIn URL'
    }
    if (formData.github && formData.github.trim() && !urlRegex.test(formData.github)) {
      newErrors.github = 'Please enter a valid GitHub URL'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      // Filter out empty social links before sending to backend
      const cleanedData = {
        ...formData,
        website: formData.website?.trim() || undefined,
        linkedin: formData.linkedin?.trim() || undefined,
        github: formData.github?.trim() || undefined,
        phone: formData.phone?.trim() || undefined,
      }
      updateProfileMutation.mutate(cleanedData)
    }
  }

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

  const completionItems = [
    ['firstName', 'First Name', !!formData.firstName],
    ['lastName', 'Last Name', !!formData.lastName],
    ['bio', 'Bio', !!formData.bio],
    ['skills', 'Skills', (formData.skills || []).length > 0],
    ['location', 'Location', !!formData.location],
    ['resume', 'Resume', !!user.resume]
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
                <h3 className="font-semibold text-foreground mb-2">Welcome to NayaJagir!</h3>
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
                {formData.firstName ? `${formData.firstName} ${formData.lastName || ''}` : 'Your Name'}
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
                <div key={String(key)} className="flex items-center gap-3">
                  <div className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 ${done ? 'bg-success' : 'bg-muted'}`}>
                    {done ? <CheckCircle className="h-3 w-3 text-success-foreground" /> : <div className="h-2 w-2 rounded-full bg-muted-foreground/40" />}
                  </div>
                  <span className={`text-sm ${done ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>{label}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Social Links Display */}
          {(formData.website || formData.linkedin || formData.github) && (
            <Card className="border border-border/60">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Social Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {formData.website && (
                  <a href={formData.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors text-sm text-muted-foreground">
                    <Globe className="h-4 w-4" /> Website
                  </a>
                )}
                {formData.linkedin && (
                  <a href={formData.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors text-sm text-muted-foreground">
                    <Linkedin className="h-4 w-4" /> LinkedIn
                  </a>
                )}
                {formData.github && (
                  <a href={formData.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors text-sm text-muted-foreground">
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
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-5">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Basic Information</h3>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <Label htmlFor="firstName" className="text-sm font-medium text-foreground mb-1.5 block">First Name *</Label>
                      <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="John" className={`h-11 rounded-xl ${errors.firstName ? 'border-destructive' : ''}`} />
                      {errors.firstName && <p className="text-xs text-destructive mt-1.5">{errors.firstName}</p>}
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-sm font-medium text-foreground mb-1.5 block">Last Name *</Label>
                      <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Doe" className={`h-11 rounded-xl ${errors.lastName ? 'border-destructive' : ''}`} />
                      {errors.lastName && <p className="text-xs text-destructive mt-1.5">{errors.lastName}</p>}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-sm font-medium text-foreground mb-1.5 block">Phone (Optional)</Label>
                    <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+1 (555) 123-4567" className={`h-11 rounded-xl ${errors.phone ? 'border-destructive' : ''}`} />
                    {errors.phone && <p className="text-xs text-destructive mt-1.5">{errors.phone}</p>}
                  </div>
                </div>

                <div className="space-y-5">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">About You</h3>
                  <div>
                    <Label htmlFor="bio" className="text-sm font-medium text-foreground mb-1.5 block">Bio *</Label>
                    <Textarea id="bio" name="bio" value={formData.bio} onChange={handleInputChange} rows={4} placeholder="Tell us about yourself..." className={`rounded-xl resize-none ${errors.bio ? 'border-destructive' : ''}`} />
                    {errors.bio && <p className="text-xs text-destructive mt-1.5">{errors.bio}</p>}
                  </div>
                  <div>
                    <Label htmlFor="location" className="text-sm font-medium text-foreground mb-1.5 block">Location *</Label>
                    <Input id="location" name="location" value={formData.location} onChange={handleInputChange} placeholder="City, Country" className={`h-11 rounded-xl ${errors.location ? 'border-destructive' : ''}`} />
                    {errors.location && <p className="text-xs text-destructive mt-1.5">{errors.location}</p>}
                  </div>
                </div>

                <div className="space-y-5">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Skills *</h3>
                  <div>
                    <div className="flex gap-2 mb-3">
                      <Input value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())} placeholder="Type a skill and press Enter" className="h-11 rounded-xl" />
                      <Button type="button" onClick={handleAddSkill} className="rounded-xl h-11 px-5 gradient-primary">Add</Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.skills?.map(skill => (
                        <Badge key={skill} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground font-medium text-sm">
                          {skill}
                          <button type="button" onClick={() => handleRemoveSkill(skill)} className="hover:text-destructive transition-colors text-muted-foreground">&times;</button>
                        </Badge>
                      ))}
                    </div>
                    {(!formData.skills || formData.skills.length === 0) && (
                      <p className="text-xs text-muted-foreground mt-2">Add skills like &ldquo;JavaScript&rdquo;, &ldquo;Project Management&rdquo;, etc.</p>
                    )}
                  </div>
                </div>

                <div className="space-y-5">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Experience & Education</h3>
                  <div>
                    <Label htmlFor="experience" className="text-sm font-medium text-foreground mb-1.5 block">Work Experience</Label>
                    <Textarea id="experience" name="experience" value={formData.experience} onChange={handleInputChange} rows={4} placeholder="Describe your work experience..." className="rounded-xl resize-none" />
                  </div>
                  <div>
                    <Label htmlFor="education" className="text-sm font-medium text-foreground mb-1.5 block">Education</Label>
                    <Textarea id="education" name="education" value={formData.education} onChange={handleInputChange} rows={3} placeholder="Your educational background..." className="rounded-xl resize-none" />
                  </div>
                </div>

                <div className="space-y-5">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Social Links</h3>
                  <p className="text-xs text-muted-foreground -mt-3">Optional — won&rsquo;t affect profile completion.</p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="website" className="text-sm font-medium text-foreground mb-1.5 block">Website</Label>
                      <Input id="website" name="website" value={formData.website} onChange={handleInputChange} placeholder="https://" className={`h-11 rounded-xl ${errors.website ? 'border-destructive' : ''}`} />
                      {errors.website && <p className="text-xs text-destructive mt-1.5">{errors.website}</p>}
                    </div>
                    <div>
                      <Label htmlFor="linkedin" className="text-sm font-medium text-foreground mb-1.5 block">LinkedIn</Label>
                      <Input id="linkedin" name="linkedin" value={formData.linkedin} onChange={handleInputChange} placeholder="https://linkedin.com/" className={`h-11 rounded-xl ${errors.linkedin ? 'border-destructive' : ''}`} />
                      {errors.linkedin && <p className="text-xs text-destructive mt-1.5">{errors.linkedin}</p>}
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="github" className="text-sm font-medium text-foreground mb-1.5 block">GitHub</Label>
                      <Input id="github" name="github" value={formData.github} onChange={handleInputChange} placeholder="https://github.com/" className={`h-11 rounded-xl ${errors.github ? 'border-destructive' : ''}`} />
                      {errors.github && <p className="text-xs text-destructive mt-1.5">{errors.github}</p>}
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full h-12 rounded-xl gradient-primary shadow-md hover:shadow-lg transition-all" disabled={updateProfileMutation.isPending}>
                  {updateProfileMutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : <>Save Changes</>}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
  }

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <ProfilePageContent />
    </Suspense>
  )
}
