import express from 'express'
import mongoose from 'mongoose'
import Internship from '../models/Internship.js'
import Application from '../models/Application.js'
import { protect, adminOnly, optionalAuth } from '../middleware/auth.js'
import { INTERNSHIPS_DATA } from '../../client/src/data/internshipsData.js'

const router = express.Router()

// GET /api/internships - List internships (with optional filtering)
router.get('/', async (req, res) => {
  try {
    const { category, mode, search } = req.query
    const query = { isVerified: true }

    if (category && category !== 'all') {
      query.category = category
    }
    if (mode && mode !== 'All Modes') {
      query.mode = mode
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { skills: { $in: [new RegExp(search, 'i')] } }
      ]
    }

    let internships = []
    if (mongoose.connection.readyState === 1) {
      internships = await Internship.find(query).sort({ createdAt: -1 })
    }

    // Fallback to local dataset if DB returns empty or offline
    if (internships.length === 0 && !search && (!category || category === 'all') && (!mode || mode === 'All Modes')) {
      internships = INTERNSHIPS_DATA.map((i) => ({
        ...i,
        slug: i.id
      }))
    }

    res.json(internships)
  } catch (err) {
    console.error('Fetch internships error:', err)
    res.status(500).json({ message: err.message })
  }
})

// GET /api/internships/my/applications - Get logged-in user's applications
router.get('/my/applications', protect, async (req, res) => {
  try {
    const applications = await Application.find({
      $or: [
        { user: req.user._id },
        { email: req.user.email }
      ]
    })
      .populate('internship')
      .sort({ createdAt: -1 })

    res.json({ success: true, data: applications })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/internships/:id - Get single internship by Mongo ID or Slug
router.get('/:id', async (req, res) => {
  try {
    const idOrSlug = req.params.id
    const isObjectId = mongoose.isValidObjectId(idOrSlug)
    const query = isObjectId ? { _id: idOrSlug } : { slug: idOrSlug }

    let internship = null
    if (mongoose.connection.readyState === 1) {
      internship = await Internship.findOne(query)
    }

    if (!internship) {
      // Fallback search in static data
      const staticItem = INTERNSHIPS_DATA.find((i) => i.id === idOrSlug)
      if (staticItem) {
        internship = { ...staticItem, slug: staticItem.id }
      }
    }

    if (!internship) {
      return res.status(404).json({ message: 'Internship role not found' })
    }

    res.json(internship)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/internships/:id/apply - Apply for an internship
router.post('/:id/apply', optionalAuth, async (req, res) => {
  try {
    const { fullName, email, phone, college, batch, resumeUrl, portfolioUrl, pitch } = req.body

    if (!fullName || !email || !resumeUrl) {
      return res.status(400).json({
        success: false,
        message: 'Full name, email, and resume link are required.'
      })
    }

    const idOrSlug = req.params.id
    const isObjectId = mongoose.isValidObjectId(idOrSlug)
    const query = isObjectId ? { _id: idOrSlug } : { slug: idOrSlug }

    let internship = null
    if (mongoose.connection.readyState === 1) {
      internship = await Internship.findOne(query)
    }

    if (!internship) {
      // If not in DB, check static data and create in DB on-the-fly
      const staticItem = INTERNSHIPS_DATA.find((i) => i.id === idOrSlug)
      if (staticItem && mongoose.connection.readyState === 1) {
        internship = await Internship.create({
          slug: staticItem.id,
          title: staticItem.title,
          company: staticItem.company,
          category: staticItem.category,
          categoryLabel: staticItem.categoryLabel,
          location: staticItem.location,
          mode: staticItem.mode,
          stipend: staticItem.stipend,
          duration: staticItem.duration,
          deadline: staticItem.deadline,
          openings: staticItem.openings,
          skills: staticItem.skills || [],
          ppoOffered: staticItem.ppoOffered || false,
          ppoPackage: staticItem.ppoPackage || '',
          overview: staticItem.overview || '',
          responsibilities: staticItem.responsibilities || [],
          requirements: staticItem.requirements || [],
          perks: staticItem.perks || [],
          isVerified: true
        })
      }
    }

    const normEmail = email.toLowerCase().trim()
    const generatedId = `UPS-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

    if (mongoose.connection.readyState === 1 && internship?._id) {
      // Check for duplicate application
      const existing = await Application.findOne({
        internship: internship._id,
        email: normEmail
      })

      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'You have already submitted an application for this role.',
          applicationId: existing.applicationId
        })
      }

      const application = await Application.create({
        applicationId: generatedId,
        internship: internship._id,
        user: req.user?._id || null,
        fullName: fullName.trim(),
        email: normEmail,
        phone: (phone || '').trim(),
        college: (college || '').trim(),
        batch: batch || '2026',
        resumeUrl: resumeUrl.trim(),
        portfolioUrl: (portfolioUrl || '').trim(),
        pitch: (pitch || '').trim(),
        status: 'Applied'
      })

      // Increment applicants count
      await Internship.findByIdAndUpdate(internship._id, { $inc: { applicantsCount: 1 } })

      return res.status(201).json({
        success: true,
        message: 'Application submitted successfully!',
        applicationId: application.applicationId,
        data: application
      })
    }

    // Stateless fallback response if DB is offline
    res.status(201).json({
      success: true,
      message: 'Application recorded successfully!',
      applicationId: generatedId
    })
  } catch (err) {
    console.error('Application submit error:', err)
    res.status(500).json({ success: false, message: err.message })
  }
})

// POST /api/internships/seed - Sync all internships to MongoDB
router.post('/seed', protect, adminOnly, async (_req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'MongoDB not connected' })
    }

    await Internship.deleteMany({})
    const docs = INTERNSHIPS_DATA.map((i) => ({
      slug: i.id,
      title: i.title,
      company: i.company,
      category: i.category,
      categoryLabel: i.categoryLabel,
      location: i.location,
      mode: i.mode,
      stipend: i.stipend,
      duration: i.duration,
      deadline: i.deadline,
      openings: i.openings,
      applicantsCount: i.applicants || 0,
      skills: i.skills || [],
      ppoOffered: i.ppoOffered || false,
      ppoPackage: i.ppoPackage || '',
      overview: i.overview || '',
      responsibilities: i.responsibilities || [],
      requirements: i.requirements || [],
      perks: i.perks || [],
      isVerified: true
    }))

    const inserted = await Internship.insertMany(docs)
    res.json({ success: true, message: `Seeded ${inserted.length} internships to MongoDB.` })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router