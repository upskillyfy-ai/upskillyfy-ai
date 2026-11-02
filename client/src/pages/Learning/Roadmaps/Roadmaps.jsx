import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Search, 
  X, 
  Bookmark, 
  Clock, 
  CheckCircle2, 
  Compass, 
  GraduationCap, 
  ArrowUpRight,
  Loader2
} from 'lucide-react'
import { roadmapAPI } from '../../../api'
import './Roadmaps.css'

export const ROADMAP_CATEGORIES = [
  'All Tracks',
  'Cloud & DevOps',
  'AI & Machine Learning',
  'Web Development',
  'DSA & Problem Solving',
  'Data & Analytics',
  'Security & Systems',
  'Mobile Engineering',
  'System Design'
]

export const ROADMAP_DURATIONS = [
  'All Durations',
  'Under 5 Months',
  '5 - 6 Months',
  '6+ Months'
]

export default function Roadmaps() {
  const [roadmaps, setRoadmaps] = useState([])
  const [loading, setLoading] = useState(true)

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All Tracks')
  const [selectedDuration, setSelectedDuration] = useState('All Durations')
  const [sortBy, setSortBy] = useState('recommended')
  const [showSavedOnly, setShowSavedOnly] = useState(false)

  // Toast Notification
  const [toastMessage, setToastMessage] = useState('')

  // Bookmarked Roadmaps (Saved in Wishlist)
  const [savedRoadmaps, setSavedRoadmaps] = useState(() => {
    try {
      const saved = localStorage.getItem('upskillyfy-saved-roadmaps')
      return saved ? JSON.parse(saved) : ['cloud-devops-engineer', 'fullstack-web-developer']
    } catch {
      return ['cloud-devops-engineer', 'fullstack-web-developer']
    }
  })

  // Synchronize Bookmarks to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('upskillyfy-saved-roadmaps', JSON.stringify(savedRoadmaps))
    } catch {}
  }, [savedRoadmaps])

  // Fetch dynamic roadmaps from API
  useEffect(() => {
    let isMounted = true
    setLoading(true)
    roadmapAPI.getAll()
      .then((res) => {
        if (isMounted && res?.data && Array.isArray(res.data)) {
          setRoadmaps(res.data)
        }
      })
      .catch((err) => {
        console.error('Failed to load roadmaps from API:', err)
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => { isMounted = false }
  }, [])

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 2500)
  }

  // Toggle Bookmark
  const toggleSaveRoadmap = (e, id) => {
    e.stopPropagation()
    setSavedRoadmaps((prev) => {
      const exists = prev.includes(id)
      const next = exists ? prev.filter((item) => item !== id) : [...prev, id]
      showToast(exists ? 'Removed from saved roadmaps' : 'Roadmap saved to wishlist')
      return next
    })
  }

  // Filtered & Sorted Roadmaps
  const filteredRoadmaps = useMemo(() => {
    return roadmaps.filter((r) => {
      // Category filter
      if (selectedCategory !== 'All Tracks' && r.category !== selectedCategory) {
        return false
      }

      // Duration filter
      if (selectedDuration === 'Under 5 Months' && r.months >= 5) return false
      if (selectedDuration === '5 - 6 Months' && (r.months < 5 || r.months > 6)) return false
      if (selectedDuration === '6+ Months' && r.months < 6) return false

      // Saved only filter
      if (showSavedOnly && !savedRoadmaps.includes(r.id)) return false

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim()
        const matchTitle = r.title.toLowerCase().includes(query)
        const matchCategory = r.category.toLowerCase().includes(query)
        const matchSkills = r.skills?.some(s => s.toLowerCase().includes(query))
        if (!matchTitle && !matchCategory && !matchSkills) return false
      }

      return true
    }).sort((a, b) => {
      if (sortBy === 'shortest') return a.months - b.months
      if (sortBy === 'indepth') return b.months - a.months
      return 0 // default recommended order
    })
  }, [roadmaps, searchQuery, selectedCategory, selectedDuration, sortBy, showSavedOnly, savedRoadmaps])

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('All Tracks')
    setSelectedDuration('All Durations')
    setSortBy('recommended')
    setShowSavedOnly(false)
  }

  return (
    <div className="gcp-roadmaps-hub">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="gcp-toast" style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000, background: '#202124', color: '#fff', padding: '10px 18px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 14px rgba(0,0,0,0.3)', fontSize: '0.85rem' }}>
          <CheckCircle2 size={16} color="#34A853" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Section */}
      <section className="gcp-clean-hero">
        <div className="gcp-clean-hero-bar" />
        <div className="container">
          <div className="gcp-clean-eyebrow">
            <Compass size={14} />
            <span>OFFICIAL CAREER PATHWAYS</span>
          </div>

          <h1 className="gcp-clean-title">
            Explore <span className="grad">Engineering Roadmaps</span>
          </h1>

          <p className="gcp-clean-sub">
            Interactive, step-by-step skill pathways from foundational systems to advanced architecture.
            Follow the connected node map to reach production readiness.
          </p>
        </div>
      </section>

      {/* Controls Toolbar */}
      <section className="gcp-roadmaps-toolbar">
        <div className="container">
          <div className="gcp-roadmaps-toolbar-row">
            {/* Search Input */}
            <div className="gcp-roadmaps-search-wrap">
              <Search size={16} className="gcp-roadmaps-search-icon" />
              <input
                type="text"
                placeholder="Search roadmaps, frameworks, technologies (e.g. Kubernetes, LLM, MERN)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="gcp-roadmaps-search-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="gcp-roadmaps-search-clear"
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Compact Dropdown Filters */}
            <div className="gcp-roadmaps-dropdowns">
              <div className="gcp-roadmaps-select-wrap">
                <select
                  value={selectedDuration}
                  onChange={(e) => setSelectedDuration(e.target.value)}
                  className="gcp-roadmaps-select"
                  aria-label="Filter by duration"
                >
                  {ROADMAP_DURATIONS.map((dur) => (
                    <option key={dur} value={dur}>{dur}</option>
                  ))}
                </select>
              </div>

              <div className="gcp-roadmaps-select-wrap">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="gcp-roadmaps-select"
                  aria-label="Sort roadmaps"
                >
                  <option value="recommended">Recommended</option>
                  <option value="shortest">Shortest Duration</option>
                  <option value="indepth">Deepest Depth</option>
                </select>
              </div>

              <button
                type="button"
                className={`gcp-roadmaps-filter-btn ${showSavedOnly ? 'active' : ''}`}
                onClick={() => setShowSavedOnly(!showSavedOnly)}
                title="Filter bookmarked roadmaps"
              >
                <Bookmark size={15} fill={showSavedOnly ? 'currentColor' : 'none'} />
                <span>Saved ({savedRoadmaps.length})</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Track Pill Horizontal Bar */}
      <nav className="gcp-roadmaps-track-bar" aria-label="Roadmap tracks">
        <div className="container">
          <div className="gcp-roadmaps-track-scroll">
            {ROADMAP_CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`gcp-roadmaps-track-btn ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Roadmaps Cards Grid */}
      <section className="section" style={{ paddingTop: 18 }}>
        <div className="container">
          {/* Active Status Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
            <span style={{ fontSize: '0.84rem', color: 'var(--muted)' }}>
              {loading ? (
                <span>Loading career roadmaps...</span>
              ) : (
                <>
                  Showing <strong>{filteredRoadmaps.length}</strong> of <strong>{roadmaps.length}</strong> career roadmaps
                  {selectedCategory !== 'All Tracks' && ` in "${selectedCategory}"`}
                  {showSavedOnly && ' (Saved Wishlist)'}
                </>
              )}
            </span>
            {(selectedCategory !== 'All Tracks' || selectedDuration !== 'All Durations' || searchQuery || showSavedOnly) && (
              <button 
                onClick={clearFilters}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: 'var(--gcp-blue)', 
                  fontSize: '0.82rem', 
                  fontWeight: 600, 
                  cursor: 'pointer' 
                }}
              >
                Reset all filters
              </button>
            )}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)' }}>
              <Loader2 size={32} className="spin" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
              <p>Fetching dynamic engineering roadmaps...</p>
            </div>
          ) : filteredRoadmaps.length === 0 ? (
            <div className="gcp-empty-state" style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-card)', borderRadius: 10, border: '1px solid var(--border)', marginTop: 12 }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🗺️</div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: 6 }}>No roadmaps match your search</h3>
              <p style={{ color: 'var(--muted)', maxWidth: 420, margin: '0 auto 18px', fontSize: '0.88rem' }}>
                Try adjusting your search terms or clearing selected filters to explore available paths.
              </p>
              <button onClick={clearFilters} className="gcp-btn-explore" style={{ margin: '0 auto', display: 'inline-flex' }}>
                View All Roadmaps
              </button>
            </div>
          ) : (
            <div className="gcp-roadmaps-grid">
              {filteredRoadmaps.map((r) => {
                const isSaved = savedRoadmaps.includes(r.id)

                return (
                  <article key={r.id} className="gcp-roadmap-card">
                    {/* Visual Card Image Banner */}
                    <div className="gcp-roadmap-card-banner">
                      <img 
                        src={r.thumbnail} 
                        alt={r.title} 
                        loading="lazy" 
                        className="gcp-roadmap-card-img" 
                      />
                      <div className="gcp-roadmap-card-img-overlay" />
                      
                      {/* Top Badges */}
                      <div className="gcp-roadmap-card-banner-badges">
                        <span className={`gcp-tag gcp-tag-${r.badgeType || 'blue'}`}>
                          {r.badge}
                        </span>
                        <button
                          type="button"
                          className={`gcp-roadmap-card-save-btn ${isSaved ? 'saved' : ''}`}
                          onClick={(e) => toggleSaveRoadmap(e, r.id)}
                          aria-label={isSaved ? 'Remove from wishlist' : 'Save roadmap'}
                        >
                          <Bookmark size={14} fill={isSaved ? '#1a73e8' : 'none'} />
                        </button>
                      </div>

                      {/* Duration Tag */}
                      <div className="gcp-roadmap-card-duration">
                        <Clock size={12} />
                        <span>{r.duration}</span>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="gcp-roadmap-card-body">
                      <div className="gcp-roadmap-card-category">{r.category}</div>
                      
                      <h3 className="gcp-roadmap-card-title">
                        <Link to={`/learning/roadmaps/${r.id}`}>{r.title}</Link>
                      </h3>

                      <p className="gcp-roadmap-card-desc">{r.overview}</p>

                      {/* Skills Covered Tags (first 4) */}
                      <div className="gcp-roadmap-card-skills">
                        {r.skills?.slice(0, 4).map((skill) => (
                          <span key={skill} className="gcp-roadmap-skill-pill">
                            {skill}
                          </span>
                        ))}
                        {r.skills && r.skills.length > 4 && (
                          <span className="gcp-roadmap-skill-pill more">
                            +{r.skills.length - 4} more
                          </span>
                        )}
                      </div>

                      {/* Related Course Link if present */}
                      {r.relatedCourseId && (
                        <div className="gcp-roadmap-related-course">
                          <GraduationCap size={13} color="#1a73e8" />
                          <span>Specialization: </span>
                          <Link to={`/learning/courses/${r.relatedCourseId}`} className="gcp-roadmap-course-link">
                            {r.relatedCourseTitle}
                          </Link>
                        </div>
                      )}

                      {/* Footer Actions */}
                      <div className="gcp-roadmap-card-footer">
                        <div className="gcp-roadmap-milestones-count">
                          <CheckCircle2 size={13} color="#34A853" />
                          <span>{r.milestones?.length || 0} Milestone Nodes</span>
                        </div>

                        <Link to={`/learning/roadmaps/${r.id}`} className="gcp-roadmap-view-link">
                          <span>View Pathway</span>
                          <ArrowUpRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
