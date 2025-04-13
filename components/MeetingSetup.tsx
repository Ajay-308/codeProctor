"use client";

import {
  DeviceSettings,
  useCall,
  VideoPreview,
} from "@stream-io/video-react-sdk";
import { useEffect, useState } from "react";
import { Card } from "./ui/card";
import {
  CameraIcon,
  CameraOffIcon,
  MicIcon,
  MicOffIcon,
  SettingsIcon,
  UserIcon,
} from "lucide-react";
import { Switch } from "./ui/switch";
import { Button } from "./ui/button";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

function MeetingSetup({ onSetupComplete }: { onSetupComplete: () => void }) {
  const [isCameraDisabled, setIsCameraDisabled] = useState(true);
  const [isMicDisabled, setIsMicDisabled] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showDeviceSettings, setShowDeviceSettings] = useState(false);

  const call = useCall();

  const [, setCameraEnabled] = useState(false);
  const [, setMicrophoneEnabled] = useState(false);

  useEffect(() => {
    if (call) {
      if (isCameraDisabled) {
        call.camera.disable();
        setCameraEnabled(false);
      } else {
        call.camera.enable();
        setCameraEnabled(true);
      }
    }
  }, [isCameraDisabled, call]);

  useEffect(() => {
    if (call) {
      if (isMicDisabled) {
        call.microphone.disable();
        setMicrophoneEnabled(false);
      } else {
        call.microphone.enable();
        setMicrophoneEnabled(true);
      }
    }
  }, [isMicDisabled, call]);

  if (!call) return null;

  const handleJoin = async () => {
    await call.join();
    onSetupComplete();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-6 bg-gradient-to-br from-background to-background/90">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[1200px] mx-auto"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* VIDEO PREVIEW CONTAINER */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="md:col-span-1 p-6 shadow-lg border-muted/50 h-full flex flex-col">
              <div>
                <h1 className="text-xl font-semibold mb-1">Camera Preview</h1>
                <p className="text-sm text-muted-foreground">
                  Make sure you look good!
                </p>
              </div>

              {/* VIDEO PREVIEW */}
              <div
                className="mt-6 flex-1 min-h-[400px] rounded-xl overflow-hidden bg-muted/30 border border-muted/50 relative"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                {isCameraDisabled ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/10 backdrop-blur-sm">
                    <div className="h-20 w-20 rounded-full bg-muted/20 flex items-center justify-center mb-4">
                      <UserIcon className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground font-medium">
                      Camera is turned off
                    </p>
                  </div>
                ) : (
                  <div className="absolute inset-0">
                    <VideoPreview className="h-full w-full object-cover" />
                  </div>
                )}

                {/* Camera status indicator */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isHovered || isCameraDisabled ? 1 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute bottom-4 left-4 bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg"
                >
                  {isCameraDisabled ? (
                    <CameraOffIcon className="h-4 w-4 text-destructive" />
                  ) : (
                    <CameraIcon className="h-4 w-4 text-emerald-500" />
                  )}
                  <span className="text-xs font-medium">
                    {isCameraDisabled ? "Camera off" : "Camera on"}
                  </span>
                </motion.div>
              </div>
            </Card>
          </motion.div>

          {/* CARD CONTROLS */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="md:col-span-1 p-6 shadow-lg border-muted/50 h-full">
              <div className="h-full flex flex-col">
                {/* MEETING DETAILS */}
                <div>
                  <h2 className="text-xl font-semibold mb-1">
                    Meeting Details
                  </h2>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium">
                      Meeting ID
                    </div>
                    <p className="text-sm text-muted-foreground font-mono truncate">
                      {call.id}
                    </p>
                  </div>
                </div>

                <div className="flex-1 flex flex-col justify-between mt-6">
                  <div className="space-y-6">
                    {/* CAM CONTROL */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 10,
                      }}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-lg border",
                        isCameraDisabled
                          ? "bg-muted/30"
                          : "bg-primary/5 border-primary/20"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "h-12 w-12 rounded-full flex items-center justify-center",
                            isCameraDisabled ? "bg-muted/30" : "bg-primary/10"
                          )}
                        >
                          {isCameraDisabled ? (
                            <CameraOffIcon className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <CameraIcon className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">Camera</p>
                          <p
                            className={cn(
                              "text-sm",
                              isCameraDisabled
                                ? "text-muted-foreground"
                                : "text-primary"
                            )}
                          >
                            {isCameraDisabled ? "Off" : "On"}
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={!isCameraDisabled}
                        onCheckedChange={(checked) =>
                          setIsCameraDisabled(!checked)
                        }
                      />
                    </motion.div>

                    {/* MIC CONTROL */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 10,
                      }}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-lg border",
                        isMicDisabled
                          ? "bg-muted/30"
                          : "bg-primary/5 border-primary/20"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "h-12 w-12 rounded-full flex items-center justify-center",
                            isMicDisabled ? "bg-muted/30" : "bg-primary/10"
                          )}
                        >
                          {isMicDisabled ? (
                            <MicOffIcon className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <MicIcon className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">Microphone</p>
                          <p
                            className={cn(
                              "text-sm",
                              isMicDisabled
                                ? "text-muted-foreground"
                                : "text-primary"
                            )}
                          >
                            {isMicDisabled ? "Off" : "On"}
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={!isMicDisabled}
                        onCheckedChange={(checked) =>
                          setIsMicDisabled(!checked)
                        }
                      />
                    </motion.div>

                    {/* DEVICE SETTINGS */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 10,
                      }}
                      className="flex items-center justify-between p-4 rounded-lg border bg-muted/10"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <SettingsIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Settings</p>
                          <p className="text-sm text-muted-foreground">
                            Configure devices
                          </p>
                        </div>
                      </div>
                      <div>
                        <button
                          className="bg-muted/50 hover:bg-muted text-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium"
                          onClick={() => setShowDeviceSettings(true)}
                        >
                          Change
                        </button>
                        {showDeviceSettings && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <div className="relative bg-white p-4 rounded-lg shadow-lg">
                              <Button
                                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                                onClick={() => setShowDeviceSettings(false)}
                              >
                                ✕
                              </Button>
                              <DeviceSettings />
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </div>

                  {/* JOIN BTN */}
                  <div className="space-y-3 mt-8">
                    <motion.div
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        className="w-full h-14 text-base font-medium shadow-lg"
                        size="lg"
                        onClick={handleJoin}
                      >
                        Join Meeting
                      </Button>
                    </motion.div>
                    <p className="text-xs text-center text-muted-foreground px-4">
                      Do not worry, our team is super friendly! We want you to
                      succeed. 🎉
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

export default MeetingSetup;
