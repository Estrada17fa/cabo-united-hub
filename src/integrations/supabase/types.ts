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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      match_event_type:
        | "goal"
        | "yellow_card"
        | "red_card"
        | "substitution"
        | "penalty"
        | "own_goal"
      match_source: "manual" | "scraped"
      match_status: "scheduled" | "live" | "finished"
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
    },
  },
} as const
