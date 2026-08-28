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
    PostgrestVersion: "14.17"
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
          id: string
          name: string
          start_date: string
          status: Database["public"]["Enums"]["season_status_enum"]
        }
        Insert: {
          cc_reset_date: string
          created_at?: string
          end_date: string
          id?: string
          name: string
          start_date: string
          status?: Database["public"]["Enums"]["season_status_enum"]
        }
        Update: {
          cc_reset_date?: string
          created_at?: string
          end_date?: string
          id?: string
          name?: string
          start_date?: string
          status?: Database["public"]["Enums"]["season_status_enum"]
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
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
      generate_pass_code:
        | { Args: never; Returns: string }
        | {
            Args: {
              _full_name: string
              _tier: Database["public"]["Enums"]["pass_tier"]
            }
            Returns: string
          }
      get_level_name: { Args: { level: number }; Returns: string }
      has_role:
        | {
            Args: {
              _role: Database["public"]["Enums"]["app_role"]
              _user_id: string
            }
            Returns: boolean
          }
        | { Args: { _role: string; _user_id: string }; Returns: boolean }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_minor_user: { Args: { _user_id: string }; Returns: boolean }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
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
        | "yellow_card"
        | "red_card"
        | "substitution"
        | "penalty"
        | "own_goal"
      match_source: "manual" | "scraped"
      match_status: "scheduled" | "live" | "finished"
      pass_tier: "fan" | "gold" | "premium" | "platino"
      payment_status: "free" | "pending" | "mock_paid" | "paid" | "failed"
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
