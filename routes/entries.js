const express = require('express');
const router = express.Router();
const pool = require('../db');
const requireAuth = require('../middleware/auth');

// Add a new entry (personal or business)
router.post('/entries', requireAuth, async (req, res) => {
  const { type, category, amount, entry_date, note } = req.body;
  if (!type || !category || amount === undefined) {
    return res.status(400).json({ error: 'type, category, and amount are required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO entries (user_id, type, category, amount, entry_date, note)
       VALUES ($1, $2, $3, $4, COALESCE($5, CURRENT_DATE), $6) RETURNING *`,
      [req.userId, type, category, amount, entry_date, note]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not save entry' });
  }
});

// Dashboard summary — shaped to match the frontend's `data` object exactly,
// so the CodePen JS just needs to fetch this instead of using hardcoded values.
router.get('/dashboard', requireAuth, async (req, res) => {
  try {
    const entries = await pool.query(
      'SELECT * FROM entries WHERE user_id = $1 ORDER BY entry_date',
      [req.userId]
    );
    const rows = entries.rows;

    const personal = rows.filter(r => r.type === 'personal');