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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      rackets: {
        Row: {
          balance: number | null
          balance_points: number | null
          beam_width: string | null
          brand: string
          comfort_level: string | null
          composition: string | null
          control_level: string | null
          created_at: string
          crosses: number | null
          description: string | null
          generation: string | null
          grip_sizes: string | null
          head_size: number | null
          head_size_cm2: number | null
          id: string
          image_url: string | null
          incomplete_data: boolean
          is_current: boolean
          length: number | null
          mains: number | null
          maneuverability: string | null
          manufacturer_url: string | null
          model: string
          power_level: string | null
          price: number | null
          product_url: string | null
          racket_type: string | null
          recommended_play_style: string | null
          recommended_player_level: string | null
          recommended_tension: string | null
          slug: string
          source_url: string | null
          source_verified: boolean
          spin_level: string | null
          status: string
          stiffness: number | null
          string_pattern: string | null
          stroke_style: string | null
          swing_speed: string | null
          swingweight: number | null
          updated_at: string
          weight: number | null
          weight_strung: number | null
          weight_unstrung: number | null
          year: number | null
        }
        Insert: {
          balance?: number | null
          balance_points?: number | null
          beam_width?: string | null
          brand: string
          comfort_level?: string | null
          composition?: string | null
          control_level?: string | null
          created_at?: string
          crosses?: number | null
          description?: string | null
          generation?: string | null
          grip_sizes?: string | null
          head_size?: number | null
          head_size_cm2?: number | null
          id?: string
          image_url?: string | null
          incomplete_data?: boolean
          is_current?: boolean
          length?: number | null
          mains?: number | null
          maneuverability?: string | null
          manufacturer_url?: string | null
          model: string
          power_level?: string | null
          price?: number | null
          product_url?: string | null
          racket_type?: string | null
          recommended_play_style?: string | null
          recommended_player_level?: string | null
          recommended_tension?: string | null
          slug: string
          source_url?: string | null
          source_verified?: boolean
          spin_level?: string | null
          status?: string
          stiffness?: number | null
          string_pattern?: string | null
          stroke_style?: string | null
          swing_speed?: string | null
          swingweight?: number | null
          updated_at?: string
          weight?: number | null
          weight_strung?: number | null
          weight_unstrung?: number | null
          year?: number | null
        }
        Update: {
          balance?: number | null
          balance_points?: number | null
          beam_width?: string | null
          brand?: string
          comfort_level?: string | null
          composition?: string | null
          control_level?: string | null
          created_at?: string
          crosses?: number | null
          description?: string | null
          generation?: string | null
          grip_sizes?: string | null
          head_size?: number | null
          head_size_cm2?: number | null
          id?: string
          image_url?: string | null
          incomplete_data?: boolean
          is_current?: boolean
          length?: number | null
          mains?: number | null
          maneuverability?: string | null
          manufacturer_url?: string | null
          model?: string
          power_level?: string | null
          price?: number | null
          product_url?: string | null
          racket_type?: string | null
          recommended_play_style?: string | null
          recommended_player_level?: string | null
          recommended_tension?: string | null
          slug?: string
          source_url?: string | null
          source_verified?: boolean
          spin_level?: string | null
          status?: string
          stiffness?: number | null
          string_pattern?: string | null
          stroke_style?: string | null
          swing_speed?: string | null
          swingweight?: number | null
          updated_at?: string
          weight?: number | null
          weight_strung?: number | null
          weight_unstrung?: number | null
          year?: number | null
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
      [_ in never]: never
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
