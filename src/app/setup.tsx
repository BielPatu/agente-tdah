import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { ActionButton, Card, colors, PageHeader, Screen } from '@/components/mvp-ui';
import {
  sortEvents,
  useSchedule,
  WEEKDAY_LABELS,
  WEEKDAYS,
  type AnalyzeAgendaResponse,
  type ClassEvent,
} from '@/lib/schedule';

type Step = 'pick' | 'analyzing' | 'review';
type PickedImage = { uri: string; base64: string; mimeType: string };

const STEP_NUMBER: Record<Step, number> = { pick: 1, analyzing: 2, review: 3 };

async function analyzeAgenda(image: PickedImage) {
  // Relative URL hits the Expo dev server in development. For production native
  // builds, set the expo-router plugin `origin` in app.json to the deployed server.
  const response = await fetch('/api/agenda/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64: image.base64, mimeType: image.mimeType }),
  });
  const data = (await response.json()) as AnalyzeAgendaResponse;
  if ('error' in data) throw new Error(data.error);
  return data;
}

export default function SetupScreen() {
  const { completeSetup } = useSchedule();
  const [step, setStep] = useState<Step>('pick');
  const [image, setImage] = useState<PickedImage | null>(null);
  const [events, setEvents] = useState<ClassEvent[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  async function pickImage() {
    setError('');
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      base64: true,
      quality: 0.7,
    });
    const asset = result.canceled ? null : result.assets[0];
    if (!asset) return;
    if (!asset.base64) {
      setError('Não conseguimos abrir essa imagem. Tente outra.');
      return;
    }
    // expo-image-picker always encodes `base64` as JPEG.
    setImage({ uri: asset.uri, base64: asset.base64, mimeType: 'image/jpeg' });
  }

  async function analyze() {
    if (!image) return;
    setError('');
    setStep('analyzing');
    try {
      const result = await analyzeAgenda(image);
      setEvents(
        sortEvents(result.events.map((event, index) => ({ ...event, id: `${Date.now()}-${index}` }))),
      );
      setWarnings(result.warnings);
      setStep('review');
    } catch (e) {
      setError(
        e instanceof Error && e.message
          ? e.message
          : 'Não foi possível analisar a imagem agora. Tente de novo.',
      );
      setStep('pick');
    }
  }

  async function save(next: ClassEvent[]) {
    setError('');
    setIsSaving(true);
    try {
      await completeSetup(next);
    } catch (e) {
      console.error('[setup] failed to save schedule', e);
      setError('Não foi possível salvar agora. Tente de novo.');
      setIsSaving(false);
    }
  }

  function removeEvent(id: string) {
    setEvents((current) => current.filter((event) => event.id !== id));
  }

  function startOver() {
    setImage(null);
    setEvents([]);
    setWarnings([]);
    setError('');
    setStep('pick');
  }

  return (
    <Screen>
      <View style={styles.progressRow}>
        <Text style={styles.progressText}>Passo {STEP_NUMBER[step]} de 3</Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${(STEP_NUMBER[step] / 3) * 100}%` }]} />
        </View>
      </View>

      {step === 'pick' ? (
        <>
          <PageHeader
            eyebrow="CONFIGURAÇÃO"
            title="Vamos montar sua semana"
            subtitle="Envie um print da sua grade de aulas. A gente lê e monta sua agenda para você revisar." />

          <Card>
            <Text style={styles.cardTitle}>Dicas para um bom print</Text>
            <Tip text="Mostre a semana inteira, com os dias e horários visíveis." />
            <Tip text="Pode ser do portal da faculdade, do app da escola ou de uma planilha." />
            <Tip text="Evite cortar o nome das disciplinas." />
          </Card>

          {image ? (
            <Card style={styles.previewCard}>
              <Image
                source={{ uri: image.uri }}
                style={styles.preview}
                contentFit="contain"
                accessibilityLabel="Print selecionado da agenda"
              />
              <ActionButton label="Analisar minha agenda" onPress={analyze} />
              <ActionButton label="Escolher outra imagem" variant="secondary" onPress={pickImage} />
            </Card>
          ) : (
            <ActionButton label="Escolher print da galeria" onPress={pickImage} />
          )}

          {error ? (
            <Text accessibilityRole="alert" style={styles.errorText}>
              {error}
            </Text>
          ) : null}

          <ActionButton
            label="Pular por enquanto"
            variant="quiet"
            disabled={isSaving}
            onPress={() => save([])}
          />
        </>
      ) : null}

      {step === 'analyzing' ? (
        <Card style={styles.analyzingCard}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text accessibilityRole="header" style={styles.cardTitle}>
            Lendo sua agenda…
          </Text>
          <Text style={styles.bodyText}>
            Isso costuma levar alguns segundos. Você vai poder revisar tudo antes de salvar.
          </Text>
        </Card>
      ) : null}

      {step === 'review' ? (
        <>
          <PageHeader
            eyebrow="REVISÃO"
            title={events.length ? 'Confira suas aulas' : 'Não encontramos aulas'}
            subtitle={
              events.length
                ? 'Remova o que não estiver certo. Você poderá ajustar depois.'
                : 'Tente um print com os dias e horários mais visíveis.'
            } />

          {warnings.length ? (
            <Card style={styles.warningCard}>
              {warnings.map((warning) => (
                <Text key={warning} style={styles.bodyText}>
                  • {warning}
                </Text>
              ))}
            </Card>
          ) : null}

          {WEEKDAYS.map((day) => {
            const dayEvents = events.filter((event) => event.weekday === day);
            if (!dayEvents.length) return null;
            return (
              <Card key={day}>
                <Text style={styles.dayTitle}>{WEEKDAY_LABELS[day]}</Text>
                {dayEvents.map((event) => (
                  <View key={event.id} style={styles.eventRow}>
                    <Text style={styles.eventTime}>
                      {event.start}
                      {'\n'}
                      {event.end}
                    </Text>
                    <View style={styles.eventCopy}>
                      <Text style={styles.eventTitle}>{event.title}</Text>
                      {event.location || event.professor || event.notes ? (
                        <Text style={styles.bodyText}>
                          {[event.location, event.professor, event.notes].filter(Boolean).join(' · ')}
                        </Text>
                      ) : null}
                    </View>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Remover ${event.title}`}
                      hitSlop={8}
                      onPress={() => removeEvent(event.id)}>
                      <Text style={styles.removeText}>Remover</Text>
                    </Pressable>
                  </View>
                ))}
              </Card>
            );
          })}

          {events.length ? (
            <ActionButton
              label={
                isSaving
                  ? 'Salvando…'
                  : `Salvar ${events.length} ${events.length === 1 ? 'aula' : 'aulas'} na agenda`
              }
              disabled={isSaving}
              onPress={() => save(events)}
            />
          ) : null}
          {error ? (
            <Text accessibilityRole="alert" style={styles.errorText}>
              {error}
            </Text>
          ) : null}
          <ActionButton
            label="Enviar outro print"
            variant="secondary"
            disabled={isSaving}
            onPress={startOver}
          />
        </>
      ) : null}
    </Screen>
  );
}

function Tip({ text }: { text: string }) {
  return (
    <View style={styles.tipRow}>
      <View style={styles.tipDot} />
      <Text style={[styles.bodyText, styles.tipText]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  progressRow: {
    gap: 8,
    marginTop: 8,
  },
  progressText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '600',
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  cardTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '700',
  },
  bodyText: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
  },
  tipRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  tipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 7,
    backgroundColor: colors.primary,
  },
  tipText: {
    flex: 1,
  },
  previewCard: {
    alignItems: 'stretch',
  },
  preview: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: 12,
    backgroundColor: colors.background,
  },
  errorText: {
    color: colors.accent,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  analyzingCard: {
    alignItems: 'center',
    paddingVertical: 32,
    marginTop: 40,
  },
  warningCard: {
    backgroundColor: colors.yellow,
    borderColor: '#EFE4C1',
    gap: 6,
  },
  dayTitle: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 6,
  },
  eventTime: {
    width: 46,
    color: colors.muted,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  eventCopy: {
    flex: 1,
    gap: 2,
  },
  eventTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '600',
  },
  removeText: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '700',
  },
});
