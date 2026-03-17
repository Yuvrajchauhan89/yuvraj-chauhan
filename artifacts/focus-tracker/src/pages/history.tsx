import { useState } from "react";
import { useGetSessions } from "@workspace/api-client-react";
import { GlassCard } from "@/components/ui/glass-card";
import { formatTime, getCategoryColor, cn } from "@/lib/utils";
import { format } from "date-fns";
import { ChevronRight, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function History() {
  const { data, isLoading } = useGetSessions({ limit: 50 }, { query: { retry: false } });
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Mock data fallback
  const sessions = data?.sessions || [
    { id: 1, startTime: new Date(Date.now() - 3600000).toISOString(), status: 'completed', avgFocusScore: 85, totalFocusTime: 2400, distractionCount: 2, focusPercentage: 88 },
    { id: 2, startTime: new Date(Date.now() - 86400000).toISOString(), status: 'completed', avgFocusScore: 62, totalFocusTime: 1800, distractionCount: 15, focusPercentage: 65 },
    { id: 3, startTime: new Date(Date.now() - 172800000).toISOString(), status: 'completed', avgFocusScore: 92, totalFocusTime: 4500, distractionCount: 1, focusPercentage: 95 },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-display font-bold">SESSION LOGS</h1>
          <p className="text-sm text-muted-foreground font-mono mt-1">HISTORICAL DATA ARCHIVE</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-card/40 border border-white/10 rounded-lg text-sm font-mono hover:bg-white/5 transition-colors">
          <Filter className="w-4 h-4" /> FILTER
        </button>
      </div>

      <GlassCard className="overflow-hidden">
        <div className="grid grid-cols-6 gap-4 p-4 border-b border-white/10 text-xs font-mono text-muted-foreground bg-black/20">
          <div className="col-span-2">DATE & TIME</div>
          <div>DURATION</div>
          <div>AVG SCORE</div>
          <div>DISTRACTIONS</div>
          <div className="text-right">ACTION</div>
        </div>

        <div className="divide-y divide-white/5">
          {sessions.map((session) => (
            <div key={session.id}>
              <div 
                className={cn(
                  "grid grid-cols-6 gap-4 p-4 items-center transition-colors cursor-pointer hover:bg-white/5",
                  selectedId === session.id && "bg-white/5 border-l-2 border-primary"
                )}
                onClick={() => setSelectedId(selectedId === session.id ? null : session.id)}
              >
                <div className="col-span-2">
                  <div className="font-medium">{format(new Date(session.startTime), "MMM dd, yyyy")}</div>
                  <div className="text-xs text-muted-foreground font-mono">{format(new Date(session.startTime), "HH:mm")}</div>
                </div>
                <div className="font-mono text-sm">{formatTime(session.totalFocusTime || 0)}</div>
                
                <div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "w-2 h-2 rounded-full",
                      (session.avgFocusScore || 0) >= 80 ? "bg-success shadow-[0_0_5px_hsl(var(--success))]" : 
                      (session.avgFocusScore || 0) >= 50 ? "bg-primary shadow-[0_0_5px_hsl(var(--primary))]" : "bg-destructive"
                    )} />
                    <span className="font-display font-bold">{Math.round(session.avgFocusScore || 0)}</span>
                  </div>
                </div>

                <div className="font-mono text-sm text-muted-foreground">
                  {session.distractionCount || 0} events
                </div>

                <div className="text-right">
                  <ChevronRight className={cn(
                    "w-5 h-5 inline-block text-muted-foreground transition-transform",
                    selectedId === session.id && "rotate-90 text-primary"
                  )} />
                </div>
              </div>

              {/* Expandable Detail View */}
              <AnimatePresence>
                {selectedId === session.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden bg-black/20"
                  >
                    <div className="p-6 border-t border-white/5 flex gap-8">
                      <div className="flex-1">
                        <h4 className="font-mono text-xs text-muted-foreground mb-4">SESSION SUMMARY</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Status</span>
                            <span className="text-success uppercase">{session.status}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Focus Ratio</span>
                            <span className="font-mono">{session.focusPercentage}%</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex-[2] bg-card/30 rounded-lg p-4 border border-white/5 flex items-center justify-center">
                        <p className="text-muted-foreground text-sm font-mono">Detailed chart data requires session fetch...</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
          
          {sessions.length === 0 && !isLoading && (
            <div className="p-8 text-center text-muted-foreground font-mono">
              NO LOGS FOUND IN DATABASE
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
