'use client';

import React, { useState, useRef, useEffect } from 'react';
import GlassCard from './GlassCard';
import GlowButton from './GlowButton';

type VoiceRecorderProps = {
  onRecording: (blob: Blob) => void;
  language?: string;
};

export default function VoiceRecorder({ onRecording, language = 'English' }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const [selectedLang, setSelectedLang] = useState(language);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        onRecording(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Microphone access denied", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (isRecording && mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
    };
  }, [isRecording]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <GlassCard className="w-full flex flex-col items-center">
      <div className="w-full flex justify-between items-center mb-6">
        <h3 className="text-white/80 font-medium">Voice Description</h3>
        <select 
          value={selectedLang} 
          onChange={(e) => setSelectedLang(e.target.value)}
          className="bg-slate-800/50 border border-white/10 rounded-lg px-3 py-1 text-sm text-cyan-400 outline-none focus:border-cyan-500/50"
        >
          <option value="English">English</option>
          <option value="Hindi">Hindi</option>
          <option value="Hinglish">Hinglish</option>
          <option value="Tamil">Tamil</option>
          <option value="Telugu">Telugu</option>
        </select>
      </div>

      <div className="relative w-32 h-32 flex items-center justify-center mb-6">
        {isRecording && (
          <>
            <div className="absolute inset-0 bg-cyan-500/20 rounded-full animate-ping opacity-75"></div>
            <div className="absolute inset-2 bg-cyan-500/30 rounded-full animate-pulse"></div>
          </>
        )}
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
            isRecording 
              ? 'bg-red-500/80 shadow-[0_0_20px_rgba(239,68,68,0.6)] border-4 border-red-400' 
              : 'bg-cyan-500/20 border-2 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:bg-cyan-500/30'
          }`}
        >
          {isRecording ? (
            <div className="w-6 h-6 bg-white rounded-sm"></div>
          ) : (
            <svg className="w-8 h-8 text-cyan-400 pl-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
            </svg>
          )}
        </button>
      </div>

      <div className="text-2xl font-mono text-cyan-400 mb-2 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]">
        {formatTime(recordingTime)}
      </div>
      <p className="text-white/50 text-sm">
        {isRecording ? "Recording in progress..." : "Tap to record your description"}
      </p>
    </GlassCard>
  );
}
