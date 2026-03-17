import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Activity, LayoutDashboard, History, Settings, Home, BrainCircuit } from "lucide-react";
import { motion } from "framer-motion";

interface LayoutProps {
  children: ReactNode;
}

const NAV_ITEMS = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/tracker", icon: Activity, label: "Live Tracker" },
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/history", icon: History, label: "History" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="w-64 glass-panel border-r border-white/5 flex flex-col z-40 relative">
        <div className="p-6 flex items-center gap-3 border-b border-white/5">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/50 shadow-[0_0_15px_rgba(0,243,255,0.3)]">
            <BrainCircuit className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-display font-bold text-foreground leading-none tracking-wider">FOCUS</h1>
            <span className="text-xs text-primary font-mono tracking-[0.2em] neon-text-primary">AI TRACKER</span>
          </div>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-2">
          {NAV_ITEMS.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            
            return (
              <Link key={item.href} href={item.href} className="block">
                <div className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 relative overflow-hidden group cursor-pointer",
                  isActive ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                )}>
                  {isActive && (
                    <motion.div 
                      layoutId="sidebar-active" 
                      className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-lg shadow-[0_0_10px_rgba(0,243,255,0.1)_inset]"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full shadow-[0_0_10px_#00f3ff]" />
                  )}
                  <Icon className={cn("w-5 h-5 relative z-10 transition-transform group-hover:scale-110", isActive && "neon-text-primary")} />
                  <span className="font-medium relative z-10">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-6 border-t border-white/5">
          <div className="glass-panel rounded-xl p-4 border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-accent/20 blur-xl rounded-full translate-x-1/2 -translate-y-1/2" />
            <p className="text-xs text-muted-foreground font-mono mb-1">SYSTEM STATUS</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success shadow-[0_0_8px_hsl(var(--success))]" />
              <span className="text-sm font-medium text-foreground">Online & Ready</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        {/* Ambient background glows */}
        <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10" />
        <div className="fixed bottom-0 left-[20%] w-[600px] h-[600px] bg-accent/5 rounded-full blur-[150px] pointer-events-none -z-10" />
        
        <div className="p-8 max-w-7xl mx-auto min-h-full">
          <motion.div
            key={location}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
