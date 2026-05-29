import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';

function signToken(user) {
  return jwt.sign(
    { id: user.Id, email: user.Email, role: user.Role, name: user.FullName },
    process.env.JWT_SECRET || 'dev-secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

export async function register(req, res, next) {
  try {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'fullName, email and password are required' });
    }

    const existing = await query('SELECT Id FROM dbo.Users WHERE Email = @Email', { Email: email });
    if (existing.recordset.length > 0) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    const hash = await bcrypt.hash(password, 10);
    const result = await query(
      `INSERT INTO dbo.Users (FullName, Email, PasswordHash, Role)
       OUTPUT INSERTED.Id, INSERTED.FullName, INSERTED.Email, INSERTED.Role
       VALUES (@FullName, @Email, @PasswordHash, 'customer')`,
      { FullName: fullName, Email: email, PasswordHash: hash }
    );

    const user = result.recordset[0];
    res.status(201).json({ token: signToken(user), user: { id: user.Id, name: user.FullName, email: user.Email, role: user.Role } });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }

    const result = await query('SELECT * FROM dbo.Users WHERE Email = @Email', { Email: email });
    const user = result.recordset[0];
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.PasswordHash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    res.json({ token: signToken(user), user: { id: user.Id, name: user.FullName, email: user.Email, role: user.Role } });
  } catch (err) {
    next(err);
  }
}

export async function me(req, res) {
  res.json({ user: req.user });
}
