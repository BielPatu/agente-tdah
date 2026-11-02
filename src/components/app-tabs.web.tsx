import { TabList, TabSlot, TabTrigger, Tabs } from 'expo-router/ui';

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList>
        <TabTrigger name="home" href="/">
          Hoje
        </TabTrigger>
        <TabTrigger name="explore" href="/explore">
          Atividades
        </TabTrigger>
        <TabTrigger name="routine" href="/routine">
          Rotina
        </TabTrigger>
        <TabTrigger name="account" href="/account">
          Google
        </TabTrigger>
      </TabList>
    </Tabs>
  );
}
