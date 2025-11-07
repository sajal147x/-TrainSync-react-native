import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from './home';
import Workouts from './workout';
import Settings from './settings';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

export default function Layout() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';
          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Workouts') iconName = 'barbell';
          else if (route.name === 'Settings') iconName = 'settings';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#9AA4B2',
        tabBarStyle: { backgroundColor: '#0d1117', borderTopColor: '#131720' },
      })}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Workouts" component={Workouts} />
      <Tab.Screen name="Settings" component={Settings} />
    </Tab.Navigator>
  );
}
