import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// ─── Database helpers ────────────────────────────────────────────────

export async function upsertUserProgress(userId: string, data: Partial<{
  xp: number;
  level: number;
  streak: number;
  last_active_date: string;
  completed_lessons: string[];
  completed_puzzles: string[];
  unlocked_units: string[];
  hearts: number;
  gems: number;
}>) {
  const { error } = await supabase
    .from('user_progress')
    .upsert({ user_id: userId, ...data }, { onConflict: 'user_id' });
  if (error) console.error('upsertUserProgress:', error.message);
}

export async function fetchUserProgress(userId: string) {
  const { data, error } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (error && error.code !== 'PGRST116') console.error('fetchUserProgress:', error.message);
  return data;
}

export async function fetchLeaderboard(limit = 20) {
  const { data, error } = await supabase
    .from('user_progress')
    .select('user_id, xp, streak, profiles(username, avatar_url)')
    .order('xp', { ascending: false })
    .limit(limit);
  if (error) console.error('fetchLeaderboard:', error.message);
  return data ?? [];
}

export async function logPuzzleResult(userId: string, result: {
  puzzle_id: string;
  solved: boolean;
  moves_used: number;
  hints_used: number;
  xp_earned: number;
  time_seconds: number;
}) {
  const { error } = await supabase
    .from('puzzle_results')
    .insert({ user_id: userId, ...result });
  if (error) console.error('logPuzzleResult:', error.message);
}
