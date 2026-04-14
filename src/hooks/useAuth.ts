import { useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

// --- INICIO DA ALTERAÇÃO ---
// Hook customizado para gerenciar estado de autenticação e papel do usuário (motorista/passageiro)

export type UserRole = 'motorista' | 'passageiro' | null;

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Busca a sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRole(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Escuta mudanças no estado de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRole(session.user.id);
      } else {
        setRole(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Função para determinar se o usuário é motorista ou passageiro
  const fetchUserRole = async (userId: string) => {
    try {
      // Verifica se existe na tabela de motoristas
      const { data: motorista } = await supabase
        .from('motoristas')
        .select('id')
        .eq('id', userId); // Removido o .single()

      if (motorista && motorista.length > 0) {
        setRole('motorista');
        return;
      }

      // Verifica se existe na tabela de passageiros
      const { data: passageiro } = await supabase
        .from('passageiros')
        .select('id')
        .eq('id', userId); // Removido o .single()

      if (passageiro && passageiro.length > 0) {
        setRole('passageiro');
        return;
      }

      setRole(null);
    } catch (error) {
      console.error('Erro ao buscar papel do usuário:', error);
    } finally {
      setLoading(false);
    }
  };

  return { user, session, role, loading };
}
// --- FIM DA ALTERAÇÃO ---
