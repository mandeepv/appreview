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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      app_config: {
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
      email_opt_outs: {
        Row: {
          created_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          user_id?: string
        }
        Relationships: []
      }
      entitlements: {
        Row: {
          activated_at: string | null
          activated_subscription_id: string | null
          cancel_pending: boolean
          current_period_end: string | null
          dodo_customer_id: string | null
          dodo_subscription_id: string | null
          last_event_at: string | null
          nudge_stage: number
          product_id: string
          source: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          activated_at?: string | null
          activated_subscription_id?: string | null
          cancel_pending?: boolean
          current_period_end?: string | null
          dodo_customer_id?: string | null
          dodo_subscription_id?: string | null
          last_event_at?: string | null
          nudge_stage?: number
          product_id: string
          source: string
          status: string
          updated_at?: string
          user_id: string
        }
        Update: {
          activated_at?: string | null
          activated_subscription_id?: string | null
          cancel_pending?: boolean
          current_period_end?: string | null
          dodo_customer_id?: string | null
          dodo_subscription_id?: string | null
          last_event_at?: string | null
          nudge_stage?: number
          product_id?: string
          source?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      funnel_sessions: {
        Row: {
          answers: Json
          capi: Json | null
          created_at: string
          handoff_nonce_hash: string | null
          id: string
          landing_variant: string | null
          purchased_at: string | null
          updated_at: string
          user_id: string | null
          utm: Json | null
          winback_stage: number
        }
        Insert: {
          answers?: Json
          capi?: Json | null
          created_at?: string
          handoff_nonce_hash?: string | null
          id: string
          landing_variant?: string | null
          purchased_at?: string | null
          updated_at?: string
          user_id?: string | null
          utm?: Json | null
          winback_stage?: number
        }
        Update: {
          answers?: Json
          capi?: Json | null
          created_at?: string
          handoff_nonce_hash?: string | null
          id?: string
          landing_variant?: string | null
          purchased_at?: string | null
          updated_at?: string
          user_id?: string | null
          utm?: Json | null
          winback_stage?: number
        }
        Relationships: []
      }
      handoff_keys: {
        Row: {
          created_at: string
          expires_at: string
          key_hash: string
          source: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          key_hash: string
          source: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          key_hash?: string
          source?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      lesson_progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          completed_sections: string[]
          created_at: string | null
          id: string
          lesson_id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          completed_sections?: string[]
          created_at?: string | null
          id?: string
          lesson_id: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          completed_sections?: string[]
          created_at?: string | null
          id?: string
          lesson_id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      rate_limit_hits: {
        Row: {
          count: number
          key: string
          window_start: string
        }
        Insert: {
          count?: number
          key: string
          window_start: string
        }
        Update: {
          count?: number
          key?: string
          window_start?: string
        }
        Relationships: []
      }
      unlinked_purchases: {
        Row: {
          created_at: string
          dodo_subscription_id: string | null
          id: number
          payload: Json
          reason: string
          resolved: boolean
        }
        Insert: {
          created_at?: string
          dodo_subscription_id?: string | null
          id?: never
          payload: Json
          reason: string
          resolved?: boolean
        }
        Update: {
          created_at?: string
          dodo_subscription_id?: string | null
          id?: never
          payload?: Json
          reason?: string
          resolved?: boolean
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          age: number | null
          children: Json | null
          children_count: number | null
          created_at: string | null
          emotional_challenges: string[] | null
          experience_level: string | null
          familiar_parenting_styles: string[] | null
          id: string
          improvement_goals: string[] | null
          learning_goal: string | null
          name: string | null
          notifications_enabled: boolean | null
          onboarding_variant: string | null
          partner_invited: boolean | null
          partner_involvement: string | null
          updated_at: string | null
          user_type: string | null
          variant_b_answers: Json | null
        }
        Insert: {
          age?: number | null
          children?: Json | null
          children_count?: number | null
          created_at?: string | null
          emotional_challenges?: string[] | null
          experience_level?: string | null
          familiar_parenting_styles?: string[] | null
          id: string
          improvement_goals?: string[] | null
          learning_goal?: string | null
          name?: string | null
          notifications_enabled?: boolean | null
          onboarding_variant?: string | null
          partner_invited?: boolean | null
          partner_involvement?: string | null
          updated_at?: string | null
          user_type?: string | null
          variant_b_answers?: Json | null
        }
        Update: {
          age?: number | null
          children?: Json | null
          children_count?: number | null
          created_at?: string | null
          emotional_challenges?: string[] | null
          experience_level?: string | null
          familiar_parenting_styles?: string[] | null
          id?: string
          improvement_goals?: string[] | null
          learning_goal?: string | null
          name?: string | null
          notifications_enabled?: boolean | null
          onboarding_variant?: string | null
          partner_invited?: boolean | null
          partner_involvement?: string | null
          updated_at?: string | null
          user_type?: string | null
          variant_b_answers?: Json | null
        }
        Relationships: []
      }
      waitlist: {
        Row: {
          answers: Json | null
          created_at: string
          email: string
          reason: string | null
        }
        Insert: {
          answers?: Json | null
          created_at?: string
          email: string
          reason?: string | null
        }
        Update: {
          answers?: Json | null
          created_at?: string
          email?: string
          reason?: string | null
        }
        Relationships: []
      }
      webhook_events: {
        Row: {
          event_type: string | null
          id: string
          received_at: string
          status: string
        }
        Insert: {
          event_type?: string | null
          id: string
          received_at?: string
          status?: string
        }
        Update: {
          event_type?: string | null
          id?: string
          received_at?: string
          status?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      expire_stale_entitlements: { Args: never; Returns: number }
      get_user_id_by_email: { Args: { p_email: string }; Returns: string }
      hit_rate_limit: {
        Args: { p_key: string; p_max: number; p_window_seconds: number }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
