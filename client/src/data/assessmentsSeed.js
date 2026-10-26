/* =========================================================
   UPSKILLYFY-AI — ASSESSMENT CLIENT CONFIG & METADATA
   ------------------------------------------------------------
   Lightweight client-side branch metadata and configuration.
   Actual test questions and evaluation are served dynamically
   from the backend API (/api/assessments) and stored in MongoDB.
   ========================================================= */

export const DEFAULT_MARKING = {
  positive: 1,
  negative: 0.25,
  description: '+1 for correct, -0.25 for incorrect, 0 for unattempted',
}

export const DEFAULT_NEGATIVE_MARKS = 0.25

export const BRANCHES = [
  {
    id: 'cse',
    name: 'Computer Science Engineering',
    shortName: 'CSE',
    icon: 'Code2',
    color: '#1a73e8',
    description:
      'Core computer science — data structures, operating systems, databases, networks and programming fundamentals.',
    order: 1,
  },
  {
    id: 'it',
    name: 'Information Technology',
    shortName: 'IT',
    icon: 'Server',
    color: '#34a853',
    description:
      'Enterprise and application technology — web development, databases, IT infrastructure and systems analysis.',
    order: 2,
  },
  {
    id: 'ece',
    name: 'Electronics and Communication Engineering',
    shortName: 'ECE',
    icon: 'CircuitBoard',
    color: '#7b61ff',
    description:
      'Signals, embedded systems, digital electronics and communication — from transistor-level intuition to device firmware.',
    order: 3,
  },
  {
    id: 'ee',
    name: 'Electrical Engineering',
    shortName: 'EE',
    icon: 'Zap',
    color: '#fbbc04',
    description:
      'Circuits, machines, power systems and control — the physics and mathematics behind electrical infrastructure.',
    order: 4,
  },
  {
    id: 'me',
    name: 'Mechanical Engineering',
    shortName: 'ME',
    icon: 'Cog',
    color: '#ea4335',
    description:
      'Thermodynamics, mechanics, manufacturing and design fundamentals for machines, systems and industrial processes.',
    order: 5,
  },
  {
    id: 'ce',
    name: 'Civil Engineering',
    shortName: 'CE',
    icon: 'Building2',
    color: '#00897b',
    description:
      'Structures, geotechnical and concrete design, surveying and construction management — building things that stand up.',
    order: 6,
  },
  {
    id: 'ai-ds',
    name: 'Artificial Intelligence & Data Science',
    shortName: 'AI & DS',
    icon: 'Brain',
    color: '#9c27b0',
    description:
      'Machine learning, statistics, model evaluation and deep learning — building systems that learn from data.',
    order: 7,
  },
  {
    id: 'general-aptitude',
    name: 'General Aptitude',
    shortName: 'Aptitude',
    icon: 'Puzzle',
    color: '#e8710a',
    description:
      'The reasoning, quantitative and verbal skills that every campus drive and aptitude screen opens with.',
    order: 8,
  },
  {
    id: 'faculty',
    name: 'Faculty & Educator Development',
    shortName: 'Faculty',
    icon: 'Brain',
    color: '#00897b',
    description:
      'Pedagogical mastery, modern EdTech, Outcome-Based Education (OBE), Bloom taxonomy, and GenAI classroom integration.',
    order: 9,
  },
]

export const ASSESSMENTS = []
export const ASSESSMENTS_BUILT = []

export function getBranchesWithCounts() {
  return BRANCHES.map((branch) => ({
    ...branch,
    testCount: 4,
    questionCount: 40,
  })).sort((a, b) => a.order - b.order)
}

export function getAssessmentsByBranch(branchId) {
  return ASSESSMENTS_BUILT.filter((a) => a.branchId === branchId)
}

export function getAssessmentById(assessmentId) {
  return ASSESSMENTS_BUILT.find((a) => a.id === assessmentId) || null
}

export function getBranchById(branchId) {
  return BRANCHES.find((b) => b.id === branchId) || null
}
