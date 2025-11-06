import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';

// Import our utility functions for using tokens
import {
    generateAccessToken,
    generateRefreshToken,
    storeRefreshToken,
    removeRefreshToken,
    refreshTokenExists,
    REFRESH_TOKEN_SECRET,
    REFRESH_TOKEN_DAYS
} from '../utils/tokens.js';

// Import utility for email verification and password reset
import { sendMail } from '../utils/mailer.js';

/**
 * Modularizes the API endpoints related to user accounts for ease of use in production and testing.
 * Contains the 
 * POST /login, 
 * POST /register, 
 * POST /refresh, and
 * POST /logout,
 * endpoints
 * @param {*} db The MongoDB database to use (use either test or real db)
 * @returns A mini-app that contains the endpoints.
 */
export function createUsersRouter(db) {
    const router = express.Router();
    
    router.post('/login', async (req, res, next) => {
        // expects: {ident, password}
        // ident can be either a username or email
        // produces: {_id: ObjectId(...), firstName, lastName, email, success: True | False, error}

        let ret = {
            _id: -1,
            firstName: '',
            lastName: '',
            email: '',
            success: false,
            error: ''
        };

        try {
            const {ident, password} = req.body;

            if(!(ident?.trim()) || !(password?.trim())){
                ret.error = 'Missing fields';
                res.status(400).json(ret);
                return;
            }

            const account = await db.collection('users').findOne({
                $or: [
                    {user: ident},
                    {email: ident}
                ],
            });

            if(!account || !(await bcrypt.compare(password, account.password))){
                ret.error = 'Invalid username/password';
                res.status(401).json(ret);
                return;
            }

            // generate tokens
            const accessToken = generateAccessToken(account);
            const refreshToken = generateRefreshToken(account);

            // store refresh token server-side
            await storeRefreshToken(db, refreshToken, account._id);

            // detect client type: header X-Client-Type or body.clientType (explicit)
            const headerClient = (req.get('X-Client-Type') || '').toLowerCase();
            const bodyClient = (req.body?.clientType || '').toLowerCase();
            const isMobile = headerClient === 'mobile' || bodyClient === 'mobile';

            ret._id = account._id;
            ret.firstName = account.firstName;
            ret.lastName = account.lastName;
            ret.email = account.email;
            ret.success = true;

            if (isMobile) {
                // Mobile clients expect both tokens in JSON (mobile will store refreshToken securely)
                res.status(200).json({ ...ret, accessToken, refreshToken });
            } else {
                // Web/browser: set refresh token as HttpOnly cookie and return access token in body
                res.cookie('jid', refreshToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    maxAge: REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000
                });
                // also return access token for client use (store in memory)
                res.status(201).json({ ...ret, accessToken });
            }
        }
        catch(err) {
            console.error('Error in /api/users/login:', err.message);
            ret.success = false;
            ret.error = 'Database error occurred';
            res.status(500).json(ret);
        }
    });
    
    router.post('/register', async (req, res) => {
      const ret = { _id: -1, success: false, error: '' };

      try {
        const { firstName, lastName = '', user, email, password } = req.body || {};
        if (!(firstName?.trim()) || !(user?.trim()) || !(email?.trim()) || !(password?.trim())) {
          return res.status(400).json({ ...ret, error: 'Missing fields' });
        }

        const uname = user.trim();
        const mail = email.trim().toLowerCase();

        // Pre-check duplicates
        const existing = await db.collection('users').findOne({
          $or: [{ user: uname }, { email: mail }]
        });
        if (existing) {
          return res.status(409).json({ _id: -1, success: false, error: 'Username/email already in use' });
        }

        const hashed = await bcrypt.hash(password, 10);

        const ins = await db.collection('users').insertOne({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          user: uname,
          email: mail,
          password: hashed,
          isVerified: false,
        });

        res.status(201).json({ _id: ins.insertedId, success: true, error: '' });

        // Skip email during tests to avoid open handles/logs
        const isRunningTests = !!process.env.JEST_WORKER_ID;
        if (!isRunningTests) {
          const verifyToken = jwt.sign(
            { id: ins.insertedId.toString(), email: mail, aud: 'email_verify' },
            process.env.JWT_EMAIL_SECRET || 'temp_secret',
            { expiresIn: '1h' }
          );
          const verifyUrl = `http://4lokofridays.com/api/users/verify-email?token=${encodeURIComponent(verifyToken)}`;

          sendMail({
            to: mail,
            subject: 'Verify your email',
            html: `
              <p>Hi ${firstName.trim()},</p>
              <p>Click below to verify your email (expires in 1 hour):</p>
              <p><a href="${verifyUrl}">${verifyUrl}</a></p>
            `
          }).catch(err => console.error('Verification email failed:', err?.message || err));
        }
      } catch (err) {
        if (err?.code === 11000) {
          return res.status(409).json({ _id: -1, success: false, error: 'Username/email already in use' });
        }
        console.error('Register error:', err);
        return res.status(500).json({ _id: -1, success: false, error: 'Database error occurred' });
        }
    });

    router.post('/refresh', async (req, res) => {
        const token = req.cookies?.jid || req.body?.refreshToken || req.get('x-refresh-token');
        if(!token) return res.sendStatus(401);

        // check if exists in DB
        if(!(await refreshTokenExists(db, token))) return res.sendStatus(403);

        jwt.verify(token, REFRESH_TOKEN_SECRET, async (err, payload) => {
            if(err) return res.sendStatus(403);
            // payload should contain user id
            const userId = payload.id;
            const account = await db.collection('users').findOne({_id: new ObjectId(userId)});
            if(!account) return res.sendStatus(403);
            const accessToken = generateAccessToken(account);
            res.json({ accessToken });
        });
    });

    // Logout endpoint
    router.post('/logout', async (req, res) => {
        const token = req.cookies?.jid;
        if(token) await removeRefreshToken(db, token);
        res.clearCookie('jid');
        res.sendStatus(204);
    });

       router.get('/verify-email', async (req, res) => {
    try {
        const { token } = req.query;
    
    if (!token) {
      return res.status(400).send('Verification token is missing');
    }

    // Verify the JWT token
    const decoded = jwt.verify(token, process.env.JWT_EMAIL_SECRET || 'temp_secret');
    
    // Check if token is for email verification
    if (decoded.aud !== 'email_verify') {
      return res.status(400).send('Invalid token');
    }

    // Update user's isVerified status
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(decoded.id) },
      { $set: { isVerified: true } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).send('User not found');
    }

    // Redirect to your frontend verification success page
    res.redirect('http://4lokofridays.com/verify/success');
    
  } catch (err) {
    console.error('Email verification error:', err);
    if (err.name === 'TokenExpiredError') {
      return res.status(400).send('Verification link has expired');
    }
    res.status(500).send('Verification failed');
  }
});

// New for Password Reset

// Request password reset - sends email with reset link
router.post('/request-password-reset', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email?.trim()) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }

    const mail = email.trim().toLowerCase();
    
    // Find user by email
    const user = await db.collection('users').findOne({ email: mail });
    
    // Don't reveal if user exists or not 
    if (!user) {
      return res.status(200).json({ success: true, message: 'If account exists, reset email sent' });
    }

    // Skip email during tests
    const isRunningTests = !!process.env.JEST_WORKER_ID;
    if (!isRunningTests) {
      // Create reset token (expires in 1 hour)
      const resetToken = jwt.sign(
        { id: user._id.toString(), email: mail, aud: 'password_reset' },
        process.env.JWT_EMAIL_SECRET || 'temp_secret',
        { expiresIn: '1h' }
      );

      const resetUrl = `http://4lokofridays.com/change-password?token=${encodeURIComponent(resetToken)}`;

      await sendMail({
        to: mail,
        subject: 'Reset your password',
        html: `
          <p>Hi ${user.firstName},</p>
          <p>Click below to reset your password (expires in 1 hour):</p>
          <p><a href="${resetUrl}">${resetUrl}</a></p>
          <p>If you didn't request this, please ignore this email.</p>
        `
      }).catch(err => console.error('Password reset email failed:', err?.message || err));
    }

    res.status(200).json({ success: true, message: 'If account exists, reset email sent' });
    
  } catch (err) {
    console.error('Password reset request error:', err);
    res.status(500).json({ success: false, error: 'Server error occurred' });
  }
});

// Reset password with token
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword?.trim()) {
      return res.status(400).json({ success: false, error: 'Token and password required' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_EMAIL_SECRET || 'temp_secret');
    
    if (decoded.aud !== 'password_reset') {
      return res.status(400).json({ success: false, error: 'Invalid token' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(decoded.id) },
      { $set: { password: hashedPassword } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.status(200).json({ success: true, message: 'Password reset successfully' });
    
  } catch (err) {
    console.error('Password reset error:', err);
    if (err.name === 'TokenExpiredError') {
      return res.status(400).json({ success: false, error: 'Reset link has expired' });
    }
    res.status(400).json({ success: false, error: 'Invalid or expired token' });
  }
});
    
return router;
}
