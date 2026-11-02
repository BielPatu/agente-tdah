import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ActionButton, Card, colors, PageHeader, Screen } from '@/components/mvp-ui';

export default function AccountScreen() {
  const [message, setMessage] = useState('');

  return (
    <Screen>
      <PageHeader
        eyebrow="INTEGRAÇÕES"
        title="Google Agenda"
        subtitle="Conecte sua agenda quando quiser. Isso é opcional." />

      <Card style={styles.googleCard}>
        <View style={styles.googleMark}>
          <Text style={styles.googleMarkText}>G</Text>
        </View>
        <Text accessibilityRole="header" style={styles.cardTitle}>
          Sua agenda, em um só lugar
        </Text>
        <Text style={styles.bodyText}>
          A integração poderá ajudar a considerar seus compromissos ao organizar blocos de estudo
          e descanso.
        </Text>
        <View style={styles.permissionBox}>
          <Text style={styles.permissionTitle}>Acesso pensado para o necessário</Text>
          <Text style={styles.bodyText}>
            A futura conexão solicitará apenas as permissões necessárias para consultar e organizar
            eventos da agenda. Você poderá continuar sem conectar.
          </Text>
        </View>
        <ActionButton
          label="Continuar com Google"
          onPress={() => setMessage('A conexão com o Google estará disponível em uma próxima etapa.')}
        />
        <ActionButton
          label="Agora não"
          variant="secondary"
          onPress={() => setMessage('Tudo bem. Você pode usar o app sem conectar sua agenda.')}
        />
        {message ? (
          <Text accessibilityRole="status" style={styles.statusMessage}>
            {message}
          </Text>
        ) : null}
      </Card>

      <Card style={styles.privacyCard}>
        <Text style={styles.privacyTitle}>Seus dados e sua escolha</Text>
        <Text style={styles.bodyText}>
          Este protótipo não inicia sessão, acessa o Google Calendar nem salva credenciais.
          Autenticação, sessão persistente e renovação segura de tokens no servidor ainda precisam
          ser implementadas.
        </Text>
      </Card>

      <Text style={styles.version}>Ritmo · protótipo visual</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  googleCard: {
    alignItems: 'stretch',
  },
  googleMark: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F1F4F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleMarkText: {
    color: '#4285F4',
    fontSize: 23,
    fontWeight: '800',
  },
  cardTitle: {
    color: colors.ink,
    fontSize: 19,
    fontWeight: '700',
  },
  bodyText: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
  },
  permissionBox: {
    padding: 14,
    gap: 7,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
  },
  permissionTitle: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  statusMessage: {
    color: colors.primary,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  privacyCard: {
    backgroundColor: colors.surface,
  },
  privacyTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '700',
  },
  version: {
    color: colors.muted,
    fontSize: 12,
    textAlign: 'center',
  },
});
