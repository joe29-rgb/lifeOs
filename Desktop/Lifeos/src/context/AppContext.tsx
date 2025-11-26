/**
 * App Context
 * Global app state: user profile, settings, onboarding status
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserProfile {
  name: string;
  sleepGoal: number;
  exerciseGoal: number;
  workType: 'remote' | 'hybrid' | 'office';
}

interface AppSettings {
  procrastinationSensitivity: 'low' | 'medium' | 'high';
  barneyMode: boolean;
  sleepGoal: number;
  exerciseGoal: number;
  notificationsEnabled: boolean;
  dailyBriefingTime: string;
  dataRetentionDays: number;
}

interface AppContextType {
  isOnboarded: boolean;
  userProfile: UserProfile | null;
  settings: AppSettings;
  setOnboarded: (value: boolean) => Promise<void>;
  updateProfile: (profile: UserProfile) => Promise<void>;
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
  loading: boolean;
}

const defaultSettings: AppSettings = {
  procrastinationSensitivity: 'medium',
  barneyMode: true,
  sleepGoal: 7.5,
  exerciseGoal: 4,
  notificationsEnabled: true,
  dailyBriefingTime: '21:30',
  dataRetentionDays: 90,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [isOnboarded, setIsOnboardedState] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAppState();
  }, []);

  const loadAppState = async () => {
    try {
      const [onboardedData, profileData, settingsData] = await Promise.all([
        AsyncStorage.getItem('@app_onboarded'),
        AsyncStorage.getItem('@user_profile'),
        AsyncStorage.getItem('@app_settings'),
      ]);

      setIsOnboardedState(onboardedData === 'true');
      
      if (profileData) {
        setUserProfile(JSON.parse(profileData));
      }
      
      if (settingsData) {
        setSettings({ ...defaultSettings, ...JSON.parse(settingsData) });
      }
    } catch (error) {
      console.error('Error loading app state:', error);
    } finally {
      setLoading(false);
    }
  };

  const setOnboarded = async (value: boolean) => {
    try {
      await AsyncStorage.setItem('@app_onboarded', value.toString());
      setIsOnboardedState(value);
    } catch (error) {
      console.error('Error setting onboarded:', error);
    }
  };

  const updateProfile = async (profile: UserProfile) => {
    try {
      await AsyncStorage.setItem('@user_profile', JSON.stringify(profile));
      setUserProfile(profile);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    try {
      const updated = { ...settings, ...newSettings };
      await AsyncStorage.setItem('@app_settings', JSON.stringify(updated));
      setSettings(updated);
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  return (
    <AppContext.Provider
      value={{
        isOnboarded,
        userProfile,
        settings,
        setOnboarded,
        updateProfile,
        updateSettings,
        loading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
