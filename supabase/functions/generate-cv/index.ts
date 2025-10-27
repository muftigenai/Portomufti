import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { render } from "https://deno.land/x/wasm_pdf@v0.2.6/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return 'Present';
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date);
};

const formatDescription = (desc: string | null) => {
  if (!desc) return '';
  // Split description by newlines and wrap each line in a list item
  return `
    <ul class="description-list">
      ${desc.split('\n').map(line => `<li>${line.trim()}</li>`).join('')}
    </ul>
  `;
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

    const [
      profileRes,
      skillsRes,
      experienceRes,
      educationRes,
    ] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('skills').select('*').eq('user_id', userId),
      supabase.from('experience').select('*').eq('user_id', userId).order('start_date', { ascending: false }),
      supabase.from('education').select('*').eq('user_id', userId).order('start_date', { ascending: false }),
    ]);

    if (profileRes.error) throw profileRes.error;
    
    const profile = profileRes.data;
    const experiences = experienceRes.data || [];
    const educations = educationRes.data || [];

    const avatarUrl = profile.photo_url 
      ? supabase.storage.from('avatars').getPublicUrl(profile.photo_url).data.publicUrl
      : '';

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>CV - ${profile.name}</title>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 10pt; line-height: 1.5; color: #333; background-color: #fff; margin: 0; }
          .page { padding: 40px; max-width: 800px; margin: auto; }
          .header { text-align: left; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
          .header h1 { font-size: 24pt; margin: 0; text-transform: uppercase; letter-spacing: 2px; }
          .header .contact-info { font-size: 9pt; color: #555; margin-top: 5px; }
          .main-content { display: flex; flex-direction: row; gap: 20px; }
          .left-col { flex-basis: 120px; flex-shrink: 0; }
          .right-col { flex-grow: 1; }
          .photo { width: 120px; height: auto; object-fit: cover; }
          .summary { margin-top: 0; text-align: justify; }
          .section-title { font-size: 14pt; font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 5px; margin-top: 20px; margin-bottom: 15px; }
          .item { margin-bottom: 15px; page-break-inside: avoid; }
          .item-header { display: flex; justify-content: space-between; align-items: baseline; }
          .item-title { font-size: 11pt; font-weight: bold; margin: 0; }
          .item-subtitle { font-style: italic; margin: 2px 0; }
          .item-date { font-size: 10pt; color: #555; white-space: nowrap; }
          .description-list { padding-left: 20px; margin-top: 5px; }
          .description-list li { margin-bottom: 3px; }
        </style>
      </head>
      <body>
        <div class="page">
          <div class="header">
            <h1>${profile.name || ''}</h1>
            <div class="contact-info">${profile.location || ''}</div>
          </div>
          <div class="main-content">
            <div class="left-col">
              ${avatarUrl ? `<img src="${avatarUrl}" alt="Profile Photo" class="photo">` : ''}
            </div>
            <div class="right-col">
              <p class="summary">${profile.bio || ''}</p>
            </div>
          </div>
          
          <div class="section-title">Pendidikan</div>
          ${educations.map(edu => `
            <div class="item">
              <div class="item-header">
                <div class="item-title">${edu.institution} - ${edu.degree || ''}</div>
                <div class="item-date">${formatDate(edu.start_date)} - ${formatDate(edu.end_date)}</div>
              </div>
              <div class="item-subtitle">${edu.field_of_study || ''}</div>
            </div>
          `).join('')}

          <div class="section-title">Pengalaman Kerja</div>
          ${experiences.map(exp => `
            <div class="item">
              <div class="item-header">
                <div class="item-title">${exp.company}</div>
                <div class="item-date">${formatDate(exp.start_date)} - ${formatDate(exp.end_date)}</div>
              </div>
              <div class="item-subtitle">${exp.role}</div>
              ${formatDescription(exp.description)}
            </div>
          `).join('')}
        </div>
      </body>
      </html>
    `;

    const pdfBuffer = await render(htmlContent);
    const pdfFilename = `CV-${profile.name?.replace(/\s+/g, '_') || 'Portfolio'}.pdf`;

    return new Response(pdfBuffer, {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${pdfFilename}"`,
      },
    });

  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});