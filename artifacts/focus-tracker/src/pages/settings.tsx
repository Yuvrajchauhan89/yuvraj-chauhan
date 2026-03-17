import { GlassCard } from "@/components/ui/glass-card";
import { useSettings } from "@/hooks/use-settings";
import { Volume2, VolumeX, Smartphone, ShieldAlert, Save } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { settings, updateSettings } = useSettings();
  const { toast } = useToast();
  
  // Local state for form before saving
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSave = () => {
    updateSettings(localSettings);
    toast({
      title: "Settings Saved",
      description: "Configuration parameters updated successfully.",
      className: "bg-card border-primary text-primary"
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">SYSTEM CONFIGURATION</h1>
        <p className="text-sm text-muted-foreground font-mono mt-1">LOCAL PREFERENCES & HARDWARE</p>
      </div>

      <div className="grid gap-6">
        <GlassCard className="p-6">
          <h2 className="text-lg font-display font-bold mb-6 flex items-center gap-2 border-b border-white/10 pb-4">
            <ShieldAlert className="w-5 h-5 text-primary" /> ALERT THRESHOLDS
          </h2>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-foreground">Distraction Sensitivity</h3>
                <p className="text-sm text-muted-foreground mt-1">Seconds of looking away before an alert is triggered</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-primary bg-primary/10 px-2 py-1 rounded">{localSettings.distractionThreshold}s</span>
                <input 
                  type="range" 
                  min="1" max="15" step="1"
                  value={localSettings.distractionThreshold}
                  onChange={(e) => setLocalSettings({...localSettings, distractionThreshold: parseInt(e.target.value)})}
                  className="accent-primary"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <div>
                <h3 className="font-medium text-foreground">Audio Feedback</h3>
                <p className="text-sm text-muted-foreground mt-1">Play a warning beep when distracted</p>
              </div>
              <button 
                onClick={() => setLocalSettings({...localSettings, soundEnabled: !localSettings.soundEnabled})}
                className={`w-14 h-8 rounded-full transition-colors relative ${localSettings.soundEnabled ? 'bg-primary' : 'bg-white/10'}`}
              >
                <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-transform ${localSettings.soundEnabled ? 'left-7' : 'left-1'}`} />
                {localSettings.soundEnabled ? 
                  <Volume2 className="w-4 h-4 absolute left-2 top-2 text-background" /> : 
                  <VolumeX className="w-4 h-4 absolute right-2 top-2 text-muted-foreground" />
                }
              </button>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h2 className="text-lg font-display font-bold mb-6 flex items-center gap-2 border-b border-white/10 pb-4">
            <Smartphone className="w-5 h-5 text-accent" /> IOT INTEGRATION
          </h2>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-foreground">External Hardware Alerts</h3>
                <p className="text-sm text-muted-foreground mt-1">Send POST requests to physical devices (LEDs, buzzers)</p>
              </div>
              <button 
                onClick={() => setLocalSettings({...localSettings, iotAlertsEnabled: !localSettings.iotAlertsEnabled})}
                className={`w-14 h-8 rounded-full transition-colors relative ${localSettings.iotAlertsEnabled ? 'bg-accent' : 'bg-white/10'}`}
              >
                <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-transform ${localSettings.iotAlertsEnabled ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            <div className={`transition-opacity ${localSettings.iotAlertsEnabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
              <label className="block text-sm font-medium text-foreground mb-2">Device ID / Endpoint Address</label>
              <input 
                type="text" 
                value={localSettings.iotDeviceId}
                onChange={(e) => setLocalSettings({...localSettings, iotDeviceId: e.target.value})}
                placeholder="e.g. esp32-node-01"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-foreground font-mono focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
              />
            </div>
          </div>
        </GlassCard>

        <div className="flex justify-end">
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 px-8 py-3 bg-primary text-background font-bold uppercase tracking-widest rounded-xl hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(0,243,255,0.4)] transition-all"
          >
            <Save className="w-5 h-5" /> APPLY CONFIG
          </button>
        </div>
      </div>
    </div>
  );
}
