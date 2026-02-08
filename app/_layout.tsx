import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { PaperProvider } from 'react-native-paper';

export default function RootLayout() {
  const loadVendor = useAuthStore((state) => state.loadVendor);

  useEffect(() => {
    loadVendor();
  }, []);

  return (
    <PaperProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </PaperProvider>
  );
}