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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      brand_leads: {
        Row: {
          address: string | null
          admin_notes: string | null
          budget_range: string | null
          business_name: string
          business_type: string | null
          city: string | null
          contact_name: string
          contact_role: string | null
          created_at: string
          description: string | null
          email: string
          facebook: string | null
          goals: string | null
          id: string
          instagram: string | null
          interest: string
          phone: string
          privacy_accepted: boolean
          referral_source: string | null
          status: string
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          admin_notes?: string | null
          budget_range?: string | null
          business_name: string
          business_type?: string | null
          city?: string | null
          contact_name: string
          contact_role?: string | null
          created_at?: string
          description?: string | null
          email: string
          facebook?: string | null
          goals?: string | null
          id?: string
          instagram?: string | null
          interest?: string
          phone: string
          privacy_accepted?: boolean
          referral_source?: string | null
          status?: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          admin_notes?: string | null
          budget_range?: string | null
          business_name?: string
          business_type?: string | null
          city?: string | null
          contact_name?: string
          contact_role?: string | null
          created_at?: string
          description?: string | null
          email?: string
          facebook?: string | null
          goals?: string | null
          id?: string
          instagram?: string | null
          interest?: string
          phone?: string
          privacy_accepted?: boolean
          referral_source?: string | null
          status?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      business_users: {
        Row: {
          active: boolean
          created_at: string
          email: string
          id: string
          location_id: string
          name: string
          user_id: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          email: string
          id?: string
          location_id: string
          name: string
          user_id?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string
          email?: string
          id?: string
          location_id?: string
          name?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_users_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      checkins: {
        Row: {
          checkin_day: string
          consumption_amount: number | null
          created_at: string
          id: string
          location_id: string
          qr_code_used: string | null
          type: Database["public"]["Enums"]["checkin_type_enum"]
          user_id: string
          verified: boolean
        }
        Insert: {
          checkin_day?: string
          consumption_amount?: number | null
          created_at?: string
          id?: string
          location_id: string
          qr_code_used?: string | null
          type: Database["public"]["Enums"]["checkin_type_enum"]
          user_id: string
          verified?: boolean
        }
        Update: {
          checkin_day?: string
          consumption_amount?: number | null
          created_at?: string
          id?: string
          location_id?: string
          qr_code_used?: string | null
          type?: Database["public"]["Enums"]["checkin_type_enum"]
          user_id?: string
          verified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "checkins_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          admin_notes: string | null
          created_at: string
          email: string
          id: string
          message: string
          name: string
          phone: string | null
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
          status?: string
          subject?: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
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
      fan_posts: {
        Row: {
          author: string
          created_at: string
          handle: string | null
          id: string
          image_url: string | null
          link_url: string | null
          network: string
          published: boolean
          sort_order: number
          text: string
          updated_at: string
        }
        Insert: {
          author: string
          created_at?: string
          handle?: string | null
          id?: string
          image_url?: string | null
          link_url?: string | null
          network?: string
          published?: boolean
          sort_order?: number
          text: string
          updated_at?: string
        }
        Update: {
          author?: string
          created_at?: string
          handle?: string | null
          id?: string
          image_url?: string | null
          link_url?: string | null
          network?: string
          published?: boolean
          sort_order?: number
          text?: string
          updated_at?: string
        }
        Relationships: []
      }
      fan_route_stops: {
        Row: {
          created_at: string
          id: string
          place_id: string
          position: number
          route_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          place_id: string
          position?: number
          route_id: string
        }
        Update: {
          created_at?: string
          id?: string
          place_id?: string
          position?: number
          route_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fan_route_stops_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fan_route_stops_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "fan_routes"
            referencedColumns: ["id"]
          },
        ]
      }
      fan_routes: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          duration: string | null
          icon: string
          id: string
          name: string
          published: boolean
          sort_order: number
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          duration?: string | null
          icon?: string
          id?: string
          name: string
          published?: boolean
          sort_order?: number
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          duration?: string | null
          icon?: string
          id?: string
          name?: string
          published?: boolean
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      game_plays: {
        Row: {
          cc_awarded: number
          created_at: string
          game_id: string
          id: string
          result: Json | null
          score: number | null
          user_id: string
          xp_awarded: number
        }
        Insert: {
          cc_awarded?: number
          created_at?: string
          game_id: string
          id?: string
          result?: Json | null
          score?: number | null
          user_id: string
          xp_awarded?: number
        }
        Update: {
          cc_awarded?: number
          created_at?: string
          game_id?: string
          id?: string
          result?: Json | null
          score?: number | null
          user_id?: string
          xp_awarded?: number
        }
        Relationships: [
          {
            foreignKeyName: "game_plays_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      games: {
        Row: {
          active: boolean
          cc_reward: number
          created_at: string
          icon: string | null
          id: string
          name: string
          sort_order: number
          status: string
          subtitle: string | null
          tier: string
          xp_reward: number
        }
        Insert: {
          active?: boolean
          cc_reward?: number
          created_at?: string
          icon?: string | null
          id: string
          name: string
          sort_order?: number
          status?: string
          subtitle?: string | null
          tier?: string
          xp_reward?: number
        }
        Update: {
          active?: boolean
          cc_reward?: number
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
          sort_order?: number
          status?: string
          subtitle?: string | null
          tier?: string
          xp_reward?: number
        }
        Relationships: []
      }
      league_standings: {
        Row: {
          adjustment_note: string | null
          drawn: number
          form: string | null
          goal_diff: number
          goals_against: number
          goals_for: number
          group_name: string | null
          id: string
          lost: number
          manual_adjustment: number
          played: number
          points: number
          season: string
          team_id: string
          updated_at: string
          won: number
        }
        Insert: {
          adjustment_note?: string | null
          drawn?: number
          form?: string | null
          goal_diff?: number
          goals_against?: number
          goals_for?: number
          group_name?: string | null
          id?: string
          lost?: number
          manual_adjustment?: number
          played?: number
          points?: number
          season?: string
          team_id: string
          updated_at?: string
          won?: number
        }
        Update: {
          adjustment_note?: string | null
          drawn?: number
          form?: string | null
          goal_diff?: number
          goals_against?: number
          goals_for?: number
          group_name?: string | null
          id?: string
          lost?: number
          manual_adjustment?: number
          played?: number
          points?: number
          season?: string
          team_id?: string
          updated_at?: string
          won?: number
        }
        Relationships: [
          {
            foreignKeyName: "league_standings_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          active: boolean
          business_name: string | null
          consumption_cc: number
          consumption_xp: number
          created_at: string
          discount_fan: number | null
          discount_gold: number | null
          discount_platino: number | null
          discount_premium: number | null
          id: string
          name: string
          qr_static_code: string | null
          type: Database["public"]["Enums"]["location_type_enum"]
          visit_cc: number
          visit_xp: number
        }
        Insert: {
          active?: boolean
          business_name?: string | null
          consumption_cc?: number
          consumption_xp?: number
          created_at?: string
          discount_fan?: number | null
          discount_gold?: number | null
          discount_platino?: number | null
          discount_premium?: number | null
          id?: string
          name: string
          qr_static_code?: string | null
          type: Database["public"]["Enums"]["location_type_enum"]
          visit_cc?: number
          visit_xp?: number
        }
        Update: {
          active?: boolean
          business_name?: string | null
          consumption_cc?: number
          consumption_xp?: number
          created_at?: string
          discount_fan?: number | null
          discount_gold?: number | null
          discount_platino?: number | null
          discount_premium?: number | null
          id?: string
          name?: string
          qr_static_code?: string | null
          type?: Database["public"]["Enums"]["location_type_enum"]
          visit_cc?: number
          visit_xp?: number
        }
        Relationships: []
      }
      match_events: {
        Row: {
          created_at: string
          description: string | null
          id: string
          match_id: string
          minute: number
          minute_extra: number | null
          player_id: string | null
          player_name: string | null
          team_id: string | null
          type: Database["public"]["Enums"]["match_event_type"]
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          match_id: string
          minute?: number
          minute_extra?: number | null
          player_id?: string | null
          player_name?: string | null
          team_id?: string | null
          type: Database["public"]["Enums"]["match_event_type"]
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          match_id?: string
          minute?: number
          minute_extra?: number | null
          player_id?: string | null
          player_name?: string | null
          team_id?: string | null
          type?: Database["public"]["Enums"]["match_event_type"]
        }
        Relationships: [
          {
            foreignKeyName: "match_events_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_events_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_events_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      match_predictions: {
        Row: {
          away_score: number
          created_at: string
          home_score: number
          id: string
          match_id: string
          rewarded: boolean
          user_id: string
        }
        Insert: {
          away_score: number
          created_at?: string
          home_score: number
          id?: string
          match_id: string
          rewarded?: boolean
          user_id: string
        }
        Update: {
          away_score?: number
          created_at?: string
          home_score?: number
          id?: string
          match_id?: string
          rewarded?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_predictions_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      match_reactions: {
        Row: {
          created_at: string
          id: string
          kind: string
          match_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind: string
          match_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          match_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_reactions_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          away_pens: number | null
          away_points: number
          away_score: number
          away_team_id: string
          created_at: string
          first_half_started_at: string | null
          group_name: string | null
          highlights_url: string | null
          home_pens: number | null
          home_points: number
          home_score: number
          home_team_id: string
          id: string
          is_featured: boolean
          kickoff_at: string
          manual_score: boolean
          matchday: number | null
          notes: string | null
          phase: Database["public"]["Enums"]["match_phase"]
          season: string
          second_half_started_at: string | null
          stage: Database["public"]["Enums"]["match_stage"]
          stoppage_minutes: number
          stream_url: string | null
          tickets_url: string | null
          updated_at: string
          venue: string | null
        }
        Insert: {
          away_pens?: number | null
          away_points?: number
          away_score?: number
          away_team_id: string
          created_at?: string
          first_half_started_at?: string | null
          group_name?: string | null
          highlights_url?: string | null
          home_pens?: number | null
          home_points?: number
          home_score?: number
          home_team_id: string
          id?: string
          is_featured?: boolean
          kickoff_at: string
          manual_score?: boolean
          matchday?: number | null
          notes?: string | null
          phase?: Database["public"]["Enums"]["match_phase"]
          season?: string
          second_half_started_at?: string | null
          stage?: Database["public"]["Enums"]["match_stage"]
          stoppage_minutes?: number
          stream_url?: string | null
          tickets_url?: string | null
          updated_at?: string
          venue?: string | null
        }
        Update: {
          away_pens?: number | null
          away_points?: number
          away_score?: number
          away_team_id?: string
          created_at?: string
          first_half_started_at?: string | null
          group_name?: string | null
          highlights_url?: string | null
          home_pens?: number | null
          home_points?: number
          home_score?: number
          home_team_id?: string
          id?: string
          is_featured?: boolean
          kickoff_at?: string
          manual_score?: boolean
          matchday?: number | null
          notes?: string | null
          phase?: Database["public"]["Enums"]["match_phase"]
          season?: string
          second_half_started_at?: string | null
          stage?: Database["public"]["Enums"]["match_stage"]
          stoppage_minutes?: number
          stream_url?: string | null
          tickets_url?: string | null
          updated_at?: string
          venue?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_away_team_id_fkey"
            columns: ["away_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_home_team_id_fkey"
            columns: ["home_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      missions: {
        Row: {
          active: boolean
          cc_reward: number
          created_at: string
          description: string | null
          id: string
          is_starter: boolean
          title: string
          xp_reward: number
        }
        Insert: {
          active?: boolean
          cc_reward?: number
          created_at?: string
          description?: string | null
          id: string
          is_starter?: boolean
          title: string
          xp_reward?: number
        }
        Update: {
          active?: boolean
          cc_reward?: number
          created_at?: string
          description?: string | null
          id?: string
          is_starter?: boolean
          title?: string
          xp_reward?: number
        }
        Relationships: []
      }
      monthly_player_votes: {
        Row: {
          created_at: string
          id: string
          month_year: string
          player_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          month_year: string
          player_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          month_year?: string
          player_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "monthly_player_votes_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_player_winners: {
        Row: {
          announced_at: string | null
          id: string
          month_year: string
          total_votes: number
          winner_player_id: string | null
        }
        Insert: {
          announced_at?: string | null
          id?: string
          month_year: string
          total_votes: number
          winner_player_id?: string | null
        }
        Update: {
          announced_at?: string | null
          id?: string
          month_year?: string
          total_votes?: number
          winner_player_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "monthly_player_winners_winner_player_id_fkey"
            columns: ["winner_player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      motm_votes: {
        Row: {
          created_at: string
          id: string
          match_id: string
          player_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          match_id: string
          player_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          match_id?: string
          player_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "motm_votes_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "motm_votes_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      news: {
        Row: {
          author: string | null
          category: string | null
          content: string | null
          created_at: string
          excerpt: string | null
          id: string
          image_url: string | null
          published: boolean
          published_at: string | null
          slug: string | null
          title: string
          updated_at: string
        }
        Insert: {
          author?: string | null
          category?: string | null
          content?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          image_url?: string | null
          published?: boolean
          published_at?: string | null
          slug?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          author?: string | null
          category?: string | null
          content?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          image_url?: string | null
          published?: boolean
          published_at?: string | null
          slug?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          kind: string
          metadata: Json | null
          read_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          kind: string
          metadata?: Json | null
          read_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          kind?: string
          metadata?: Json | null
          read_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      parental_consent_requests: {
        Row: {
          confirmed_at: string | null
          created_at: string
          expires_at: string
          id: string
          ip_address: string | null
          token_hash: string
          tutor_email: string
          tutor_name: string
          tutor_phone: string | null
          tutor_relationship: string
          user_id: string
        }
        Insert: {
          confirmed_at?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          ip_address?: string | null
          token_hash: string
          tutor_email: string
          tutor_name: string
          tutor_phone?: string | null
          tutor_relationship: string
          user_id: string
        }
        Update: {
          confirmed_at?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          ip_address?: string | null
          token_hash?: string
          tutor_email?: string
          tutor_name?: string
          tutor_phone?: string | null
          tutor_relationship?: string
          user_id?: string
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
      place_categories: {
        Row: {
          active: boolean
          color: string
          created_at: string
          gradient: string | null
          icon: string
          label: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          color?: string
          created_at?: string
          gradient?: string | null
          icon?: string
          label: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          color?: string
          created_at?: string
          gradient?: string | null
          icon?: string
          label?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      places: {
        Row: {
          area: string | null
          category: string
          created_at: string
          description: string | null
          featured: boolean
          going_today: number | null
          hours: string | null
          id: string
          lat: number | null
          lng: number | null
          logo_url: string | null
          name: string
          photo_gradient: string | null
          photo_url: string | null
          published: boolean
          rating: number | null
          slug: string | null
          sort_order: number
          tier: Database["public"]["Enums"]["place_tier"]
          updated_at: string
          visited_by: number | null
          whatsapp: string | null
        }
        Insert: {
          area?: string | null
          category?: string
          created_at?: string
          description?: string | null
          featured?: boolean
          going_today?: number | null
          hours?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          logo_url?: string | null
          name: string
          photo_gradient?: string | null
          photo_url?: string | null
          published?: boolean
          rating?: number | null
          slug?: string | null
          sort_order?: number
          tier?: Database["public"]["Enums"]["place_tier"]
          updated_at?: string
          visited_by?: number | null
          whatsapp?: string | null
        }
        Update: {
          area?: string | null
          category?: string
          created_at?: string
          description?: string | null
          featured?: boolean
          going_today?: number | null
          hours?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          logo_url?: string | null
          name?: string
          photo_gradient?: string | null
          photo_url?: string | null
          published?: boolean
          rating?: number | null
          slug?: string | null
          sort_order?: number
          tier?: Database["public"]["Enums"]["place_tier"]
          updated_at?: string
          visited_by?: number | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "places_category_fkey"
            columns: ["category"]
            isOneToOne: false
            referencedRelation: "place_categories"
            referencedColumns: ["slug"]
          },
        ]
      }
      players: {
        Row: {
          active: boolean
          birth_date: string | null
          birth_place: string | null
          created_at: string
          goals: number | null
          id: string
          jersey_number: number | null
          matches_played: number | null
          name: string
          nationality: string | null
          photo_url: string | null
          position: string | null
          short_bio: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          birth_date?: string | null
          birth_place?: string | null
          created_at?: string
          goals?: number | null
          id?: string
          jersey_number?: number | null
          matches_played?: number | null
          name: string
          nationality?: string | null
          photo_url?: string | null
          position?: string | null
          short_bio?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          birth_date?: string | null
          birth_place?: string | null
          created_at?: string
          goals?: number | null
          id?: string
          jersey_number?: number | null
          matches_played?: number | null
          name?: string
          nationality?: string | null
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
          birth_date: string | null
          cc: number
          cc_multiplier: number
          city: string | null
          created_at: string
          display_name: string | null
          email_verified: boolean
          favorite_player_id: string | null
          first_name: string | null
          id: string
          identity_verified: boolean
          last_name_m: string | null
          last_name_p: string | null
          last_season_xp: number
          level: number
          level_name: string | null
          level_status: Database["public"]["Enums"]["level_status_enum"]
          marketing_consent: boolean
          marketing_consent_at: string | null
          parental_consent: boolean
          parental_consent_at: string | null
          phone: string | null
          phone_verified: boolean
          season_xp: number
          stripe_customer_id: string | null
          subscription_expires_at: string | null
          subscription_started_at: string | null
          subscription_tier: Database["public"]["Enums"]["subscription_tier_enum"]
          terms_accepted_at: string | null
          updated_at: string
          username: string | null
          xp: number
          xp_multiplier: number
        }
        Insert: {
          avatar_url?: string | null
          birth_date?: string | null
          cc?: number
          cc_multiplier?: number
          city?: string | null
          created_at?: string
          display_name?: string | null
          email_verified?: boolean
          favorite_player_id?: string | null
          first_name?: string | null
          id: string
          identity_verified?: boolean
          last_name_m?: string | null
          last_name_p?: string | null
          last_season_xp?: number
          level?: number
          level_name?: string | null
          level_status?: Database["public"]["Enums"]["level_status_enum"]
          marketing_consent?: boolean
          marketing_consent_at?: string | null
          parental_consent?: boolean
          parental_consent_at?: string | null
          phone?: string | null
          phone_verified?: boolean
          season_xp?: number
          stripe_customer_id?: string | null
          subscription_expires_at?: string | null
          subscription_started_at?: string | null
          subscription_tier?: Database["public"]["Enums"]["subscription_tier_enum"]
          terms_accepted_at?: string | null
          updated_at?: string
          username?: string | null
          xp?: number
          xp_multiplier?: number
        }
        Update: {
          avatar_url?: string | null
          birth_date?: string | null
          cc?: number
          cc_multiplier?: number
          city?: string | null
          created_at?: string
          display_name?: string | null
          email_verified?: boolean
          favorite_player_id?: string | null
          first_name?: string | null
          id?: string
          identity_verified?: boolean
          last_name_m?: string | null
          last_name_p?: string | null
          last_season_xp?: number
          level?: number
          level_name?: string | null
          level_status?: Database["public"]["Enums"]["level_status_enum"]
          marketing_consent?: boolean
          marketing_consent_at?: string | null
          parental_consent?: boolean
          parental_consent_at?: string | null
          phone?: string | null
          phone_verified?: boolean
          season_xp?: number
          stripe_customer_id?: string | null
          subscription_expires_at?: string | null
          subscription_started_at?: string | null
          subscription_tier?: Database["public"]["Enums"]["subscription_tier_enum"]
          terms_accepted_at?: string | null
          updated_at?: string
          username?: string | null
          xp?: number
          xp_multiplier?: number
        }
        Relationships: [
          {
            foreignKeyName: "profiles_favorite_player_id_fkey"
            columns: ["favorite_player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
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
      reward_redemptions: {
        Row: {
          cc_spent: number
          code: string | null
          created_at: string
          fulfilled_at: string | null
          id: string
          reward_id: string
          status: string
          user_id: string
        }
        Insert: {
          cc_spent: number
          code?: string | null
          created_at?: string
          fulfilled_at?: string | null
          id?: string
          reward_id: string
          status?: string
          user_id: string
        }
        Update: {
          cc_spent?: number
          code?: string | null
          created_at?: string
          fulfilled_at?: string | null
          id?: string
          reward_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reward_redemptions_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "rewards"
            referencedColumns: ["id"]
          },
        ]
      }
      rewards: {
        Row: {
          active: boolean
          cc_cost: number
          created_at: string
          description: string | null
          icon: string | null
          id: string
          image_url: string | null
          slug: string
          sort_order: number
          stock: number | null
          tier: string
          title: string
        }
        Insert: {
          active?: boolean
          cc_cost: number
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          slug: string
          sort_order?: number
          stock?: number | null
          tier?: string
          title: string
        }
        Update: {
          active?: boolean
          cc_cost?: number
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          slug?: string
          sort_order?: number
          stock?: number | null
          tier?: string
          title?: string
        }
        Relationships: []
      }
      season_achievements: {
        Row: {
          achievement_type: Database["public"]["Enums"]["achievement_type_enum"]
          created_at: string
          delivered: boolean
          id: string
          metric_value: number | null
          prize_description: string | null
          rank: number | null
          season_id: string
          user_id: string
        }
        Insert: {
          achievement_type: Database["public"]["Enums"]["achievement_type_enum"]
          created_at?: string
          delivered?: boolean
          id?: string
          metric_value?: number | null
          prize_description?: string | null
          rank?: number | null
          season_id: string
          user_id: string
        }
        Update: {
          achievement_type?: Database["public"]["Enums"]["achievement_type_enum"]
          created_at?: string
          delivered?: boolean
          id?: string
          metric_value?: number | null
          prize_description?: string | null
          rank?: number | null
          season_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "season_achievements_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      seasons: {
        Row: {
          cc_reset_date: string
          created_at: string
          end_date: string
          groups: string[]
          id: string
          is_active: boolean
          logo_url: string | null
          name: string
          points_rules: Json
          qualifiers_count: number
          season_key: string | null
          start_date: string
          status: Database["public"]["Enums"]["season_status_enum"]
        }
        Insert: {
          cc_reset_date: string
          created_at?: string
          end_date: string
          groups?: string[]
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name: string
          points_rules?: Json
          qualifiers_count?: number
          season_key?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["season_status_enum"]
        }
        Update: {
          cc_reset_date?: string
          created_at?: string
          end_date?: string
          groups?: string[]
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name?: string
          points_rules?: Json
          qualifiers_count?: number
          season_key?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["season_status_enum"]
        }
        Relationships: []
      }
      shop_banners: {
        Row: {
          bg_color: string | null
          body: string | null
          created_at: string
          cta_label: string | null
          cta_url: string | null
          id: string
          image_url: string | null
          published: boolean
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          bg_color?: string | null
          body?: string | null
          created_at?: string
          cta_label?: string | null
          cta_url?: string | null
          id?: string
          image_url?: string | null
          published?: boolean
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          bg_color?: string | null
          body?: string | null
          created_at?: string
          cta_label?: string | null
          cta_url?: string | null
          id?: string
          image_url?: string | null
          published?: boolean
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      shop_hero_slides: {
        Row: {
          created_at: string
          cta_label: string | null
          cta_url: string | null
          eyebrow: string | null
          id: string
          image_url: string | null
          published: boolean
          sort_order: number
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          cta_label?: string | null
          cta_url?: string | null
          eyebrow?: string | null
          id?: string
          image_url?: string | null
          published?: boolean
          sort_order?: number
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          cta_label?: string | null
          cta_url?: string | null
          eyebrow?: string | null
          id?: string
          image_url?: string | null
          published?: boolean
          sort_order?: number
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      sponsors: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          link_url: string | null
          logo_url: string
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          link_url?: string | null
          logo_url: string
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          link_url?: string | null
          logo_url?: string
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      stripe_products: {
        Row: {
          active: boolean
          amount_mxn: number
          created_at: string
          id: string
          stripe_price_id: string
          stripe_product_id: string
          tier: Database["public"]["Enums"]["subscription_tier_enum"]
        }
        Insert: {
          active?: boolean
          amount_mxn: number
          created_at?: string
          id?: string
          stripe_price_id: string
          stripe_product_id: string
          tier: Database["public"]["Enums"]["subscription_tier_enum"]
        }
        Update: {
          active?: boolean
          amount_mxn?: number
          created_at?: string
          id?: string
          stripe_price_id?: string
          stripe_product_id?: string
          tier?: Database["public"]["Enums"]["subscription_tier_enum"]
        }
        Relationships: []
      }
      stripe_webhook_events: {
        Row: {
          error_message: string | null
          id: string
          payload: Json
          processed_at: string
          success: boolean
          type: string
        }
        Insert: {
          error_message?: string | null
          id: string
          payload: Json
          processed_at?: string
          success?: boolean
          type: string
        }
        Update: {
          error_message?: string | null
          id?: string
          payload?: Json
          processed_at?: string
          success?: boolean
          type?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          environment: string
          id: string
          price_id: string
          product_id: string
          status: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          price_id: string
          product_id: string
          status?: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          price_id?: string
          product_id?: string
          status?: string
          stripe_customer_id?: string
          stripe_subscription_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      teams: {
        Row: {
          active: boolean
          city: string | null
          created_at: string
          group_name: string | null
          id: string
          is_ours: boolean
          logo_url: string | null
          name: string
          season: string
          short_name: string | null
          updated_at: string
          venue: string | null
        }
        Insert: {
          active?: boolean
          city?: string | null
          created_at?: string
          group_name?: string | null
          id?: string
          is_ours?: boolean
          logo_url?: string | null
          name: string
          season?: string
          short_name?: string | null
          updated_at?: string
          venue?: string | null
        }
        Update: {
          active?: boolean
          city?: string | null
          created_at?: string
          group_name?: string | null
          id?: string
          is_ours?: boolean
          logo_url?: string | null
          name?: string
          season?: string
          short_name?: string | null
          updated_at?: string
          venue?: string | null
        }
        Relationships: []
      }
      top_scorers: {
        Row: {
          assists: number
          created_at: string
          goals: number
          id: string
          matches_played: number
          player_id: string | null
          player_name: string
          season: string
          team_id: string | null
          updated_at: string
        }
        Insert: {
          assists?: number
          created_at?: string
          goals?: number
          id?: string
          matches_played?: number
          player_id?: string | null
          player_name: string
          season?: string
          team_id?: string | null
          updated_at?: string
        }
        Update: {
          assists?: number
          created_at?: string
          goals?: number
          id?: string
          matches_played?: number
          player_id?: string | null
          player_name?: string
          season?: string
          team_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "top_scorers_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "top_scorers_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          cc_delta: number
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          source: string | null
          type: Database["public"]["Enums"]["tx_type"]
          user_id: string
          xp_delta: number
        }
        Insert: {
          cc_delta?: number
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          source?: string | null
          type: Database["public"]["Enums"]["tx_type"]
          user_id: string
          xp_delta?: number
        }
        Update: {
          cc_delta?: number
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          source?: string | null
          type?: Database["public"]["Enums"]["tx_type"]
          user_id?: string
          xp_delta?: number
        }
        Relationships: []
      }
      user_missions: {
        Row: {
          completed_at: string
          mission_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          mission_id: string
          user_id: string
        }
        Update: {
          completed_at?: string
          mission_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_missions_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_onboarding: {
        Row: {
          completed_at: string | null
          created_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          user_id?: string
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
      youth_team: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          tournament: string
          updated_at: string
          visible: boolean
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          tournament?: string
          updated_at?: string
          visible?: boolean
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          tournament?: string
          updated_at?: string
          visible?: boolean
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_list_fan_passes: {
        Args: never
        Returns: {
          birth_date: string
          created_at: string
          email: string
          full_name: string
          id: string
          marketing_consent: boolean
          pass_code: string
          payment_status: Database["public"]["Enums"]["payment_status"]
          phone: string
          status: string
          tier: Database["public"]["Enums"]["pass_tier"]
          user_id: string
        }[]
      }
      admin_recalculate_standings: {
        Args: { _season: string }
        Returns: undefined
      }
      award_points: {
        Args: {
          _cc: number
          _description: string
          _source: string
          _type: Database["public"]["Enums"]["tx_type"]
          _user_id: string
          _xp: number
        }
        Returns: string
      }
      award_points_v2: {
        Args: {
          p_apply_multiplier?: boolean
          p_cc: number
          p_description: string
          p_source: string
          p_source_type?: string
          p_user_id: string
          p_xp: number
        }
        Returns: Json
      }
      business_location_id: { Args: { _user_id: string }; Returns: string }
      calculate_fan_zone_level: { Args: { total_xp: number }; Returns: number }
      check_level_maintenance: { Args: { p_user_id: string }; Returns: Json }
      check_username_available: {
        Args: { _username: string }
        Returns: boolean
      }
      complete_mission: {
        Args: { _mission_id: string; _user_id: string }
        Returns: boolean
      }
      compute_level: { Args: { _xp: number }; Returns: number }
      compute_match_points: {
        Args: {
          _away_pens: number
          _away_score: number
          _home_pens: number
          _home_score: number
        }
        Returns: {
          away_points: number
          home_points: number
        }[]
      }
      generate_pass_code:
        | { Args: never; Returns: string }
        | {
            Args: {
              _full_name: string
              _tier: Database["public"]["Enums"]["pass_tier"]
            }
            Returns: string
          }
      get_leaderboard: {
        Args: { _limit?: number }
        Returns: {
          avatar_url: string
          display_name: string
          id: string
          level: number
          username: string
          xp: number
        }[]
      }
      get_level_name: { Args: { level: number }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_minor_user: { Args: { _user_id: string }; Returns: boolean }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
      my_parental_consent_status: {
        Args: never
        Returns: {
          confirmed_at: string
          created_at: string
          expires_at: string
          id: string
          tutor_email: string
          tutor_name: string
          tutor_relationship: string
        }[]
      }
      recalculate_standings: { Args: { _season: string }; Returns: undefined }
      record_game_play: {
        Args: { _game_id: string; _result?: Json; _score?: number }
        Returns: string
      }
      redeem_reward: { Args: { _reward_id: string }; Returns: string }
      run_level_at_risk_warning: { Args: never; Returns: number }
      run_level_demotion_check: { Args: never; Returns: number }
      run_subscription_expiry_check: { Args: never; Returns: number }
      spend_cabo_coins: {
        Args: {
          p_cc: number
          p_description: string
          p_source: string
          p_source_type?: string
          p_user_id: string
        }
        Returns: Json
      }
      unaccent: { Args: { "": string }; Returns: string }
    }
    Enums: {
      achievement_type_enum: "top_ranking" | "first_leyenda" | "stadium_perfect"
      app_role: "fan" | "staff" | "admin" | "super_admin" | "business" | "user"
      checkin_type_enum:
        | "visit"
        | "consumption"
        | "stadium_matchday"
        | "stadium_regular"
      level_status_enum: "permanent" | "active" | "at_risk" | "demoted"
      location_type_enum: "stadium" | "sponsor"
      match_event_type:
        | "goal"
        | "own_goal"
        | "penalty_goal"
        | "penalty_miss"
        | "yellow"
        | "red"
        | "substitution"
        | "note"
        | "var"
      match_phase:
        | "scheduled"
        | "first_half"
        | "halftime"
        | "second_half"
        | "finished"
        | "postponed"
        | "canceled"
      match_stage: "regular" | "final"
      pass_tier: "fan" | "gold" | "premium" | "platino"
      payment_status: "free" | "pending" | "mock_paid" | "paid" | "failed"
      place_category: "restaurantes" | "bares" | "tours" | "tiendas" | "hoteles"
      place_tier: "basico" | "destacado" | "patrocinador"
      qr_kind: "master" | "match" | "benefit" | "experience" | "member"
      season_status_enum: "upcoming" | "active" | "reset_warning" | "closed"
      subscription_tier_enum: "FAN" | "GOLD" | "PREMIUM" | "PLATINO"
      tx_type:
        | "bonus"
        | "mission"
        | "checkin"
        | "game"
        | "redeem"
        | "purchase"
        | "adjust"
        | "earn"
        | "spend"
        | "refund"
        | "adjustment"
        | "season_reset"
        | "signup_bonus"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      achievement_type_enum: [
        "top_ranking",
        "first_leyenda",
        "stadium_perfect",
      ],
      app_role: ["fan", "staff", "admin", "super_admin", "business", "user"],
      checkin_type_enum: [
        "visit",
        "consumption",
        "stadium_matchday",
        "stadium_regular",
      ],
      level_status_enum: ["permanent", "active", "at_risk", "demoted"],
      location_type_enum: ["stadium", "sponsor"],
      match_event_type: [
        "goal",
        "own_goal",
        "penalty_goal",
        "penalty_miss",
        "yellow",
        "red",
        "substitution",
        "note",
        "var",
      ],
      match_phase: [
        "scheduled",
        "first_half",
        "halftime",
        "second_half",
        "finished",
        "postponed",
        "canceled",
      ],
      match_stage: ["regular", "final"],
      pass_tier: ["fan", "gold", "premium", "platino"],
      payment_status: ["free", "pending", "mock_paid", "paid", "failed"],
      place_category: ["restaurantes", "bares", "tours", "tiendas", "hoteles"],
      place_tier: ["basico", "destacado", "patrocinador"],
      qr_kind: ["master", "match", "benefit", "experience", "member"],
      season_status_enum: ["upcoming", "active", "reset_warning", "closed"],
      subscription_tier_enum: ["FAN", "GOLD", "PREMIUM", "PLATINO"],
      tx_type: [
        "bonus",
        "mission",
        "checkin",
        "game",
        "redeem",
        "purchase",
        "adjust",
        "earn",
        "spend",
        "refund",
        "adjustment",
        "season_reset",
        "signup_bonus",
      ],
    },
  },
} as const
