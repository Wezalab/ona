import '../polyfills';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';
import { AppProvider } from '@/contexts/AppContext';
import { ApiProvider } from '@/contexts/ApiContext';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <ApiProvider>
          <StatusBar style="auto" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.background },
            }}
          />
        </ApiProvider>
      </AppProvider>
    </SafeAreaProvider>
  );
}
