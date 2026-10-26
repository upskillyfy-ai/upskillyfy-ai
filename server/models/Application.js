import mongoose from 'mongoose'

const applicationSchema = new mongoose.Schema({
  applicationId: { type: String, unique: true, index: true },
  internship: { type: mongoose.Schema.Types.ObjectId, ref: 'Internship', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String, required: true, trim: true },
  college: { type: String, default: '', trim: true },
  batch: { type: String, default: '2026', trim: true },
  resumeUrl: { type: String, required: true, trim: true },
  portfolioUrl: { type: String, default: '', trim: true },
  pitch: { type: String, default: '', trim: true },
  status: { 
    type: String, 
    enum: ['Applied', 'Reviewing', 'Shortlisted', 'Rejected'], 
    default: 'Applied' 
  }
}, { timestamps: true })

export default mongoose.model('Application', applicationSchema)
