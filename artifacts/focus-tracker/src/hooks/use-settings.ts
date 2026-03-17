import { useState, useEffect } from 'react';

export interface AppSettings {
  soundEnabled: boolean;
  distractionThreshold: number; // in seconds
  iotDeviceId: string;
  iotAlertsEnabled: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  soundEnabled: true,
  distractionThreshold: 5,
  iotDeviceId: '',
  iotAlertsEnabled: false,
};

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const stored = localStorage.getItem('focus_tracker_settings');
      return stored ? JSON.parse(stored) : DEFAULT_SETTINGS;
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  });

  useEffect(() => {
    localStorage.setItem('focus_tracker_settings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (updates: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  return { settings, updateSettings };
}
