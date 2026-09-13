import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase/client.js';
import { employeeCodeToInternalEmail } from '../logic/auth-mapping.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (userId) => {
    if (!userId) {
      setProfile(null);
      return;
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('employee_code, role, display_name')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('[Auth] Không đọc được hồ sơ profiles:', error.message);
      setProfile(null);
      return;
    }
    setProfile(data);
  }, []);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      setSession(data.session);
      await loadProfile(data.session?.user?.id);
      if (active) setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      await loadProfile(newSession?.user?.id);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signIn = useCallback(async (employeeCode, password) => {
    const email = employeeCodeToInternalEmail(employeeCode);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const updatePassword = useCallback(async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    return { error };
  }, []);

  return (
    <AuthContext.Provider value={{ session, profile, loading, signIn, signOut, updatePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth() phải được gọi bên trong <AuthProvider>');
  return ctx;
}
