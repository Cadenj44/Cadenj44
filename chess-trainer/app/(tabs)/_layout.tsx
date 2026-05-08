import { Tabs } from 'expo-router';
import { Text, View } from 'react-native';
import { Colors, Typography } from '@/constants/theme';

function TabIcon({ icon, label, focused }: { icon: string; label: string; focused: boolean }) {
  return (
    <View style={{ alignItems: 'center', gap: 2, paddingTop: 6 }}>
      <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.45 }}>{icon}</Text>
      <Text style={{
        fontSize: 9,
        fontWeight: focused ? Typography.weights.bold : Typography.weights.normal,
        color: focused ? Colors.primary : Colors.textMuted,
        letterSpacing: 0.3,
      }}>
        {label.toUpperCase()}
      </Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0d1120',
          borderTopColor: '#1e2555',
          borderTopWidth: 1,
          height: 68,
          paddingBottom: 10,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ tabBarIcon: ({ focused }) => <TabIcon icon="🗺️" label="Learn" focused={focused} /> }}
      />
      <Tabs.Screen
        name="play"
        options={{ tabBarIcon: ({ focused }) => <TabIcon icon="♟️" label="Play" focused={focused} /> }}
      />
      <Tabs.Screen
        name="practice"
        options={{ tabBarIcon: ({ focused }) => <TabIcon icon="🎯" label="Puzzles" focused={focused} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ tabBarIcon: ({ focused }) => <TabIcon icon="👤" label="Profile" focused={focused} /> }}
      />
    </Tabs>
  );
}
