import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Bookmark, 
  Clock, 
  Check, 
  Download, 
  ArrowUpRight, 
  GraduationCap, 
  Sparkles,
  CheckCircle2,
  Loader2
} from 'lucide-react'
import { roadmapAPI } from '../../../api'
import './Roadmaps.css'

export default function RoadmapDetail() {
  const { roadmapId } = useParams()
  const navigate = useNavigate()

  const [roadmap, setRoadmap] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Toast Notification
  const [toastMessage, setToastMessage] = useState('')

  // Saved Wishlist State
  const [savedRoadmaps, setSavedRoadmaps] = useState(() => {
    try {
      const saved = localStorage.getItem('upskillyfy-saved-roadmaps')
      return saved ? JSON.parse(saved) : ['cloud-devops-engineer']
    } catch {
      return ['cloud-devops-engineer']
    }
  })

  // Completed Skills Tracking: format { "roadmapId:skillName": true }
  const [completedSkills, setCompletedSkills] = useState(() => {
    try {
      const saved = localStorage.getItem('upskillyfy-completed-skills')
      return saved ? JSON.parse(saved) : { 
        'cloud-devops-engineer:Bash Scripting': true,
        'cloud-devops-engineer:Docker Engine': true
      }
    } catch {
      return {}
    }
  })

  // Fetch roadmap dynamically from API
  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setError(null)

    roadmapAPI.getOne(roadmapId)
      .then((res) => {
        if (isMounted) {
          if (res?.data) {
            setRoadmap(res.data)
          } else {
            setError('Roadmap not found')
          }
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Failed to load roadmap:', err)
          setError(err.response?.data?.message || 'Could not load roadmap')
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => { isMounted = false }
  }, [roadmapId])

  // Synchronize Bookmarks
  useEffect(() => {
    try {
      localStorage.setItem('upskillyfy-saved-roadmaps', JSON.stringify(savedRoadmaps))
    } catch {}
  }, [savedRoadmaps])

  // Synchronize Completed Skills
  useEffect(() => {
    try {
      localStorage.setItem('upskillyfy-completed-skills', JSON.stringify(completedSkills))
    } catch {}
  }, [completedSkills])

  // Scroll to top on load
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [roadmapId])

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 2500)
  }

  // Toggle Bookmark
  const toggleSave = () => {
    if (!roadmap) return
    setSavedRoadmaps((prev) => {
      const id = roadmap.id || roadmap.slug
      const exists = prev.includes(id)
      const next = exists ? prev.filter((item) => item !== id) : [...prev, id]
      showToast(exists ? 'Removed from saved roadmaps' : 'Roadmap saved to wishlist')
      return next
    })
  }

  // Toggle Skill Node
  const toggleSkillNode = (skillName) => {
    if (!roadmap) return
    const id = roadmap.id || roadmap.slug
    const key = `${id}:${skillName}`
    setCompletedSkills((prev) => {
      const next = { ...prev, [key]: !prev[key] }
      showToast(!prev[key] ? `Marked "${skillName}" as mastered! ✓` : `Unchecked "${skillName}"`)
      return next
    })
  }

  // Download Blueprint as Markdown
  const handleDownloadPlan = () => {
    if (!roadmap) return
    const id = roadmap.id || roadmap.slug
    let content = `# Upskillyfy AI Career Roadmap: ${roadmap.title}\n`
    content += `Track: ${roadmap.category} | Duration: ${roadmap.duration} | Level: ${roadmap.level}\n\n`
    content += `Overview:\n${roadmap.overview}\n\n`
    content += `## Learning Stages & Skills\n`
    roadmap.milestones?.forEach((m) => {
      content += `\n### Stage ${m.step}: ${m.title} (${m.duration})\n`
      m.skills?.forEach((s) => {
        const isDone = completedSkills[`${id}:${s}`] ? '[X]' : '[ ]'
        content += `- ${isDone} ${s}\n`
      })
      if (m.project) content += `Milestone Capstone: ${m.project}\n`
    })

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `${id}-roadmap-path.md`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    showToast('Roadmap blueprint downloaded')
  }

  if (loading) {
    return (
      <div className="gcp-roadmap-detail-page" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--muted)' }}>
          <Loader2 size={36} className="spin" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
          <p>Loading career roadmap blueprint...</p>
        </div>
      </div>
    )
  }

  if (error || !roadmap) {
    return (
      <div className="gcp-roadmap-detail-page">
        <section className="section" style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div className="container">
            <h2 style={{ fontSize: '1.8rem', marginBottom: 12 }}>Roadmap Not Found</h2>
            <p style={{ color: 'var(--muted)', marginBottom: 24 }}>The requested engineering roadmap pathway does not exist or could not be loaded.</p>
            <Link to="/learning/roadmaps" className="gcp-btn-explore" style={{ display: 'inline-flex' }}>
              <ArrowLeft size={16} />
              <span>Back to All Roadmaps</span>
            </Link>
          </div>
        </section>
      </div>
    )
  }

  const roadmapKey = roadmap.id || roadmap.slug

  // Calculate Progress
  let totalSkills = 0
  let completedCount = 0
  roadmap.milestones?.forEach((m) => {
    m.skills?.forEach((s) => {
      totalSkills++
      if (completedSkills[`${roadmapKey}:${s}`]) {
        completedCount++
      }
    })
  })
  const progressPercent = totalSkills > 0 ? Math.round((completedCount / totalSkills) * 100) : 0
  const isSaved = savedRoadmaps.includes(roadmapKey)

  return (
    <div className="gcp-roadmap-detail-page">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="gcp-toast" style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000, background: '#202124', color: '#fff', padding: '10px 18px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 14px rgba(0,0,0,0.3)', fontSize: '0.85rem' }}>
          <CheckCircle2 size={16} color="#34A853" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Bar with Accent */}
      <section className="gcp-detail-hero">
        <div className="gcp-clean-hero-bar" />
        <div className="container">
          {/* Breadcrumb Back Button */}
          <div className="gcp-detail-nav-row">
            <Link to="/learning/roadmaps" className="gcp-detail-back-btn">
              <ArrowLeft size={16} />
              <span>Back to All Roadmaps</span>
            </Link>

            <button 
              className={`gcp-detail-save-btn ${isSaved ? 'saved' : ''}`}
              onClick={toggleSave}
              title={isSaved ? 'Saved to wishlist' : 'Save roadmap'}
            >
              <Bookmark size={15} fill={isSaved ? 'currentColor' : 'none'} />
              <span>{isSaved ? 'Saved' : 'Save Roadmap'}</span>
            </button>
          </div>

          {/* Title & Metadata */}
          <div className="gcp-detail-title-section">
            <div className="gcp-detail-badge-row">
              <span className={`gcp-roadmap-badge ${roadmap.badgeType || 'blue'}`}>
                {roadmap.category}
              </span>
              <span className="gcp-detail-meta-pill">
                <Clock size={13} />
                <span>{roadmap.duration}</span>
              </span>
              <span className="gcp-detail-meta-pill">
                {roadmap.level}
              </span>
            </div>

            <h1 className="gcp-detail-title">{roadmap.title}</h1>
            <p className="gcp-detail-overview">{roadmap.overview}</p>

            {/* Interactive Progress Ribbon */}
            <div className="gcp-detail-progress-card">
              <div className="gcp-detail-progress-header">
                <div>
                  <strong>Your Skill Mastery Progress</strong>
                  <span className="gcp-detail-progress-stats">
                    {' '}({completedCount} of {totalSkills} skills mastered • {progressPercent}%)
                  </span>
                </div>
                <span className="gcp-detail-progress-percent">{progressPercent}%</span>
              </div>
              <div className="gcp-detail-progress-track">
                <div className="gcp-detail-progress-fill" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>

            {/* Top Action Buttons */}
            <div className="gcp-detail-hero-actions">
              <button 
                className="gcp-btn-detail-download"
                onClick={handleDownloadPlan}
              >
                <Download size={15} />
                <span>Export Roadmap Plan</span>
              </button>

              {roadmap.relatedCourseId && (
                <Link 
                  to={`/learning/courses/${roadmap.relatedCourseId}`}
                  className="gcp-btn-detail-course"
                >
                  <GraduationCap size={16} />
                  <span>Launch Practice Course</span>
                  <ArrowUpRight size={15} />
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Roadmap Visual Stages Grid */}
      <section className="section" style={{ paddingTop: 24, paddingBottom: 64 }}>
        <div className="container">
          <div className="gcp-detail-section-header">
            <div>
              <h2 className="gcp-detail-section-title">Interactive Learning Path</h2>
              <p className="gcp-detail-section-sub">Click any skill node below as you master each topic to track your progress.</p>
            </div>
          </div>

          <div className="gcp-detail-stages-grid">
            {roadmap.milestones?.map((milestone) => (
              <div key={milestone.step} className="gcp-detail-stage-card">
                {/* Stage Header */}
                <div className="gcp-detail-stage-header">
                  <span className="gcp-detail-stage-pill">
                    STAGE 0{milestone.step}
                  </span>
                  <h3 className="gcp-detail-stage-title">{milestone.title}</h3>
                  <span className="gcp-detail-stage-duration">{milestone.duration}</span>
                </div>

                {/* Interactive Skill Nodes */}
                <div className="gcp-detail-nodes-grid">
                  {milestone.skills?.map((skillName, sIdx) => {
                    const isDone = !!completedSkills[`${roadmapKey}:${skillName}`]

                    return (
                      <button
                        key={sIdx}
                        className={`gcp-detail-node-btn ${isDone ? 'mastered' : ''}`}
                        onClick={() => toggleSkillNode(skillName)}
                        title="Click to toggle mastered status"
                      >
                        <span className="gcp-detail-node-icon">
                          {isDone ? <Check size={13} /> : '○'}
                        </span>
                        <span className="gcp-detail-node-label">{skillName}</span>
                      </button>
                    )
                  })}
                </div>

                {/* Milestone Project */}
                {milestone.project && (
                  <div className="gcp-detail-project-box">
                    <Sparkles size={14} color="var(--gcp-amber)" />
                    <span><strong>Milestone Capstone:</strong> {milestone.project}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Connected Course Banner at Bottom */}
          {roadmap.relatedCourseId && (
            <div className="gcp-detail-course-banner">
              <div>
                <h3>Ready to practice this curriculum with code exercises?</h3>
                <p>Learn this exact pathway with video lessons, quizzes, and live cloud labs in <strong>{roadmap.relatedCourseTitle}</strong>.</p>
              </div>
              <Link 
                to={`/learning/courses/${roadmap.relatedCourseId}`}
                className="gcp-btn-detail-course"
              >
                <span>Open Course Workspace</span>
                <ArrowUpRight size={15} />
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
