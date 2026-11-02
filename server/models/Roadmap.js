import mongoose from 'mongoose'

const milestoneSchema = new mongoose.Schema({
  step: { type: Number, required: true },
  title: { type: String, required: true },
  duration: { type: String, default: '' },
  summary: { type: String, default: '' },
  skills: [{ type: String }],
  project: { type: String, default: '' }
}, { _id: false })

const roadmapSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true, trim: true },
  title: { type: String, required: true, trim: true },
  category: { type: String, default: 'General' },
  level: { type: String, default: 'Beginner to Pro' },
  duration: { type: String, default: '6 Months' },
  months: { type: Number, default: 6 },
  thumbnail: { type: String, default: '' },
  badge: { type: String, default: 'High Demand' },
  badgeType: { type: String, default: 'blue' },
  overview: { type: String, default: '' },
  skills: [{ type: String }],
  targetRoles: [{ type: String }],
  relatedCourseId: { type: String, default: '' },
  relatedCourseTitle: { type: String, default: '' },
  milestones: [milestoneSchema],
  isVerified: { type: Boolean, default: true }
}, { timestamps: true })

export default mongoose.model('Roadmap', roadmapSchema)

