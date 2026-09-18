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
      achievements: {
        Row: {
          code: string
          created_at: string
          description: string
          icon: string
          id: string
          name: string
        }
        Insert: {
          code: string
          created_at?: string
          description: string
          icon?: string
          id?: string
          name: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string
          icon?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      acquisition_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          player_id: string | null
          source: string
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          player_id?: string | null
          source?: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          player_id?: string | null
          source?: string
        }
        Relationships: [
          {
            foreignKeyName: "acquisition_events_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          confirmed_at: string | null
          created_at: string
          expires_at: string | null
          id: string
          pix_copy_paste: string | null
          pix_qr_code: string | null
          provider: string | null
          provider_reference: string | null
          registration_id: string
          status: Database["public"]["Enums"]["payment_status"]
        }
        Insert: {
          amount: number
          confirmed_at?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          pix_copy_paste?: string | null
          pix_qr_code?: string | null
          provider?: string | null
          provider_reference?: string | null
          registration_id: string
          status?: Database["public"]["Enums"]["payment_status"]
        }
        Update: {
          amount?: number
          confirmed_at?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          pix_copy_paste?: string | null
          pix_qr_code?: string | null
          provider?: string | null
          provider_reference?: string | null
          registration_id?: string
          status?: Database["public"]["Enums"]["payment_status"]
        }
        Relationships: [
          {
            foreignKeyName: "payments_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      player_achievements: {
        Row: {
          achievement_id: string
          id: string
          player_id: string
          unlocked_at: string
        }
        Insert: {
          achievement_id: string
          id?: string
          player_id: string
          unlocked_at?: string
        }
        Update: {
          achievement_id?: string
          id?: string
          player_id?: string
          unlocked_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_achievements_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      player_stats: {
        Row: {
          booyahs: number
          earnings: number
          kills: number
          matches: number
          mvps: number
          player_id: string
          season_booyahs: number
          season_earnings: number
          season_kills: number
          season_matches: number
          season_mvps: number
          season_top2: number
          top2: number
          updated_at: string
        }
        Insert: {
          booyahs?: number
          earnings?: number
          kills?: number
          matches?: number
          mvps?: number
          player_id: string
          season_booyahs?: number
          season_earnings?: number
          season_kills?: number
          season_matches?: number
          season_mvps?: number
          season_top2?: number
          top2?: number
          updated_at?: string
        }
        Update: {
          booyahs?: number
          earnings?: number
          kills?: number
          matches?: number
          mvps?: number
          player_id?: string
          season_booyahs?: number
          season_earnings?: number
          season_kills?: number
          season_matches?: number
          season_mvps?: number
          season_top2?: number
          top2?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_stats_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          brz_id: string
          created_at: string
          email: string | null
          free_fire_id: string | null
          id: string
          nick: string
          updated_at: string
          utm_source: string | null
          whatsapp: string | null
        }
        Insert: {
          avatar_url?: string | null
          brz_id: string
          created_at?: string
          email?: string | null
          free_fire_id?: string | null
          id: string
          nick: string
          updated_at?: string
          utm_source?: string | null
          whatsapp?: string | null
        }
        Update: {
          avatar_url?: string | null
          brz_id?: string
          created_at?: string
          email?: string | null
          free_fire_id?: string | null
          id?: string
          nick?: string
          updated_at?: string
          utm_source?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      registrations: {
        Row: {
          created_at: string
          free_fire_id: string
          id: string
          nick: string
          payment_status: Database["public"]["Enums"]["payment_status"]
          player_id: string
          slot_number: number | null
          slot_status: Database["public"]["Enums"]["slot_status"]
          tournament_id: string
          utm_source: string | null
          whatsapp: string
        }
        Insert: {
          created_at?: string
          free_fire_id: string
          id?: string
          nick: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          player_id: string
          slot_number?: number | null
          slot_status?: Database["public"]["Enums"]["slot_status"]
          tournament_id: string
          utm_source?: string | null
          whatsapp: string
        }
        Update: {
          created_at?: string
          free_fire_id?: string
          id?: string
          nick?: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          player_id?: string
          slot_number?: number | null
          slot_status?: Database["public"]["Enums"]["slot_status"]
          tournament_id?: string
          utm_source?: string | null
          whatsapp?: string
        }
        Relationships: [
          {
            foreignKeyName: "registrations_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registrations_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      results: {
        Row: {
          created_at: string
          id: string
          is_mvp: boolean
          kills: number
          nick: string
          player_id: string | null
          position: number
          prize: number
          tournament_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_mvp?: boolean
          kills?: number
          nick: string
          player_id?: string | null
          position: number
          prize?: number
          tournament_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_mvp?: boolean
          kills?: number
          nick?: string
          player_id?: string | null
          position?: number
          prize?: number
          tournament_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "results_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "results_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      tournaments: {
        Row: {
          champion_prize: number
          created_at: string
          entry_fee: number
          id: string
          kill_prize: number
          kind: Database["public"]["Enums"]["tournament_kind"]
          max_players: number
          mode: Database["public"]["Enums"]["tournament_mode"]
          name: string
          results_applied: boolean
          room_id: string | null
          room_password: string | null
          room_released: boolean
          runner_up_reward: string | null
          start_time: string
          status: Database["public"]["Enums"]["tournament_status"]
          tournament_date: string
          whatsapp_group_url: string | null
        }
        Insert: {
          champion_prize?: number
          created_at?: string
          entry_fee?: number
          id?: string
          kill_prize?: number
          kind?: Database["public"]["Enums"]["tournament_kind"]
          max_players?: number
          mode?: Database["public"]["Enums"]["tournament_mode"]
          name: string
          results_applied?: boolean
          room_id?: string | null
          room_password?: string | null
          room_released?: boolean
          runner_up_reward?: string | null
          start_time: string
          status?: Database["public"]["Enums"]["tournament_status"]
          tournament_date?: string
          whatsapp_group_url?: string | null
        }
        Update: {
          champion_prize?: number
          created_at?: string
          entry_fee?: number
          id?: string
          kill_prize?: number
          kind?: Database["public"]["Enums"]["tournament_kind"]
          max_players?: number
          mode?: Database["public"]["Enums"]["tournament_mode"]
          name?: string
          results_applied?: boolean
          room_id?: string | null
          room_password?: string | null
          room_released?: boolean
          runner_up_reward?: string | null
          start_time?: string
          status?: Database["public"]["Enums"]["tournament_status"]
          tournament_date?: string
          whatsapp_group_url?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      waitlist: {
        Row: {
          created_at: string
          id: string
          nick: string
          notified: boolean
          player_id: string | null
          queue_position: number
          tournament_id: string
          whatsapp: string
        }
        Insert: {
          created_at?: string
          id?: string
          nick: string
          notified?: boolean
          player_id?: string | null
          queue_position?: number
          tournament_id: string
          whatsapp: string
        }
        Update: {
          created_at?: string
          id?: string
          nick?: string
          notified?: boolean
          player_id?: string | null
          queue_position?: number
          tournament_id?: string
          whatsapp?: string
        }
        Relationships: [
          {
            foreignKeyName: "waitlist_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waitlist_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      apply_tournament_results: {
        Args: { _tournament_id: string }
        Returns: Json
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      next_brz_id: { Args: never; Returns: string }
      ranking_period: {
        Args: { _from: string }
        Returns: {
          booyahs: number
          brz_id: string
          earnings: number
          kills: number
          matches: number
          mvps: number
          nick: string
          player_id: string
        }[]
      }
      tournament_slot_counts: {
        Args: never
        Returns: {
          confirmed: number
          taken: number
          tournament_id: string
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      payment_status:
        | "pending"
        | "confirmed"
        | "expired"
        | "failed"
        | "refunded"
      slot_status: "reserved" | "guaranteed" | "cancelled"
      tournament_kind: "daily" | "cup" | "league"
      tournament_mode: "solo" | "duo" | "squad"
      tournament_status:
        | "scheduled"
        | "open"
        | "last_slots"
        | "full"
        | "closed"
        | "finished"
        | "cancelled"
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
      app_role: ["admin", "moderator", "user"],
      payment_status: ["pending", "confirmed", "expired", "failed", "refunded"],
      slot_status: ["reserved", "guaranteed", "cancelled"],
      tournament_kind: ["daily", "cup", "league"],
      tournament_mode: ["solo", "duo", "squad"],
      tournament_status: [
        "scheduled",
        "open",
        "last_slots",
        "full",
        "closed",
        "finished",
        "cancelled",
      ],
    },
  },
} as const
