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
      brands: {
        Row: {
          activities: string[]
          categories: string[]
          created_at: string
          id: string
          name: string
          notes: string | null
          slug: string
          status: string
          tier: string
          updated_at: string
          website: string | null
          why_we_love: string | null
        }
        Insert: {
          activities?: string[]
          categories?: string[]
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          slug: string
          status?: string
          tier?: string
          updated_at?: string
          website?: string | null
          why_we_love?: string | null
        }
        Update: {
          activities?: string[]
          categories?: string[]
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          slug?: string
          status?: string
          tier?: string
          updated_at?: string
          website?: string | null
          why_we_love?: string | null
        }
        Relationships: []
      }
      look_candidate_slots: {
        Row: {
          candidate_id: string
          created_at: string
          id: string
          notes: string | null
          position: number
          slot: string
          sourced_product_id: string | null
          updated_at: string
          vault_product_id: string | null
        }
        Insert: {
          candidate_id: string
          created_at?: string
          id?: string
          notes?: string | null
          position?: number
          slot: string
          sourced_product_id?: string | null
          updated_at?: string
          vault_product_id?: string | null
        }
        Update: {
          candidate_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          position?: number
          slot?: string
          sourced_product_id?: string | null
          updated_at?: string
          vault_product_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "look_candidate_slots_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "look_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "look_candidate_slots_sourced_product_id_fkey"
            columns: ["sourced_product_id"]
            isOneToOne: false
            referencedRelation: "sourced_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "look_candidate_slots_vault_product_id_fkey"
            columns: ["vault_product_id"]
            isOneToOne: false
            referencedRelation: "vault_products"
            referencedColumns: ["id"]
          },
        ]
      }
      look_candidates: {
        Row: {
          approved_at: string | null
          composite_score: number | null
          created_at: string
          day: number | null
          destination: string
          dna_id: string
          feedback_history: Json
          id: string
          look: number | null
          lookboard_image_url: string | null
          muse_image_url: string | null
          notes: string | null
          published_at: string | null
          rejected_at: string | null
          scoring: Json
          status: string
          updated_at: string
          variant: string
        }
        Insert: {
          approved_at?: string | null
          composite_score?: number | null
          created_at?: string
          day?: number | null
          destination: string
          dna_id: string
          feedback_history?: Json
          id?: string
          look?: number | null
          lookboard_image_url?: string | null
          muse_image_url?: string | null
          notes?: string | null
          published_at?: string | null
          rejected_at?: string | null
          scoring?: Json
          status?: string
          updated_at?: string
          variant: string
        }
        Update: {
          approved_at?: string | null
          composite_score?: number | null
          created_at?: string
          day?: number | null
          destination?: string
          dna_id?: string
          feedback_history?: Json
          id?: string
          look?: number | null
          lookboard_image_url?: string | null
          muse_image_url?: string | null
          notes?: string | null
          published_at?: string | null
          rejected_at?: string | null
          scoring?: Json
          status?: string
          updated_at?: string
          variant?: string
        }
        Relationships: []
      }
      sourced_products: {
        Row: {
          affiliate_url: string | null
          auto_approved: boolean
          auto_score: Json
          brand: string | null
          created_at: string
          currency: string | null
          day: number | null
          id: string
          image_url: string | null
          look: number | null
          notes: string | null
          price: number | null
          product_name: string | null
          promoted_at: string | null
          raw_extraction: Json | null
          retailer_domain: string | null
          scraped_at: string | null
          slot_category: string | null
          source_url: string
          status: string
          updated_at: string
          validation_notes: string | null
        }
        Insert: {
          affiliate_url?: string | null
          auto_approved?: boolean
          auto_score?: Json
          brand?: string | null
          created_at?: string
          currency?: string | null
          day?: number | null
          id?: string
          image_url?: string | null
          look?: number | null
          notes?: string | null
          price?: number | null
          product_name?: string | null
          promoted_at?: string | null
          raw_extraction?: Json | null
          retailer_domain?: string | null
          scraped_at?: string | null
          slot_category?: string | null
          source_url: string
          status?: string
          updated_at?: string
          validation_notes?: string | null
        }
        Update: {
          affiliate_url?: string | null
          auto_approved?: boolean
          auto_score?: Json
          brand?: string | null
          created_at?: string
          currency?: string | null
          day?: number | null
          id?: string
          image_url?: string | null
          look?: number | null
          notes?: string | null
          price?: number | null
          product_name?: string | null
          promoted_at?: string | null
          raw_extraction?: Json | null
          retailer_domain?: string | null
          scraped_at?: string | null
          slot_category?: string | null
          source_url?: string
          status?: string
          updated_at?: string
          validation_notes?: string | null
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          cta_source: string | null
          destination: string | null
          email: string
          id: string
          notes: string | null
          source_page: string | null
          status: string
          tags: string[]
          unsubscribed_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          cta_source?: string | null
          destination?: string | null
          email: string
          id?: string
          notes?: string | null
          source_page?: string | null
          status?: string
          tags?: string[]
          unsubscribed_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          cta_source?: string | null
          destination?: string | null
          email?: string
          id?: string
          notes?: string | null
          source_page?: string | null
          status?: string
          tags?: string[]
          unsubscribed_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      vault_products: {
        Row: {
          activity_tags: string[]
          affiliate_url: string
          approval_status: string
          approved_at: string | null
          brand: string
          brand_id: string | null
          brand_url: string | null
          category: string
          color_tags: string[]
          created_at: string
          currency: string | null
          destination_tags: string[]
          direct_product_url: string | null
          id: string
          image_status: string
          image_url: string | null
          inventory_status: string
          last_verified_at: string | null
          luxury_score: number | null
          material_tags: string[]
          notes: string | null
          price: number | null
          print_tags: string[]
          product_name: string
          resort_edit_score: number | null
          retailer: string | null
          silhouette_tags: string[]
          source_look_candidate_id: string | null
          source_method: string
          source_slot: string | null
          source_sourced_product_id: string | null
          subcategory: string | null
          thumbnail_url: string | null
          updated_at: string
        }
        Insert: {
          activity_tags?: string[]
          affiliate_url: string
          approval_status?: string
          approved_at?: string | null
          brand: string
          brand_id?: string | null
          brand_url?: string | null
          category: string
          color_tags?: string[]
          created_at?: string
          currency?: string | null
          destination_tags?: string[]
          direct_product_url?: string | null
          id?: string
          image_status?: string
          image_url?: string | null
          inventory_status?: string
          last_verified_at?: string | null
          luxury_score?: number | null
          material_tags?: string[]
          notes?: string | null
          price?: number | null
          print_tags?: string[]
          product_name: string
          resort_edit_score?: number | null
          retailer?: string | null
          silhouette_tags?: string[]
          source_look_candidate_id?: string | null
          source_method?: string
          source_slot?: string | null
          source_sourced_product_id?: string | null
          subcategory?: string | null
          thumbnail_url?: string | null
          updated_at?: string
        }
        Update: {
          activity_tags?: string[]
          affiliate_url?: string
          approval_status?: string
          approved_at?: string | null
          brand?: string
          brand_id?: string | null
          brand_url?: string | null
          category?: string
          color_tags?: string[]
          created_at?: string
          currency?: string | null
          destination_tags?: string[]
          direct_product_url?: string | null
          id?: string
          image_status?: string
          image_url?: string | null
          inventory_status?: string
          last_verified_at?: string | null
          luxury_score?: number | null
          material_tags?: string[]
          notes?: string | null
          price?: number | null
          print_tags?: string[]
          product_name?: string
          resort_edit_score?: number | null
          retailer?: string | null
          silhouette_tags?: string[]
          source_look_candidate_id?: string | null
          source_method?: string
          source_slot?: string | null
          source_sourced_product_id?: string | null
          subcategory?: string | null
          thumbnail_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vault_products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vault_products_source_look_candidate_id_fkey"
            columns: ["source_look_candidate_id"]
            isOneToOne: false
            referencedRelation: "look_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vault_products_source_sourced_product_id_fkey"
            columns: ["source_sourced_product_id"]
            isOneToOne: false
            referencedRelation: "sourced_products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
