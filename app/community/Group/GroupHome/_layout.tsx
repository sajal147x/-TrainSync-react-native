import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import Leaderboard from './leaderboard';
import Messaging from './messaging';
import Settings from './settings';

const Tab = createBottomTabNavigator();

export default function GroupHomeLayout() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'trophy';
          if (route.name === 'Leaderboard') iconName = 'trophy';
          else if (route.name === 'Messaging') iconName = 'chatbubbles';
          else if (route.name === 'Settings') iconName = 'settings';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#9AA4B2',
        tabBarStyle: { backgroundColor: '#0d1117', borderTopColor: '#131720' },
      })}
    >
      <Tab.Screen 
        name="Leaderboard" 
        component={Leaderboard}
        options={{ title: 'Leaderboard' }}
      />
      <Tab.Screen 
        name="Messaging" 
        component={Messaging}
        options={{ title: 'Messaging' }}
      />
      <Tab.Screen 
        name="Settings" 
        component={Settings}
        options={{ title: 'Settings' }}
      />
    </Tab.Navigator>
  );
}

