import { Tabs } from 'expo-router';
import { colors } from '../../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../hooks/useLanguage';

export default function TabsLayout() {
  const { t } = useLanguage();

  return (
    <Tabs screenOptions={{ 
      headerShown: false,
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.onSurfaceVariant,
      tabBarStyle: {
        borderTopWidth: 1,
        borderTopColor: colors.outlineVariant,
        elevation: 0,
        height: 60,
        paddingBottom: 8,
      }
    }}>
      <Tabs.Screen 
        name="home" 
        options={{
          title: t('home'),
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" color={color} size={size} />
        }} 
      />
      <Tabs.Screen 
        name="map" 
        options={{
          title: t('map'),
          tabBarIcon: ({ color, size }) => <Ionicons name="map-outline" color={color} size={size} />
        }} 
      />
      <Tabs.Screen 
        name="alerts/index" 
        options={{
          title: t('alerts'),
          tabBarIcon: ({ color, size }) => <Ionicons name="notifications-outline" color={color} size={size} />
        }} 
      />
      <Tabs.Screen 
        name="sync" 
        options={{
          title: t('sync'),
          tabBarIcon: ({ color, size }) => <Ionicons name="sync-outline" color={color} size={size} />
        }} 
      />
      <Tabs.Screen 
        name="profile" 
        options={{
          title: t('account'),
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" color={color} size={size} />
        }} 
      />
      <Tabs.Screen 
        name="awareness" 
        options={{
          title: t('awareness'),
          tabBarIcon: ({ color, size }) => <Ionicons name="book-outline" color={color} size={size} />
        }} 
      />
      <Tabs.Screen 
        name="alerts/[alertId]" 
        options={{
          href: null, // Hide from tab bar
        }} 
      />
    </Tabs>
  );
}
