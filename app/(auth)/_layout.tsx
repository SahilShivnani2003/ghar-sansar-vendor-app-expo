import { Stack } from 'expo-router';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export default function AuthLayout() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{flex:1}}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
        </Stack>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}