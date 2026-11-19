'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, RefreshCw, Check, X, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

interface CameraCaptureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPhotoCaptured: (file: File) => void;
  documentTitle?: string;
}

export function CameraCaptureDialog({
  open,
  onOpenChange,
  onPhotoCaptured,
  documentTitle,
}: CameraCaptureDialogProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedBlobUrl, setCapturedBlobUrl] = useState<string | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement>(null);

  // Stop camera stream tracks
  const stopStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  // Check available devices
  useEffect(() => {
    if (!open) return;
    navigator.mediaDevices?.enumerateDevices?.().then(devices => {
      const videoInputs = devices.filter(d => d.kind === 'videoinput');
      setHasMultipleCameras(videoInputs.length > 1);
    }).catch(() => {});
  }, [open]);

  // Initialize camera
  const startCamera = useCallback(async (mode: 'environment' | 'user') => {
    setIsInitializing(true);
    setCameraError(null);
    stopStream();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera is not supported on this device/browser.');
      }

      let newStream: MediaStream;
      try {
        newStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: mode },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });
      } catch {
        // Fallback to any video device
        newStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        await videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Camera permission was denied. Please allow camera permissions in your browser or use the file uploader below.'
          : err.message || 'Could not access camera. Please check your camera settings.'
      );
    } finally {
      setIsInitializing(false);
    }
  }, [stopStream]);

  // Start camera when dialog opens
  useEffect(() => {
    if (open) {
      setCapturedBlobUrl(null);
      setCapturedFile(null);
      setCameraError(null);
      startCamera(facingMode);
    } else {
      stopStream();
      if (capturedBlobUrl) {
        URL.revokeObjectURL(capturedBlobUrl);
      }
    }
    return () => {
      stopStream();
    };
  }, [open, facingMode]);

  // Switch between front & back camera
  const toggleFacingMode = () => {
    setFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Capture frame
  const takeSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, width, height);

    canvas.toBlob(blob => {
      if (!blob) return;
      const safeDocName = (documentTitle || 'document')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-');
      const filename = `${safeDocName}-photo-${Date.now()}.jpg`;
      const file = new File([blob], filename, { type: 'image/jpeg' });
      const url = URL.createObjectURL(blob);

      setCapturedFile(file);
      setCapturedBlobUrl(url);
      stopStream();
    }, 'image/jpeg', 0.95);
  };

  // Retake photo
  const handleRetake = () => {
    if (capturedBlobUrl) {
      URL.revokeObjectURL(capturedBlobUrl);
    }
    setCapturedBlobUrl(null);
    setCapturedFile(null);
    startCamera(facingMode);
  };

  // Confirm and save photo
  const handleConfirm = () => {
    if (capturedFile) {
      onPhotoCaptured(capturedFile);
      onOpenChange(false);
    }
  };

  // Native phone camera input fallback
  const handleNativeCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onPhotoCaptured(file);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl w-[95vw] sm:rounded-2xl p-4 sm:p-6 overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-headline">
            <Camera className="h-5 w-5 text-primary" />
            {capturedBlobUrl ? 'Review Document Photo' : 'Click Document Photo'}
          </DialogTitle>
          <DialogDescription>
            {documentTitle
              ? `Capture a clear photo of your: ${documentTitle}`
              : 'Hold your document steady inside the frame in good lighting.'}
          </DialogDescription>
        </DialogHeader>

        <div className="relative w-full aspect-[4/3] bg-black rounded-xl overflow-hidden flex items-center justify-center border shadow-inner">
          {/* Camera View */}
          {!capturedBlobUrl && !cameraError && (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Viewfinder Overlay Guide */}
              <div className="absolute inset-4 sm:inset-8 border-2 border-dashed border-white/70 rounded-lg pointer-events-none flex flex-col justify-between p-3">
                <div className="text-center text-xs font-medium text-white/90 bg-black/40 py-1 px-3 rounded-full mx-auto backdrop-blur-sm">
                  Align document within borders
                </div>
                <div className="text-center text-xs text-white/80 bg-black/40 py-0.5 px-2 rounded-full mx-auto backdrop-blur-sm">
                  Ensure all text is clearly readable
                </div>
              </div>

              {/* Flip camera button */}
              {hasMultipleCameras && (
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  onClick={toggleFacingMode}
                  className="absolute top-3 right-3 rounded-full bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm"
                  title="Switch camera"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              )}
            </>
          )}

          {/* Captured Preview */}
          {capturedBlobUrl && (
            <img
              src={capturedBlobUrl}
              alt="Captured document"
              className="w-full h-full object-contain bg-black"
            />
          )}

          {/* Camera Error / Permission Block */}
          {cameraError && !capturedBlobUrl && (
            <div className="p-6 text-center text-white space-y-4 max-w-sm">
              <AlertCircle className="h-10 w-10 text-amber-400 mx-auto" />
              <p className="text-sm">{cameraError}</p>
              <div className="pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => nativeCameraInputRef.current?.click()}
                  className="w-full"
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Use Native Device Camera
                </Button>
              </div>
            </div>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Hidden native camera capture input */}
        <input
          ref={nativeCameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleNativeCameraCapture}
        />

        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between items-center pt-2">
          {!capturedBlobUrl ? (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => nativeCameraInputRef.current?.click()}
                className="w-full sm:w-auto"
              >
                <ImageIcon className="mr-2 h-4 w-4" />
                Native Camera App
              </Button>

              <div className="flex gap-2 w-full sm:w-auto justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={takeSnapshot}
                  disabled={isInitializing || !!cameraError}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6"
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Snap Photo
                </Button>
              </div>
            </>
          ) : (
            <div className="flex gap-3 w-full justify-between items-center">
              <Button
                type="button"
                variant="outline"
                onClick={handleRetake}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Retake Photo
              </Button>
              <Button
                type="button"
                onClick={handleConfirm}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              >
                <Check className="mr-2 h-4 w-4" />
                Use This Photo
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
