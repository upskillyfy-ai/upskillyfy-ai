import express from 'express'
import mongoose from 'mongoose'
import Roadmap from '../models/Roadmap.js'
import { ROADMAPS_DATA } from '../data/roadmapsSeed.js'

const router = express.Router()

const isDbConnected = () => mongoose.connection.readyState === 1

// GET /api/roadmaps - List all roadmaps with optional filters
router.get('/', async (req, res) => {
  try {
    const { category, duration, search } = req.query
    const query = { isVerified: true }

    if (category && category !== 'All Tracks') {
      query.category = category
    }

    if (duration && duration !== 'All Durations') {
      // duration query e.g. "3-4 Months", "5-6 Months", "6+ Months"
      if (duration === '3-4 Months') {
        query.months = { $lte: 4 }
      } else if (duration === '5-6 Months') {
        query.months = { $gte: 5, $lte: 6 }
      } else if (duration === '6+ Months') {
        query.months = { $gte: 6 }
      }
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { overview: { $regex: search, $options: 'i' } },
        { skills: { $in: [new RegExp(search, 'i')] } },
        { targetRoles: { $in: [new RegExp(search, 'i')] } }
      ]
    }

    let roadmaps = []
    if (isDbConnected()) {
      const dbRoadmaps = await Roadmap.find(query).sort({ createdAt: -1 }).lean()
      if (dbRoadmaps && dbRoadmaps.length > 0) {
        roadmaps = dbRoadmaps.map((r) => ({
          ...r,
          id: r.slug || r._id.toString()
        }))
      }
    }

    // Fallback to static seed data if DB is empty or disconnected
    if (roadmaps.length === 0 && !search && (!category || category === 'All Tracks') && (!duration || duration === 'All Durations')) {
      roadmaps = ROADMAPS_DATA.map((r) => ({
        ...r,
        slug: r.id
      }))
    }

    res.json(roadmaps)
  } catch (err) {
    console.error('Fetch roadmaps error:', err)
    res.status(500).json({ message: err.message })
  }
})

// GET /api/roadmaps/:id - Get single roadmap by slug or ObjectId
router.get('/:id', async (req, res) => {
  try {
    const idOrSlug = req.params.id
    const isObjectId = mongoose.isValidObjectId(idOrSlug)
    const query = isObjectId ? { _id: idOrSlug } : { slug: idOrSlug }

    let roadmap = null
    if (isDbConnected()) {
      const dbRoadmap = await Roadmap.findOne(query).lean()
      if (dbRoadmap) {
        roadmap = {
          ...dbRoadmap,
          id: dbRoadmap.slug || dbRoadmap._id.toString()
        }
      }
    }

    if (!roadmap) {
      const staticItem = ROADMAPS_DATA.find((r) => r.id === idOrSlug)
      if (staticItem) {
        roadmap = { ...staticItem, slug: staticItem.id }
      }
    }

    if (!roadmap) {
      return res.status(404).json({ message: 'Roadmap not found' })
    }

    res.json(roadmap)
  } catch (err) {
    console.error('Fetch roadmap detail error:', err)
    res.status(500).json({ message: err.message })
  }
})

// POST /api/roadmaps/seed - Seed database with default roadmaps
router.post('/seed', async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({ message: 'Database not connected' })
    }

    const seeded = []
    for (const item of ROADMAPS_DATA) {
      const existing = await Roadmap.findOne({ slug: item.id })
      if (!existing) {
        const doc = await Roadmap.create({
          slug: item.id,
          title: item.title,
          category: item.category,
          level: item.level,
          duration: item.duration,
          months: item.months || 6,
          thumbnail: item.thumbnail,
          badge: item.badge,
          badgeType: item.badgeType,
          overview: item.overview,
          skills: item.skills,
          targetRoles: item.targetRoles,
          relatedCourseId: item.relatedCourseId || '',
          relatedCourseTitle: item.relatedCourseTitle || '',
          milestones: item.milestones || []
        })
        seeded.push(doc.title)
      } else {
        // Update to latest fields
        await Roadmap.updateOne(
          { slug: item.id },
          {
            $set: {
              title: item.title,
              category: item.category,
              level: item.level,
              duration: item.duration,
              months: item.months || 6,
              thumbnail: item.thumbnail,
              badge: item.badge,
              badgeType: item.badgeType,
              overview: item.overview,
              skills: item.skills,
              targetRoles: item.targetRoles,
              relatedCourseId: item.relatedCourseId || '',
              relatedCourseTitle: item.relatedCourseTitle || '',
              milestones: item.milestones || []
            }
          }
        )
      }
    }

    res.json({
      success: true,
      message: `Seeded ${seeded.length} new roadmaps. Total in catalogue: ${ROADMAPS_DATA.length}`
    })
  } catch (err) {
    console.error('Roadmaps seed error:', err)
    res.status(500).json({ message: err.message })
  }
})

export default router

