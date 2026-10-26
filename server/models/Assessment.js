import mongoose from 'mongoose'

const questionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  text: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true },
  marks: { type: Number, default: 1 },
  negativeMarks: { type: Number, default: 0.25 },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  topic: { type: String, default: '' },
  explanation: { type: String, default: '' }
}, { _id: false })

const assessmentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  branchId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  duration: { type: Number, required: true }, // Duration in minutes
  totalMarks: { type: Number, required: true },
  questionsCount: { type: Number, required: true },
  markingScheme: {
    positive: { type: Number, default: 1 },
    negative: { type: Number, default: 0.25 },
    description: { type: String, default: '+1 for correct, -0.25 for incorrect, 0 for unattempted' }
  },
  questions: [questionSchema]
}, { timestamps: true })

export default mongoose.model('Assessment', assessmentSchema)
