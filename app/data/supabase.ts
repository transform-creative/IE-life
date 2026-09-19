// AUTO-GENERATED — do not edit by hand.
// Regenerate after every schema change via the Supabase MCP server
// (`generate_typescript_types`, project ref dfzmznfuplzjgxqiluuc) or
// `npx supabase gen types typescript --project-id dfzmznfuplzjgxqiluuc`.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      household_members: {
        Row: {
          created_at: string;
          household_id: string;
          role: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          household_id: string;
          role?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          household_id?: string;
          role?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "household_members_household_id_fkey";
            columns: ["household_id"];
            isOneToOne: false;
            referencedRelation: "households";
            referencedColumns: ["id"];
          },
        ];
      };
      households: {
        Row: {
          created_at: string;
          id: string;
          name: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
      shopping_checked_items: {
        Row: {
          checked_at: string;
          household_id: string;
          id: string;
          ingredient_id: string;
          week_plan_id: string;
        };
        Insert: {
          checked_at?: string;
          household_id?: string;
          id?: string;
          ingredient_id: string;
          week_plan_id: string;
        };
        Update: {
          checked_at?: string;
          household_id?: string;
          id?: string;
          ingredient_id?: string;
          week_plan_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "shopping_checked_items_household_id_fkey";
            columns: ["household_id"];
            isOneToOne: false;
            referencedRelation: "households";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shopping_checked_items_ingredient_id_fkey";
            columns: ["ingredient_id"];
            isOneToOne: false;
            referencedRelation: "shopping_ingredients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shopping_checked_items_week_plan_id_fkey";
            columns: ["week_plan_id"];
            isOneToOne: false;
            referencedRelation: "shopping_week_plans";
            referencedColumns: ["id"];
          },
        ];
      };
      shopping_ingredients: {
        Row: {
          created_at: string;
          default_unit: string | null;
          deleted_at: string | null;
          household_id: string;
          id: string;
          name: string;
          purchase_size: number | null;
          purchase_unit: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          default_unit?: string | null;
          deleted_at?: string | null;
          household_id?: string;
          id?: string;
          name: string;
          purchase_size?: number | null;
          purchase_unit?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          default_unit?: string | null;
          deleted_at?: string | null;
          household_id?: string;
          id?: string;
          name?: string;
          purchase_size?: number | null;
          purchase_unit?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "shopping_ingredients_household_id_fkey";
            columns: ["household_id"];
            isOneToOne: false;
            referencedRelation: "households";
            referencedColumns: ["id"];
          },
        ];
      };
      shopping_meal_ingredients: {
        Row: {
          created_at: string;
          household_id: string;
          id: string;
          ingredient_id: string;
          meal_id: string;
          quantity: number;
          unit: string | null;
        };
        Insert: {
          created_at?: string;
          household_id?: string;
          id?: string;
          ingredient_id: string;
          meal_id: string;
          quantity: number;
          unit?: string | null;
        };
        Update: {
          created_at?: string;
          household_id?: string;
          id?: string;
          ingredient_id?: string;
          meal_id?: string;
          quantity?: number;
          unit?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "shopping_meal_ingredients_household_id_fkey";
            columns: ["household_id"];
            isOneToOne: false;
            referencedRelation: "households";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shopping_meal_ingredients_ingredient_id_fkey";
            columns: ["ingredient_id"];
            isOneToOne: false;
            referencedRelation: "shopping_ingredients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shopping_meal_ingredients_meal_id_fkey";
            columns: ["meal_id"];
            isOneToOne: false;
            referencedRelation: "shopping_meal_stats";
            referencedColumns: ["meal_id"];
          },
          {
            foreignKeyName: "shopping_meal_ingredients_meal_id_fkey";
            columns: ["meal_id"];
            isOneToOne: false;
            referencedRelation: "shopping_meals";
            referencedColumns: ["id"];
          },
        ];
      };
      shopping_meals: {
        Row: {
          created_at: string;
          cuisine: string | null;
          deleted_at: string | null;
          household_id: string;
          id: string;
          image_url: string | null;
          name: string;
          prep_minutes: number | null;
          recipe_note: string | null;
          recipe_url: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          cuisine?: string | null;
          deleted_at?: string | null;
          household_id?: string;
          id?: string;
          image_url?: string | null;
          name: string;
          prep_minutes?: number | null;
          recipe_note?: string | null;
          recipe_url?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          cuisine?: string | null;
          deleted_at?: string | null;
          household_id?: string;
          id?: string;
          image_url?: string | null;
          name?: string;
          prep_minutes?: number | null;
          recipe_note?: string | null;
          recipe_url?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "shopping_meals_household_id_fkey";
            columns: ["household_id"];
            isOneToOne: false;
            referencedRelation: "households";
            referencedColumns: ["id"];
          },
        ];
      };
      shopping_week_plan_day_ingredients: {
        Row: {
          created_at: string;
          household_id: string;
          id: string;
          ingredient_id: string;
          quantity: number;
          unit: string | null;
          week_plan_day_id: string;
        };
        Insert: {
          created_at?: string;
          household_id?: string;
          id?: string;
          ingredient_id: string;
          quantity: number;
          unit?: string | null;
          week_plan_day_id: string;
        };
        Update: {
          created_at?: string;
          household_id?: string;
          id?: string;
          ingredient_id?: string;
          quantity?: number;
          unit?: string | null;
          week_plan_day_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "shopping_week_plan_day_ingredients_household_id_fkey";
            columns: ["household_id"];
            isOneToOne: false;
            referencedRelation: "households";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shopping_week_plan_day_ingredients_ingredient_id_fkey";
            columns: ["ingredient_id"];
            isOneToOne: false;
            referencedRelation: "shopping_ingredients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shopping_week_plan_day_ingredients_week_plan_day_id_fkey";
            columns: ["week_plan_day_id"];
            isOneToOne: false;
            referencedRelation: "shopping_week_plan_days";
            referencedColumns: ["id"];
          },
        ];
      };
      shopping_week_plan_days: {
        Row: {
          created_at: string;
          day_index: number;
          household_id: string;
          id: string;
          meal_id: string | null;
          note: string | null;
          slot_type: Database["public"]["Enums"]["shopping_slot_type"];
          updated_at: string;
          week_plan_id: string;
        };
        Insert: {
          created_at?: string;
          day_index: number;
          household_id?: string;
          id?: string;
          meal_id?: string | null;
          note?: string | null;
          slot_type?: Database["public"]["Enums"]["shopping_slot_type"];
          updated_at?: string;
          week_plan_id: string;
        };
        Update: {
          created_at?: string;
          day_index?: number;
          household_id?: string;
          id?: string;
          meal_id?: string | null;
          note?: string | null;
          slot_type?: Database["public"]["Enums"]["shopping_slot_type"];
          updated_at?: string;
          week_plan_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "shopping_week_plan_days_household_id_fkey";
            columns: ["household_id"];
            isOneToOne: false;
            referencedRelation: "households";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shopping_week_plan_days_meal_id_fkey";
            columns: ["meal_id"];
            isOneToOne: false;
            referencedRelation: "shopping_meal_stats";
            referencedColumns: ["meal_id"];
          },
          {
            foreignKeyName: "shopping_week_plan_days_meal_id_fkey";
            columns: ["meal_id"];
            isOneToOne: false;
            referencedRelation: "shopping_meals";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shopping_week_plan_days_week_plan_id_fkey";
            columns: ["week_plan_id"];
            isOneToOne: false;
            referencedRelation: "shopping_week_plans";
            referencedColumns: ["id"];
          },
        ];
      };
      shopping_week_plans: {
        Row: {
          created_at: string;
          household_id: string;
          id: string;
          week_start_date: string;
        };
        Insert: {
          created_at?: string;
          household_id?: string;
          id?: string;
          week_start_date: string;
        };
        Update: {
          created_at?: string;
          household_id?: string;
          id?: string;
          week_start_date?: string;
        };
        Relationships: [
          {
            foreignKeyName: "shopping_week_plans_household_id_fkey";
            columns: ["household_id"];
            isOneToOne: false;
            referencedRelation: "households";
            referencedColumns: ["id"];
          },
        ];
      };
      shopping_week_template_days: {
        Row: {
          day_index: number;
          household_id: string;
          id: string;
          meal_id: string | null;
          slot_type: Database["public"]["Enums"]["shopping_slot_type"];
          template_id: string;
        };
        Insert: {
          day_index: number;
          household_id?: string;
          id?: string;
          meal_id?: string | null;
          slot_type?: Database["public"]["Enums"]["shopping_slot_type"];
          template_id: string;
        };
        Update: {
          day_index?: number;
          household_id?: string;
          id?: string;
          meal_id?: string | null;
          slot_type?: Database["public"]["Enums"]["shopping_slot_type"];
          template_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "shopping_week_template_days_household_id_fkey";
            columns: ["household_id"];
            isOneToOne: false;
            referencedRelation: "households";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shopping_week_template_days_meal_id_fkey";
            columns: ["meal_id"];
            isOneToOne: false;
            referencedRelation: "shopping_meal_stats";
            referencedColumns: ["meal_id"];
          },
          {
            foreignKeyName: "shopping_week_template_days_meal_id_fkey";
            columns: ["meal_id"];
            isOneToOne: false;
            referencedRelation: "shopping_meals";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shopping_week_template_days_template_id_fkey";
            columns: ["template_id"];
            isOneToOne: false;
            referencedRelation: "shopping_week_templates";
            referencedColumns: ["id"];
          },
        ];
      };
      shopping_week_templates: {
        Row: {
          created_at: string;
          household_id: string;
          id: string;
          name: string;
          sort_order: number;
        };
        Insert: {
          created_at?: string;
          household_id?: string;
          id?: string;
          name: string;
          sort_order?: number;
        };
        Update: {
          created_at?: string;
          household_id?: string;
          id?: string;
          name?: string;
          sort_order?: number;
        };
        Relationships: [
          {
            foreignKeyName: "shopping_week_templates_household_id_fkey";
            columns: ["household_id"];
            isOneToOne: false;
            referencedRelation: "households";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      shopping_meal_stats: {
        Row: {
          cuisine: string | null;
          days_since_last: number | null;
          household_id: string | null;
          last_planned_on: string | null;
          meal_id: string | null;
          name: string | null;
          prep_minutes: number | null;
          times_planned: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "shopping_meals_household_id_fkey";
            columns: ["household_id"];
            isOneToOne: false;
            referencedRelation: "households";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Functions: {
      current_household_id: {
        Args: never;
        Returns: string;
      };
      is_household_member: {
        Args: { hh: string };
        Returns: boolean;
      };
    };
    Enums: {
      shopping_slot_type:
        | "meal"
        | "takeaway"
        | "leftovers"
        | "none";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<
  Database,
  "__InternalSupabase"
>;

type DefaultSchema =
  DatabaseWithoutInternals[Extract<
    keyof Database,
    "public"
  >];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends
    DefaultSchemaTableNameOrOptions extends {
      schema: keyof DatabaseWithoutInternals;
    }
      ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
          DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
      : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends
    DefaultSchemaTableNameOrOptions extends {
      schema: keyof DatabaseWithoutInternals;
    }
      ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
      : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends
    DefaultSchemaTableNameOrOptions extends {
      schema: keyof DatabaseWithoutInternals;
    }
      ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
      : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends
    DefaultSchemaEnumNameOrOptions extends {
      schema: keyof DatabaseWithoutInternals;
    }
      ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
      : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends
    PublicCompositeTypeNameOrOptions extends {
      schema: keyof DatabaseWithoutInternals;
    }
      ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
      : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      shopping_slot_type: [
        "meal",
        "takeaway",
        "leftovers",
        "none",
      ],
    },
  },
} as const;
