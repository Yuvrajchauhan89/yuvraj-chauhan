import { Link } from "wouter";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { Activity, Brain, Target, Zap } from "lucide-react";
import { useGetDailyAnalytics } from "@workspace/api-client-react";
import { formatTime } from "@/lib/utils";

export default function Home() {
  const { data: analytics, isLoading } = useGetDailyAnalytics({ date: new Date().toISOString().split('T')[0] }, { 
    query: { retry: false } // Avoid retrying if backend isn't ready
  });

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden min-h-[400px] flex items-center border border-white/10 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/80 to-primary/20 z-10" />
        <img 
          src={`${import.meta.env.BASE_URL}images/hero-bg.png`} 
          alt="High-tech neural network background" 
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        
        <div className="relative z-20 p-10 md:p-16 w-full max-w-3xl">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-4 leading-tight">
              MASTER YOUR <br/>
              <span className="text-primary neon-text-primary">DEEP WORK</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl">
              AI-powered real-time tracking analyzes your eye movements, head pose, and blink rate to keep you locked in. Connect with IoT devices for physical focus alerts.
            </p>
            
            <Link href="/tracker">
              <div className="inline-flex items-center justify-center px-8 py-4 text-sm font-bold uppercase tracking-widest text-background bg-primary rounded-xl hover:bg-primary/90 hover:shadow-[0_0_30px_rgba(0,243,255,0.4)] transition-all cursor-pointer group">
                <Activity className="w-5 h-5 mr-3 group-hover:animate-pulse-fast" />
                Initialize Tracker
              </div>
            </Link>
          </motion.div>
        </div>

        <div className="absolute right-10 top-1/2 -translate-y-1/2 hidden lg:block z-20">
           <motion.img 
             initial={{ opacity: 0, scale: 0.8 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ delay: 0.4, type: "spring" }}
             src={`${import.meta.env.BASE_URL}images/brain-eye.png`}
             alt="AI Brain Eye"
             className="w-80 h-80 object-contain drop-shadow-[0_0_40px_rgba(188,19,254,0.3)] animate-float"
           />
        </div>
      </section>

      {/* Quick Stats */}
      <section>
        <h2 className="text-xl font-display font-bold mb-6 flex items-center gap-3">
          <Zap className="w-5 h-5 text-accent" /> Today's Performance
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassCard className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-lg bg-primary/10 text-primary">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Average Focus</p>
                <h3 className="text-3xl font-bold font-display">
                  {isLoading ? "..." : (analytics?.avgFocusScore || 0).toFixed(1)}<span className="text-lg text-muted-foreground">%</span>
                </h3>
              </div>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${analytics?.avgFocusScore || 0}%` }}
                className="h-full bg-primary shadow-[0_0_10px_#00f3ff]"
              />
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-lg bg-accent/10 text-accent">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Deep Work Time</p>
                <h3 className="text-3xl font-bold font-display">
                  {isLoading ? "..." : formatTime((analytics?.highFocusMinutes || 0) * 60)}
                </h3>
              </div>
            </div>
             <p className="text-xs text-muted-foreground mt-2">
               Out of {isLoading ? "..." : formatTime((analytics?.totalStudyTime || 0) * 60)} total
             </p>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-lg bg-success/10 text-success">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sessions Completed</p>
                <h3 className="text-3xl font-bold font-display">
                  {isLoading ? "..." : analytics?.totalSessions || 0}
                </h3>
              </div>
            </div>
             <p className="text-xs text-success mt-2 flex items-center gap-1">
               <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
               Ready for another
             </p>
          </GlassCard>
        </div>
      </section>
    </div>
  );
}
