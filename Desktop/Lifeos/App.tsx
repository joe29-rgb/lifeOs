import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { AppProvider, useApp } from './src/context/AppContext';
import { HomeScreen } from './src/screens/HomeScreen';
import { FocusScreen } from './src/screens/FocusScreen';
import { LifeScreen } from './src/screens/LifeScreen';
import { HealthScreen } from './src/screens/HealthScreen';
import { BriefingScreen } from './src/screens/BriefingScreen';
import { SimulatorScreen } from './src/screens/SimulatorScreen';
import { IntelligenceDashboard } from './src/screens/IntelligenceDashboard';
import { InsightsScreen } from './src/screens/InsightsScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { CrisisScreen } from './src/screens/CrisisScreen';
import { BreathingScreen } from './src/screens/BreathingScreen';
import { EmergencyContactsScreen } from './src/screens/EmergencyContactsScreen';
import { PastYouScreen } from './src/screens/PastYouScreen';
import { PastYouInsightsScreen } from './src/screens/PastYouInsightsScreen';
import { FutureLettersScreen } from './src/screens/FutureLettersScreen';
import { DecisionCheckScreen } from './src/screens/DecisionCheckScreen';
import { RegretHistoryScreen } from './src/screens/RegretHistoryScreen';
import { SocialBatteryScreen } from './src/screens/SocialBatteryScreen';
import { SocialTypeScreen } from './src/screens/SocialTypeScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: '#757575',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E0E0E0',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: () => null,
        }}
      />
      <Tab.Screen
        name="Intelligence"
        component={IntelligenceDashboard}
        options={{
          tabBarLabel: 'Intelligence',
          tabBarIcon: () => null,
        }}
      />
      <Tab.Screen
        name="Focus"
        component={FocusScreen}
        options={{
          tabBarLabel: 'Focus',
          tabBarIcon: () => null,
        }}
      />
      <Tab.Screen
        name="Life"
        component={LifeScreen}
        options={{
          tabBarLabel: 'Life',
          tabBarIcon: () => null,
        }}
      />
      <Tab.Screen
        name="Health"
        component={HealthScreen}
        options={{
          tabBarLabel: 'Health',
          tabBarIcon: () => null,
        }}
      />
      <Tab.Screen
        name="Briefing"
        component={BriefingScreen}
        options={{
          tabBarLabel: 'Briefing',
          tabBarIcon: () => null,
        }}
      />
      <Tab.Screen
        name="Career"
        component={SimulatorScreen}
        options={{
          tabBarLabel: 'Career',
          tabBarIcon: () => null,
        }}
      />
      <Tab.Screen
        name="Crisis"
        component={CrisisScreen}
        options={{
          tabBarLabel: 'Crisis',
          tabBarIcon: () => null,
        }}
      />
      <Tab.Screen
        name="PastYou"
        component={PastYouScreen}
        options={{
          tabBarLabel: 'Past You',
          tabBarIcon: () => null,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: () => null,
        }}
      />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const { isOnboarded, loading } = useApp();

  if (loading) {
    return null;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isOnboarded ? (
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      ) : (
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="Breathing" component={BreathingScreen} />
          <Stack.Screen name="EmergencyContacts" component={EmergencyContactsScreen} />
          <Stack.Screen name="PastYouInsights" component={PastYouInsightsScreen} />
          <Stack.Screen name="FutureLetters" component={FutureLettersScreen} />
          <Stack.Screen name="DecisionCheck" component={DecisionCheckScreen} />
          <Stack.Screen name="RegretHistory" component={RegretHistoryScreen} />
          <Stack.Screen name="SocialBattery" component={SocialBatteryScreen} />
          <Stack.Screen name="SocialType" component={SocialTypeScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AppProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <RootNavigator />
      </NavigationContainer>
    </AppProvider>
  );
}
