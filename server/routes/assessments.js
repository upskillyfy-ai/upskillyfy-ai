import express from 'express'
import mongoose from 'mongoose'
import Assessment from '../models/Assessment.js'
import Attempt from '../models/Attempt.js'
import { protect, adminOnly, optionalAuth } from '../middleware/auth.js'
import { seedAssessments } from '../data/assessmentsSeed.js'

const router = express.Router()

// Fallback seed data in case database is offline or not yet connected
const { branches, assessments, branchesWithCounts, assessmentsByBranch } = seedAssessments()

const isDbConnected = () => mongoose.connection.readyState === 1

/**
 * Helper to get a test either from MongoDB (if connected) or in-memory fallback
 */
async function findTestById(testId) {
  if (isDbConnected()) {
    try {
      const testFromDb = await Assessment.findOne({ id: testId }).lean()
      if (testFromDb) return testFromDb
    } catch {
      // Fall through to in-memory on DB read error
    }
  }
  return assessments.find((a) => a.id === testId) || null
}

// GET /api/assessments/branches - List all branches with test counts
router.get('/branches', async (_req, res) => {
  try {
    if (isDbConnected()) {
      try {
        const dbAssessments = await Assessment.find({}, 'id branchId').lean()
        if (dbAssessments.length > 0) {
          const counts = {}
          for (const a of dbAssessments) {
            counts[a.branchId] = (counts[a.branchId] || 0) + 1
          }
          const data = branches.map((b) => ({
            ...b,
            testCount: counts[b.id] || 0,
            testsCount: counts[b.id] || 0
          }))
          return res.json({ success: true, data })
        }
      } catch {
        // Fall through to seed count
      }
    }

    const data = branchesWithCounts.map((b) => ({
      ...b,
      testCount: b.testCount ?? 0,
      testsCount: b.testCount ?? 0
    }))
    res.json({ success: true, data })
  } catch (err) {
    console.error('Assessments branches error:', err)
    res.status(500).json({ success: false, message: 'Failed to fetch branches' })
  }
})

// GET /api/assessments/branches/:branchId - Get single branch
router.get('/branches/:branchId', async (req, res) => {
  try {
    const branch = branches.find((b) => b.id === req.params.branchId)
    if (!branch) {
      return res.status(404).json({ success: false, message: 'Branch not found' })
    }
    res.json({ success: true, data: branch })
  } catch (err) {
    console.error('Assessment branch error:', err)
    res.status(500).json({ success: false, message: 'Failed to fetch branch' })
  }
})

// GET /api/assessments/branches/:branchId/tests - List tests for a branch (no answer key)
router.get('/branches/:branchId/tests', async (req, res) => {
  try {
    let branchTests = null

    if (isDbConnected()) {
      try {
        const fromDb = await Assessment.find({ branchId: req.params.branchId }).lean()
        if (fromDb.length > 0) branchTests = fromDb
      } catch {
        // Fallback
      }
    }

    if (!branchTests) {
      branchTests = assessmentsByBranch(req.params.branchId)
    }

    if (!branchTests || branchTests.length === 0) {
      const branchExists = branches.some((b) => b.id === req.params.branchId)
      if (!branchExists) {
        return res.status(404).json({ success: false, message: 'Branch not found' })
      }
      return res.json({ success: true, data: [] })
    }

    // Strip questions and correct answers for safe listing
    const safeTests = branchTests.map((t) => ({
      id: t.id,
      branchId: t.branchId,
      title: t.title,
      description: t.description,
      difficulty: t.difficulty,
      duration: t.duration,
      totalMarks: t.totalMarks,
      questionsCount: t.questionsCount,
      markingScheme: t.markingScheme,
    }))

    res.json({ success: true, data: safeTests })
  } catch (err) {
    console.error('Branch tests error:', err)
    res.status(500).json({ success: false, message: 'Failed to fetch tests' })
  }
})

// GET /api/assessments/tests/:testId - Get test details with question text (no answer key)
router.get('/tests/:testId', async (req, res) => {
  try {
    const test = await findTestById(req.params.testId)
    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found' })
    }

    const safeTest = {
      id: test.id,
      branchId: test.branchId,
      title: test.title,
      description: test.description,
      difficulty: test.difficulty,
      duration: test.duration,
      totalMarks: test.totalMarks,
      questionsCount: test.questionsCount,
      markingScheme: test.markingScheme,
      questions: (test.questions || []).map((q) => ({
        id: q.id,
        text: q.text,
        options: q.options,
        marks: q.marks,
        negativeMarks: q.negativeMarks,
        difficulty: q.difficulty,
        topic: q.topic,
      })),
    }

    res.json({ success: true, data: safeTest })
  } catch (err) {
    console.error('Test details error:', err)
    res.status(500).json({ success: false, message: 'Failed to fetch test' })
  }
})

// GET /api/assessments/tests/:testId/questions - Get test questions only
router.get('/tests/:testId/questions', async (req, res) => {
  try {
    const test = await findTestById(req.params.testId)
    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found' })
    }

    const safeQuestions = (test.questions || []).map((q) => ({
      id: q.id,
      text: q.text,
      options: q.options,
      marks: q.marks,
      negativeMarks: q.negativeMarks,
      difficulty: q.difficulty,
      topic: q.topic,
    }))

    res.json({ success: true, data: safeQuestions })
  } catch (err) {
    console.error('Test questions error:', err)
    res.status(500).json({ success: false, message: 'Failed to fetch questions' })
  }
})

// POST /api/assessments/attempts/start - Start a new attempt
router.post('/attempts/start', optionalAuth, async (req, res) => {
  try {
    const { testId } = req.body
    const test = await findTestById(testId)
    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found' })
    }

    const now = new Date()
    const deadline = new Date(now.getTime() + (test.duration || 30) * 60 * 1000)
    const generatedAttemptId = `att_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

    // Try saving attempt record in MongoDB if connected
    if (isDbConnected()) {
      try {
        await Attempt.create({
          attemptId: generatedAttemptId,
          assessmentId: test.id,
          branchId: test.branchId,
          user: req.user?._id || null,
          startedAt: now,
          deadline,
          isSubmitted: false,
          answers: []
        })
      } catch (saveErr) {
        // Non-blocking fallback
      }
    }

    const attempt = {
      id: generatedAttemptId,
      assessmentId: test.id,
      branchId: test.branchId,
      user: req.user?._id || 'anonymous',
      startedAt: now,
      deadline,
      submittedAt: null,
      isSubmitted: false,
      currentQuestionIndex: 0,
      answers: (test.questions || []).map((q) => ({
        questionId: q.id,
        selectedOption: null,
        isMarkedForReview: false,
        visited: false,
        answered: false,
      })),
      visitedCount: 0,
      answeredCount: 0,
      markedCount: 0,
      result: null,
    }

    res.json({ success: true, data: attempt })
  } catch (err) {
    console.error('Start attempt error:', err)
    res.status(500).json({ success: false, message: 'Failed to start attempt' })
  }
})

// POST /api/assessments/attempts/submit - Submit an attempt and compute score
router.post('/attempts/submit', optionalAuth, async (req, res) => {
  try {
    const { attemptId, testId, answers = [], timeTakenSeconds = 0 } = req.body

    const test = await findTestById(testId)
    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found' })
    }

    // Compute score securely on the server
    const answerMap = new Map(answers.map((a) => [a.questionId, a.selectedOption]))
    let score = 0
    let correct = 0
    let incorrect = 0
    let unanswered = 0

    const questions = test.questions || []
    questions.forEach((q) => {
      const selected = answerMap.get(q.id)
      if (selected === null || selected === undefined) {
        unanswered++
        return
      }
      if (selected === q.correctAnswer) {
        score += (q.marks ?? 1)
        correct++
      } else {
        score -= (q.negativeMarks ?? 0.25)
        incorrect++
      }
    })

    score = Math.round(score * 100) / 100
    const maxScore = test.totalMarks || questions.length
    const accuracy = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0

    const result = {
      score,
      maxScore,
      correct,
      incorrect,
      unanswered,
      accuracy,
      timeTakenSeconds,
    }

    // Persist attempt submission into MongoDB if connected
    if (isDbConnected()) {
      try {
        let existingAttempt = null
        if (attemptId) {
          existingAttempt = await Attempt.findOne({ attemptId })
        }

        if (existingAttempt) {
          existingAttempt.isSubmitted = true
          existingAttempt.submittedAt = new Date()
          existingAttempt.answers = answers
          existingAttempt.result = result
          if (req.user?._id && !existingAttempt.user) {
            existingAttempt.user = req.user._id
          }
          await existingAttempt.save()
        } else {
          await Attempt.create({
            attemptId: attemptId || `att_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            assessmentId: test.id,
            branchId: test.branchId,
            user: req.user?._id || null,
            startedAt: new Date(Date.now() - timeTakenSeconds * 1000),
            deadline: new Date(),
            submittedAt: new Date(),
            isSubmitted: true,
            answers,
            result
          })
        }
      } catch (saveErr) {
        console.warn('Could not persist attempt to DB:', saveErr.message)
      }
    }

    res.json({ success: true, data: { result, attemptId } })
  } catch (err) {
    console.error('Submit attempt error:', err)
    res.status(500).json({ success: false, message: 'Failed to submit attempt' })
  }
})

// GET /api/assessments/tests/:testId/result - Review results with explanations
router.get('/tests/:testId/result', async (req, res) => {
  try {
    const test = await findTestById(req.params.testId)
    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found' })
    }

    const questionsWithAnswers = (test.questions || []).map((q) => ({
      id: q.id,
      text: q.text,
      options: q.options,
      correctAnswer: q.correctAnswer,
      marks: q.marks,
      negativeMarks: q.negativeMarks,
      difficulty: q.difficulty,
      topic: q.topic,
      explanation: q.explanation,
    }))

    res.json({
      success: true,
      data: {
        testId: test.id,
        title: test.title,
        totalMarks: test.totalMarks,
        questionsCount: test.questionsCount,
        markingScheme: test.markingScheme,
        questions: questionsWithAnswers,
      },
    })
  } catch (err) {
    console.error('Test result review error:', err)
    res.status(500).json({ success: false, message: 'Failed to fetch result' })
  }
})

// GET /api/assessments/my/attempts - Get history of submitted attempts for authenticated user
router.get('/my/attempts', protect, async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.json({ success: true, data: [] })
    }

    const attempts = await Attempt.find({ user: req.user._id, isSubmitted: true })
      .sort({ createdAt: -1 })
      .lean()

    const enriched = attempts.map((a) => {
      const test = assessments.find((t) => t.id === a.assessmentId)
      return {
        ...a,
        testTitle: test ? test.title : a.assessmentId,
        difficulty: test ? test.difficulty : 'Medium'
      }
    })

    res.json({ success: true, data: enriched })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// POST /api/assessments/seed - Seed assessments into MongoDB (Admin only)
router.post('/seed', protect, adminOnly, async (_req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({ success: false, message: 'MongoDB is not connected.' })
    }
    await Assessment.deleteMany({})
    const inserted = await Assessment.insertMany(assessments)
    res.json({ success: true, message: `Successfully seeded ${inserted.length} assessments into MongoDB.` })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

export default router