import { useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, fetchUserProgress, upsertUserProgress } from '@/lib/supabase';
import { useGameStore } from '@/store/gameStore';
import { MAX_HEARTS } from '@/constants/curriculum';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { setProgress, reset } = useGameStore();

  useEffect(() => {
    supabase.auth.getSession()
      .then(({ data }) => {
        setSession(data.session);
        setUser(data.session?.user ?? null);
        if (data.session?.user) loadProgress(data.session.user.id);
        else { reset(); setLoading(false); }
      })
      .catch(() => {
        // Supabase not configured or network error — fall through as guest
        reset();
        setLoading(false);
      });

    let subscription: { unsubscribe: () => void } = { unsubscribe: () => {} };
    try {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) loadProgress(session.user.id);
        else { reset(); setLoading(false); }
      });
      subscription = data.subscription;
    } catch {
      // ignore if Supabase not configured
    }

    return () => subscription.unsubscribe();
  }, []);

  async function loadProgress(userId: string) {
    const raw = await fetchUserProgress(userId);
    if (raw) {
      setProgress({
        userId,
        xp: raw.xp ?? 0,
        level: raw.level ?? 1,
        streak: raw.streak ?? 0,
        lastActiveDate: raw.last_active_date ?? '',
        completedLessons: raw.completed_lessons ?? [],
        completedPuzzles: raw.completed_puzzles ?? [],
        unlockedUnits: raw.unlocked_units ?? ['basics'],
        hearts: raw.hearts ?? MAX_HEARTS,
        maxHearts: MAX_HEARTS,
        gems: raw.gems ?? 0,
      });
    } else {
      // First time user
      const initial = {
        userId,
        xp: 0,
        level: 1,
        streak: 0,
        lastActiveDate: '',
        completedLessons: [],
        completedPuzzles: [],
        unlockedUnits: ['basics'],
        hearts: MAX_HEARTS,
        maxHearts: MAX_HEARTS,
        gems: 0,
      };
      setProgress(initial);
      await upsertUserProgress(userId, {
        xp: 0,
        level: 1,
        streak: 0,
        hearts: MAX_HEARTS,
        gems: 0,
        unlocked_units: ['basics'],
        completed_lessons: [],
        completed_puzzles: [],
      });
    }
    setLoading(false);
  }

  async function signUp(email: string, password: string, username: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    });
    return { data, error };
  }

  async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  }

  async function signOut() {
    try { await supabase.auth.signOut(); } catch {}
    reset();
    setSession(null);
    setUser(null);
  }

  function playAsGuest() {
    reset();
    setSession(null);
    setUser(null);
    setLoading(false);
  }

  return { session, user, loading, signUp, signIn, signOut, playAsGuest };
}
