// Mic → Vietnamese transcript. Two engines, one interface:
//   1) 'webspeech' — Web Speech API (Chrome/Edge/Safari): free, live partials.
//   2) 'recorder'  — MediaRecorder → POST /api/stt (Workers AI Whisper): works in
//      Brave/Firefox/webviews where Web Speech fires a 'network' error (no Google backend).
// A 'network'/'service-not-allowed' error permanently flips this session to 'recorder'.
// No mic at all → text input is always there.
XDH.Speech = (function () {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const canRecord = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder);

  let mode = SR ? 'webspeech' : (canRecord ? 'recorder' : 'none');
  const supported = mode !== 'none';

  let rec = null;            // webspeech recognizer
  let media = null;          // MediaRecorder
  let stream = null;
  let chunks = [];
  let listening = false;
  let starting = false;      // getUserMedia in flight
  let pendingStop = false;   // released the button before recording began
  let maxTimer = null;
  let finalText = '';
  let cbs = {};

  function start(callbacks) {
    if (!supported || listening || starting) return false;
    cbs = callbacks || {};
    return mode === 'webspeech' ? startWebSpeech() : startRecorder();
  }

  // ---- engine 1: Web Speech API ----
  function startWebSpeech() {
    rec = new SR();
    rec.lang = (window.XDH && XDH.lang === 'en') ? 'en-US' : 'vi-VN';
    rec.interimResults = true;
    rec.continuous = true;
    finalText = '';

    rec.onresult = (e) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finalText += r[0].transcript;
        else interim += r[0].transcript;
      }
      cbs.onPartial && cbs.onPartial((finalText + ' ' + interim).trim());
    };
    rec.onerror = (e) => {
      listening = false;
      // Brave & friends: SpeechRecognition object exists but no speech service.
      if ((e.error === 'network' || e.error === 'service-not-allowed' || e.error === 'language-not-supported') && canRecord) {
        mode = 'recorder';
        cbs.onError && cbs.onError('fallback');   // UI: "chuyển mic dự phòng, giữ nút nói lại nhé"
        return;
      }
      cbs.onError && cbs.onError(e.error);        // 'not-allowed', 'no-speech'...
    };
    rec.onend = () => {
      const was = listening;
      listening = false;
      if (was) cbs.onDone && cbs.onDone(finalText.trim());
    };

    try { rec.start(); listening = true; return true; }
    catch (err) { listening = false; cbs.onError && cbs.onError(String(err)); return false; }
  }

  // ---- engine 2: MediaRecorder → /api/stt ----
  function startRecorder() {
    starting = true; pendingStop = false;
    navigator.mediaDevices.getUserMedia({ audio: true }).then(s => {
      starting = false;
      stream = s;
      const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4' : '';
      media = new MediaRecorder(s, mime ? { mimeType: mime } : undefined);
      chunks = [];
      media.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
      media.onstop = onRecorderStop;
      media.start();
      listening = true;
      cbs.onPartial && cbs.onPartial('đang nghe… (thả nút để gửi)');
      clearTimeout(maxTimer);
      maxTimer = setTimeout(stop, 15000);          // hard cap: 15s per line
      if (pendingStop) stop();                      // button already released
    }).catch(err => {
      starting = false; listening = false;
      cbs.onError && cbs.onError(err && err.name === 'NotAllowedError' ? 'not-allowed' : String(err));
    });
    return true;
  }

  async function onRecorderStop() {
    clearTimeout(maxTimer);
    listening = false;
    if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null; }
    const blob = new Blob(chunks, { type: (media && media.mimeType) || 'audio/webm' });
    chunks = [];
    if (blob.size < 1500) { cbs.onDone && cbs.onDone(''); return; }   // held too briefly
    cbs.onPartial && cbs.onPartial('đang dịch giọng nói… ⏳');
    try {
      const r = await fetch('/api/stt?lang=' + ((window.XDH && XDH.lang) || 'vi'), {
        method: 'POST',
        headers: { 'Content-Type': blob.type || 'application/octet-stream' },
        body: blob
      });
      const j = await r.json();
      if (!r.ok || !j.ok) throw new Error(j.error || ('HTTP ' + r.status));
      cbs.onDone && cbs.onDone((j.text || '').trim());
    } catch (err) {
      cbs.onError && cbs.onError('stt-' + err.message);
    }
  }

  function stop() {
    if (mode === 'webspeech') {
      if (rec && listening) { try { rec.stop(); } catch (_) {} }
      return;
    }
    if (starting) { pendingStop = true; return; }
    if (media && media.state === 'recording') { try { media.stop(); } catch (_) {} }
  }

  function isListening() { return listening; }
  function currentMode() { return mode; }

  return { supported, start, stop, isListening, mode: currentMode };
})();
