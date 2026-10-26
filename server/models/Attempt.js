import mongoose from 'mongoose'

const attemptSchema = new mongoose.Schema({
  attemptId: { type: String, index: true },
  assessmentId: { type: String, required: true, index: true },
  branchId: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  startedAt: { type: Date, required: true, default: Date.now },
  deadline: { type: Date, required: true },
  submittedAt: { type: Date },
  isSubmitted: { type: Boolean, default: false },
  answers: [{
    questionId: { type: String, required: true },
    selectedOption: { type: Number, default: null }
  }],
  result: {
    score: { type: Number, default: 0 },
    maxScore: { type: Number, default: 0 },
    correct: { type: Number, default: 0 },
    incorrect: { type: Number, default: 0 },
    unanswered: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 },
    timeTakenSeconds: { type: Number, default: 0 }
  }
}, { timestamps: true })

export default mongoose.model('Attempt', attemptSchema)
