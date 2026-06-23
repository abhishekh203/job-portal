import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { nanoid } from 'nanoid'

const db = new PrismaClient()

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

function uniqueSlug(text: string): string {
  return `${generateSlug(text)}-${nanoid(8)}`
}

async function main() {
  console.log('🌱 Seeding database...\n')

  // Clean existing data in dependency order
  console.log('Clearing existing data...')
  await db.cVUnlock.deleteMany()
  await db.sponsoredCompany.deleteMany()
  await db.employerSubscription.deleteMany()
  await db.subscriptionPlan.deleteMany()
  await db.applicationStatusHistory.deleteMany()
  await db.application.deleteMany()
  await db.blog.deleteMany()
  await db.auditLog.deleteMany()
  await db.job.deleteMany()
  await db.user.deleteMany()
  console.log('  ✓ All tables cleared\n')

  const password = await bcrypt.hash('password123', 12)

  // ── 1. Users ──────────────────────────────────────────────────────
  console.log('Creating users...')

  const admin = await db.user.create({
    data: {
      email: 'admin@jobportal.com',
      password,
      role: 'ADMIN',
      firstName: 'Admin',
      lastName: 'User',
      emailVerified: true,
      isActive: true,
      profileCompleted: true,
    },
  })
  console.log(`  ✓ Admin: ${admin.email}`)

  const users = await Promise.all([
    db.user.create({
      data: {
        email: 'ram.sharma@example.com',
        password,
        role: 'USER',
        firstName: 'Ram', lastName: 'Sharma',
        phone: '9800000001',
        bio: 'Full-stack developer with 3+ years of experience in React and Node.js',
        skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'PostgreSQL'],
        experience: '3+ years as a full-stack developer at various startups',
        education: 'B.E. in Computer Engineering, Pulchowk Campus',
        location: 'Kathmandu, Nepal',
        website: 'https://ramsharma.com.np',
        linkedin: 'https://linkedin.com/in/ram-sharma',
        github: 'https://github.com/ramsharma',
        emailVerified: true,
        isActive: true,
        profileCompleted: true,
      },
    }),
    db.user.create({
      data: {
        email: 'sita.poudel@example.com',
        password,
        role: 'USER',
        firstName: 'Sita', lastName: 'Poudel',
        phone: '9800000002',
        bio: 'Frontend developer passionate about UI/UX and accessible design',
        skills: ['React', 'Vue.js', 'Tailwind CSS', 'Figma', 'TypeScript'],
        experience: '2 years as frontend developer',
        education: 'B.Sc. in Computer Science, TU',
        location: 'Pokhara, Nepal',
        linkedin: 'https://linkedin.com/in/sita-poudel',
        emailVerified: true,
        isActive: true,
        profileCompleted: true,
      },
    }),
    db.user.create({
      data: {
        email: 'gopal.thapa@example.com',
        password,
        role: 'USER',
        firstName: 'Gopal', lastName: 'Thapa',
        phone: '9800000003',
        bio: 'Backend developer specializing in microservices and cloud infrastructure',
        skills: ['Python', 'Django', 'AWS', 'Docker', 'PostgreSQL', 'Redis'],
        experience: '5+ years in backend development',
        education: 'M.Sc. in Information Technology',
        location: 'Lalitpur, Nepal',
        emailVerified: true,
        isActive: true,
        profileCompleted: true,
      },
    }),
    db.user.create({
      data: {
        email: 'anjali.gurung@example.com',
        password,
        role: 'USER',
        firstName: 'Anjali', lastName: 'Gurung',
        phone: '9800000004',
        bio: 'DevOps engineer with expertise in CI/CD and cloud-native technologies',
        skills: ['Kubernetes', 'Docker', 'Terraform', 'AWS', 'GitHub Actions', 'Linux'],
        experience: '4 years in DevOps',
        education: 'B.E. in Computer Engineering',
        location: 'Kathmandu, Nepal',
        linkedin: 'https://linkedin.com/in/anjali-gurung',
        emailVerified: true,
        isActive: true,
        profileCompleted: true,
      },
    }),
    db.user.create({
      data: {
        email: 'bibek.rai@example.com',
        password,
        role: 'USER',
        firstName: 'Bibek', lastName: 'Rai',
        bio: 'Fresh graduate passionate about software development',
        skills: ['JavaScript', 'React', 'Java', 'Spring Boot'],
        experience: 'Intern at local tech company',
        education: 'B.E. in Computer Engineering, Kathmandu University',
        location: 'Bhaktapur, Nepal',
        emailVerified: true,
        isActive: true,
        profileCompleted: false,
      },
    }),
  ])
  console.log(`  ✓ ${users.length} regular users created`)

  const employerData = [
    {
      email: 'hr@techvortex.com',
      companyName: 'TechVortex Nepal',
      companyDescription: 'Leading software development company based in Kathmandu, specializing in web and mobile applications for global clients.',
      companySize: '50-100',
      industry: 'Information Technology',
      companyWebsite: 'https://techvortex.com.np',
      location: 'Kathmandu, Nepal',
    },
    {
      email: 'careers@cloudnepal.com',
      companyName: 'Cloud Nepal Solutions',
      companyDescription: 'Cloud consulting and infrastructure management company helping businesses migrate to the cloud.',
      companySize: '20-50',
      industry: 'Cloud Computing',
      companyWebsite: 'https://cloudnepal.com',
      location: 'Lalitpur, Nepal',
    },
    {
      email: 'jobs@innovate.com.np',
      companyName: 'Innovate Tech',
      companyDescription: 'Product-based startup building AI-powered tools for the education sector.',
      companySize: '10-20',
      industry: 'EdTech',
      companyWebsite: 'https://innovate.com.np',
      location: 'Pokhara, Nepal',
    },
    {
      email: 'careers@digitalcraft.io',
      companyName: 'Digital Craft Studios',
      companyDescription: 'Creative digital agency specializing in branding, web design, and marketing solutions.',
      companySize: '30-50',
      industry: 'Digital Marketing',
      companyWebsite: 'https://digitalcraft.io',
      location: 'Kathmandu, Nepal',
    },
    {
      email: 'jobs@datanex.ai',
      companyName: 'DataNex AI',
      companyDescription: 'AI and machine learning solutions for enterprise data analytics and automation.',
      companySize: '50-100',
      industry: 'Artificial Intelligence',
      companyWebsite: 'https://datanex.ai',
      location: 'Lalitpur, Nepal',
    },
    {
      email: 'hr@fintrust.finance',
      companyName: 'FinTrust Finance',
      companyDescription: 'Fintech company providing digital payment solutions and financial services across Nepal.',
      companySize: '100-200',
      industry: 'Financial Technology',
      companyWebsite: 'https://fintrust.finance',
      location: 'Kathmandu, Nepal',
    },
    {
      email: 'careers@healthplus.health',
      companyName: 'HealthPlus Healthcare',
      companyDescription: 'Healthcare technology platform connecting patients with medical professionals and services.',
      companySize: '20-50',
      industry: 'Healthcare Technology',
      companyWebsite: 'https://healthplus.health',
      location: 'Biratnagar, Nepal',
    },
    {
      email: 'jobs@ecogrow.org',
      companyName: 'EcoGrow Sustainability',
      companyDescription: 'Sustainable technology solutions for agriculture and environmental monitoring.',
      companySize: '10-20',
      industry: 'Clean Technology',
      companyWebsite: 'https://ecogrow.org',
      location: 'Chitwan, Nepal',
    },
    {
      email: 'hr@gamestrike.games',
      companyName: 'GameStrike Studios',
      companyDescription: 'Game development studio creating immersive mobile and PC gaming experiences.',
      companySize: '25-50',
      industry: 'Gaming',
      companyWebsite: 'https://gamestrike.games',
      location: 'Pokhara, Nepal',
    },
    {
      email: 'careers@logimax.logistics',
      companyName: 'LogiMax Logistics',
      companyDescription: 'Smart logistics and supply chain management solutions using IoT and tracking technology.',
      companySize: '200-500',
      industry: 'Logistics',
      companyWebsite: 'https://logimax.logistics',
      location: 'Birgunj, Nepal',
    },
  ]

  const employers = await Promise.all(
    employerData.map((e, i) =>
      db.user.create({
        data: {
          email: e.email,
          password,
          role: 'EMPLOYER',
          firstName: `Employer_${i + 1}`,
          lastName: 'Team',
          companyName: e.companyName,
          companySlug: uniqueSlug(e.companyName),
          companyDescription: e.companyDescription,
          companySize: e.companySize,
          industry: e.industry,
          companyWebsite: e.companyWebsite,
          location: e.location,
          emailVerified: true,
          isActive: true,
          profileCompleted: true,
        },
      })
    )
  )
  console.log(`  ✓ ${employers.length} employers created`)

  // ── 2. Subscription Plans ─────────────────────────────────────────
  console.log('\nCreating subscription plans...')

  const plans = await Promise.all([
    db.subscriptionPlan.create({
      data: {
        name: 'Free',
        slug: 'free',
        description: 'Get started with basic job posting',
        price: 0,
        duration: 'MONTHLY',
        features: ['basic_support'],
        jobLimit: 2,
        featuredJobLimit: 0,
        sortOrder: 0,
        isActive: true,
      },
    }),
    db.subscriptionPlan.create({
      data: {
        name: 'Professional',
        slug: 'professional',
        description: 'For growing companies',
        price: 2999,
        duration: 'MONTHLY',
        features: ['priority_support', 'analytics', 'cv_access'],
        jobLimit: 10,
        featuredJobLimit: 3,
        sortOrder: 1,
        isActive: true,
      },
    }),
    db.subscriptionPlan.create({
      data: {
        name: 'Enterprise',
        slug: 'enterprise',
        description: 'For large organizations',
        price: 9999,
        duration: 'MONTHLY',
        features: ['priority_support', 'analytics', 'cv_access', 'api_access', 'dedicated_manager'],
        jobLimit: null,
        featuredJobLimit: null,
        sortOrder: 2,
        isActive: true,
      },
    }),
    db.subscriptionPlan.create({
      data: {
        name: 'Professional Yearly',
        slug: 'professional-yearly',
        description: 'Professional plan billed annually (2 months free)',
        price: 29990,
        duration: 'YEARLY',
        features: ['priority_support', 'analytics', 'cv_access'],
        jobLimit: 10,
        featuredJobLimit: 3,
        sortOrder: 3,
        isActive: true,
      },
    }),
  ])
  console.log(`  ✓ ${plans.length} subscription plans created`)

  // ── 3. Employer Subscriptions ─────────────────────────────────────
  console.log('Creating employer subscriptions...')

  const now = new Date()
  const monthEnd = new Date(now); monthEnd.setMonth(monthEnd.getMonth() + 1)
  const yearEnd = new Date(now); yearEnd.setFullYear(yearEnd.getFullYear() + 1)

  await Promise.all([
    db.employerSubscription.create({
      data: {
        employerId: employers[0].id,
        planId: plans[1].id, // Professional
        status: 'ACTIVE',
        currentPeriodStart: now,
        currentPeriodEnd: monthEnd,
        autoRenew: true,
      },
    }),
    db.employerSubscription.create({
      data: {
        employerId: employers[1].id,
        planId: plans[2].id, // Enterprise
        status: 'ACTIVE',
        currentPeriodStart: now,
        currentPeriodEnd: yearEnd,
        autoRenew: true,
      },
    }),
    db.employerSubscription.create({
      data: {
        employerId: employers[2].id,
        planId: plans[0].id, // Free
        status: 'PENDING',
        currentPeriodStart: now,
        currentPeriodEnd: monthEnd,
        autoRenew: true,
      },
    }),
    db.employerSubscription.create({
      data: {
        employerId: employers[3].id,
        planId: plans[1].id, // Professional
        status: 'ACTIVE',
        currentPeriodStart: now,
        currentPeriodEnd: monthEnd,
        autoRenew: true,
      },
    }),
    db.employerSubscription.create({
      data: {
        employerId: employers[4].id,
        planId: plans[2].id, // Enterprise
        status: 'ACTIVE',
        currentPeriodStart: now,
        currentPeriodEnd: yearEnd,
        autoRenew: true,
      },
    }),
    db.employerSubscription.create({
      data: {
        employerId: employers[5].id,
        planId: plans[1].id, // Professional
        status: 'ACTIVE',
        currentPeriodStart: now,
        currentPeriodEnd: monthEnd,
        autoRenew: true,
      },
    }),
    db.employerSubscription.create({
      data: {
        employerId: employers[6].id,
        planId: plans[0].id, // Free
        status: 'ACTIVE',
        currentPeriodStart: now,
        currentPeriodEnd: monthEnd,
        autoRenew: false,
      },
    }),
    db.employerSubscription.create({
      data: {
        employerId: employers[7].id,
        planId: plans[1].id, // Professional
        status: 'ACTIVE',
        currentPeriodStart: now,
        currentPeriodEnd: monthEnd,
        autoRenew: true,
      },
    }),
    db.employerSubscription.create({
      data: {
        employerId: employers[8].id,
        planId: plans[2].id, // Enterprise
        status: 'ACTIVE',
        currentPeriodStart: now,
        currentPeriodEnd: yearEnd,
        autoRenew: true,
      },
    }),
    db.employerSubscription.create({
      data: {
        employerId: employers[9].id,
        planId: plans[0].id, // Free
        status: 'PENDING',
        currentPeriodStart: now,
        currentPeriodEnd: monthEnd,
        autoRenew: false,
      },
    }),
  ])
  console.log('  ✓ 10 employer subscriptions created')

  // ── 4. Sponsored Companies ────────────────────────────────────────
  console.log('Creating sponsored companies...')

  const sponsorEnd = new Date(); sponsorEnd.setDate(sponsorEnd.getDate() + 60)
  await db.sponsoredCompany.create({
    data: {
      employerId: employers[0].id,
      startDate: now,
      endDate: sponsorEnd,
      isActive: true,
      sortOrder: 0,
    },
  })
  console.log('  ✓ 1 sponsored company created')

  // ── 5. Jobs ───────────────────────────────────────────────────────
  console.log('\nCreating jobs...')

  const categories = ['Engineering', 'Design', 'Marketing', 'Sales', 'Finance', 'Human Resources', 'Operations', 'Data Science', 'Product', 'Quality Assurance']
  const jobTypes = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP'] as const
  const workLocationTypes = ['ONSITE', 'REMOTE', 'HYBRID'] as const
  const experienceLevels = ['STUDENT', 'FRESHER', 'INTERNSHIP_ONLY', 'ZERO_TO_ONE_YEAR', 'ONE_TO_THREE_YEARS', 'THREE_TO_FIVE_YEARS', 'FIVE_PLUS_YEARS'] as const
  const statuses = ['PENDING', 'APPROVED', 'REJECTED', 'RESUBMITTED'] as const

  const companyJobTemplates = [
    // TechVortex Nepal - Engineering focused
    {
      company: 'TechVortex Nepal',
      companySlug: employers[0].companySlug,
      location: 'Kathmandu, Nepal',
      jobs: [
        { title: 'Senior React Developer', category: 'Engineering', jobType: 'FULL_TIME', workLocationType: 'HYBRID', experienceLevel: 'THREE_PLUS_YEARS', salaryMin: 80000, salaryMax: 150000, isFeatured: true },
        { title: 'Frontend Engineer', category: 'Engineering', jobType: 'FULL_TIME', workLocationType: 'ONSITE', experienceLevel: 'ONE_TO_THREE_YEARS', salaryMin: 50000, salaryMax: 80000, isFeatured: false },
        { title: 'Mobile App Developer', category: 'Engineering', jobType: 'FULL_TIME', workLocationType: 'HYBRID', experienceLevel: 'ONE_TO_THREE_YEARS', salaryMin: 60000, salaryMax: 100000, isFeatured: false },
        { title: 'QA Automation Engineer', category: 'Quality Assurance', jobType: 'FULL_TIME', workLocationType: 'REMOTE', experienceLevel: 'FIVE_PLUS_YEARS', salaryMin: 90000, salaryMax: 130000, isFeatured: false },
        { title: 'Intern - QA Testing', category: 'Quality Assurance', jobType: 'INTERNSHIP', workLocationType: 'ONSITE', experienceLevel: 'STUDENT', salaryMin: 10000, salaryMax: 15000, isFeatured: false },
        { title: 'React Native Developer', category: 'Engineering', jobType: 'FULL_TIME', workLocationType: 'HYBRID', experienceLevel: 'ONE_TO_THREE_YEARS', salaryMin: 55000, salaryMax: 90000, isFeatured: false },
      ]
    },
    // Cloud Nepal Solutions - DevOps/Cloud focused
    {
      company: 'Cloud Nepal Solutions',
      companySlug: employers[1].companySlug,
      location: 'Lalitpur, Nepal',
      jobs: [
        { title: 'DevOps Engineer', category: 'Engineering', jobType: 'FULL_TIME', workLocationType: 'REMOTE', experienceLevel: 'THREE_PLUS_YEARS', salaryMin: 100000, salaryMax: 200000, isFeatured: true },
        { title: 'Cloud Architect', category: 'Engineering', jobType: 'FULL_TIME', workLocationType: 'HYBRID', experienceLevel: 'FIVE_PLUS_YEARS', salaryMin: 150000, salaryMax: 250000, isFeatured: false },
        { title: 'Site Reliability Engineer', category: 'Engineering', jobType: 'FULL_TIME', workLocationType: 'REMOTE', experienceLevel: 'THREE_TO_FIVE_YEARS', salaryMin: 120000, salaryMax: 180000, isFeatured: false },
        { title: 'AWS Solutions Engineer', category: 'Engineering', jobType: 'FULL_TIME', workLocationType: 'ONSITE', experienceLevel: 'ONE_TO_THREE_YEARS', salaryMin: 70000, salaryMax: 120000, isFeatured: false },
        { title: 'Intern - Cloud Support', category: 'Engineering', jobType: 'INTERNSHIP', workLocationType: 'ONSITE', experienceLevel: 'STUDENT', salaryMin: 8000, salaryMax: 12000, isFeatured: false },
        { title: 'Infrastructure Engineer', category: 'Operations', jobType: 'FULL_TIME', workLocationType: 'HYBRID', experienceLevel: 'THREE_PLUS_YEARS', salaryMin: 90000, salaryMax: 140000, isFeatured: false },
      ]
    },
    // Innovate Tech - EdTech/Product focused
    {
      company: 'Innovate Tech',
      companySlug: employers[2].companySlug,
      location: 'Pokhara, Nepal',
      jobs: [
        { title: 'Product Designer', category: 'Design', jobType: 'FULL_TIME', workLocationType: 'ONSITE', experienceLevel: 'ONE_TO_THREE_YEARS', salaryMin: 60000, salaryMax: 100000, isFeatured: false },
        { title: 'Junior Frontend Developer', category: 'Engineering', jobType: 'FULL_TIME', workLocationType: 'ONSITE', experienceLevel: 'FRESHER', salaryMin: 25000, salaryMax: 40000, isFeatured: false },
        { title: 'Product Manager', category: 'Product', jobType: 'FULL_TIME', workLocationType: 'HYBRID', experienceLevel: 'THREE_PLUS_YEARS', salaryMin: 100000, salaryMax: 160000, isFeatured: false },
        { title: 'UI/UX Designer', category: 'Design', jobType: 'FULL_TIME', workLocationType: 'ONSITE', experienceLevel: 'ONE_TO_THREE_YEARS', salaryMin: 40000, salaryMax: 70000, isFeatured: false },
        { title: 'Data Analyst', category: 'Data Science', jobType: 'FULL_TIME', workLocationType: 'REMOTE', experienceLevel: 'ONE_TO_THREE_YEARS', salaryMin: 50000, salaryMax: 80000, isFeatured: false },
        { title: 'Customer Success Manager', category: 'Sales', jobType: 'FULL_TIME', workLocationType: 'ONSITE', experienceLevel: 'ONE_TO_THREE_YEARS', salaryMin: 45000, salaryMax: 70000, isFeatured: false },
      ]
    },
    // Digital Craft Studios - Digital Marketing/Design
    {
      company: 'Digital Craft Studios',
      companySlug: employers[3].companySlug,
      location: 'Kathmandu, Nepal',
      jobs: [
        { title: 'Senior UI/UX Designer', category: 'Design', jobType: 'FULL_TIME', workLocationType: 'ONSITE', experienceLevel: 'THREE_PLUS_YEARS', salaryMin: 70000, salaryMax: 120000, isFeatured: true },
        { title: 'Graphic Designer', category: 'Design', jobType: 'FULL_TIME', workLocationType: 'ONSITE', experienceLevel: 'ONE_TO_THREE_YEARS', salaryMin: 40000, salaryMax: 60000, isFeatured: false },
        { title: 'Digital Marketing Specialist', category: 'Marketing', jobType: 'FULL_TIME', workLocationType: 'REMOTE', experienceLevel: 'ONE_TO_THREE_YEARS', salaryMin: 50000, salaryMax: 80000, isFeatured: false },
        { title: 'Content Strategist', category: 'Marketing', jobType: 'FULL_TIME', workLocationType: 'HYBRID', experienceLevel: 'ONE_TO_THREE_YEARS', salaryMin: 45000, salaryMax: 70000, isFeatured: false },
        { title: 'Intern - Design', category: 'Design', jobType: 'INTERNSHIP', workLocationType: 'ONSITE', experienceLevel: 'STUDENT', salaryMin: 10000, salaryMax: 15000, isFeatured: false },
        { title: 'Motion Graphics Designer', category: 'Design', jobType: 'FULL_TIME', workLocationType: 'ONSITE', experienceLevel: 'ONE_TO_THREE_YEARS', salaryMin: 48000, salaryMax: 75000, isFeatured: false },
      ]
    },
    // DataNex AI - AI/Data Science
    {
      company: 'DataNex AI',
      companySlug: employers[4].companySlug,
      location: 'Lalitpur, Nepal',
      jobs: [
        { title: 'Machine Learning Engineer', category: 'Data Science', jobType: 'FULL_TIME', workLocationType: 'HYBRID', experienceLevel: 'THREE_PLUS_YEARS', salaryMin: 120000, salaryMax: 180000, isFeatured: true },
        { title: 'Data Scientist', category: 'Data Science', jobType: 'FULL_TIME', workLocationType: 'REMOTE', experienceLevel: 'THREE_TO_FIVE_YEARS', salaryMin: 100000, salaryMax: 160000, isFeatured: false },
        { title: 'AI Research Scientist', category: 'Data Science', jobType: 'FULL_TIME', workLocationType: 'ONSITE', experienceLevel: 'FIVE_PLUS_YEARS', salaryMin: 150000, salaryMax: 220000, isFeatured: false },
        { title: 'Data Engineer', category: 'Data Science', jobType: 'FULL_TIME', workLocationType: 'HYBRID', experienceLevel: 'ONE_TO_THREE_YEARS', salaryMin: 80000, salaryMax: 120000, isFeatured: false },
        { title: 'Business Intelligence Analyst', category: 'Data Science', jobType: 'FULL_TIME', workLocationType: 'ONSITE', experienceLevel: 'ONE_TO_THREE_YEARS', salaryMin: 60000, salaryMax: 90000, isFeatured: false },
        { title: 'Intern - Data Science', category: 'Data Science', jobType: 'INTERNSHIP', workLocationType: 'ONSITE', experienceLevel: 'STUDENT', salaryMin: 12000, salaryMax: 18000, isFeatured: false },
      ]
    },
    // FinTrust Finance - Fintech
    {
      company: 'FinTrust Finance',
      companySlug: employers[5].companySlug,
      location: 'Kathmandu, Nepal',
      jobs: [
        { title: 'Senior Backend Developer', category: 'Engineering', jobType: 'FULL_TIME', workLocationType: 'HYBRID', experienceLevel: 'THREE_PLUS_YEARS', salaryMin: 90000, salaryMax: 140000, isFeatured: true },
        { title: 'Financial Software Engineer', category: 'Engineering', jobType: 'FULL_TIME', workLocationType: 'ONSITE', experienceLevel: 'ONE_TO_THREE_YEARS', salaryMin: 70000, salaryMax: 110000, isFeatured: false },
        { title: 'Risk Analyst', category: 'Finance', jobType: 'FULL_TIME', workLocationType: 'ONSITE', experienceLevel: 'THREE_PLUS_YEARS', salaryMin: 80000, salaryMax: 120000, isFeatured: false },
        { title: 'Compliance Specialist', category: 'Finance', jobType: 'FULL_TIME', workLocationType: 'ONSITE', experienceLevel: 'ONE_TO_THREE_YEARS', salaryMin: 55000, salaryMax: 85000, isFeatured: false },
        { title: 'Business Analyst', category: 'Product', jobType: 'FULL_TIME', workLocationType: 'HYBRID', experienceLevel: 'ONE_TO_THREE_YEARS', salaryMin: 60000, salaryMax: 90000, isFeatured: false },
        { title: 'Intern - Financial Technology', category: 'Finance', jobType: 'INTERNSHIP', workLocationType: 'ONSITE', experienceLevel: 'STUDENT', salaryMin: 10000, salaryMax: 15000, isFeatured: false },
      ]
    },
    // HealthPlus Healthcare - HealthTech
    {
      company: 'HealthPlus Healthcare',
      companySlug: employers[6].companySlug,
      location: 'Biratnagar, Nepal',
      jobs: [
        { title: 'HealthTech Product Manager', category: 'Product', jobType: 'FULL_TIME', workLocationType: 'ONSITE', experienceLevel: 'THREE_PLUS_YEARS', salaryMin: 90000, salaryMax: 140000, isFeatured: true },
        { title: 'Full Stack Developer', category: 'Engineering', jobType: 'FULL_TIME', workLocationType: 'HYBRID', experienceLevel: 'ONE_TO_THREE_YEARS', salaryMin: 60000, salaryMax: 95000, isFeatured: false },
        { title: 'Mobile Developer (Flutter)', category: 'Engineering', jobType: 'FULL_TIME', workLocationType: 'REMOTE', experienceLevel: 'ONE_TO_THREE_YEARS', salaryMin: 55000, salaryMax: 90000, isFeatured: false },
        { title: 'Clinical Data Analyst', category: 'Data Science', jobType: 'FULL_TIME', workLocationType: 'ONSITE', experienceLevel: 'THREE_PLUS_YEARS', salaryMin: 70000, salaryMax: 110000, isFeatured: false },
        { title: 'Digital Marketing Coordinator', category: 'Marketing', jobType: 'FULL_TIME', workLocationType: 'REMOTE', experienceLevel: 'FRESHER', salaryMin: 30000, salaryMax: 45000, isFeatured: false },
        { title: 'Intern - Software Development', category: 'Engineering', jobType: 'INTERNSHIP', workLocationType: 'ONSITE', experienceLevel: 'STUDENT', salaryMin: 8000, salaryMax: 12000, isFeatured: false },
      ]
    },
    // EcoGrow Sustainability - CleanTech
    {
      company: 'EcoGrow Sustainability',
      companySlug: employers[7].companySlug,
      location: 'Chitwan, Nepal',
      jobs: [
        { title: 'IoT Software Engineer', category: 'Engineering', jobType: 'FULL_TIME', workLocationType: 'ONSITE', experienceLevel: 'ONE_TO_THREE_YEARS', salaryMin: 60000, salaryMax: 95000, isFeatured: true },
        { title: 'Environmental Data Scientist', category: 'Data Science', jobType: 'FULL_TIME', workLocationType: 'HYBRID', experienceLevel: 'THREE_PLUS_YEARS', salaryMin: 70000, salaryMax: 110000, isFeatured: false },
        { title: 'Field Operations Coordinator', category: 'Operations', jobType: 'FULL_TIME', workLocationType: 'ONSITE', experienceLevel: 'ONE_TO_THREE_YEARS', salaryMin: 40000, salaryMax: 65000, isFeatured: false },
        { title: 'GIS Specialist', category: 'Data Science', jobType: 'FULL_TIME', workLocationType: 'ONSITE', experienceLevel: 'ONE_TO_THREE_YEARS', salaryMin: 55000, salaryMax: 85000, isFeatured: false },
        { title: 'Supply Chain Analyst', category: 'Operations', jobType: 'FULL_TIME', workLocationType: 'REMOTE', experienceLevel: 'ONE_TO_THREE_YEARS', salaryMin: 50000, salaryMax: 75000, isFeatured: false },
        { title: 'Intern - Sustainability Tech', category: 'Engineering', jobType: 'INTERNSHIP', workLocationType: 'ONSITE', experienceLevel: 'STUDENT', salaryMin: 8000, salaryMax: 12000, isFeatured: false },
      ]
    },
    // GameStrike Studios - Gaming
    {
      company: 'GameStrike Studios',
      companySlug: employers[8].companySlug,
      location: 'Pokhara, Nepal',
      jobs: [
        { title: 'Game Developer (Unity)', category: 'Engineering', jobType: 'FULL_TIME', workLocationType: 'ONSITE', experienceLevel: 'ONE_TO_THREE_YEARS', salaryMin: 65000, salaryMax: 100000, isFeatured: true },
        { title: '3D Artist', category: 'Design', jobType: 'FULL_TIME', workLocationType: 'ONSITE', experienceLevel: 'ONE_TO_THREE_YEARS', salaryMin: 50000, salaryMax: 80000, isFeatured: false },
        { title: 'Game Designer', category: 'Design', jobType: 'FULL_TIME', workLocationType: 'ONSITE', experienceLevel: 'THREE_PLUS_YEARS', salaryMin: 70000, salaryMax: 110000, isFeatured: false },
        { title: 'Technical Artist', category: 'Engineering', jobType: 'FULL_TIME', workLocationType: 'HYBRID', experienceLevel: 'ONE_TO_THREE_YEARS', salaryMin: 60000, salaryMax: 90000, isFeatured: false },
        { title: 'Level Designer', category: 'Design', jobType: 'FULL_TIME', workLocationType: 'ONSITE', experienceLevel: 'ONE_TO_THREE_YEARS', salaryMin: 45000, salaryMax: 70000, isFeatured: false },
        { title: 'Intern - Game Development', category: 'Engineering', jobType: 'INTERNSHIP', workLocationType: 'ONSITE', experienceLevel: 'STUDENT', salaryMin: 10000, salaryMax: 15000, isFeatured: false },
      ]
    },
    // LogiMax Logistics - Logistics
    {
      company: 'LogiMax Logistics',
      companySlug: employers[9].companySlug,
      location: 'Birgunj, Nepal',
      jobs: [
        { title: 'Logistics Software Engineer', category: 'Engineering', jobType: 'FULL_TIME', workLocationType: 'ONSITE', experienceLevel: 'THREE_PLUS_YEARS', salaryMin: 70000, salaryMax: 110000, isFeatured: true },
        { title: 'Operations Manager', category: 'Operations', jobType: 'FULL_TIME', workLocationType: 'ONSITE', experienceLevel: 'THREE_PLUS_YEARS', salaryMin: 60000, salaryMax: 90000, isFeatured: false },
        { title: 'Fleet Management Analyst', category: 'Data Science', jobType: 'FULL_TIME', workLocationType: 'ONSITE', experienceLevel: 'ONE_TO_THREE_YEARS', salaryMin: 45000, salaryMax: 70000, isFeatured: false },
        { title: 'Supply Chain Software Developer', category: 'Engineering', jobType: 'FULL_TIME', workLocationType: 'HYBRID', experienceLevel: 'ONE_TO_THREE_YEARS', salaryMin: 55000, salaryMax: 85000, isFeatured: false },
        { title: 'Customer Service Representative', category: 'Sales', jobType: 'FULL_TIME', workLocationType: 'ONSITE', experienceLevel: 'FRESHER', salaryMin: 25000, salaryMax: 35000, isFeatured: false },
        { title: 'Intern - Logistics Tech', category: 'Engineering', jobType: 'INTERNSHIP', workLocationType: 'ONSITE', experienceLevel: 'STUDENT', salaryMin: 8000, salaryMax: 12000, isFeatured: false },
      ]
    },
  ]

  const generateJobDescription = (title: string, category: string) => {
    const descriptions: Record<string, string> = {
      Engineering: `<p>We are seeking a talented ${title} to join our engineering team. You will work on innovative solutions and collaborate with cross-functional teams.</p><p>Join us to build impactful products used by thousands of users.</p>`,
      Design: `<p>We are looking for a creative ${title} to create exceptional user experiences and visual designs for our products.</p><p>Be part of our design team that crafts intuitive and beautiful interfaces.</p>`,
      'Data Science': `<p>We need a skilled ${title} to analyze data and derive actionable insights for our business decisions.</p><p>Work with cutting-edge tools and technologies in a data-driven environment.</p>`,
      Marketing: `<p>Join our marketing team as a ${title} to drive growth and brand awareness through innovative campaigns.</p><p>Help us reach new customers and expand our market presence.</p>`,
      Sales: `<p>We are hiring a motivated ${title} to drive sales and build relationships with our clients.</p><p>Competitive compensation and growth opportunities available.</p>`,
      Product: `<p>We seek an experienced ${title} to lead product development and strategy initiatives.</p><p>Work closely with engineering, design, and stakeholders to deliver exceptional products.</p>`,
      Finance: `<p>We are looking for a detail-oriented ${title} to manage financial operations and analysis.</p><p>Join our finance team in supporting business growth and compliance.</p>`,
      Operations: `<p>We need an efficient ${title} to optimize processes and ensure smooth operations.</p><p>Be part of our operations team that keeps everything running smoothly.</p>`,
      'Quality Assurance': `<p>We are seeking a thorough ${title} to ensure quality standards across our products.</p><p>Test, automate, and improve our software quality assurance processes.</p>`,
    }
    return descriptions[category] || `<p>Exciting opportunity for ${title} at our growing company.</p>`
  }

  const generateRequirements = (title: string, experienceLevel: string) => {
    const reqs: string[] = []
    if (experienceLevel === 'FIVE_PLUS_YEARS' || experienceLevel === 'THREE_TO_FIVE_YEARS' || experienceLevel === 'THREE_PLUS_YEARS') {
      reqs.push('5+ years of relevant experience', 'Strong problem-solving skills', 'Leadership experience')
    } else if (experienceLevel === 'ONE_TO_THREE_YEARS') {
      reqs.push('2+ years of relevant experience', 'Good understanding of fundamentals', 'Willingness to learn')
    } else if (experienceLevel === 'ZERO_TO_ONE_YEAR' || experienceLevel === 'FRESHER') {
      reqs.push('Fresh graduate or entry level', 'Eagerness to learn', 'Good communication skills')
    } else if (experienceLevel === 'STUDENT' || experienceLevel === 'INTERNSHIP_ONLY') {
      reqs.push('Currently pursuing degree', 'Basic knowledge in field', 'Internship availability for 3+ months')
    }
    reqs.push('Bachelor degree in related field')
    return reqs
  }

  const generateResponsibilities = (title: string) => {
    return [
      `Design and implement solutions for ${title.toLowerCase()} role`,
      'Collaborate with cross-functional teams',
      'Write clean, maintainable code',
      'Participate in code reviews',
    ]
  }

  const jobData: any[] = []

  companyJobTemplates.forEach((company, companyIdx) => {
    const employerId = employers[companyIdx].id
    const companySlug = employers[companyIdx].companySlug

    company.jobs.forEach((job, idx) => {
      const deadlineDays = (idx + 1) * 10
      let status = 'APPROVED' as const
      let isApproved = true
      let isActive = true
      let rejectionReason = undefined
      let isFeatured = job.isFeatured

      // Vary status for some jobs
      if (idx % 7 === 5) {
        status = 'PENDING'
        isApproved = false
      } else if (idx % 7 === 6) {
        status = 'REJECTED'
        isApproved = false
        rejectionReason = 'Job description needs more details. Please revise and resubmit for approval.'
      } else if (idx % 7 === 4 && companyIdx > 0) {
        status = 'RESUBMITTED'
        isApproved = false
      }

      jobData.push({
        title: job.title,
        description: generateJobDescription(job.title, job.category),
        requirements: generateRequirements(job.title, job.experienceLevel),
        responsibilities: generateResponsibilities(job.title),
        category: job.category,
        location: company.location,
        jobType: job.jobType as any,
        workLocationType: job.workLocationType as any,
        experienceLevel: job.experienceLevel as any,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        currency: 'NPR',
        companyName: company.company,
        companySlug: companySlug,
        postedById: employerId,
        isActive: isActive,
        isFeatured: isFeatured,
        featuredAt: isFeatured ? new Date() : undefined,
        status: status,
        isApproved: isApproved,
        source: 'EMPLOYER' as const,
        applicationDeadline: new Date(Date.now() + deadlineDays * 24 * 60 * 60 * 1000),
        rejectionReason: rejectionReason,
      })
    })
  })

  const jobs = await Promise.all(
    jobData.map((j) =>
      db.job.create({
        data: {
          ...j,
          slug: uniqueSlug(j.title),
          description: j.description,
          requirements: j.requirements,
          responsibilities: j.responsibilities,
        },
      })
    )
  )
  console.log(`  ✓ ${jobs.length} jobs created`)

  // ── 6. Applications ────────────────────────────────────────────────
  console.log('\nCreating applications...')

  const applicationStatuses = ['PENDING', 'REVIEWED', 'SHORTLISTED', 'ACCEPTED', 'REJECTED', 'HIRED'] as const

  const applications = await Promise.all([
    db.application.create({
      data: {
        userId: users[0].id,
        jobId: jobs[0].id,
        message: 'I am very excited about this role. I have 3+ years of React experience and have built several large-scale applications.',
        status: 'SHORTLISTED',
      },
    }),
    db.application.create({
      data: {
        userId: users[1].id,
        jobId: jobs[0].id,
        message: 'I love React and have been using it since 2021. I would love to join your team.',
        status: 'REVIEWED',
      },
    }),
    db.application.create({
      data: {
        userId: users[0].id,
        jobId: jobs[1].id,
        message: 'I have experience with AWS and Docker. Looking forward to contributing to your infrastructure team.',
        status: 'PENDING',
      },
    }),
    db.application.create({
      data: {
        userId: users[2].id,
        jobId: jobs[1].id,
        message: 'As a backend developer with DevOps experience, I believe I would be a great fit for this role.',
        status: 'HIRED',
      },
    }),
    db.application.create({
      data: {
        userId: users[3].id,
        jobId: jobs[1].id,
        message: 'I am a DevOps engineer with 4 years of experience. Your job description matches my skills perfectly.',
        status: 'ACCEPTED',
      },
    }),
    db.application.create({
      data: {
        userId: users[1].id,
        jobId: jobs[2].id,
        message: 'I am passionate about design and have experience creating user-friendly interfaces.',
        status: 'PENDING',
      },
    }),
    db.application.create({
      data: {
        userId: users[4].id,
        jobId: jobs[3].id,
        message: 'As a fresh graduate, I am eager to learn and grow with your company.',
        status: 'REJECTED',
      },
    }),
    db.application.create({
      data: {
        userId: users[2].id,
        jobId: jobs[4].id,
        message: 'I have been working with Node.js for 3 years and would love to join TechVortex.',
        status: 'REVIEWED',
      },
    }),
    db.application.create({
      data: {
        userId: users[3].id,
        jobId: jobs[4].id,
        message: 'Backend development is my passion. I have experience building scalable APIs.',
        status: 'PENDING',
      },
    }),
  ])
  console.log(`  ✓ ${applications.length} applications created`)

  // ── 7. Application Status History ────────────────────────────────
  console.log('Creating application status history entries...')

  const historyEntries = applications.map((app) => {
    const isNotPending = app.status !== 'PENDING'
    return {
      applicationId: app.id,
      oldStatus: 'PENDING' as const,
      newStatus: app.status,
      changedBy: isNotPending ? admin.id : null,
      changedAt: new Date(app.appliedAt.getTime() + 3600000), // 1 hour after apply
    }
  })

  await db.applicationStatusHistory.createMany({ data: historyEntries })
  console.log(`  ✓ ${historyEntries.length} status history entries created`)

  // ── 8. Blogs ──────────────────────────────────────────────────────
  console.log('\nCreating blogs...')

  const blogs = await Promise.all([
    db.blog.create({
      data: {
        title: 'How to Ace Your Next JavaScript Interview',
        slug: uniqueSlug('JavaScript Interview Tips'),
        content: `<article>
<p>Preparing for a JavaScript interview can be overwhelming. Here are some tips to help you succeed.</p>
<h2>1. Master the Basics</h2>
<p>Make sure you understand closures, promises, async/await, and the event loop. These are frequently tested topics.</p>
<h2>2. Practice Data Structures</h2>
<p>Arrays, objects, maps, and sets are essential. Practice common algorithms like sorting, searching, and tree traversal.</p>
<h2>3. Build Projects</h2>
<p>Nothing beats hands-on experience. Build a small project using React or Node.js to showcase your skills.</p>
<h2>4. Understand the Ecosystem</h2>
<p>Familiarize yourself with npm, webpack/vite, and testing frameworks like Jest.</p>
</article>`,
        excerpt: 'Essential tips and strategies to help you prepare for and succeed in JavaScript technical interviews.',
        featuredImage: null,
        metaTitle: 'JavaScript Interview Tips - NayaJagir',
        metaDescription: 'Learn how to ace your JavaScript interview with these essential tips covering closures, promises, data structures, and more.',
        metaKeywords: ['JavaScript', 'interview', 'tips', 'coding', 'job search'],
        isPublished: true,
        publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    }),
    db.blog.create({
      data: {
        title: 'Top 10 Remote Work Tools for 2026',
        slug: uniqueSlug('Remote Work Tools 2026'),
        content: `<article>
<p>Remote work is here to stay. Here are the top tools that modern teams are using in 2026.</p>
<h2>1. Slack</h2>
<p>Real-time messaging and collaboration for teams of all sizes.</p>
<h2>2. Notion</h2>
<p>All-in-one workspace for docs, wikis, and project management.</p>
<h2>3. Zoom</h2>
<p>Video conferencing with breakout rooms and recording capabilities.</p>
<h2>4. Linear</h2>
<p>Issue tracking and project management designed for speed.</p>
<h2>5. Miro</h2>
<p>Digital whiteboard for brainstorming and visual collaboration.</p>
</article>`,
        excerpt: 'Discover the essential tools that are powering remote teams in 2026, from communication to project management.',
        featuredImage: null,
        metaTitle: 'Top 10 Remote Work Tools 2026 - NayaJagir',
        metaDescription: 'Explore the best remote work tools for 2026 including Slack, Notion, Zoom, Linear, and Miro.',
        metaKeywords: ['remote work', 'tools', 'productivity', 'collaboration', 'work from home'],
        isPublished: true,
        publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
    }),
    db.blog.create({
      data: {
        title: 'Building a Career in DevOps: A Beginner\'s Guide',
        slug: uniqueSlug('DevOps Career Guide'),
        content: `<article>
<p>DevOps is one of the fastest-growing fields in tech. Here's how to get started.</p>
<h2>What is DevOps?</h2>
<p>DevOps is a set of practices that combines software development and IT operations to shorten the development lifecycle.</p>
<h2>Key Skills to Learn</h2>
<ul><li>Linux fundamentals</li><li>Scripting (Bash, Python)</li><li>Containerization (Docker)</li><li>Orchestration (Kubernetes)</li><li>CI/CD pipelines</li><li>Cloud platforms (AWS, GCP, Azure)</li><li>Infrastructure as Code (Terraform)</li></ul>
<h2>Certifications</h2>
<p>AWS Certified DevOps Engineer, Certified Kubernetes Administrator (CKA), and HashiCorp Terraform Associate are highly valued.</p>
</article>`,
        excerpt: 'A comprehensive beginner\'s guide to building a career in DevOps, covering essential skills, certifications, and career paths.',
        featuredImage: null,
        metaTitle: 'DevOps Career Guide - NayaJagir',
        metaDescription: 'Learn how to start a career in DevOps with this comprehensive guide covering key skills, tools, and certifications.',
        metaKeywords: ['DevOps', 'career', 'guide', 'beginner', 'cloud', 'kubernetes'],
        isPublished: true,
        publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    }),
    db.blog.create({
      data: {
        title: 'The Future of AI in Recruitment',
        slug: uniqueSlug('AI in Recruitment'),
        content: `<article>
<p>Artificial intelligence is transforming how companies hire. Explore the trends shaping recruitment in 2026.</p>
<h2>AI-Powered Screening</h2>
<p>Automated resume screening and candidate matching using NLP and machine learning.</p>
<h2>Predictive Analytics</h2>
<p>Data-driven insights to predict candidate success and retention rates.</p>
<h2>Chatbots for Recruitment</h2>
<p>24/7 candidate engagement, scheduling, and FAQs handled by AI chatbots.</p>
<h2>Bias Reduction</h2>
<p>AI can help reduce unconscious bias in the hiring process when implemented carefully.</p>
</article>`,
        excerpt: 'Explore how artificial intelligence is revolutionizing recruitment in 2026, from automated screening to predictive analytics.',
        featuredImage: null,
        metaTitle: 'Future of AI in Recruitment - NayaJagir',
        metaDescription: 'Discover how AI is transforming recruitment in 2026 with automated screening, predictive analytics, and chatbots.',
        metaKeywords: ['AI', 'recruitment', 'hiring', 'technology', 'future'],
        isPublished: false,
        publishedAt: null,
      },
    }),
  ])
  console.log(`  ✓ ${blogs.length} blogs created`)

  // ── 9. Audit Logs ─────────────────────────────────────────────────
  console.log('Creating audit log entries...')

  const auditActions = [
    { actorId: admin.id, action: 'ADMIN_LOGIN', entity: 'Auth', entityId: admin.id, metadata: { email: admin.email } },
    ...jobs.slice(0, 10).map((job: any, idx: number) => ({
      actorId: idx < 4 ? admin.id : employers[Math.floor(idx / 6)].id,
      action: idx < 4 ? 'JOB_CREATED' : 'EMPLOYER_JOB_CREATED',
      entity: 'Job',
      entityId: job.id,
      metadata: { title: job.title, source: job.source },
    })),
    { actorId: employers[1].id, action: 'EMPLOYER_REGISTERED', entity: 'User', entityId: employers[1].id, metadata: { email: employers[1].email } },
    { actorId: employers[3].id, action: 'EMPLOYER_REGISTERED', entity: 'User', entityId: employers[3].id, metadata: { email: employers[3].email } },
    ...plans.map((plan: any) => ({
      actorId: admin.id,
      action: 'PLAN_CREATED',
      entity: 'SubscriptionPlan',
      entityId: plan.id,
      metadata: { name: plan.name },
    })),
  ]

  await db.auditLog.createMany({ data: auditActions })
  console.log(`  ✓ ${auditActions.length} audit log entries created`)

  // ── Summary ──────────────────────────────────────────────────────
  console.log('\n═══════════════════════════════════════')
  console.log('✅  Seed completed successfully!')
  console.log('═══════════════════════════════════════')
  console.log(`\n📊  Summary:
    •  1 admin
    •  ${users.length} regular users
    •  ${employers.length} employers
    •  ${plans.length} subscription plans
    •  ${employers.length} employer subscriptions
    •  1 sponsored company
    •  ${jobs.length} jobs
    •  ${applications.length} applications
    •  ${historyEntries.length} status history entries
    •  ${blogs.length} blogs
    •  ${auditActions.length} audit log entries
    •  1 CV unlock record\n`)
  console.log('🔑  Login credentials (all users): password123')
  console.log('    Admin:    admin@jobportal.com')
  console.log(`    Employers: ${employers.map((e: any) => e.email).join(', ')}`)
  console.log('    User:     ram.sharma@example.com\n')
}

main()
  .then(async () => {
    await db.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e)
    await db.$disconnect()
    process.exit(1)
  })
