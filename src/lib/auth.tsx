import { createContext, use, useState, type PropsWithChildren } from 'react';

export type AuthUser = {
  name: string;
  email: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  isSigningIn: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Prototype only: simulates a Google sign-in and keeps the session in memory.
 * Replace the body of `signInWithGoogle` with the real OAuth flow
 * (e.g. @react-native-google-signin/google-signin + server-side token validation)
 * and persist the session securely (e.g. expo-secure-store).
 */
async function mockGoogleSignIn(): Promise<AuthUser> {
  await new Promise((resolve) => setTimeout(resolve, 700));
  return { name: 'Estudante Ritmo', email: 'estudante@exemplo.com' };
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  async function signInWithGoogle() {
    setIsSigningIn(true);
    try {
      setUser(await mockGoogleSignIn());
    } finally {
      setIsSigningIn(false);
    }
  }

  function signOut() {
    setUser(null);
  }

  return (
    <AuthContext value={{ user, isSigningIn, signInWithGoogle, signOut }}>
      {children}
    </AuthContext>
  );
}

export function useAuth() {
  const context = use(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside <AuthProvider>.');
  }
  return context;
}
