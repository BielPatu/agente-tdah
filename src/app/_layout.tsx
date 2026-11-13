import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { useColorScheme } from 'react-native';

import { AuthProvider, useAuth } from '@/lib/auth';
import { migrateDbIfNeeded } from '@/lib/db';
import { ScheduleProvider, useSchedule } from '@/lib/schedule';

function RootNavigator() {
  const { user } = useAuth();
  const { isSetupComplete, isLoaded } = useSchedule();
  const isLoggedIn = user !== null;

  // Wait for the saved schedule so the setup wizard doesn't flash for returning users.
  if (!isLoaded) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!isLoggedIn}>
        <Stack.Screen name="login" />
      </Stack.Protected>

      <Stack.Protected guard={isLoggedIn && !isSetupComplete}>
        <Stack.Screen name="setup" />
      </Stack.Protected>

      <Stack.Protected guard={isLoggedIn && isSetupComplete}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <SQLiteProvider databaseName="ritmo.db" onInit={migrateDbIfNeeded}>
          <ScheduleProvider>
            <RootNavigator />
          </ScheduleProvider>
        </SQLiteProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
