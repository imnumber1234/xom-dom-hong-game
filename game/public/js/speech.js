// Mic → Vietnamese transcript via Web Speech API (Chrome/Edge/Safari).
// Flow per Lucas: hold mic → speak → transcript SHOWS on screen → sent to the NPC brain.
// No mic / unsupported browser → text input is always there.
XDH.Speech = (function () {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  let rec = null;
  let listening = false;
  let finalText = '';
  let cbs = {};

  const supported = !!SR;

  function start(callbacks) {
    if (!SR || listening) return false;
    cbs = callbacks || {};
    rec = new SR();
    rec.lang = 'vi-VN';
    rec.interimResults = true;      // live transcript while speaking
    rec.continuous = true;          // keep going until released
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
      cbs.onError && cbs.onError(e.error); // 'not-allowed', 'no-speech', 'network'...
    };
    rec.onend = () => {
      const wasListening = listening;
      listening = false;
      if (wasListening) cbs.onDone && cbs.onDone(finalText.trim());
    };

    try { rec.start(); listening = true; return true; }
    catch (err) { listening = false; cbs.onError && cbs.onError(String(err)); return false; }
  }

  function stop() {
    if (rec && listening) { try { rec.stop(); } catch (_) {} }
  }

  function isListening() { return listening; }

  return { supported, start, stop, isListening };
})();
