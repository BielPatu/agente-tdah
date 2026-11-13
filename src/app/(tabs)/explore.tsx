import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ActionButton, Card, colors, PageHeader, Screen, TextField } from '@/components/mvp-ui';

type Priority = 'Alta' | 'Média' | 'Baixa';
type Activity = { id: number; name: string; due: string; priority: Priority };

const starterActivities: Activity[] = [
  { id: 1, name: 'Projeto de Biologia', due: '12 nov', priority: 'Média' },
  { id: 2, name: 'Leitura de História', due: '15 nov', priority: 'Baixa' },
];

export default function ActivitiesScreen() {
  const [activities, setActivities] = useState(starterActivities);
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [due, setDue] = useState('');
  const [priority, setPriority] = useState<Priority>('Média');
  const [error, setError] = useState('');

  function addActivity() {
    if (!name.trim() || !due.trim()) {
      setError('Preencha o nome e o prazo para continuar.');
      return;
    }

    setActivities((current) => [
      { id: Date.now(), name: name.trim(), due: due.trim(), priority },
      ...current,
    ]);
    setName('');
    setDue('');
    setPriority('Média');
    setError('');
    setIsAdding(false);
  }

  return (
    <Screen>
      <PageHeader
        eyebrow="SEU ESPAÇO"
        title="Atividades"
        subtitle="Tire as tarefas da cabeça e coloque tudo em um só lugar." />

      <ActionButton
        label={isAdding ? 'Fechar formulário' : '+ Adicionar atividade'}
        onPress={() => {
          setIsAdding((current) => !current);
          setError('');
        }}
      />

      {isAdding ? (
        <Card>
          <Text accessibilityRole="header" style={styles.formTitle}>
            Nova atividade
          </Text>
          <TextField
            label="Nome"
            placeholder="Ex.: trabalho de biologia"
            value={name}
            onChangeText={setName}
            returnKeyType="next"
          />
          <TextField
            label="Prazo"
            placeholder="Ex.: 12/11/2026"
            value={due}
            onChangeText={setDue}
            returnKeyType="done"
          />
          <Text style={styles.label}>Prioridade</Text>
          <View style={styles.priorityRow}>
            {(['Baixa', 'Média', 'Alta'] as const).map((option) => (
              <Pressable
                key={option}
                accessibilityRole="radio"
                accessibilityState={{ checked: priority === option }}
                onPress={() => setPriority(option)}
                style={[
                  styles.priorityOption,
                  priority === option ? styles.prioritySelected : null,
                ]}>
                <Text
                  style={[
                    styles.priorityText,
                    priority === option ? styles.priorityTextSelected : null,
                  ]}>
                  {option}
                </Text>
              </Pressable>
            ))}
          </View>
          {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
          <ActionButton label="Salvar atividade" onPress={addActivity} />
        </Card>
      ) : null}

      <View style={styles.listHeader}>
        <Text accessibilityRole="header" style={styles.sectionTitle}>
          Próximas
        </Text>
        <Text style={styles.countText}>{activities.length} atividades</Text>
      </View>

      {activities.map((activity) => (
        <ActivityCard key={activity.id} activity={activity} />
      ))}

      <Card style={styles.encouragement}>
        <Text style={styles.encouragementTitle}>Comece pequeno</Text>
        <Text style={styles.secondaryText}>
          Uma atividade registrada já é um passo. Você pode ajustar os detalhes depois.
        </Text>
      </Card>
      <Text style={styles.prototypeNote}>Seus dados ficam só nesta tela de demonstração.</Text>
    </Screen>
  );
}

function ActivityCard({ activity }: { activity: Activity }) {
  const priorityStyle =
    activity.priority === 'Alta'
      ? styles.highTag
      : activity.priority === 'Baixa'
        ? styles.lowTag
        : styles.mediumTag;

  return (
    <Card style={styles.activityCard}>
      <View style={styles.activityHeading}>
        <View style={styles.activityMark}>
          <Text style={styles.activityMarkText}>A</Text>
        </View>
        <View style={styles.activityCopy}>
          <Text style={styles.activityTitle}>{activity.name}</Text>
          <Text style={styles.secondaryText}>Prazo: {activity.due}</Text>
        </View>
      </View>
      <Text style={[styles.priorityTag, priorityStyle]}>Prioridade {activity.priority.toLowerCase()}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  formTitle: {
    color: colors.ink,
    fontSize: 19,
    fontWeight: '700',
  },
  label: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '600',
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityOption: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  prioritySelected: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  priorityText: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '600',
  },
  priorityTextSelected: {
    color: colors.primary,
  },
  error: {
    color: '#A64B3F',
    fontSize: 14,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: -10,
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: '700',
  },
  countText: {
    color: colors.muted,
    fontSize: 13,
  },
  activityCard: {
    gap: 14,
  },
  activityHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  activityMark: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.lavender,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityMarkText: {
    color: '#6C5B8C',
    fontSize: 17,
    fontWeight: '700',
  },
  activityCopy: {
    flex: 1,
    gap: 4,
  },
  activityTitle: {
    color: colors.ink,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
  },
  secondaryText: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  priorityTag: {
    alignSelf: 'flex-start',
    overflow: 'hidden',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 12,
    fontWeight: '600',
  },
  highTag: {
    color: '#9A493E',
    backgroundColor: '#F8E8E4',
  },
  mediumTag: {
    color: '#856529',
    backgroundColor: '#F7F0D9',
  },
  lowTag: {
    color: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  encouragement: {
    backgroundColor: colors.accentSoft,
    borderColor: '#F0DED4',
  },
  encouragementTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '700',
  },
  prototypeNote: {
    color: colors.muted,
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 18,
  },
});
