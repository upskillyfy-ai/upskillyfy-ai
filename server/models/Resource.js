import mongoose from 'mongoose'

const resourceSchema = new mongoose.Schema({
  resourceId: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, default: 'Cloud & DevOps' },
  type: { type: String, default: 'Cheat Sheet' },
  badge: { type: String, default: 'Placement Essential' },
  badgeType: { type: String, default: 'blue' },
  fileFormat: { type: String, default: 'PDF Guide' },
  fileExt: { type: String, default: 'PDF' },
  fileSize: { type: String, default: '5 MB' },
  pages: { type: String, default: '30 Pages' },
  downloadsCount: { type: String, default: '10,000+' },
  downloadsNum: { type: Number, default: 10000 },
  rating: { type: Number, default: 4.9 },
  author: { type: String, default: 'Upskillyfy AI Guild' },
  updatedAt: { type: String, default: '2026' },
  tags: [{ type: String }],
  previewSummary: { type: String, default: '' },
  sampleSnippet: { type: String, default: '' },
  keyHighlights: [{ type: String }],
  tableOfContents: [{ type: String }],
  downloadFileName: { type: String, default: 'resource.pdf' }
}, { timestamps: true })

export default mongoose.model('Resource', resourceSchema)
