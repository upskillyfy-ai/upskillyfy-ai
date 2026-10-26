import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const getJwtSecret = () => process.env.JWT_SECRET || 'upskillyfy_super_secret_key_2026'

/**
 * Protect routes: requires valid Bearer JWT token
 */
export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required. Please login.' })
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, getJwtSecret())

    const user = await User.findById(decoded.id).select('-password')
    if (!user) {
      return res.status(401).json({ message: 'User account not found' })
    }

    req.user = user
    next()
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token. Please login again.' })
  }
}

/**
 * Restrict to administrators
 */
export const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied: Admin privileges required.' })
  }
  next()
}

/**
 * Optional authentication: attaches user if valid token exists, but doesn't block if missing
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1]
      const decoded = jwt.verify(token, getJwtSecret())
      const user = await User.findById(decoded.id).select('-password')
      if (user) req.user = user
    }
  } catch {
    // Continue without user if token is invalid or expired
  }
  next()
}