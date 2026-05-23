import jwt from 'jsonwebtoken';
import config from '@/config/index';

/**
 * Sign a JWT for the given user.
 * @param {string} userId
 * @param {string} role
 * @returns {string} signed JWT
 */
export function signToken(userId, role) {
  return jwt.sign(
    { userId: String(userId), role },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
}

/**
 * Verify and decode a JWT.
 * @param {string} token
 * @returns {{ userId: string, role: string }} decoded payload
 * @throws {Error} if token is invalid or expired
 */
export function verifyToken(token) {
  return jwt.verify(token, config.jwt.secret);
}
