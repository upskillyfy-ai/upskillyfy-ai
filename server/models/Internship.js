import mongoose from 'mongoose'

const internshipSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true, trim: true },
  title: { type: String, required: true, trim: true },
  company: { type: String, required: true, trim: true },
  category: { type: String, default: 'fullstack' },
  categoryLabel: { type: String, default: 'Full-Stack & Backend' },
  location: { type: String, default: 'Remote' },
  mode: { type: String, enum: ['Remote', 'Hybrid', 'In-Office', 'On-site'], default: 'Remote' },
  stipend: { type: String, default: 'Performance Based' },
  duration: { type: String, default: '3 Months' },
  deadline: { type: String, default: 'Open' },
  openings: { type: Number, default: 1 },
  applicantsCount: { type: Number, default: 0 },
  skills: [{ type: String }],
  ppoOffered: { type: Boolean, default: false },
  ppoPackage: { type: String, default: '' },
  overview: { type: String, default: '' },
  responsibilities: [{ type: String }],
  requirements: [{ type: String }],
  perks: [{ type: String }],
  isVerified: { type: Boolean, default: true }
}, { timestamps: true })

export default mongoose.model('Internship', internshipSchema)