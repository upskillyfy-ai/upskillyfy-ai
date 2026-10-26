import express from 'express'
import mongoose from 'mongoose'
import Resource from '../models/Resource.js'
import { protect, adminOnly } from '../middleware/auth.js'
import { RESOURCES_DATA } from '../../client/src/data/resourcesData.js'

const router = express.Router()

const isDbConnected = () => mongoose.connection.readyState === 1

// GET /api/resources - List learning resources
router.get('/', async (req, res) => {
  try {
    const { category, type, search } = req.query

    if (isDbConnected()) {
      try {
        const query = {}
        if (category && category !== 'All Tracks') query.category = category
        if (type && type !== 'All Formats') query.type = type
        if (search) {
          query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { tags: { $in: [new RegExp(search, 'i')] } }
          ]
        }

        const dbResources = await Resource.find(query).sort({ downloadsNum: -1 }).lean()
        if (dbResources.length > 0) {
          // Normalize resourceId to id for frontend compatibility
          const data = dbResources.map((r) => ({
            ...r,
            id: r.resourceId || r.id
          }))
          return res.json(data)
        }
      } catch {
        // Fall back to local data on DB read error
      }
    }

    // Fallback to local static dataset
    let filtered = [...RESOURCES_DATA]
    if (category && category !== 'All Tracks') {
      filtered = filtered.filter((r) => r.category === category)
    }
    if (type && type !== 'All Formats') {
      filtered = filtered.filter((r) => r.type === type)
    }
    if (search) {
      const q = search.toLowerCase()
      filtered = filtered.filter((r) =>
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q)
      )
    }

    res.json(filtered)
  } catch (err) {
    console.error('Fetch resources error:', err)
    res.status(500).json({ message: err.message })
  }
})

// GET /api/resources/:id - Get single resource
router.get('/:id', async (req, res) => {
  try {
    const targetId = req.params.id

    if (isDbConnected()) {
      try {
        const fromDb = await Resource.findOne({
          $or: [
            { resourceId: targetId },
            ...(mongoose.isValidObjectId(targetId) ? [{ _id: targetId }] : [])
          ]
        }).lean()

        if (fromDb) {
          return res.json({
            ...fromDb,
            id: fromDb.resourceId
          })
        }
      } catch {
        // Fall through to static
      }
    }

    const staticItem = RESOURCES_DATA.find((r) => r.id === targetId)
    if (!staticItem) {
      return res.status(404).json({ message: 'Resource not found' })
    }

    res.json(staticItem)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/resources/:id/download - Track download
router.post('/:id/download', async (req, res) => {
  try {
    const targetId = req.params.id

    if (isDbConnected()) {
      try {
        await Resource.findOneAndUpdate(
          { resourceId: targetId },
          { $inc: { downloadsNum: 1 } }
        )
      } catch {
        // Non-blocking
      }
    }

    res.json({ success: true, message: 'Download tracked' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/resources/:id/bookmark - Track bookmark
router.post('/:id/bookmark', async (_req, res) => {
  res.json({ success: true, message: 'Bookmark synchronized' })
})

// POST /api/resources/seed - Seed resources to MongoDB (Admin only)
router.post('/seed', protect, adminOnly, async (_req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({ message: 'MongoDB not connected' })
    }

    await Resource.deleteMany({})
    const docs = RESOURCES_DATA.map((r) => ({
      resourceId: r.id,
      title: r.title,
      description: r.description,
      category: r.category,
      type: r.type,
      badge: r.badge,
      badgeType: r.badgeType,
      fileFormat: r.fileFormat,
      fileExt: r.fileExt,
      fileSize: r.fileSize,
      pages: r.pages,
      downloadsCount: r.downloadsCount,
      downloadsNum: parseInt(String(r.downloadsCount).replace(/[^0-9]/g, '')) || 10000,
      rating: r.rating,
      author: r.author,
      updatedAt: r.updatedAt,
      tags: r.tags || [],
      previewSummary: r.previewSummary || '',
      sampleSnippet: r.sampleSnippet || '',
      keyHighlights: r.keyHighlights || [],
      tableOfContents: r.tableOfContents || [],
      downloadFileName: r.downloadFileName || 'guide.pdf'
    }))

    const inserted = await Resource.insertMany(docs)
    res.json({ success: true, message: `Seeded ${inserted.length} resources to MongoDB.` })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router
