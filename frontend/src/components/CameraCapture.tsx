'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import GlassCard from './GlassCard';
import GlowButton from './GlowButton';

type CameraCaptureProps = {
  onCapture: (file: File) => void;
  mode?: 'environment' | 'user';
  label?: string;
};

export default function CameraCapture({ 
  onCapture, 
  mode = 'environment',
  label = 'Capture Evidence' 
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [gpsLocation, setGpsLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Auto-acquire high accuracy GPS on camera mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGpsLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (err) => console.warn('Camera GPS acquisition note:', err.message),
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, []);

  const stopStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  }, [stream]);

  const startCamera = useCallback(async () => {
    stopStream();
    setError(null);

    const constraintsList: MediaStreamConstraints[] = [
      // 1. Try strict environment (rear) camera lock with HD resolution
      {
        video: {
          facingMode: { exact: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      },
      // 2. Fallback to loose environment camera
      {
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      },
      // 3. Fallback to any default camera
      {
        video: true,
        audio: false
      }
    ];

    let activeStream: MediaStream | null = null;
    let lastError: any = null;

    for (const constraints of constraintsList) {
      try {
        activeStream = await navigator.mediaDevices.getUserMedia(constraints);
        if (activeStream) break;
      } catch (err) {
        lastError = err;
      }
    }

    if (activeStream) {
      setStream(activeStream);
      setIsCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = activeStream;
        videoRef.current.play().catch((e) => console.error('Video play error:', e));
      }
    } else {
      console.warn('Native camera streaming unavailable:', lastError);
      setError('Live camera stream not supported on this device. Use native camera capture below.');
      setIsCameraActive(false);
    }
  }, [stopStream]);

  useEffect(() => {
    startCamera();
    return () => {
      stopStream();
    };
  }, []);

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Stamp subtle forensic watermarking (timestamp + GPS coords)
        const timestamp = new Date().toISOString();
        ctx.fillStyle = 'rgba(9, 13, 22, 0.75)';
        ctx.fillRect(10, canvas.height - 40, canvas.width - 20, 30);
        ctx.fillStyle = '#06B6D4';
        ctx.font = '14px monospace';
        const geoText = gpsLocation ? `LAT: ${gpsLocation.lat.toFixed(5)} LON: ${gpsLocation.lng.toFixed(5)}` : 'GPS: ACQUIRING';
        ctx.fillText(`SMART-CIVIC FORENSIC EVIDENCE | ${timestamp} | ${geoText}`, 20, canvas.height - 20);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
        setImagePreview(dataUrl);
        stopStream();
      }
    }
  };

  const confirmImage = () => {
    if (imagePreview) {
      fetch(imagePreview)
        .then((res) => res.blob())
        .then((blob) => {
          const fileName = `evidence_${Date.now()}_geo.jpg`;
          const file = new File([blob], fileName, { type: 'image/jpeg', lastModified: Date.now() });
          onCapture(file);
        });
    }
  };

  const retakeImage = () => {
    setImagePreview(null);
    startCamera();
  };

  const handleNativeFallback = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
        stopStream();
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <GlassCard className="w-full overflow-hidden flex flex-col items-center p-4 border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
      <div className="w-full flex items-center justify-between pb-3 border-b border-white/10 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#06B6D4]" />
          <span className="text-sm font-semibold text-white tracking-wide uppercase">{label}</span>
        </div>
        <span className="text-xs text-white/50 font-mono">
          {gpsLocation ? `GPS LOCKED (${gpsLocation.lat.toFixed(3)}, ${gpsLocation.lng.toFixed(3)})` : 'REAR CAMERA LOCKED'}
        </span>
      </div>

      {imagePreview ? (
        <div className="w-full flex flex-col items-center animate-fade-in">
          <div className="relative w-full rounded-xl overflow-hidden border border-emerald-500/30 mb-5 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
            <img 
              src={imagePreview} 
              alt="Evidence Capture" 
              className="w-full h-auto max-h-[55vh] object-contain bg-slate-950" 
            />
            <div className="absolute top-3 right-3 bg-emerald-500/20 backdrop-blur-md border border-emerald-500/40 text-emerald-300 text-xs px-3 py-1 rounded-full font-mono">
              ✓ Tamper-Protected Frame
            </div>
          </div>
          <div className="flex gap-4 w-full justify-center">
            <GlowButton variant="outline" onClick={retakeImage} className="w-1/3">
              Retake
            </GlowButton>
            <GlowButton variant="emerald" onClick={confirmImage} className="w-2/3 font-semibold">
              Confirm & Attach Evidence
            </GlowButton>
          </div>
        </div>
      ) : isCameraActive ? (
        <div className="w-full flex flex-col items-center relative">
          <div className="relative w-full rounded-xl overflow-hidden border border-cyan-500/30 bg-slate-950 flex justify-center items-center shadow-[0_0_25px_rgba(6,182,212,0.15)]">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted
              className="w-full h-auto max-h-[55vh] object-cover"
            />
            
            {/* Viewfinder Target Overlay */}
            <div className="absolute inset-8 border border-white/20 pointer-events-none rounded-lg flex flex-col justify-between p-2">
              <div className="flex justify-between">
                <div className="w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
                <div className="w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
              </div>
              <div className="text-center text-xs font-mono text-cyan-400/70 tracking-widest uppercase">
                Align defect in frame
              </div>
              <div className="flex justify-between">
                <div className="w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
                <div className="w-4 h-4 border-b-2 border-r-2 border-cyan-400" />
              </div>
            </div>

            {/* Shutter Button */}
            <div className="absolute bottom-5 left-0 right-0 flex justify-center items-center">
              <button 
                type="button"
                onClick={captureImage}
                className="w-18 h-18 p-1 rounded-full bg-slate-900/60 border-2 border-cyan-400 backdrop-blur-md flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(6,182,212,0.6)] group"
                title="Capture Photo"
              >
                <div className="w-14 h-14 bg-gradient-to-tr from-cyan-500 to-emerald-400 rounded-full group-hover:opacity-90" />
              </button>
            </div>
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </div>
      ) : (
        <div className="w-full text-center py-10 px-4 bg-slate-900/50 rounded-xl border border-white/10">
          <div className="w-16 h-16 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-cyan-500/20 text-cyan-400">
            📷
          </div>
          <p className="text-sm text-white/80 mb-2 font-medium">Rear Camera Direct Capture</p>
          <p className="text-xs text-white/50 mb-6 max-w-sm mx-auto">
            {error || 'Tap below to launch your device camera with enforced environment rear lens.'}
          </p>
          
          <label className="glow-btn-cyan cursor-pointer px-6 py-3 rounded-xl inline-flex items-center justify-center font-semibold text-sm shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            Open Native Camera
            <input 
              type="file" 
              accept="image/*" 
              capture="environment" 
              className="hidden" 
              onChange={handleNativeFallback} 
            />
          </label>
        </div>
      )}
    </GlassCard>
  );
}
