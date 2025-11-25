import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { HealthScreen } from './src/screens/HealthScreen';
import { BriefingScreen } from './src/screens/BriefingScreen';
import { DecisionsScreen } from './src/screens/DecisionsScreen';
import { RelationshipsScreen } from './src/screens/RelationshipsScreen';
import { SimulatorScreen } from './src/screens/SimulatorScreen';

const Tab = createBottomTabNavigator();

/**
 * Timeline App Entry Point
 * Bottom tab navigation for all main features
 */
export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
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
            fontSize: 12,
            fontWeight: '600',
          },
        }}
      >
        <Tab.Screen
          name="Health"
          component={HealthScreen}
          options={{
            tabBarLabel: 'Health',
            tabBarIcon: () => null,
          }}
        />
        <Tab.Screen
          name="Decisions"
          component={DecisionsScreen}
          options={{
            tabBarLabel: 'Decisions',
            tabBarIcon: () => null,
          }}
        />
        <Tab.Screen
          name="Relationships"
          component={RelationshipsScreen}
          options={{
            tabBarLabel: 'Relationships',
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
          name="Simulator"
          component={SimulatorScreen}
          options={{
            tabBarLabel: 'Simulator',
            tabBarIcon: () => null,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
