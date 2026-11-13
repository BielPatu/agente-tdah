import { Link } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ActionButton, Card, colors, Screen } from '@/components/mvp-ui';
import { todayWeekday, useSchedule, WEEKDAY_LABELS } from '@/lib/schedule';

const TIMELINE_COLORS = [colors.primary, '#C18A43', '#8873A8', colors.accent];

export default function TodayScreen() {
  const [showClassPrompt, setShowClassPrompt] = useState(true);
  const { events } = useSchedule();
  const today = todayWeekday();
  const todayClasses = events.filter((event) => event.weekday === today);

  return (
    <Screen>
      <View style={styles.brandRow}>
        <View style={styles.brandMark}>
          <Text style={styles.brandMarkText}>r</Text>
        </View>
        <Text style={styles.brand}>ritmo</Text>
        <Text style={styles.todayLabel}>HOJE</Text>
      </View>

      <View style={styles.greeting}>
        <Text style={styles.greetingTitle}>Bom dia 👋</Text>
        <Text style={styles.greetingSubtitle}>Vamos por partes. O que cabe no seu dia?</Text>
      </View>

      <Card style={styles.focusCard}>
        <View style={styles.focusTop}>
          <Text style={styles.cardEyebrow}>SEU PRÓXIMO PASSO</Text>
          <View style={styles.timePill}>
            <Text style={styles.timePillText}>14:00</Text>
          </View>
        </View>
        <Text style={styles.focusTitle}>Projeto de Biologia</Text>
        <Text style={styles.mutedText}>Um bloco de foco de 25 min, sem pressão.</Text>
        <View style={styles.focusFooter}>
          <Text style={styles.softTag}>Prioridade média</Text>
          <Text style={styles.timeHint}>Hoje · 25 min</Text>
        </View>
      </Card>

      <View style={styles.sectionHeading}>
        <Text accessibilityRole="header" style={styles.sectionTitle}>
          Suas aulas de hoje
        </Text>
        <Link href="/routine" asChild>
          <Pressable accessibilityRole="link">
            <Text style={styles.linkText}>Ver rotina</Text>
          </Pressable>
        </Link>
      </View>

      <Card style={styles.timelineCard}>
        {todayClasses.length ? (
          todayClasses.map((event, index) => (
            <TimelineItem
              key={event.id}
              time={event.start}
              title={event.title}
              detail={[`até ${event.end}`, event.location, event.professor].filter(Boolean).join(' · ')}
              color={TIMELINE_COLORS[index % TIMELINE_COLORS.length]}
              last={index === todayClasses.length - 1}
            />
          ))
        ) : (
          <Text style={[styles.mutedText, styles.emptyTimeline]}>
            Sem aulas na {WEEKDAY_LABELS[today].toLowerCase()}. Um bom espaço para descansar ou
            adiantar algo pequeno.
          </Text>
        )}
      </Card>

      {showClassPrompt ? (
        <Card style={styles.promptCard}>
          <View style={styles.promptIcon}>
            <Text style={styles.promptIconText}>?</Text>
          </View>
          <Text accessibilityRole="header" style={styles.promptTitle}>
            Saiu da aula?
          </Text>
          <Text style={styles.mutedText}>
            Se tiver uma atividade nova, podemos anotar agora. Leva menos de um minuto.
          </Text>
          <Link href="/explore" asChild>
            <ActionButton label="Registrar atividade" onPress={() => {}} />
          </Link>
          <Pressable
            accessibilityRole="button"
            onPress={() => setShowClassPrompt(false)}
            style={styles.laterButton}>
            <Text style={styles.linkText}>Agora não</Text>
          </Pressable>
        </Card>
      ) : (
        <Text style={styles.footerNote}>Tudo bem. Você pode registrar depois.</Text>
      )}

      <Text style={styles.footerNote}>Um dia de cada vez. Seu ritmo é o certo.</Text>
    </Screen>
  );
}

function TimelineItem({
  time,
  title,
  detail,
  color,
  last = false,
}: {
  time: string;
  title: string;
  detail: string;
  color: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.timelineItem, !last ? styles.timelineDivider : null]}>
      <Text style={styles.timelineTime}>{time}</Text>
      <View style={[styles.timelineDot, { backgroundColor: color }]} />
      <View style={styles.timelineCopy}>
        <Text style={styles.timelineTitle}>{title}</Text>
        <Text style={styles.mutedText}>{detail}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  brandRow: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  brandMark: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  brandMarkText: {
    color: colors.surface,
    fontSize: 20,
    fontWeight: '800',
  },
  brand: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: '800',
  },
  todayLabel: {
    marginLeft: 'auto',
    color: colors.muted,
    fontSize: 12,
    letterSpacing: 1,
    fontWeight: '700',
  },
  greeting: {
    gap: 7,
    paddingTop: 4,
  },
  greetingTitle: {
    color: colors.ink,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '700',
  },
  greetingSubtitle: {
    color: colors.muted,
    fontSize: 16,
    lineHeight: 23,
  },
  focusCard: {
    backgroundColor: colors.primarySoft,
    borderColor: '#D7E5D9',
    padding: 20,
  },
  focusTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardEyebrow: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.7,
  },
  timePill: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 5,
  },
  timePillText: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '700',
  },
  focusTitle: {
    color: colors.ink,
    fontSize: 21,
    lineHeight: 27,
    fontWeight: '700',
  },
  mutedText: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  focusFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  softTag: {
    color: colors.primary,
    backgroundColor: '#D8E8DA',
    borderRadius: 20,
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 12,
    fontWeight: '600',
  },
  timeHint: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  sectionHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: -8,
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 19,
    fontWeight: '700',
  },
  linkText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  timelineCard: {
    paddingVertical: 3,
    gap: 0,
  },
  emptyTimeline: {
    paddingVertical: 14,
  },
  timelineItem: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    paddingVertical: 14,
  },
  timelineDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  timelineTime: {
    width: 45,
    color: colors.muted,
    fontSize: 13,
    fontWeight: '600',
    paddingTop: 1,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 5,
  },
  timelineCopy: {
    flex: 1,
    gap: 3,
  },
  timelineTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '600',
  },
  promptCard: {
    backgroundColor: colors.yellow,
    borderColor: '#EFE4C1',
    alignItems: 'flex-start',
  },
  promptIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E9DDAF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  promptIconText: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '700',
  },
  promptTitle: {
    color: colors.ink,
    fontSize: 19,
    fontWeight: '700',
  },
  laterButton: {
    alignSelf: 'center',
    paddingVertical: 6,
  },
  footerNote: {
    textAlign: 'center',
    color: colors.muted,
    fontSize: 13,
    paddingVertical: 4,
  },
});
