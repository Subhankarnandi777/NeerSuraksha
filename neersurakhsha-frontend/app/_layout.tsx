import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts as useInterFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { useFonts as useMontserratFonts, Montserrat_600SemiBold, Montserrat_700Bold, Montserrat_800ExtraBold } from '@expo-google-fonts/montserrat';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import { useAppStore } from '../store/main.store';
import { resolveLanguageCode } from '../constants/languages';

// Prevent splash screen from hiding automatically
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const [interLoaded, interError] = useInterFonts({
    'Inter': Inter_400Regular, 
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const [montserratLoaded, montserratError] = useMontserratFonts({
    'Montserrat': Montserrat_700Bold,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    Montserrat_800ExtraBold,
  });

  const loaded = interLoaded && montserratLoaded;
  const error = interError || montserratError;

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  useEffect(() => {
    if (!loaded) return;

    AsyncStorage.getItem('jaljeevan_language')
      .then((storedLanguage) => {
        if (storedLanguage) {
          const nextLanguage = resolveLanguageCode(storedLanguage);
          useAppStore.getState().setLanguage(nextLanguage);
        }
      })
      .catch(() => undefined);

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const user = session.user;
        const { setUserName, setUserRole, setUserPhone } = useAppStore.getState();
        setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || 'User');
        setUserRole(user.user_metadata?.role || 'ASHA Worker');
        setUserPhone(user.email || 'No Email');
        
        if (segments[0] !== '(tabs)') {
          router.replace('/(tabs)/home');
        }
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        const user = session.user;
        const { setUserName, setUserRole, setUserPhone } = useAppStore.getState();
        setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || 'User');
        setUserRole(user.user_metadata?.role || 'ASHA Worker');
        setUserPhone(user.email || 'No Email');
        router.replace('/(tabs)/home');
      } else {
        router.replace('/splash');
      }
    });

    return () => subscription.unsubscribe();
  }, [loaded]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
}
