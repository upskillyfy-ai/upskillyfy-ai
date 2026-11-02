// Lightweight offline fallback. Production resources load dynamically from /api/resources (MongoDB Atlas)
export const RESOURCES_DATA = [
  {
    id: 'gcp-ace-cheatsheet',
    title: 'Google Cloud Associate Cloud Engineer (ACE) Architecture & Exam Cram',
    description: 'Visual decision trees, gcloud CLI syntax tables, and IAM security matrices covering Compute Engine, GKE, VPC peering, and Cloud Storage.',
    category: 'Cloud & DevOps',
    type: 'Cheat Sheet',
    badge: 'Official Aligned',
    badgeType: 'blue',
    fileFormat: 'PDF Guide',
    fileExt: 'PDF',
    fileSize: '4.8 MB',
    pages: '42 Pages',
    downloadsCount: '28,400+',
    rating: 4.96,
    author: 'Upskillyfy AI Cloud Engineering Guild',
    updatedAt: 'October 2025',
    tags: ['Google Cloud', 'ACE Exam', 'GKE', 'IAM', 'VPC Networking'],
    previewSummary: 'Engineered for candidates preparing for the Google Cloud Associate Cloud Engineer credential and junior SREs. This visual handbook condenses hundreds of pages of official documentation into high-yield architecture decision trees, gcloud CLI syntax tables, and service comparison matrices.',
    sampleSnippet: `# Essential gcloud CLI syntax cheatsheet
# 1. Project & Account Context
gcloud auth login
gcloud config set project [PROJECT_ID]
gcloud config set compute/zone us-central1-a

# 2. Compute Engine - Create preemptible VM with custom service account
gcloud compute instances create prod-web-vm \\
    --zone=us-central1-a \\
    --machine-type=e2-medium \\
    --service-account=sa-web@my-project.iam.gserviceaccount.com \\
    --scopes=cloud-platform \\
    --tags=http-server,https-server

# 3. GKE - Connect kubectl to regional cluster
gcloud container clusters get-credentials prod-cluster --region us-central1`,
    keyHighlights: [
      'Visual decision flowcharts: When to choose Compute Engine vs Cloud Run vs GKE',
      'Top 100 gcloud CLI commands with copy-paste flags and real-world examples',
      'VPC Service Controls, Cloud NAT, and Least-Privilege IAM role mapping',
      'Self-assessment practice checklist containing 50 high-frequency exam scenarios'
    ],
    tableOfContents: [
      'Section 1: Google Cloud Resource Hierarchy (Org > Folder > Project)',
      'Section 2: Compute Engine, Autoscaling & Custom Machine Types',
      'Section 3: Google Kubernetes Engine (GKE) Cluster Architecture & Node Pools',
      'Section 4: Cloud Storage Classes, Lifecycle Rules & Signed URLs',
      'Section 5: Virtual Private Cloud (VPC), Subnets, Firewall Rules & Cloud VPN',
      'Section 6: Cloud IAM Roles (Primitive vs Predefined vs Custom)',
      'Section 7: Cloud Monitoring, Cloud Logging, and Alert Policies'
    ],
    downloadFileName: 'Upskillyfy_AI_GCP_ACE_CheatSheet_v2025.pdf'
  },
  {
    id: 'dsa-450-interview-roadmap',
    title: 'Curated 450 DSA Sheet & Algorithmic Pattern Handbook',
    description: 'The definitive coding interview roadmap: 450 topic-wise problems with visual approaches, time complexity proofs, and C++/Java/Python snippets.',
    category: 'DSA & Problem Solving',
    type: 'Question Bank',
    badge: 'Placement Essential',
    badgeType: 'purple',
    fileFormat: 'Interactive PDF + Code Repo',
    fileExt: 'PDF + ZIP',
    fileSize: '12.4 MB',
    pages: '118 Pages',
    downloadsCount: '45,200+',
    rating: 4.98,
    author: 'Competitive Programming Cell',
    updatedAt: 'October 2025',
    tags: ['DSA', 'LeetCode 450', 'Dynamic Programming', 'Graphs', 'Trees'],
    previewSummary: 'A rigorously organized collection of the 450 most frequent coding interview questions asked across Google, Microsoft, Amazon, and fast-scaling unicorn engineering teams. Features step-by-step problem intuition diagrams, asymptotic analysis, and tested solutions.',
    sampleSnippet: `// Two-Pointer Pattern: Trap Rainwater O(N) Time, O(1) Space
int trap(vector<int>& height) {
    int left = 0, right = height.size() - 1;
    int maxLeft = 0, maxRight = 0, waterTrapped = 0;
    while (left <= right) {
        if (height[left] <= height[right]) {
            if (height[left] >= maxLeft) maxLeft = height[left];
            else waterTrapped += maxLeft - height[left];
            left++;
        } else {
            if (height[right] >= maxRight) maxRight = height[right];
            else waterTrapped += maxRight - height[right];
            right--;
        }
    }
    return waterTrapped;
}`,
    keyHighlights: [
      'Problem categorization across 14 high-frequency coding patterns (Sliding Window, Monotonic Stack, Top-K)',
      'Side-by-side time and space complexity comparison between brute force and optimal solutions',
      'Curated company tags reflecting recent 2025-2026 tech hiring cycles',
      'QR codes linking directly to runnable online compiler environments for each problem'
    ],
    tableOfContents: [
      'Topic 1: Arrays, Matrix Manipulations & Prefix Sums (50 Problems)',
      'Topic 2: Strings, KMP Pattern Matching & Two Pointers (35 Problems)',
      'Topic 3: Linked Lists, Cycle Detection & Reversals (25 Problems)',
      'Topic 4: Binary Trees, BSTs & Lowest Common Ancestor (45 Problems)',
      'Topic 5: Graphs, Topological Sorting & Dijkstra Algorithms (55 Problems)',
      'Topic 6: Dynamic Programming Patterns (0/1 Knapsack, LCS, LIS) (60 Problems)',
      'Topic 7: System Design Foundations & Bit Manipulation (30 Problems)'
    ],
    downloadFileName: 'Upskillyfy_AI_450_DSA_Interview_Sheet.pdf'
  }
]
