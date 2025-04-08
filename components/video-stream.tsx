"use client";

import { useEffect, useRef, useState } from "react";

import { Camera, CameraOff } from "lucide-react";

interface VideoStreamProps {
  enabled: boolean;
}

export default function VideoStream({ enabled }: VideoStreamProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);

  const constraints = {
    video: true,
    audio: true,
  };
  useEffect(() => {
    if (enabled) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [enabled]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraOn(true);
      setHasPermission(true);
    } catch (error) {
      console.error("Error accessing camera:", error);
      setHasPermission(false);
      setIsCameraOn(false);
    }
  };
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsCameraOn(false);
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-muted rounded-md overflow-hidden">
      {enabled ? (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${
              isCameraOn ? "opacity-100" : "opacity-0"
            }`}
          />

          {hasPermission === false && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
              <CameraOff className="h-10 w-10 mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">Camera access denied</p>
              <p className="text-xs text-muted-foreground mt-1">
                Please enable camera access in your browser settings
              </p>
            </div>
          )}

          {hasPermission === null && !isCameraOn && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center text-center p-4">
          <Camera className="h-10 w-10 mb-2 text-muted-foreground" />
          <p className="text-muted-foreground">Camera is disabled</p>
          <p className="text-xs text-muted-foreground mt-1">
            Enable camera for video proctoring
          </p>
        </div>
      )}
    </div>
  );
}
