import "../polyfills";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AppProvider } from "@/contexts/AppContext";
import { ApiProvider } from "@/contexts/ApiContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="language-select" />
      <Stack.Screen name="welcome" />
      <Stack.Screen name="consent" />
      <Stack.Screen name="home" />
      <Stack.Screen name="patient-info" />
      <Stack.Screen name="va-calibration" />
      <Stack.Screen name="va-test" />
      <Stack.Screen name="va-result" />
      <Stack.Screen name="eye-capture" />
      <Stack.Screen name="ai-processing" />
      <Stack.Screen name="screening-results" />
      <Stack.Screen name="history" />
      <Stack.Screen name="screening-detail" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="api-settings" />
      <Stack.Screen name="blockchain" />
      <Stack.Screen name="about" />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AppProvider>
          <ApiProvider>
            <RootLayoutNav />
          </ApiProvider>
        </AppProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
