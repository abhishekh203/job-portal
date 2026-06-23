'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { api } from '@/lib/api'
import { useUpdateEmployerProfile } from '@/features/employer/queries'
import { handleApiError } from '@/lib/error-handler'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Loader2, Building2, Upload, Globe, Users, Tag, Save } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/use-auth'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const COMPANY_SIZES = [
  { value: '1-10', label: '1-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-500', label: '201-500 employees' },
  { value: '501-1000', label: '501-1000 employees' },
  { value: '1000+', label: '1000+ employees' },
]

const companyFormSchema = z.object({
  companyName: z.string().trim().min(1, 'Company name is required'),
  industry: z.string().optional(),
  companyDescription: z.string().optional(),
  companySize: z.string().optional(),
  companyWebsite: z.string().optional(),
})
type CompanyFormValues = z.infer<typeof companyFormSchema>

const emptyCompanyForm: CompanyFormValues = {
  companyName: '',
  industry: '',
  companyDescription: '',
  companySize: '',
  companyWebsite: '',
}

export default function CompanyProfilePage() {
  const { user, updateUserProfile } = useAuth()
  const [uploadingLogo, setUploadingLogo] = useState(false)

  const updateProfile = useUpdateEmployerProfile()
  const isPending = updateProfile.isPending

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: emptyCompanyForm,
  })

  // Profile lives in the auth context; pre-fill the form once the user is available.
  useEffect(() => {
    if (user) {
      form.reset({
        companyName: user.companyName || '',
        companyDescription: user.companyDescription || '',
        companyWebsite: user.companyWebsite || '',
        companySize: user.companySize || '',
        industry: user.industry || '',
      })
    }
  }, [user, form])

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingLogo(true)
    try {
      const result = await api.uploadCompanyLogo(file)
      await api.updateEmployerProfile({ companyLogo: result.url })
      updateUserProfile({ companyLogo: result.url })
      toast.success('Company logo updated')
    } catch (error) {
      handleApiError(error, 'Failed to upload logo')
    } finally {
      setUploadingLogo(false)
    }
  }

  const onSubmit = form.handleSubmit((values) => {
    updateProfile.mutate(
      {
        companyName: values.companyName,
        companyDescription: values.companyDescription || undefined,
        companyWebsite: values.companyWebsite || undefined,
        companySize: values.companySize || undefined,
        industry: values.industry || undefined,
      },
      {
        onSuccess: (data) => {
          updateUserProfile(data.user)
          toast.success('Company profile updated')
        },
        onError: (error) => handleApiError(error, 'Failed to update profile'),
      }
    )
  })

  const companyName = form.watch('companyName')
  const initials = companyName
    ? companyName.charAt(0).toUpperCase()
    : user?.email?.charAt(0).toUpperCase() || 'C'

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Company Profile</h2>
        <p className="text-muted-foreground mt-1">Manage your company information and branding</p>
      </div>

      {/* Logo Section */}
      <Card className="border border-border/60">
        <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <Avatar className="h-20 w-20 rounded-2xl shrink-0">
            <AvatarImage src={user?.companyLogo} alt={companyName} />
            <AvatarFallback className="rounded-2xl bg-primary/10 text-primary text-2xl font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-semibold text-foreground">Company Logo</p>
            <p className="text-sm text-muted-foreground mt-0.5">Recommended: 400x400px. PNG or JPG.</p>
            <div className="mt-3">
              <Label htmlFor="logo-upload" className="cursor-pointer">
                <Button variant="outline" type="button" disabled={uploadingLogo} asChild className="rounded-xl">
                  <span>
                    {uploadingLogo ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    Upload Logo
                  </span>
                </Button>
              </Label>
              <input
                id="logo-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoUpload}
                disabled={uploadingLogo}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Company Info Form */}
      <Form {...form}>
        <form onSubmit={onSubmit}>
          <Card className="border border-border/60">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                Company Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name *</FormLabel>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                        <FormControl>
                          <Input disabled={isPending} className="pl-9 rounded-xl" {...field} />
                        </FormControl>
                      </div>
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
                      <div className="relative">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                        <FormControl>
                          <Input placeholder="e.g. Technology, Healthcare" disabled={isPending} className="pl-9 rounded-xl" {...field} />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="companyDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell applicants about your company culture, mission, and what makes you unique..."
                        rows={4}
                        disabled={isPending}
                        className="rounded-xl"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid sm:grid-cols-2 gap-5">
                <FormField
                  control={form.control}
                  name="companySize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Size</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange} disabled={isPending}>
                        <FormControl>
                          <SelectTrigger className="rounded-xl">
                            <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                            <SelectValue placeholder="Select size" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {COMPANY_SIZES.map((size) => (
                            <SelectItem key={size.value} value={size.value}>{size.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                        <FormControl>
                          <Input placeholder="https://example.com" disabled={isPending} className="pl-9 rounded-xl" {...field} />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button type="submit" disabled={isPending} className="rounded-xl px-8">
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  )
}
