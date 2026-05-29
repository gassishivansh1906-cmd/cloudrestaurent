import { query } from '../config/db.js';

export async function createMessage(req, res, next) {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'name, email and message are required' });
    }
    await query(
      `INSERT INTO dbo.ContactMessages (Name, Email, Subject, Message)
       VALUES (@Name, @Email, @Subject, @Message)`,
      { Name: name, Email: email, Subject: subject || null, Message: message }
    );
    res.status(201).json({ message: 'Message received. We will get back to you shortly.' });
  } catch (err) {
    next(err);
  }
}

export async function listMessages(req, res, next) {
  try {
    const result = await query('SELECT * FROM dbo.ContactMessages ORDER BY CreatedAt DESC');
    res.json(result.recordset);
  } catch (err) {
    next(err);
  }
}
