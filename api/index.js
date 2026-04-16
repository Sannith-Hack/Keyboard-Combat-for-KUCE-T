import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY in environment');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// POST /api/students/start
app.post('/api/students/start', async (req, res) => {
  const { name, roll_number, email, college, competition_id } = req.body || {};

  if (!name || !roll_number || !competition_id) {
    return res.status(400).json({ error: 'Missing required fields: name, roll_number, competition_id' });
  }

  try {
    // Avoid duplicate "started" records: if student already started for this competition, return it
    const { data: existing, error: fetchErr } = await supabase
      .from('students')
      .select('*')
      .eq('competition_id', competition_id)
      .eq('roll_number', roll_number)
      .maybeSingle();

    if (fetchErr) {
      console.error('Fetch existing student error:', fetchErr);
      return res.status(500).json({ error: fetchErr.message });
    }

    if (existing && existing.status !== 'completed') {
      return res.json({ data: existing });
    }

    const payload = {
      name,
      roll_number,
      email,
      college,
      competition_id,
      status: 'started',
      start_time: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('students')
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error('Insert student error:', error);
      return res.status(500).json({ error: error.message });
    }

    return res.json({ data });
  } catch (err) {
    console.error('Unexpected error in /api/students/start:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/students/:id/update
app.put('/api/students/:id/update', async (req, res) => {
  const { id } = req.params;
  const payload = req.body || {};

  if (!id) return res.status(400).json({ error: 'Missing student id' });

  try {
    const { data, error } = await supabase
      .from('students')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update student error:', error);
      return res.status(500).json({ error: error.message });
    }

    return res.json({ data });
  } catch (err) {
    console.error('Unexpected error in PUT /api/students/:id/update', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/students?competition_id=...
app.get('/api/students', async (req, res) => {
  const competition_id = req.query.competition_id;

  try {
    let query = supabase.from('students').select('*').in('status', ['started', 'completed']);
    if (competition_id) query = query.eq('competition_id', competition_id);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) {
      console.error('Fetch students error:', error);
      return res.status(500).json({ error: error.message });
    }

    return res.json({ data });
  } catch (err) {
    console.error('Unexpected error in GET /api/students', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Remove app.listen for Vercel
// const PORT = process.env.PORT || 4000;
// app.listen(PORT, () => {
//   console.log(`Students API server running on port ${PORT}`);
// });

export default app;
