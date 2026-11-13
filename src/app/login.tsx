import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { ActionButton, Card, colors, PageHeader, Screen } from '@/components/mvp-ui';
import { useAuth } from '@/lib/auth';

export default function LoginScreen() {
  const { signInWithGoogle, isSigningIn } = useAuth();
  const [error, setError] = useState('');

  async function handleGoogle() {
    setError('');
    try {
      await signInWithGoogle();
    } catch {
      setError('Não foi possível entrar agora. Tente de novo quando quiser.');
    }
  }

  return (
    <Screen>
      <View style={styles.brand}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>R</Text>
        </View>
        <Text style={styles.brandName}>Ritmo</Text>
      </View>

      <PageHeader
        eyebrow="BOAS-VINDAS"
        title="Organize seu dia no seu ritmo"
        subtitle="Entre com sua conta Google para guardar suas atividades e rotinas." />

      <Card>
        <View style={styles.googleMark}>
          <Text style={styles.googleMarkText}>G</Text>
        </View>
        <Text accessibilityRole="header" style={styles.cardTitle}>
          Entrar com Google
        </Text>
        <Text style={styles.bodyText}>
          Usamos sua conta apenas para identificar você e, se quiser, considerar seus compromissos
          da agenda.
        </Text>

        <ActionButton
          label={isSigningIn ? 'Entrando…' : 'Continuar com Google'}
          disabled={isSigningIn}
          onPress={handleGoogle}
        />
        {isSigningIn ? <ActivityIndicator color={colors.primary} /> : null}

        {error ? (
          <Text accessibilityRole="alert" style={styles.errorText}>
            {error}
          </Text>
        ) : null}
      </Card>

      <Text style={styles.footnote}>
        Protótipo: o login é simulado e nenhum dado é enviado ao Google.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 24,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: colors.surface,
    fontSize: 20,
    fontWeight: '800',
  },
  brandName: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: '700',
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
  errorText: {
    color: colors.accent,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  footnote: {
    color: colors.muted,
    fontSize: 12,
    textAlign: 'center',
  },
});
