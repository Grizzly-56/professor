'use client'

import { useState, useEffect } from 'react'
import styles from './page.module.css'

type User = {
  email: string
}

type Move = {
  id: string
  name: string
  date: string
  notes?: string
  videos: Array<{ title: string; url: string }>
  position?: string
  effectiveness?: number
  category?: 'working_on' | 'favorite' | 'comp_prep' | 'general'
  lastReviewed?: string
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [moves, setMoves] = useState<Move[]>([])
  const [view, setView] = useState<'login' | 'dashboard' | 'log'>('login')
  const [formData, setFormData] = useState({ name: '', notes: '', position: '', effectiveness: 3, category: 'general' as const })
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterPosition, setFilterPosition] = useState<string>('')
  const [filterCategory, setFilterCategory] = useState<string>('')

  const positions = ['Guard', 'Side Control', 'Mount', 'Back Control', 'North-South', 'Knee on Belly', 'Standup', 'Other']
  const categories = [
    { value: 'general', label: 'General' },
    { value: 'working_on', label: 'Working On' },
    { value: 'favorite', label: 'Favorite' },
    { value: 'comp_prep', label: 'Comp Prep' }
  ]

  useEffect(() => {
    const saved = localStorage.getItem('user')
    const savedMoves = localStorage.getItem('moves')
    if (saved) {
      setUser(JSON.parse(saved))
      setView('dashboard')
    }
    if (savedMoves) {
      setMoves(JSON.parse(savedMoves))
    }
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    const userData = { email }
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
    setView('dashboard')
    setEmail('')
    setPassword('')
  }

  const handleLogMove = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    setLoading(true)
    try {
      const response = await fetch('/api/search-videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ move: formData.name }),
      })

      const data = await response.json()
      const newMove: Move = {
        id: Date.now().toString(),
        name: formData.name,
        date: new Date().toLocaleDateString(),
        notes: formData.notes,
        position: formData.position || undefined,
        effectiveness: formData.effectiveness,
        category: formData.category as Move['category'],
        videos: data.videos || [],
        lastReviewed: new Date().toLocaleDateString(),
      }

      const updated = [newMove, ...moves]
      setMoves(updated)
      localStorage.setItem('moves', JSON.stringify(updated))
      setFormData({ name: '', notes: '', position: '', effectiveness: 3, category: 'general' as const })
      setView('dashboard')
    } catch (error) {
      console.error('Error logging move:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('user')
    setView('login')
  }

  const filtered = moves.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPosition = !filterPosition || m.position === filterPosition
    const matchesCategory = !filterCategory || m.category === filterCategory
    return matchesSearch && matchesPosition && matchesCategory
  })

  if (view === 'login') {
    return (
      <div className={styles.loginContainer}>
        <div className={styles.loginBox}>
          <h1>Professor</h1>
          <p>Your BJJ Journey</p>
          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit" className={styles.btnPrimary}>
              Sign In
            </button>
          </form>
        </div>
      </div>
    )
  }

  if (view === 'log') {
    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <h1>Log a Move</h1>
          <button onClick={() => setView('dashboard')} className={styles.btnSecondary}>
            Back
          </button>
        </header>
        <form onSubmit={handleLogMove} className={styles.form}>
          <input
            type="text"
            placeholder="Move name (e.g., armbar, triangle)"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          
          <select
            value={formData.position}
            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
            className={styles.select}
          >
            <option value="">Select Position (optional)</option>
            {positions.map(pos => (
              <option key={pos} value={pos}>{pos}</option>
            ))}
          </select>

          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
            className={styles.select}
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>

          <div className={styles.effectivenessGroup}>
            <label>Effectiveness: {formData.effectiveness}/5</label>
            <input
              type="range"
              min="1"
              max="5"
              value={formData.effectiveness}
              onChange={(e) => setFormData({ ...formData, effectiveness: parseInt(e.target.value) })}
              className={styles.slider}
            />
          </div>

          <textarea
            placeholder="Notes (optional)"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
          />
          <button type="submit" disabled={loading} className={styles.btnPrimary}>
            {loading ? 'Searching...' : 'Log Move & Find Videos'}
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Professor</h1>
        <button onClick={handleLogout} className={styles.btnDanger}>
          Logout
        </button>
      </header>

      <div className={styles.dashboard}>
        <button onClick={() => setView('log')} className={styles.btnPrimary}>
          + Log Move
        </button>

        <div className={styles.filterBar}>
          <input
            type="text"
            placeholder="Search moves..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
          <select
            value={filterPosition}
            onChange={(e) => setFilterPosition(e.target.value)}
            className={styles.select}
          >
            <option value="">All Positions</option>
            {positions.map(pos => (
              <option key={pos} value={pos}>{pos}</option>
            ))}
          </select>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className={styles.select}
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>

        <div className={styles.movesList}>
          {filtered.length === 0 ? (
            <p className={styles.empty}>No moves logged yet. Start your journey!</p>
          ) : (
            filtered.map((move) => (
              <div key={move.id} className={styles.moveCard}>
                <div className={styles.moveHeader}>
                  <div>
                    <h3>{move.name}</h3>
                    {move.position && <span className={styles.position}>{move.position}</span>}
                  </div>
                  <span className={styles.date}>{move.date}</span>
                </div>
                <div className={styles.moveMeta}>
                  {move.effectiveness && (
                    <span className={styles.effectiveness}>
                      ⭐ {move.effectiveness}/5
                    </span>
                  )}
                  {move.category && move.category !== 'general' && (
                    <span className={`${styles.category} ${styles[`category_${move.category}`]}`}>
                      {categories.find(c => c.value === move.category)?.label}
                    </span>
                  )}
                </div>
                {move.notes && <p className={styles.notes}>{move.notes}</p>}
                {move.videos.length > 0 && (
                  <div className={styles.videos}>
                    <p className={styles.videoLabel}>Related videos:</p>
                    <ul>
                      {move.videos.map((video, idx) => (
                        <li key={idx}>
                          <a href={video.url} target="_blank" rel="noopener noreferrer">
                            {video.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
