import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Fungsi untuk memformat tanggal
const formatDate = (dateStr: string | null) => {
  if (!dateStr) return 'Present';
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(date);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get('user_id');

    if (!userId) {
      return new Response(JSON.stringify({ error: 'user_id is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // Ambil semua data secara paralel
    const [
      profileRes,
      skillsRes,
      experienceRes,
      educationRes,
      socialsRes
    ] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('skills').select('*').eq('user_id', userId),
      supabase.from('experience').select('*').eq('user_id', userId).order('start_date', { ascending: false }),
      supabase.from('education').select('*').eq('user_id', userId).order('start_date', { ascending: false }),
      supabase.from('social_media_links').select('*').eq('user_id', userId)
    ]);

    if (profileRes.error) throw profileRes.error;
    
    const profile = profileRes.data;
    const skills = skillsRes.data || [];
    const experiences = experienceRes.data || [];
    const educations = educationRes.data || [];
    const socials = socialsRes.data || [];

    // Buat konten HTML
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>CV - ${profile.name}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; line-height: 1.6; color: #333; background-color: #f9f9f9; margin: 0; padding: 0; }
          .container { max-width: 800px; margin: 2rem auto; background: #fff; padding: 2.5rem; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px; }
          h1, h2, h3 { color: #1a202c; margin-top: 0; }
          h1 { font-size: 2.5rem; text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 1rem; margin-bottom: 1rem; }
          h2 { font-size: 1.5rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.5rem; margin-top: 2rem; margin-bottom: 1rem; }
          .contact-info { text-align: center; margin-bottom: 2rem; }
          .contact-info a { color: #2b6cb0; text-decoration: none; margin: 0 0.5rem; }
          .section { margin-bottom: 1.5rem; }
          .job, .edu-item { margin-bottom: 1rem; }
          .job-title { font-weight: bold; font-size: 1.1rem; }
          .company, .institution { font-style: italic; color: #4a5568; }
          .date { color: #718096; font-size: 0.9rem; }
          .skills-list { list-style: none; padding: 0; display: flex; flex-wrap: wrap; gap: 0.5rem; }
          .skills-list li { background-color: #edf2f7; color: #4a5568; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.9rem; }
          p { margin-top: 0.5rem; }
          @media print {
            body { background-color: #fff; }
            .container { box-shadow: none; border: 1px solid #ddd; margin: 0; padding: 1.5rem; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>${profile.name || 'Nama Tidak Tersedia'}</h1>
          <div class="contact-info">
            ${profile.location ? `<span>${profile.location}</span> | ` : ''}
            ${socials.map(s => `<a href="${s.url}" target="_blank">${s.platform}</a>`).join(' | ')}
          </div>

          <div class="section">
            <h2>Summary</h2>
            <p>${profile.bio || 'Bio tidak tersedia.'}</p>
          </div>

          <div class="section">
            <h2>Work Experience</h2>
            ${experiences.map(exp => `
              <div class="job">
                <div class="job-title">${exp.role}</div>
                <div class="company">${exp.company}</div>
                <div class="date">${formatDate(exp.start_date)} - ${formatDate(exp.end_date)}</div>
                <p>${exp.description || ''}</p>
              </div>
            `).join('')}
          </div>

          <div class="section">
            <h2>Education</h2>
            ${educations.map(edu => `
              <div class="edu-item">
                <div class="job-title">${edu.institution}</div>
                <div class="institution">${edu.degree || ''} - ${edu.field_of_study || ''}</div>
                <div class="date">${formatDate(edu.start_date)} - ${formatDate(edu.end_date)}</div>
              </div>
            `).join('')}
          </div>

          <div class="section">
            <h2>Skills</h2>
            <ul class="skills-list">
              ${skills.map(skill => `<li>${skill.name}</li>`).join('')}
            </ul>
          </div>
        </div>
      </body>
      </html>
    `;

    return new Response(htmlContent, {
      headers: { ...corsHeaders, 'Content-Type': 'text/html' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});