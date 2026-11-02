// Lightweight offline fallback. Production courses load dynamically from /api/courses (Licensing API / MongoDB)
export const COURSES_DATA = [
  {
    id: 'cloud-computing-devops',
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
    title: 'Google Cloud Infrastructure & DevOps Specialization',
    subtitle: 'Master GCP compute, networking, Kubernetes, CI/CD pipelines, and infrastructure as code with Terraform.',
    category: 'Cloud & DevOps',
    badge: 'Google Cloud Aligned',
    badgeType: 'blue',
    level: 'Intermediate',
    duration: '8 Weeks · 42 Hours',
    estimatedHours: 42,
    rating: 4.9,
    reviewsCount: 2840,
    enrolledCount: '18,500+',
    instructor: {
      name: 'Priya Sharma & Google Cloud Certified Mentors',
      role: 'Principal Cloud Architect & DevOps Lead',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
      bio: 'Ex-Google Cloud Partner engineer with 10+ years architecting multi-region resilient infrastructures.'
    },
    skills: ['Google Cloud (GCP)', 'Compute Engine & GKE', 'Terraform', 'Docker', 'Kubernetes', 'Cloud Build CI/CD', 'Cloud Monitoring'],
    prerequisites: ['Basic Linux command-line understanding', 'Familiarity with any programming language'],
    overview: 'This comprehensive specialization equips engineers and students with practical, production-ready cloud engineering skills. Designed in alignment with Google Cloud Professional Cloud Architect and DevOps Engineer competencies, you will build live cloud environments, automate deployments, containerize applications, and manage resilient microservices on Kubernetes.',
    whatYouWillLearn: [
      'Architect robust, scalable infrastructure on Google Cloud Platform',
      'Containerize microservices with Docker and orchestrate them on Google Kubernetes Engine (GKE)',
      'Automate deployments using Cloud Build, Artifact Registry, and GitOps',
      'Manage Infrastructure as Code using production Terraform patterns',
      'Configure Cloud IAM, VPC firewalls, and least-privilege security controls',
      'Implement real-time alerting, logging with Cloud Operations'
    ],
    modules: [
      {
        id: 'mod-1',
        title: 'Module 1: Foundations of Google Cloud Platform & Virtualization',
        duration: '2h 15m',
        lessons: [
          {
            id: 'gcp-101',
            title: 'Welcome & Navigating the Google Cloud Console',
            duration: '12:40',
            type: 'video',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            summary: 'Get an architectural overview of Google Cloud global infrastructure: regions, zones, network edge points of presence, and how resource hierarchy functions.',
            keyTakeaways: [
              'Projects are the core organizational entity for Google Cloud resources and billing.',
              'Google Cloud uses global VPC networks across all geographic regions.',
              'Cloud Shell provides a pre-authenticated Debian-based VM inside your browser.'
            ],
            codeSnippet: `# Initialize Google Cloud CLI and verify authentication
gcloud auth login
gcloud config set project upskillyfy-cloud-demo
gcloud compute zones list --filter="region:us-central1"`,
            resources: [
              { name: 'GCP Hierarchy Architecture Sheet.pdf', size: '1.8 MB', type: 'doc' },
              { name: 'Cloud SDK Command Cheat Sheet.md', size: '420 KB', type: 'code' }
            ],
            quiz: {
              question: 'Which entity in Google Cloud is the fundamental container for billing, permissions, and APIs?',
              options: ['Organization', 'Folder', 'Project', 'Resource Group'],
              correctAnswer: 2,
              explanation: 'In Google Cloud, every resource must belong to exactly one Project. Projects are the boundary for APIs, IAM permissions, and billing.'
            }
          }
        ]
      }
    ]
  }
]
