import { useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';

import { Card, colors, PageHeader, Screen, TextField } from '@/components/mvp-ui';

export default function RoutineScreen() {
  const [sleep, setSleep] = useState({ start: '22:30', end: '07:00' });
  const [meals, setMeals] = useState({ breakfast: '07:30', lunch: '12:00', dinner: '19:00' });
  const [focus, setFocus] = useState({ start: '14:00', end: '16:00' });
  const [muted, setMuted] = useState(false);

  return (
    <Screen>
      <PageHeader
        eyebrow="SEU BEM-ESTAR"
        title="Rotina"
        subtitle="Horários gentis ajudam a deixar espaço para o que importa." />

      <Card style={styles.introCard}>
        <Text style={styles.introTitle}>Seus horários, do seu jeito</Text>
        <Text style={styles.secondaryText}>
          Estes são pontos de partida. Ajuste para combinar com a sua realidade.
        </Text>
      </Card>

      <Card>
        <View style={styles.cardHeading}>
          <View style={[styles.iconBox, styles.sleepIcon]}>
            <Text style={styles.iconText}>Z</Text>
          </View>
          <View style={styles.headingCopy}>
            <Text style={styles.cardTitle}>Sono</Text>
            <Text style={styles.secondaryText}>Uma rotina de descanso possível</Text>
          </View>
        </View>
        <View style={styles.timeFields}>
          <View style={styles.timeField}>
            <TextField
              label="Dormir"
              value={sleep.start}
              onChangeText={(start) => setSleep((current) => ({ ...current, start }))}
              keyboardType="numbers-and-punctuation"
              maxLength={5}
            />
          </View>
          <View style={styles.timeField}>
            <TextField
              label="Acordar"
              value={sleep.end}
              onChangeText={(end) => setSleep((current) => ({ ...current, end }))}
              keyboardType="numbers-and-punctuation"
              maxLength={5}
            />
          </View>
        </View>
      </Card>

      <Card>
        <View style={styles.cardHeading}>
          <View style={[styles.iconBox, styles.mealIcon]}>
            <Text style={styles.iconText}>+</Text>
          </View>
          <View style={styles.headingCopy}>
            <Text style={styles.cardTitle}>Refeições</Text>
            <Text style={styles.secondaryText}>Lembretes para fazer uma pausa</Text>
          </View>
        </View>
        <TextField
          label="Café da manhã"
          value={meals.breakfast}
          onChangeText={(breakfast) => setMeals((current) => ({ ...current, breakfast }))}
          keyboardType="numbers-and-punctuation"
          maxLength={5}
        />
        <TextField
          label="Almoço"
          value={meals.lunch}
          onChangeText={(lunch) => setMeals((current) => ({ ...current, lunch }))}
          keyboardType="numbers-and-punctuation"
          maxLength={5}
        />
        <TextField
          label="Jantar"
          value={meals.dinner}
          onChangeText={(dinner) => setMeals((current) => ({ ...current, dinner }))}
          keyboardType="numbers-and-punctuation"
          maxLength={5}
        />
      </Card>

      <Card>
        <View style={styles.cardHeading}>
          <View style={[styles.iconBox, styles.focusIcon]}>
            <Text style={styles.iconText}>25</Text>
          </View>
          <View style={styles.headingCopy}>
            <Text style={styles.cardTitle}>Período de foco</Text>
            <Text style={styles.secondaryText}>Blocos curtos também contam</Text>
          </View>
        </View>
        <View style={styles.timeFields}>
          <View style={styles.timeField}>
            <TextField
              label="Começa"
              value={focus.start}
              onChangeText={(start) => setFocus((current) => ({ ...current, start }))}
              keyboardType="numbers-and-punctuation"
              maxLength={5}
            />
          </View>
          <View style={styles.timeField}>
            <TextField
              label="Termina"
              value={focus.end}
              onChangeText={(end) => setFocus((current) => ({ ...current, end }))}
              keyboardType="numbers-and-punctuation"
              maxLength={5}
            />
          </View>
        </View>
        <Text style={styles.helperText}>Sugestão de duração: 25 minutos com pausas.</Text>
      </Card>

      <Card style={styles.muteCard}>
        <View style={styles.muteCopy}>
          <Text style={styles.cardTitle}>Silenciar lembretes</Text>
          <Text style={styles.secondaryText}>
            {muted ? 'Sem lembretes enquanto estiver silenciado.' : 'Você pode mudar isso quando quiser.'}
          </Text>
        </View>
        <Switch
          accessibilityLabel="Silenciar lembretes"
          value={muted}
          onValueChange={setMuted}
          trackColor={{ false: '#D7DDD7', true: colors.primary }}
          thumbColor="#FFFFFF"
        />
      </Card>

      <Text style={styles.prototypeNote}>As alterações são temporárias neste protótipo.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  introCard: {
    backgroundColor: colors.primarySoft,
    borderColor: '#D7E5D9',
  },
  introTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryText: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  cardHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sleepIcon: {
    backgroundColor: colors.lavender,
  },
  mealIcon: {
    backgroundColor: colors.accentSoft,
  },
  focusIcon: {
    backgroundColor: colors.yellow,
  },
  iconText: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '800',
  },
  headingCopy: {
    flex: 1,
    gap: 3,
  },
  cardTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '700',
  },
  timeFields: {
    flexDirection: 'row',
    gap: 12,
  },
  timeField: {
    flex: 1,
  },
  helperText: {
    color: colors.muted,
    fontSize: 13,
  },
  muteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  muteCopy: {
    flex: 1,
    gap: 5,
    paddingRight: 12,
  },
  prototypeNote: {
    color: colors.muted,
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 18,
  },
});
