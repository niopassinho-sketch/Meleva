import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

// --- INICIO DA ALTERAÇÃO ---
// Inicialização do cliente Supabase com variáveis de ambiente do Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Aviso: Variáveis de ambiente do Supabase não encontradas. Verifique seu arquivo .env');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
// --- FIM DA ALTERAÇÃO ---
