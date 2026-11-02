import { NativeTabs } from 'expo-router/native-tabs';
import { colors } from '@/components/mvp-ui';

export default function AppTabs() {
  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.primarySoft}
      tintColor={colors.primary}
      labelStyle={{ selected: { color: colors.primary } }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Hoje</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="explore">
        <NativeTabs.Trigger.Label>Atividades</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="routine">
        <NativeTabs.Trigger.Label>Rotina</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="account">
        <NativeTabs.Trigger.Label>Google</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
