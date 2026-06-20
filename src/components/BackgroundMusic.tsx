import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { EMOTIONS, EMOTION_COMBINATIONS, getDominantEmotion } from '../data/emotions';
import { EmotionType } from '../types/game';

type MusicMood = 'upbeat' | 'melancholic' | 'epic' | 'nostalgic' | 'peaceful';

const MOOD_SCALES: Record<MusicMood, number[]> = {
  upbeat: [0, 2, 4, 5, 7, 9, 11, 12],
  melancholic: [0, 2, 3, 5, 7, 8, 10, 12],
  epic: [0, 3, 5, 7, 8, 10, 12, 15],
  nostalgic: [0, 2, 4, 7, 9, 12, 14, 16],
  peaceful: [0, 2, 4, 7, 9, 11, 12, 14],
};

const MOOD_TEMPO: Record<MusicMood, number> = {
  upbeat: 660,
  melancholic: 1100,
  epic: 780,
  nostalgic: 950,
  peaceful: 1000,
};

const NOTE_FREQUENCIES = [
  261.63, 293.66, 311.13, 329.63, 349.23, 392.00, 415.30,
  440.00, 466.16, 493.88, 523.25, 554.37, 587.33, 622.25,
  659.25, 698.46, 783.99, 830.61, 880.00, 987.77, 1046.50,
];

const EMOTION_MOOD_MAP: Record<EmotionType, MusicMood> = {
  joy: 'upbeat',
  regret: 'melancholic',
  courage: 'epic',
  longing: 'nostalgic',
};

export const BackgroundMusic = () => {
  const {
    isMusicPlaying,
    musicVolume,
    emotionCounts,
    activeCombinationId,
    toggleMusic,
  } = useGameStore();

  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const padGainRef = useRef<GainNode | null>(null);
  const melodyGainRef = useRef<GainNode | null>(null);
  const nextNoteTimerRef = useRef<number | null>(null);
  const padNodesRef = useRef<OscillatorNode[]>([]);
  const lastNoteIdxRef = useRef(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'm' && !e.repeat) {
        e.preventDefault();
        ensureContext();
        toggleMusic();
      }
      if (e.key === 'Escape') {
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleMusic]);

  const ensureContext = () => {
    if (!audioCtxRef.current) {
      const Ctx = (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
      audioCtxRef.current = new Ctx();
      const ctx = audioCtxRef.current;

      masterGainRef.current = ctx.createGain();
      masterGainRef.current.gain.value = 0;
      masterGainRef.current.connect(ctx.destination);

      padGainRef.current = ctx.createGain();
      padGainRef.current.gain.value = 0;
      padGainRef.current.connect(masterGainRef.current);

      melodyGainRef.current = ctx.createGain();
      melodyGainRef.current.gain.value = 0;
      melodyGainRef.current.connect(masterGainRef.current);
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const determineMood = (): MusicMood => {
    const activeCombo = EMOTION_COMBINATIONS.find(c => c.id === activeCombinationId);
    if (activeCombo) {
      return activeCombo.musicMood;
    }
    const dominant = getDominantEmotion(emotionCounts);
    if (dominant) {
      return EMOTION_MOOD_MAP[dominant];
    }
    return 'peaceful';
  };

  const stopAllPadNodes = () => {
    padNodesRef.current.forEach(node => {
      try {
        node.stop();
        node.disconnect();
      } catch (_) {}
    });
    padNodesRef.current = [];
  };

  const startPad = (mood: MusicMood) => {
    const ctx = audioCtxRef.current!;
    const padGain = padGainRef.current!;

    stopAllPadNodes();

    const scale = MOOD_SCALES[mood];
    const baseNotes = [0, 2, 4, 7].map(i => 60 + scale[i % scale.length]);
    const emotion = determineDominantEmotionForColor();
    const detuneBase = emotion === 'regret' ? -8 : emotion === 'courage' ? 6 : 0;

    baseNotes.forEach((midi, idx) => {
      const freq = midiToFreq(midi - 24);
      const osc = ctx.createOscillator();
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.value = freq;
      osc.detune.value = detuneBase + (Math.random() - 0.5) * 10;

      const g = ctx.createGain();
      g.gain.value = 0;

      osc.connect(g);
      g.connect(padGain);

      const volumePerPad = idx === 0 ? 0.10 : 0.06;
      const now = ctx.currentTime;
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(volumePerPad, now + 4 + idx * 0.5);

      osc.start();
      padNodesRef.current.push(osc);
    });
  };

  const midiToFreq = (midi: number): number => {
    const idx = Math.max(0, Math.min(NOTE_FREQUENCIES.length - 1, midi - 60 + NOTE_FREQUENCIES.length / 2));
    const approx = 440 * Math.pow(2, (midi - 69) / 12);
    return NOTE_FREQUENCIES[Math.round(idx)] || approx;
  };

  const determineDominantEmotionForColor = (): EmotionType | null => {
    return getDominantEmotion(emotionCounts);
  };

  const scheduleNextNote = (mood: MusicMood) => {
    if (!isMusicPlaying || !audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const melodyGain = melodyGainRef.current!;
    const scale = MOOD_SCALES[mood];

    const intervals = [2, 4, 5, 7, 9, 11, 12, 9, 7, 5, 4, 2, 0, -2, 0];
    let idx = (lastNoteIdxRef.current + 1) % intervals.length;
    if (Math.random() < 0.35) {
      idx = Math.floor(Math.random() * intervals.length);
    }
    lastNoteIdxRef.current = idx;

    const intervalIdx = intervals[idx];
    const scaleDegree = scale[((intervalIdx % scale.length) + scale.length) % scale.length];
    const octave = 72 + Math.floor(intervalIdx / scale.length) * 12;
    const noteFreq = midiToFreq(octave + scaleDegree);

    const now = ctx.currentTime;
    const noteDur = MOOD_TEMPO[mood] / 1000 * (0.85 + Math.random() * 0.3);

    const osc = ctx.createOscillator();
    osc.type = mood === 'epic' ? 'sawtooth' : mood === 'upbeat' ? 'square' : 'sine';
    osc.frequency.value = noteFreq;

    const oscGain = ctx.createGain();
    oscGain.gain.setValueAtTime(0, now);
    oscGain.gain.linearRampToValueAtTime(mood === 'epic' ? 0.06 : 0.045, now + noteDur * 0.1);
    oscGain.gain.setValueAtTime(mood === 'epic' ? 0.06 : 0.045, now + noteDur * 0.5);
    oscGain.gain.linearRampToValueAtTime(0, now + noteDur);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = mood === 'melancholic' ? 1400 : mood === 'epic' ? 3200 : 2200;

    osc.connect(filter);
    filter.connect(oscGain);
    oscGain.connect(melodyGain);

    osc.start(now);
    osc.stop(now + noteDur + 0.05);

    if (Math.random() < 0.45 && mood !== 'melancholic') {
      const harmonyInterval = [3, 4, 5, 7][Math.floor(Math.random() * 4)];
      const hFreq = midiToFreq(octave + scaleDegree + harmonyInterval);
      const hOsc = ctx.createOscillator();
      hOsc.type = 'triangle';
      hOsc.frequency.value = hFreq;
      const hGain = ctx.createGain();
      hGain.gain.setValueAtTime(0, now + 0.08);
      hGain.gain.linearRampToValueAtTime(0.02, now + 0.08 + noteDur * 0.15);
      hGain.gain.linearRampToValueAtTime(0, now + noteDur + 0.15);
      hOsc.connect(hGain);
      hGain.connect(melodyGain);
      hOsc.start(now + 0.08);
      hOsc.stop(now + noteDur + 0.2);
    }

    if (nextNoteTimerRef.current) {
      window.clearTimeout(nextNoteTimerRef.current);
    }
    nextNoteTimerRef.current = window.setTimeout(() => {
      const nextMood = determineMood();
      scheduleNextNote(nextMood);
    }, MOOD_TEMPO[mood] + (Math.random() - 0.5) * 250);
  };

  useEffect(() => {
    const ctx = audioCtxRef.current;
    const masterGain = masterGainRef.current;
    if (!ctx || !masterGain) return;

    const targetVol = isMusicPlaying ? Math.max(0, Math.min(1, musicVolume)) * 0.35 : 0;
    const now = ctx.currentTime;
    masterGain.gain.cancelScheduledValues(now);
    masterGain.gain.setValueAtTime(masterGain.gain.value, now);
    masterGain.gain.linearRampToValueAtTime(targetVol, now + (isMusicPlaying ? 1.2 : 0.6));

    if (isMusicPlaying) {
      const mood = determineMood();
      const dominant = determineDominantEmotionForColor();
      if (dominant && padGainRef.current) {
        const padTarget = 0.32;
        padGainRef.current.gain.cancelScheduledValues(now);
        padGainRef.current.gain.setValueAtTime(padGainRef.current.gain.value, now);
        padGainRef.current.gain.linearRampToValueAtTime(padTarget, now + 3.5);
      }
      if (melodyGainRef.current) {
        melodyGainRef.current.gain.cancelScheduledValues(now);
        melodyGainRef.current.gain.setValueAtTime(melodyGainRef.current.gain.value, now);
        melodyGainRef.current.gain.linearRampToValueAtTime(0.72, now + 2);
      }
      startPad(mood);
      if (!nextNoteTimerRef.current) {
        setTimeout(() => scheduleNextNote(mood), 800);
      }
    } else {
      if (padGainRef.current) {
        padGainRef.current.gain.cancelScheduledValues(now);
        padGainRef.current.gain.setValueAtTime(padGainRef.current.gain.value, now);
        padGainRef.current.gain.linearRampToValueAtTime(0, now + 1.2);
      }
      if (melodyGainRef.current) {
        melodyGainRef.current.gain.cancelScheduledValues(now);
        melodyGainRef.current.gain.setValueAtTime(melodyGainRef.current.gain.value, now);
        melodyGainRef.current.gain.linearRampToValueAtTime(0, now + 0.8);
      }
      if (nextNoteTimerRef.current) {
        window.clearTimeout(nextNoteTimerRef.current);
        nextNoteTimerRef.current = null;
      }
    }
  }, [isMusicPlaying]);

  useEffect(() => {
    const ctx = audioCtxRef.current;
    const masterGain = masterGainRef.current;
    if (!ctx || !masterGain) return;
    if (isMusicPlaying) {
      const targetVol = Math.max(0, Math.min(1, musicVolume)) * 0.35;
      const now = ctx.currentTime;
      masterGain.gain.cancelScheduledValues(now);
      masterGain.gain.setValueAtTime(masterGain.gain.value, now);
      masterGain.gain.linearRampToValueAtTime(targetVol, now + 1.5);
    }
  }, [musicVolume, isMusicPlaying]);

  useEffect(() => {
    if (!isMusicPlaying || !audioCtxRef.current) return;
    const mood = determineMood();
    startPad(mood);
  }, [activeCombinationId]);

  useEffect(() => {
    return () => {
      if (nextNoteTimerRef.current) {
        window.clearTimeout(nextNoteTimerRef.current);
        nextNoteTimerRef.current = null;
      }
      stopAllPadNodes();
      if (audioCtxRef.current) {
        try {
          audioCtxRef.current.close();
        } catch (_) {}
        audioCtxRef.current = null;
      }
    };
  }, []);

  const ensureAndToggle = () => {
    ensureContext();
    toggleMusic();
  };

  useEffect(() => {
    const firstInteraction = () => {
      ensureContext();
      window.removeEventListener('pointerdown', firstInteraction);
      window.removeEventListener('keydown', firstInteraction);
    };
    window.addEventListener('pointerdown', firstInteraction);
    window.addEventListener('keydown', firstInteraction);
    return () => {
      window.removeEventListener('pointerdown', firstInteraction);
      window.removeEventListener('keydown', firstInteraction);
    };
  }, []);

  void ensureAndToggle;

  return null;
};
