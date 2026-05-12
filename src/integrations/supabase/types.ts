export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      fan_passes: {
        Row: {
          birth_date: string
          created_at: string
          expires_at: string | null
          favorite_player_id: string | null
          full_name: string
          id: string
          issued_at: string
          pass_code: string
          payment_status: Database["public"]["Enums"]["payment_status"]
          phone: string
          status: string
          tier: Database["public"]["Enums"]["pass_tier"]
          updated_at: string
          user_id: string
        }
        Insert: {
          birth_date: string
          created_at?: string
          expires_at?: string | null
          favorite_player_id?: string | null
          full_name: string
          id?: string
          issued_at?: string
          pass_code: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          phone: string
          status?: string
          tier?: Database["public"]["Enums"]["pass_tier"]
          updated_at?: string
          user_id: string
        }
        Update: {
          birth_date?: string
          created_at?: string
          expires_at?: string | null
          favorite_player_id?: string | null
          full_name?: string
          id?: string
          issued_at?: string
          pass_code?: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          phone?: string
          status?: string
          tier?: Database["public"]["Enums"]["pass_tier"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fan_passes_favorite_player_id_fkey"
            columns: ["favorite_player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      league_standings: {
        Row: {
          dg: number
          gc: number
          gf: number
          group_name: string | null
          id: string
          je: number
          jg: number
          jj: number
          jp: number
          pos: number
          pts: number
          season: string
          team: string
          updated_at: string
        }
        Insert: {
          dg?: number
          gc?: number
          gf?: number
          group_name?: string | null
          id?: string
          je?: number
          jg?: number
          jj?: number
          jp?: number
          pos?: number
          pts?: number
          season?: string
          team: string
          updated_at?: string
        }
        Update: {
          dg?: number
          gc?: number
          gf?: number
          group_name?: string | null
          id?: string
          je?: number
          jg?: number
          jj?: number
          jp?: number
          pos?: number
          pts?: number
          season?: string
          team?: string
          updated_at?: string
        }
        Relationships: []
      }
      match_events: {
        Row: {
          created_at: string
          description: string | null
          event_type: Database["public"]["Enums"]["match_event_type"]
          id: string
          match_id: string
          minute: number
          player_name: string | null
          team: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          event_type: Database["public"]["Enums"]["match_event_type"]
          id?: string
          match_id: string
          minute: number
          player_name?: string | null
          team?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          event_type?: Database["public"]["Enums"]["match_event_type"]
          id?: string
          match_id?: string
          minute?: number
          player_name?: string | null
          team?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "match_events_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          away_score: number | null
          away_team: string
          created_at: string
          home_score: number | null
          home_team: string
          id: string
          is_home_game: boolean
          jornada: number | null
          live_stream_url: string | null
          match_date: string
          match_summary_url: string | null
          match_time: string | null
          season: string
          source: Database["public"]["Enums"]["match_source"]
          status: Database["public"]["Enums"]["match_status"]
          updated_at: string
          venue: string | null
        }
        Insert: {
          away_score?: number | null
          away_team: string
          created_at?: string
          home_score?: number | null
          home_team: string
          id?: string
          is_home_game?: boolean
          jornada?: number | null
          live_stream_url?: string | null
          match_date: string
          match_summary_url?: string | null
          match_time?: string | null
          season?: string
          source?: Database["public"]["Enums"]["match_source"]
          status?: Database["public"]["Enums"]["match_status"]
          updated_at?: string
          venue?: string | null
        }
        Update: {
          away_score?: number | null
          away_team?: string
          created_at?: string
          home_score?: number | null
          home_team?: string
          id?: string
          is_home_game?: boolean
          jornada?: number | null
          live_stream_url?: string | null
          match_date?: string
          match_summary_url?: string | null
          match_time?: string | null
          season?: string
          source?: Database["public"]["Enums"]["match_source"]
          status?: Database["public"]["Enums"]["match_status"]
          updated_at?: string
          venue?: string | null
        }
        Relationships: []
      }
      pass_redemptions: {
        Row: {
          created_at: string
          id: string
          kind: Database["public"]["Enums"]["qr_kind"]
          label: string | null
          pass_id: string
          qr_token_id: string | null
          ref_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          kind: Database["public"]["Enums"]["qr_kind"]
          label?: string | null
          pass_id: string
          qr_token_id?: string | null
          ref_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["qr_kind"]
          label?: string | null
          pass_id?: string
          qr_token_id?: string | null
          ref_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pass_redemptions_pass_id_fkey"
            columns: ["pass_id"]
            isOneToOne: false
            referencedRelation: "fan_passes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pass_redemptions_qr_token_id_fkey"
            columns: ["qr_token_id"]
            isOneToOne: false
            referencedRelation: "qr_tokens"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          active: boolean
          created_at: string
          id: string
          jersey_number: number | null
          name: string
          photo_url: string | null
          position: string | null
          short_bio: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          jersey_number?: number | null
          name: string
          photo_url?: string | null
          position?: string | null
          short_bio?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          jersey_number?: number | null
          name?: string
          photo_url?: string | null
          position?: string | null
          short_bio?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      qr_tokens: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          kind: Database["public"]["Enums"]["qr_kind"]
          pass_id: string
          redeemed_at: string | null
          redeemed_by_staff: string | null
          ref_id: string | null
          token_hash: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          kind: Database["public"]["Enums"]["qr_kind"]
          pass_id: string
          redeemed_at?: string | null
          redeemed_by_staff?: string | null
          ref_id?: string | null
          token_hash: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["qr_kind"]
          pass_id?: string
          redeemed_at?: string | null
          redeemed_by_staff?: string | null
          ref_id?: string | null
          token_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "qr_tokens_pass_id_fkey"
            columns: ["pass_id"]
            isOneToOne: false
            referencedRelation: "fan_passes"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          id: string
          logo_url: string | null
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
        }
        Relationships: []
      }
      top_scorers: {
        Row: {
          goals: number
          id: string
          player_name: string
          season: string
          team: string
          updated_at: string
        }
        Insert: {
          goals?: number
          id?: string
          player_name: string
          season?: string
          team: string
          updated_at?: string
        }
        Update: {
          goals?: number
          id?: string
          player_name?: string
          season?: string
          team?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "fan" | "staff" | "admin"
      match_event_type:
        | "goal"
        | "yellow_card"
        | "red_card"
        | "substitution"
        | "penalty"
        | "own_goal"
      match_source: "manual" | "scraped"
      match_status: "scheduled" | "live" | "finished"
      pass_tier: "fan" | "gold" | "premium" | "platino"
      payment_status: "free" | "pending" | "mock_paid" | "paid" | "failed"
      qr_kind: "master" | "match" | "benefit" | "experience"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["fan", "staff", "admin"],
      match_event_type: [
        "goal",
        "yellow_card",
        "red_card",
        "substitution",
        "penalty",
        "own_goal",
      ],
      match_source: ["manual", "scraped"],
      match_status: ["scheduled", "live", "finished"],
      pass_tier: ["fan", "gold", "premium", "platino"],
      payment_status: ["free", "pending", "mock_paid", "paid", "failed"],
      qr_kind: ["master", "match", "benefit", "experience"],
    },
  },
} as const
