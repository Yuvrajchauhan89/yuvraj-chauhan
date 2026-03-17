import { useState, useEffect, useRef } from "react";
import Webcam from "react-webcam";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { Play, Square, AlertTriangle, Eye, Activity, RotateCcw } from "lucide-react";
import { useCreateSession, useEndSession, useRecordFocusData, useSendIotAlert } from "@workspace/api-client-react";
import { useFocusML } from "@/hooks/use-focus-ml";
import { useSettings } from "@/hooks/use-settings";
import { cn, formatTime, getCategoryColor } from "@/lib/utils";

export default function LiveTracker() {
  const [isActive, setIsActive] = useState(false);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [sessionTime, setSessionTime] = useState(0);
  
  const { settings } = useSettings();
  const webcamRef = useRef<Webcam>(null);
  
  // API Hooks
  const createSession = useCreateSession();
  const endSession = useEndSession();
  const recordFocus = useRecordFocusData();
  const sendAlert = useSendIotAlert();

  // ML Hook
  const { metrics } = useFocusML(isActive);

  // Timer & Data Recording Loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    let recordInterval: NodeJS.Timeout;

    if (isActive && sessionId) {
      interval = setInterval(() => {
        setSessionTime(prev => prev + 1);
      }, 1000);

      // Record data every 5 seconds
      recordInterval = setInterval(() => {
        if (metrics) {
          recordFocus.mutate({
            data: {
              sessionId: sessionId,
              focusScore: metrics.score,
              focusCategory: metrics.category,
              eyeOpenness: metrics.eyeOpenness,
              gazeDirection: metrics.gazeDirection,
              blinkRate: metrics.blinkRate,
              headPose: metrics.headPose,
              isDistraction: metrics.isDistraction
            }
          });
        }
      }, 5000);
    }

    return () => {
      clearInterval(interval);
      clearInterval(recordInterval);
    };
  }, [isActive, sessionId, metrics, recordFocus]);

  // Handle Distractions & IoT Alerts
  useEffect(() => {
    if (metrics?.isDistraction && settings.soundEnabled) {
      // Play beep (using simple AudioContext for no external dependencies)
      try {
        const ctx = new window.AudioContext();
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      } catch(e) {}
    }

    if (metrics?.isDistraction && settings.iotAlertsEnabled && settings.iotDeviceId) {
      sendAlert.mutate({
        data: {
          alertType: "DISTRACTION",
          deviceId: settings.iotDeviceId,
          focusScore: metrics.score,
          sessionId: sessionId
        }
      });
    }
  }, [metrics?.isDistraction, settings]);

  const handleStart = async () => {
    try {
      const res = await createSession.mutateAsync({ data: { label: "Focus Session" } });
      setSessionId(res.id);
      setIsActive(true);
      setSessionTime(0);
    } catch (e) {
      console.error("Failed to start session", e);
      // Fallback for UI if backend is offline
      setSessionId(Date.now());
      setIsActive(true);
    }
  };

  const handleStop = async () => {
    if (sessionId) {
      try {
        await endSession.mutateAsync({
          id: sessionId,
          data: {
            avgFocusScore: metrics?.score || 0, // Mocked aggregation for demo
            totalFocusTime: sessionTime * 0.8,
            totalDistractionTime: sessionTime * 0.2,
            distractionCount: 2,
            focusPercentage: 80
          }
        });
      } catch (e) {
        console.error("Failed to end session", e);
      }
    }
    setIsActive(false);
    setSessionId(null);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "var(--success)";
    if (score >= 50) return "var(--primary)";
    if (score >= 30) return "var(--warning)";
    return "var(--destructive)";
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold">LIVE TRACKER</h1>
          <p className="text-sm text-muted-foreground font-mono">
            {isActive ? "SESSION ACTIVE" : "SYSTEM STANDBY"}
          </p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="font-mono text-xl bg-card/50 px-4 py-2 rounded-lg border border-white/5">
            {formatTime(sessionTime)}
          </div>
          {isActive ? (
            <button 
              onClick={handleStop}
              className="flex items-center gap-2 px-6 py-3 bg-destructive/20 text-destructive border border-destructive/50 rounded-xl hover:bg-destructive hover:text-white transition-all shadow-[0_0_20px_rgba(255,50,100,0.2)]"
            >
              <Square className="w-5 h-5 fill-current" /> END SESSION
            </button>
          ) : (
            <button 
              onClick={handleStart}
              className="flex items-center gap-2 px-6 py-3 bg-primary/20 text-primary border border-primary/50 rounded-xl hover:bg-primary hover:text-background transition-all shadow-[0_0_20px_rgba(0,243,255,0.2)]"
            >
              <Play className="w-5 h-5 fill-current" /> INITIALIZE
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Main View - Webcam */}
        <GlassCard className="lg:col-span-2 relative overflow-hidden flex items-center justify-center bg-black/50 border-white/10">
          {!isActive && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
              <Eye className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
              <p className="text-lg font-display text-muted-foreground tracking-widest">CAMERA OFFLINE</p>
            </div>
          )}
          
          <Webcam
            ref={webcamRef}
            audio={false}
            className={cn("w-full h-full object-cover", !isActive && "opacity-20 grayscale")}
            mirrored={true}
          />

          {/* AI Overlays */}
          {isActive && (
            <>
              <div className="absolute inset-0 border-4 border-primary/20 rounded-xl pointer-events-none" />
              {/* Corner brackets */}
              <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-primary/50 pointer-events-none" />
              <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-primary/50 pointer-events-none" />
              <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-primary/50 pointer-events-none" />
              <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-primary/50 pointer-events-none" />
              
              {/* Scanning line */}
              <motion.div 
                className="absolute left-0 right-0 h-px bg-primary/50 shadow-[0_0_10px_#00f3ff]"
                animate={{ top: ['0%', '100%', '0%'] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              />
            </>
          )}

          {/* Distraction Alert Overlay */}
          <AnimatePresence>
            {metrics?.isDistraction && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-destructive/20 border-4 border-destructive flex flex-col items-center justify-center z-50 backdrop-blur-sm"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  <AlertTriangle className="w-24 h-24 text-destructive drop-shadow-[0_0_20px_rgba(255,50,100,0.8)] mb-4" />
                </motion.div>
                <h2 className="text-4xl font-display font-bold text-white tracking-widest neon-text-destructive">DISTRACTION DETECTED</h2>
                <p className="text-white/80 mt-2 font-mono">RETURN FOCUS TO SCREEN</p>
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>

        {/* Sidebar Stats */}
        <div className="flex flex-col gap-6 h-full">
          {/* Main Score */}
          <GlassCard className="p-6 flex flex-col items-center justify-center flex-1 relative overflow-hidden" neonGlow={metrics?.isDistraction ? "destructive" : "primary"}>
            <p className="text-sm font-mono text-muted-foreground absolute top-6 left-6">FOCUS INDEX</p>
            
            <div className="relative w-48 h-48 flex items-center justify-center mt-6">
              {/* Circular Progress SVG */}
              <svg className="w-full h-full transform -rotate-90 absolute inset-0">
                <circle cx="96" cy="96" r="88" className="stroke-white/5 fill-none" strokeWidth="8" />
                <motion.circle 
                  cx="96" cy="96" r="88" 
                  className="fill-none transition-all duration-300"
                  strokeWidth="8"
                  strokeDasharray="552"
                  strokeDashoffset={isActive ? 552 - (552 * (metrics?.score || 0)) / 100 : 552}
                  strokeLinecap="round"
                  style={{ stroke: getScoreColor(metrics?.score || 0) }}
                />
              </svg>
              <div className="text-center">
                <span className="text-6xl font-display font-bold" style={{ color: getScoreColor(metrics?.score || 0), textShadow: `0 0 20px ${getScoreColor(metrics?.score || 0)}` }}>
                  {isActive ? metrics?.score : "--"}
                </span>
                <span className="block text-sm text-muted-foreground font-mono mt-1">SCORE</span>
              </div>
            </div>

            {isActive && metrics && (
              <div className={cn("mt-6 px-4 py-1.5 rounded-full border text-xs font-bold tracking-wider", getCategoryColor(metrics.category))}>
                {metrics.category.replace('_', ' ')}
              </div>
            )}
          </GlassCard>

          {/* Detailed Metrics */}
          <GlassCard className="p-6 flex-1 flex flex-col justify-between">
            <h3 className="font-mono text-sm text-muted-foreground mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4" /> TELEMETRY
            </h3>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-xs font-mono mb-2">
                  <span className="text-foreground">EYE OPENNESS</span>
                  <span className="text-primary">{isActive ? `${Math.round((metrics?.eyeOpenness || 0)*100)}%` : '--'}</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-primary"
                    animate={{ width: isActive ? `${(metrics?.eyeOpenness || 0)*100}%` : '0%' }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-2">
                  <span className="text-foreground">GAZE VECTOR</span>
                  <span className="text-accent">{isActive ? metrics?.gazeDirection : '--'}</span>
                </div>
                <div className="flex gap-1 h-1.5">
                  {['LEFT', 'CENTER', 'RIGHT'].map(dir => (
                    <div key={dir} className={cn(
                      "flex-1 rounded-full transition-all",
                      isActive && metrics?.gazeDirection === dir ? "bg-accent shadow-[0_0_8px_hsl(var(--accent))]" : "bg-white/5"
                    )} />
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-2">
                  <span className="text-foreground">HEAD POSE</span>
                  <span className="text-success">{isActive ? metrics?.headPose : '--'}</span>
                </div>
                <div className="flex gap-1 h-1.5">
                  {['TILTED', 'FORWARD', 'TURNED'].map(pose => (
                    <div key={pose} className={cn(
                      "flex-1 rounded-full transition-all",
                      isActive && metrics?.headPose === pose ? "bg-success shadow-[0_0_8px_hsl(var(--success))]" : "bg-white/5"
                    )} />
                  ))}
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
