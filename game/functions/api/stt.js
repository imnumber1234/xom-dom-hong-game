// POST /api/stt — server-side speech-to-text via Workers AI Whisper.
// Exists because Web Speech API only works in Chrome/Edge (Brave/Firefox/webviews
// fire a 'network' error: no Google speech backend). Client records audio
// (webm/opus or mp4) and posts the raw bytes here; we return the transcript.

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { 'Content-Type': 'application/json; charset=utf-8' }
  });
}

export async function onRequestPost({ request, env }) {
  if (!env.AI) return json({ ok: false, error: 'AI binding missing' }, 500);
  const lang = new URL(request.url).searchParams.get('lang') === 'en' ? 'en' : 'vi';

  const buf = await request.arrayBuffer();
  if (!buf.byteLength) return json({ ok: false, error: 'no audio' }, 400);
  if (buf.byteLength > 2_500_000) return json({ ok: false, error: 'audio quá dài (tối đa ~15 giây)' }, 413);

  const bytes = new Uint8Array(buf);
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) {
    bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  }
  const b64 = btoa(bin);

  try {
    const r = await env.AI.run('@cf/openai/whisper-large-v3-turbo', {
      audio: b64,
      language: lang,
      vad_filter: true
    });
    return json({ ok: true, text: (r && r.text || '').trim(), model: 'whisper-turbo' });
  } catch (e1) {
    // Older Whisper model takes a plain byte array instead of base64.
    try {
      const r2 = await env.AI.run('@cf/openai/whisper', { audio: [...bytes] });
      return json({ ok: true, text: (r2 && r2.text || '').trim(), model: 'whisper' });
    } catch (e2) {
      console.log('stt error', String(e1 && e1.message), String(e2 && e2.message));
      return json({ ok: false, error: 'stt failed' }, 502);
    }
  }
}
