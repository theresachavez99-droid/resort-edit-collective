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
      brand_crawl_jobs: {
        Row: {
          brand_id: string
          category: string | null
          created_at: string
          cursor: string | null
          error: string | null
          failed_count: number
          id: string
          listing_url: string | null
          requested_count: number
          retailer_domain: string
          scraped_count: number
          skipped_count: number
          status: string
          updated_at: string
        }
        Insert: {
          brand_id: string
          category?: string | null
          created_at?: string
          cursor?: string | null
          error?: string | null
          failed_count?: number
          id?: string
          listing_url?: string | null
          requested_count?: number
          retailer_domain: string
          scraped_count?: number
          skipped_count?: number
          status?: string
          updated_at?: string
        }
        Update: {
          brand_id?: string
          category?: string | null
          created_at?: string
          cursor?: string | null
          error?: string | null
          failed_count?: number
          id?: string
          listing_url?: string | null
          requested_count?: number
          retailer_domain?: string
          scraped_count?: number
          skipped_count?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_crawl_jobs_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      brands: {
        Row: {
          activities: string[]
          categories: string[]
          created_at: string
          destinations: string[]
          id: string
          is_hero: boolean
          name: string
          notes: string | null
          retailer_hints: Json
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
          destinations?: string[]
          id?: string
          is_hero?: boolean
          name: string
          notes?: string | null
          retailer_hints?: Json
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
          destinations?: string[]
          id?: string
          is_hero?: boolean
          name?: string
          notes?: string | null
          retailer_hints?: Json
          slug?: string
          status?: string
          tier?: string
          updated_at?: string
          website?: string | null
          why_we_love?: string | null
        }
        Relationships: []
      }
      destination_muses: {
        Row: {
          allowed_variation: string
          created_at: string
          destination_slug: string
          face_description: string
          id: string
          muse_name: string
          reference_url: string
          style_guardrails: string
          updated_at: string
        }
        Insert: {
          allowed_variation?: string
          created_at?: string
          destination_slug: string
          face_description: string
          id?: string
          muse_name: string
          reference_url: string
          style_guardrails?: string
          updated_at?: string
        }
        Update: {
          allowed_variation?: string
          created_at?: string
          destination_slug?: string
          face_description?: string
          id?: string
          muse_name?: string
          reference_url?: string
          style_guardrails?: string
          updated_at?: string
        }
        Relationships: []
      }
      editorial_reference_library: {
        Row: {
          accessory_strategy: string | null
          activity: string | null
          brands_detected: Json
          category_mix: Json
          color_story: string | null
          created_at: string
          destination: string | null
          destination_signals: Json
          editorial_story: string | null
          editorial_tags: Json
          extracted_at: string | null
          extraction_error: string | null
          extraction_status: string
          hero_piece: string | null
          hero_piece_category: string | null
          id: string
          learned_patterns: string | null
          luxury_signals: Json
          mood: string | null
          occasion: string | null
          price_tier_mix: Json
          raw_extraction: Json
          reference_image: string | null
          reference_url: string | null
          saveability_drivers: Json
          silhouette_strategy: string | null
          source_type: string
          supporting_pieces: Json
          texture_strategy: string | null
          title: string
          updated_at: string
        }
        Insert: {
          accessory_strategy?: string | null
          activity?: string | null
          brands_detected?: Json
          category_mix?: Json
          color_story?: string | null
          created_at?: string
          destination?: string | null
          destination_signals?: Json
          editorial_story?: string | null
          editorial_tags?: Json
          extracted_at?: string | null
          extraction_error?: string | null
          extraction_status?: string
          hero_piece?: string | null
          hero_piece_category?: string | null
          id?: string
          learned_patterns?: string | null
          luxury_signals?: Json
          mood?: string | null
          occasion?: string | null
          price_tier_mix?: Json
          raw_extraction?: Json
          reference_image?: string | null
          reference_url?: string | null
          saveability_drivers?: Json
          silhouette_strategy?: string | null
          source_type?: string
          supporting_pieces?: Json
          texture_strategy?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          accessory_strategy?: string | null
          activity?: string | null
          brands_detected?: Json
          category_mix?: Json
          color_story?: string | null
          created_at?: string
          destination?: string | null
          destination_signals?: Json
          editorial_story?: string | null
          editorial_tags?: Json
          extracted_at?: string | null
          extraction_error?: string | null
          extraction_status?: string
          hero_piece?: string | null
          hero_piece_category?: string | null
          id?: string
          learned_patterns?: string | null
          luxury_signals?: Json
          mood?: string | null
          occasion?: string | null
          price_tier_mix?: Json
          raw_extraction?: Json
          reference_image?: string | null
          reference_url?: string | null
          saveability_drivers?: Json
          silhouette_strategy?: string | null
          source_type?: string
          supporting_pieces?: Json
          texture_strategy?: string | null
          title?: string
          updated_at?: string
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
          product_id: string | null
          resolution_status: string
          resolved_at: string | null
          resolved_source_id: string | null
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
          product_id?: string | null
          resolution_status?: string
          resolved_at?: string | null
          resolved_source_id?: string | null
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
          product_id?: string | null
          resolution_status?: string
          resolved_at?: string | null
          resolved_source_id?: string | null
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
            foreignKeyName: "look_candidate_slots_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "look_candidate_slots_resolved_source_id_fkey"
            columns: ["resolved_source_id"]
            isOneToOne: false
            referencedRelation: "product_sources"
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
          best_for: string[]
          brief: Json
          composite_score: number | null
          created_at: string
          day: number | null
          destination: string
          dna_id: string
          editorial_generated_at: string | null
          failure_reason: string | null
          feedback_history: Json
          id: string
          look: number | null
          lookboard_image_url: string | null
          muse_image_url: string | null
          notes: string | null
          pack_instead_of: string | null
          published_at: string | null
          quality_gate: Json
          rejected_at: string | null
          resort_edit_tip: string | null
          retry_count: number
          scoring: Json
          slug: string | null
          status: string
          updated_at: string
          variant: string
          whats_in_her_bag: Json
          why_it_works: string | null
        }
        Insert: {
          approved_at?: string | null
          best_for?: string[]
          brief?: Json
          composite_score?: number | null
          created_at?: string
          day?: number | null
          destination: string
          dna_id: string
          editorial_generated_at?: string | null
          failure_reason?: string | null
          feedback_history?: Json
          id?: string
          look?: number | null
          lookboard_image_url?: string | null
          muse_image_url?: string | null
          notes?: string | null
          pack_instead_of?: string | null
          published_at?: string | null
          quality_gate?: Json
          rejected_at?: string | null
          resort_edit_tip?: string | null
          retry_count?: number
          scoring?: Json
          slug?: string | null
          status?: string
          updated_at?: string
          variant: string
          whats_in_her_bag?: Json
          why_it_works?: string | null
        }
        Update: {
          approved_at?: string | null
          best_for?: string[]
          brief?: Json
          composite_score?: number | null
          created_at?: string
          day?: number | null
          destination?: string
          dna_id?: string
          editorial_generated_at?: string | null
          failure_reason?: string | null
          feedback_history?: Json
          id?: string
          look?: number | null
          lookboard_image_url?: string | null
          muse_image_url?: string | null
          notes?: string | null
          pack_instead_of?: string | null
          published_at?: string | null
          quality_gate?: Json
          rejected_at?: string | null
          resort_edit_tip?: string | null
          retry_count?: number
          scoring?: Json
          slug?: string | null
          status?: string
          updated_at?: string
          variant?: string
          whats_in_her_bag?: Json
          why_it_works?: string | null
        }
        Relationships: []
      }
      product_sources: {
        Row: {
          affiliate_url: string | null
          availability: string
          created_at: string
          currency: string | null
          id: string
          is_primary: boolean
          last_checked_at: string | null
          price: number | null
          product_id: string
          retailer: string
          retailer_domain: string | null
          source_url: string
          updated_at: string
        }
        Insert: {
          affiliate_url?: string | null
          availability?: string
          created_at?: string
          currency?: string | null
          id?: string
          is_primary?: boolean
          last_checked_at?: string | null
          price?: number | null
          product_id: string
          retailer: string
          retailer_domain?: string | null
          source_url: string
          updated_at?: string
        }
        Update: {
          affiliate_url?: string | null
          availability?: string
          created_at?: string
          currency?: string | null
          id?: string
          is_primary?: boolean
          last_checked_at?: string | null
          price?: number | null
          product_id?: string
          retailer?: string
          retailer_domain?: string | null
          source_url?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_sources_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          activity_tags: string[]
          approval_status: string
          brand: string
          brand_id: string | null
          category: string | null
          color: string | null
          color_family: string | null
          created_at: string
          destination_tags: string[]
          fabric: string | null
          id: string
          identity_key: string
          image_url: string | null
          luxury_score: number | null
          notes: string | null
          print_family: string | null
          product_name: string
          resort_edit_score: number | null
          silhouette: string | null
          subcategory: string | null
          texture: string | null
          updated_at: string
        }
        Insert: {
          activity_tags?: string[]
          approval_status?: string
          brand: string
          brand_id?: string | null
          category?: string | null
          color?: string | null
          color_family?: string | null
          created_at?: string
          destination_tags?: string[]
          fabric?: string | null
          id?: string
          identity_key: string
          image_url?: string | null
          luxury_score?: number | null
          notes?: string | null
          print_family?: string | null
          product_name: string
          resort_edit_score?: number | null
          silhouette?: string | null
          subcategory?: string | null
          texture?: string | null
          updated_at?: string
        }
        Update: {
          activity_tags?: string[]
          approval_status?: string
          brand?: string
          brand_id?: string | null
          category?: string | null
          color?: string | null
          color_family?: string | null
          created_at?: string
          destination_tags?: string[]
          fabric?: string | null
          id?: string
          identity_key?: string
          image_url?: string | null
          luxury_score?: number | null
          notes?: string | null
          print_family?: string | null
          product_name?: string
          resort_edit_score?: number | null
          silhouette?: string | null
          subcategory?: string | null
          texture?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      sourced_products: {
        Row: {
          activity_tags: string[]
          affiliate_url: string | null
          auto_approved: boolean
          auto_score: Json
          brand: string | null
          brand_id: string | null
          category: string | null
          color_family: string | null
          created_at: string
          currency: string | null
          day: number | null
          destination_tags: string[]
          fabric: string | null
          id: string
          image_url: string | null
          look: number | null
          notes: string | null
          price: number | null
          print_family: string | null
          product_name: string | null
          promoted_at: string | null
          raw_extraction: Json | null
          retailer_domain: string | null
          scraped_at: string | null
          silhouette: string | null
          slot_category: string | null
          source_url: string
          status: string
          subcategory: string | null
          texture: string | null
          updated_at: string
          validation_notes: string | null
        }
        Insert: {
          activity_tags?: string[]
          affiliate_url?: string | null
          auto_approved?: boolean
          auto_score?: Json
          brand?: string | null
          brand_id?: string | null
          category?: string | null
          color_family?: string | null
          created_at?: string
          currency?: string | null
          day?: number | null
          destination_tags?: string[]
          fabric?: string | null
          id?: string
          image_url?: string | null
          look?: number | null
          notes?: string | null
          price?: number | null
          print_family?: string | null
          product_name?: string | null
          promoted_at?: string | null
          raw_extraction?: Json | null
          retailer_domain?: string | null
          scraped_at?: string | null
          silhouette?: string | null
          slot_category?: string | null
          source_url: string
          status?: string
          subcategory?: string | null
          texture?: string | null
          updated_at?: string
          validation_notes?: string | null
        }
        Update: {
          activity_tags?: string[]
          affiliate_url?: string | null
          auto_approved?: boolean
          auto_score?: Json
          brand?: string | null
          brand_id?: string | null
          category?: string | null
          color_family?: string | null
          created_at?: string
          currency?: string | null
          day?: number | null
          destination_tags?: string[]
          fabric?: string | null
          id?: string
          image_url?: string | null
          look?: number | null
          notes?: string | null
          price?: number | null
          print_family?: string | null
          product_name?: string | null
          promoted_at?: string | null
          raw_extraction?: Json | null
          retailer_domain?: string | null
          scraped_at?: string | null
          silhouette?: string | null
          slot_category?: string | null
          source_url?: string
          status?: string
          subcategory?: string | null
          texture?: string | null
          updated_at?: string
          validation_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sourced_products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
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
          ai_replacements: Json
          approval_status: string
          approved_at: string | null
          brand: string
          brand_id: string | null
          brand_url: string | null
          category: string
          category_fallback_url: string | null
          color_family: string | null
          color_tags: string[]
          created_at: string
          currency: string | null
          destination_tags: string[]
          direct_product_url: string | null
          fabric: string | null
          id: string
          image_status: string
          image_url: string | null
          inventory_status: string
          last_verified_at: string | null
          luxury_score: number | null
          material_tags: string[]
          notes: string | null
          price: number | null
          print_family: string | null
          print_tags: string[]
          product_name: string
          product_type: string | null
          replacements_generated_at: string | null
          resort_edit_score: number | null
          retailer: string | null
          silhouette: string | null
          silhouette_tags: string[]
          source_look_candidate_id: string | null
          source_method: string
          source_slot: string | null
          source_sourced_product_id: string | null
          subcategory: string | null
          texture: string | null
          thumbnail_url: string | null
          updated_at: string
        }
        Insert: {
          activity_tags?: string[]
          affiliate_url: string
          ai_replacements?: Json
          approval_status?: string
          approved_at?: string | null
          brand: string
          brand_id?: string | null
          brand_url?: string | null
          category: string
          category_fallback_url?: string | null
          color_family?: string | null
          color_tags?: string[]
          created_at?: string
          currency?: string | null
          destination_tags?: string[]
          direct_product_url?: string | null
          fabric?: string | null
          id?: string
          image_status?: string
          image_url?: string | null
          inventory_status?: string
          last_verified_at?: string | null
          luxury_score?: number | null
          material_tags?: string[]
          notes?: string | null
          price?: number | null
          print_family?: string | null
          print_tags?: string[]
          product_name: string
          product_type?: string | null
          replacements_generated_at?: string | null
          resort_edit_score?: number | null
          retailer?: string | null
          silhouette?: string | null
          silhouette_tags?: string[]
          source_look_candidate_id?: string | null
          source_method?: string
          source_slot?: string | null
          source_sourced_product_id?: string | null
          subcategory?: string | null
          texture?: string | null
          thumbnail_url?: string | null
          updated_at?: string
        }
        Update: {
          activity_tags?: string[]
          affiliate_url?: string
          ai_replacements?: Json
          approval_status?: string
          approved_at?: string | null
          brand?: string
          brand_id?: string | null
          brand_url?: string | null
          category?: string
          category_fallback_url?: string | null
          color_family?: string | null
          color_tags?: string[]
          created_at?: string
          currency?: string | null
          destination_tags?: string[]
          direct_product_url?: string | null
          fabric?: string | null
          id?: string
          image_status?: string
          image_url?: string | null
          inventory_status?: string
          last_verified_at?: string | null
          luxury_score?: number | null
          material_tags?: string[]
          notes?: string | null
          price?: number | null
          print_family?: string | null
          print_tags?: string[]
          product_name?: string
          product_type?: string | null
          replacements_generated_at?: string | null
          resort_edit_score?: number | null
          retailer?: string | null
          silhouette?: string | null
          silhouette_tags?: string[]
          source_look_candidate_id?: string | null
          source_method?: string
          source_slot?: string | null
          source_sourced_product_id?: string | null
          subcategory?: string | null
          texture?: string | null
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
