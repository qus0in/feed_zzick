/**
 * Hamster Feeder - Synthetic SFX Synthesizer
 * Built programmatically via Web Audio API. Zero asset downloads required!
 */

let audioCtx = null;

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}

/**
 * Sound Synth: Cute Crunchy Bite Effect
 */
function playCrunchSound() {
  initAudio();
  if (!audioCtx) return;
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  const now = audioCtx.currentTime;
  
  // 1. Chew crunch noise
  const bufferSize = audioCtx.sampleRate * 0.08; // Short 80ms crunch
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  
  const noiseNode = audioCtx.createBufferSource();
  noiseNode.buffer = buffer;

  const filter = audioCtx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(1000, now);
  filter.frequency.exponentialRampToValueAtTime(300, now + 0.08);

  const noiseGain = audioCtx.createGain();
  noiseGain.gain.setValueAtTime(0.15, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

  noiseNode.connect(filter);
  filter.connect(noiseGain);
  noiseGain.connect(audioCtx.destination);

  // 2. High-pitch cute "Nom" squeak
  const osc = audioCtx.createOscillator();
  const oscGain = audioCtx.createGain();
  
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(600, now);
  osc.frequency.exponentialRampToValueAtTime(1200, now + 0.06);

  oscGain.gain.setValueAtTime(0.08, now);
  oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

  osc.connect(oscGain);
  oscGain.connect(audioCtx.destination);

  noiseNode.start(now);
  osc.start(now);
  osc.stop(now + 0.08);
}

/**
 * Sound Synth: Retro Magical Arpeggio (On 100% Satiety)
 */
function playHappySound() {
  initAudio();
  if (!audioCtx) return;
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  const now = audioCtx.currentTime;
  const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 arpeggio
  
  notes.forEach((freq, index) => {
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + index * 0.1);
    
    gainNode.gain.setValueAtTime(0.12, now + index * 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + index * 0.1 + 0.3);
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.start(now + index * 0.1);
    osc.stop(now + index * 0.1 + 0.3);
  });
}

/**
 * Sound Synth: Spicy Hazard Siren (On Chili Eaten)
 */
function playSpicySound() {
  initAudio();
  if (!audioCtx) return;
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  const now = audioCtx.currentTime;
  
  // Two-tone alert sound
  [0, 0.15].forEach((delay) => {
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, now + delay);
    osc.frequency.linearRampToValueAtTime(180, now + delay + 0.12);
    
    gainNode.gain.setValueAtTime(0.08, now + delay);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.12);
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.start(now + delay);
    osc.stop(now + delay + 0.12);
  });
}

/**
 * Sound Synth: Playful Bird Thief Chirp (On Interception)
 */
function playChirpSound() {
  initAudio();
  if (!audioCtx) return;
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  const now = audioCtx.currentTime;
  
  // Double high-pitch squeaky chirp (짹짹!)
  [0, 0.08].forEach((delay) => {
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(3000, now + delay);
    osc.frequency.exponentialRampToValueAtTime(4500, now + delay + 0.05);
    
    gainNode.gain.setValueAtTime(0.06, now + delay);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.05);
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.start(now + delay);
    osc.stop(now + delay + 0.05);
  });
}
