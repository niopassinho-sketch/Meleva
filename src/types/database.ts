// --- INICIO DA ALTERAÇÃO ---
// Definição de tipos para o banco de dados Supabase (MELEVA)

/**
 * Representação de coordenadas geográficas (PostGIS) no frontend.
 * Pode ser tratada como string (WKT) ou objeto GeoJSON Point.
 */
export type PostGISPoint = string | {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
};

export interface MotoristaRow {
  id: string; // UUID (Referência a auth.users)
  nome: string;
  cpf: string;
  data_nascimento: string;
  sexo: string;
  document_url: string | null;
  cnh: string;
  status: 'ativo' | 'inativo' | 'em_corrida';
  localizacao_atual: PostGISPoint | null;
  created_at: string;
}

export interface PassageiroRow {
  id: string; // UUID (Referência a auth.users)
  nome: string;
  cpf: string;
  data_nascimento: string;
  sexo: string;
  document_url: string | null;
  wallet_balance: number;
  can_use_negative_balance: boolean;
  localizacao_atual: PostGISPoint | null;
  created_at: string;
}

export interface VehicleRow {
  id: string; // UUID
  motorista_id: string; // UUID (Referência a motoristas.id)
  marca: string;
  modelo: string;
  placa: string;
  cor: string;
  created_at: string;
}

export interface UserRouteRow {
  id: string; // UUID
  user_id: string; // UUID (Referência a auth.users)
  user_type: 'motorista' | 'passageiro';
  origin: PostGISPoint;
  destination: PostGISPoint;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  vagas?: number;
  only_women?: boolean;
  created_at: string;
}

export interface ActiveMatchRow {
  id: string; // UUID
  route_id: string; // UUID (Referência a user_routes.id)
  motorista_id: string; // UUID (Referência a motoristas.id)
  passageiro_id: string; // UUID (Referência a passageiros.id)
  status: 'matched' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      motoristas: {
        Row: MotoristaRow;
        Insert: {
          id: string;
          nome: string;
          cpf: string;
          data_nascimento: string;
          sexo: string;
          document_url?: string | null;
          cnh: string;
          status?: 'ativo' | 'inativo' | 'em_corrida';
          localizacao_atual?: PostGISPoint | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          nome?: string;
          cpf?: string;
          data_nascimento?: string;
          sexo?: string;
          document_url?: string | null;
          cnh?: string;
          status?: 'ativo' | 'inativo' | 'em_corrida';
          localizacao_atual?: PostGISPoint | null;
          created_at?: string;
        };
        Relationships: [];
      };
      passageiros: {
        Row: PassageiroRow;
        Insert: {
          id: string;
          nome: string;
          cpf: string;
          data_nascimento: string;
          sexo: string;
          document_url?: string | null;
          wallet_balance?: number;
          can_use_negative_balance?: boolean;
          localizacao_atual?: PostGISPoint | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          nome?: string;
          cpf?: string;
          data_nascimento?: string;
          sexo?: string;
          document_url?: string | null;
          wallet_balance?: number;
          can_use_negative_balance?: boolean;
          localizacao_atual?: PostGISPoint | null;
          created_at?: string;
        };
        Relationships: [];
      };
      vehicles: {
        Row: VehicleRow;
        Insert: {
          id?: string;
          motorista_id: string;
          marca: string;
          modelo: string;
          placa: string;
          cor: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          motorista_id?: string;
          marca?: string;
          modelo?: string;
          placa?: string;
          cor?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      user_routes: {
        Row: UserRouteRow;
        Insert: {
          id?: string;
          user_id: string;
          user_type: 'motorista' | 'passageiro';
          origin: PostGISPoint;
          destination: PostGISPoint;
          status?: 'pending' | 'active' | 'completed' | 'cancelled';
          vagas?: number;
          only_women?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          user_type?: 'motorista' | 'passageiro';
          origin?: PostGISPoint;
          destination?: PostGISPoint;
          status?: 'pending' | 'active' | 'completed' | 'cancelled';
          vagas?: number;
          only_women?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      active_matches: {
        Row: ActiveMatchRow;
        Insert: {
          id?: string;
          route_id: string;
          motorista_id: string;
          passageiro_id: string;
          status?: 'matched' | 'in_progress' | 'completed' | 'cancelled';
          boarding_token?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          route_id?: string;
          motorista_id?: string;
          passageiro_id?: string;
          status?: 'matched' | 'in_progress' | 'completed' | 'cancelled';
          boarding_token?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      find_rides_advanced: {
        Args: {
          p_origin: any; // Usando any para simplificar a passagem de string WKT ou GeoJSON no RPC
          p_destination: any;
          p_only_women?: boolean;
        };
        Returns: {
          route_id: string;
          motorista_id: string;
          nome: string;
          idade: number;
          distancia_metros: number;
          vagas: number;
          is_first_ride: boolean;
        }[];
      };
      trigger_sos_alert: {
        Args: {
          p_user_id: string;
          p_location: any;
        };
        Returns: boolean;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
// --- FIM DA ALTERAÇÃO ---
