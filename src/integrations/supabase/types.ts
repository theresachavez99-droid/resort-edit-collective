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
      brand_intelligence: {
        Row: {
          associated_destinations: string[]
          brand: string
          channel_type: string
          created_at: string
          founder_reference_count: number
          id: string
          notes: string | null
          slug: string
          source: string | null
          status: string
          suggested_activities: string[]
          suggested_destinations: string[]
          suggested_tier: string | null
          times_saved_to_library: number
          times_seen: number
          times_selected_for_looks: number
          times_uploaded_by_founder: number
          updated_at: string
        }
        Insert: {
          associated_destinations?: string[]
          brand: string
          channel_type?: string
          created_at?: string
          founder_reference_count?: number
          id?: string
          notes?: string | null
          slug: string
          source?: string | null
          status?: string
          suggested_activities?: string[]
          suggested_destinations?: string[]
          suggested_tier?: string | null
          times_saved_to_library?: number
          times_seen?: number
          times_selected_for_looks?: number
          times_uploaded_by_founder?: number
          updated_at?: string
        }
        Update: {
          associated_destinations?: string[]
          brand?: string
          channel_type?: string
          created_at?: string
          founder_reference_count?: number
          id?: string
          notes?: string | null
          slug?: string
          source?: string | null
          status?: string
          suggested_activities?: string[]
          suggested_destinations?: string[]
          suggested_tier?: string | null
          times_saved_to_library?: number
          times_seen?: number
          times_selected_for_looks?: number
          times_uploaded_by_founder?: number
          updated_at?: string
        }
        Relationships: []
      }
      brand_promotion_signals: {
        Row: {
          activity: string | null
          brand: string
          brand_id: string | null
          collection_id: string | null
          created_at: string
          destination: string | null
          id: string
          signal_type: string
          slot_category: string
        }
        Insert: {
          activity?: string | null
          brand: string
          brand_id?: string | null
          collection_id?: string | null
          created_at?: string
          destination?: string | null
          id?: string
          signal_type?: string
          slot_category: string
        }
        Update: {
          activity?: string | null
          brand?: string
          brand_id?: string | null
          collection_id?: string | null
          created_at?: string
          destination?: string | null
          id?: string
          signal_type?: string
          slot_category?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_promotion_signals_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_review_queue: {
        Row: {
          brand: string
          brand_slug: string
          created_at: string
          id: string
          products_found: Json
          review_status: string
          reviewed_at: string | null
          reviewer_notes: string | null
          source_urls: string[]
          suggested_activities: string[]
          suggested_destinations: string[]
          suggested_tier: string | null
          times_seen: number
          updated_at: string
        }
        Insert: {
          brand: string
          brand_slug: string
          created_at?: string
          id?: string
          products_found?: Json
          review_status?: string
          reviewed_at?: string | null
          reviewer_notes?: string | null
          source_urls?: string[]
          suggested_activities?: string[]
          suggested_destinations?: string[]
          suggested_tier?: string | null
          times_seen?: number
          updated_at?: string
        }
        Update: {
          brand?: string
          brand_slug?: string
          created_at?: string
          id?: string
          products_found?: Json
          review_status?: string
          reviewed_at?: string | null
          reviewer_notes?: string | null
          source_urls?: string[]
          suggested_activities?: string[]
          suggested_destinations?: string[]
          suggested_tier?: string | null
          times_seen?: number
          updated_at?: string
        }
        Relationships: []
      }
      brands: {
        Row: {
          accessory_specialist: boolean
          activities: string[]
          affinity_signals: Json
          approval_level: string
          approved_accessory_slots: string[]
          approved_product_families: string[]
          categories: string[]
          commerce_sources: Json
          created_at: string
          destination_strength: string[]
          destinations: string[]
          editorial_affinity: Json
          editorial_notes: string | null
          excluded_product_families: string[]
          id: string
          is_hero: boolean
          materials: string[]
          name: string
          notes: string | null
          preferred_commerce_source: string
          preferred_construction: string[]
          preferred_design_language: string[]
          preferred_materials: string[]
          retailer_hints: Json
          slug: string
          status: string
          style_dna: string[]
          tier: string
          updated_at: string
          website: string | null
          why_we_love: string | null
        }
        Insert: {
          accessory_specialist?: boolean
          activities?: string[]
          affinity_signals?: Json
          approval_level?: string
          approved_accessory_slots?: string[]
          approved_product_families?: string[]
          categories?: string[]
          commerce_sources?: Json
          created_at?: string
          destination_strength?: string[]
          destinations?: string[]
          editorial_affinity?: Json
          editorial_notes?: string | null
          excluded_product_families?: string[]
          id?: string
          is_hero?: boolean
          materials?: string[]
          name: string
          notes?: string | null
          preferred_commerce_source?: string
          preferred_construction?: string[]
          preferred_design_language?: string[]
          preferred_materials?: string[]
          retailer_hints?: Json
          slug: string
          status?: string
          style_dna?: string[]
          tier?: string
          updated_at?: string
          website?: string | null
          why_we_love?: string | null
        }
        Update: {
          accessory_specialist?: boolean
          activities?: string[]
          affinity_signals?: Json
          approval_level?: string
          approved_accessory_slots?: string[]
          approved_product_families?: string[]
          categories?: string[]
          commerce_sources?: Json
          created_at?: string
          destination_strength?: string[]
          destinations?: string[]
          editorial_affinity?: Json
          editorial_notes?: string | null
          excluded_product_families?: string[]
          id?: string
          is_hero?: boolean
          materials?: string[]
          name?: string
          notes?: string | null
          preferred_commerce_source?: string
          preferred_construction?: string[]
          preferred_design_language?: string[]
          preferred_materials?: string[]
          retailer_hints?: Json
          slug?: string
          status?: string
          style_dna?: string[]
          tier?: string
          updated_at?: string
          website?: string | null
          why_we_love?: string | null
        }
        Relationships: []
      }
      buying_candidates: {
        Row: {
          affiliate_status: string
          affiliate_url: string | null
          availability: string | null
          benchmark_similarity: number | null
          brand: string | null
          canonical_url: string
          category: string | null
          color: string | null
          created_at: string
          currency: string | null
          description: string | null
          editorial_confidence: number | null
          editorial_score: number | null
          hero_outfit_id: string | null
          id: string
          image_missing: boolean
          image_url: string | null
          import_type: string
          imported_by: string | null
          is_hero_garment: boolean
          notes: string | null
          price: number | null
          product_name: string | null
          product_url: string
          ranking_reasons: Json
          raw: Json
          rejection_reason: string | null
          retailer: string | null
          sale_status: string | null
          selected_for_look: boolean
          session_id: string
          source: string
          source_adapter: string | null
          status: string
          stylist_slot: string | null
          stylist_source: string
          updated_at: string
        }
        Insert: {
          affiliate_status?: string
          affiliate_url?: string | null
          availability?: string | null
          benchmark_similarity?: number | null
          brand?: string | null
          canonical_url: string
          category?: string | null
          color?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          editorial_confidence?: number | null
          editorial_score?: number | null
          hero_outfit_id?: string | null
          id?: string
          image_missing?: boolean
          image_url?: string | null
          import_type?: string
          imported_by?: string | null
          is_hero_garment?: boolean
          notes?: string | null
          price?: number | null
          product_name?: string | null
          product_url: string
          ranking_reasons?: Json
          raw?: Json
          rejection_reason?: string | null
          retailer?: string | null
          sale_status?: string | null
          selected_for_look?: boolean
          session_id: string
          source: string
          source_adapter?: string | null
          status?: string
          stylist_slot?: string | null
          stylist_source?: string
          updated_at?: string
        }
        Update: {
          affiliate_status?: string
          affiliate_url?: string | null
          availability?: string | null
          benchmark_similarity?: number | null
          brand?: string | null
          canonical_url?: string
          category?: string | null
          color?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          editorial_confidence?: number | null
          editorial_score?: number | null
          hero_outfit_id?: string | null
          id?: string
          image_missing?: boolean
          image_url?: string | null
          import_type?: string
          imported_by?: string | null
          is_hero_garment?: boolean
          notes?: string | null
          price?: number | null
          product_name?: string | null
          product_url?: string
          ranking_reasons?: Json
          raw?: Json
          rejection_reason?: string | null
          retailer?: string | null
          sale_status?: string | null
          selected_for_look?: boolean
          session_id?: string
          source?: string
          source_adapter?: string | null
          status?: string
          stylist_slot?: string | null
          stylist_source?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "buying_candidates_hero_outfit_id_fkey"
            columns: ["hero_outfit_id"]
            isOneToOne: false
            referencedRelation: "founder_hero_outfits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "buying_candidates_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "buying_search_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      buying_search_sessions: {
        Row: {
          category_set: Json
          created_at: string
          destination: string
          founder_look_id: string | null
          id: string
          moment: string
          notes: string | null
          session_code: string | null
          source_diagnostics: Json
          status: string
          strategy: string
          updated_at: string
        }
        Insert: {
          category_set?: Json
          created_at?: string
          destination: string
          founder_look_id?: string | null
          id?: string
          moment: string
          notes?: string | null
          session_code?: string | null
          source_diagnostics?: Json
          status?: string
          strategy?: string
          updated_at?: string
        }
        Update: {
          category_set?: Json
          created_at?: string
          destination?: string
          founder_look_id?: string | null
          id?: string
          moment?: string
          notes?: string | null
          session_code?: string | null
          source_diagnostics?: Json
          status?: string
          strategy?: string
          updated_at?: string
        }
        Relationships: []
      }
      canonical_day_images: {
        Row: {
          approved_at: string
          created_at: string
          day_slug: string
          image_source: string
          image_url: string
          notes: string | null
          original_filename: string | null
          updated_at: string
        }
        Insert: {
          approved_at?: string
          created_at?: string
          day_slug: string
          image_source?: string
          image_url: string
          notes?: string | null
          original_filename?: string | null
          updated_at?: string
        }
        Update: {
          approved_at?: string
          created_at?: string
          day_slug?: string
          image_source?: string
          image_url?: string
          notes?: string | null
          original_filename?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      day_image_uploads: {
        Row: {
          created_at: string
          day_slug: string
          id: string
          image_source: string
          image_url: string
          notes: string | null
          original_filename: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          day_slug: string
          id?: string
          image_source?: string
          image_url: string
          notes?: string | null
          original_filename?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          day_slug?: string
          id?: string
          image_source?: string
          image_url?: string
          notes?: string | null
          original_filename?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      destination_moment_archetypes: {
        Row: {
          archetype_name: string
          archetype_slug: string
          created_at: string
          description: string | null
          destination_required: boolean
          id: string
          moment_type: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          archetype_name: string
          archetype_slug: string
          created_at?: string
          description?: string | null
          destination_required?: boolean
          id?: string
          moment_type?: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          archetype_name?: string
          archetype_slug?: string
          created_at?: string
          description?: string | null
          destination_required?: boolean
          id?: string
          moment_type?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      destination_moments: {
        Row: {
          active: boolean
          archetype_slug: string | null
          created_at: string
          destination_slug: string
          id: string
          moment_name: string
          moment_slug: string
          narrative: string | null
          sort_order: number
          styling_cues: Json
          time_of_day: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          archetype_slug?: string | null
          created_at?: string
          destination_slug: string
          id?: string
          moment_name: string
          moment_slug: string
          narrative?: string | null
          sort_order?: number
          styling_cues?: Json
          time_of_day?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          archetype_slug?: string | null
          created_at?: string
          destination_slug?: string
          id?: string
          moment_name?: string
          moment_slug?: string
          narrative?: string | null
          sort_order?: number
          styling_cues?: Json
          time_of_day?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "destination_moments_archetype_slug_fkey"
            columns: ["archetype_slug"]
            isOneToOne: false
            referencedRelation: "destination_moment_archetypes"
            referencedColumns: ["archetype_slug"]
          },
        ]
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
      editorial_collection_look_slots: {
        Row: {
          affiliate_url: string | null
          brand: string | null
          created_at: string
          currency: string | null
          fallback_active: boolean
          health_attempts: number
          health_status: string
          id: string
          image_url: string | null
          last_health_check_at: string | null
          locked: boolean
          look_id: string
          metadata: Json
          original_source_url: string | null
          position: number
          price: number | null
          product_name: string | null
          reasoning: string | null
          rejected_reason: string | null
          retailer: string | null
          slot: string
          source_url: string | null
          updated_at: string
        }
        Insert: {
          affiliate_url?: string | null
          brand?: string | null
          created_at?: string
          currency?: string | null
          fallback_active?: boolean
          health_attempts?: number
          health_status?: string
          id?: string
          image_url?: string | null
          last_health_check_at?: string | null
          locked?: boolean
          look_id: string
          metadata?: Json
          original_source_url?: string | null
          position?: number
          price?: number | null
          product_name?: string | null
          reasoning?: string | null
          rejected_reason?: string | null
          retailer?: string | null
          slot: string
          source_url?: string | null
          updated_at?: string
        }
        Update: {
          affiliate_url?: string | null
          brand?: string | null
          created_at?: string
          currency?: string | null
          fallback_active?: boolean
          health_attempts?: number
          health_status?: string
          id?: string
          image_url?: string | null
          last_health_check_at?: string | null
          locked?: boolean
          look_id?: string
          metadata?: Json
          original_source_url?: string | null
          position?: number
          price?: number | null
          product_name?: string | null
          reasoning?: string | null
          rejected_reason?: string | null
          retailer?: string | null
          slot?: string
          source_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "editorial_collection_look_slots_look_id_fkey"
            columns: ["look_id"]
            isOneToOne: false
            referencedRelation: "editorial_collection_looks"
            referencedColumns: ["id"]
          },
        ]
      }
      editorial_collection_looks: {
        Row: {
          approved_at: string | null
          collection_id: string
          completeness_score: number
          created_at: string
          description: string | null
          editorial_score: number
          id: string
          missing_slots: string[]
          palette: string[]
          pinned: boolean
          position: number
          reasoning: Json
          rejected_at: string | null
          status: string
          style_dna: string[]
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          collection_id: string
          completeness_score?: number
          created_at?: string
          description?: string | null
          editorial_score?: number
          id?: string
          missing_slots?: string[]
          palette?: string[]
          pinned?: boolean
          position?: number
          reasoning?: Json
          rejected_at?: string | null
          status?: string
          style_dna?: string[]
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          collection_id?: string
          completeness_score?: number
          created_at?: string
          description?: string | null
          editorial_score?: number
          id?: string
          missing_slots?: string[]
          palette?: string[]
          pinned?: boolean
          position?: number
          reasoning?: Json
          rejected_at?: string | null
          status?: string
          style_dna?: string[]
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "editorial_collection_looks_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "editorial_collections"
            referencedColumns: ["id"]
          },
        ]
      }
      editorial_collections: {
        Row: {
          activity: string
          brief: Json
          created_at: string
          destination: string
          diagnostics: Json
          featured: boolean
          featured_look_id: string | null
          id: string
          notes: string | null
          published_at: string | null
          scoring: Json
          season: string | null
          status: string
          title: string | null
          updated_at: string
        }
        Insert: {
          activity: string
          brief?: Json
          created_at?: string
          destination: string
          diagnostics?: Json
          featured?: boolean
          featured_look_id?: string | null
          id?: string
          notes?: string | null
          published_at?: string | null
          scoring?: Json
          season?: string | null
          status?: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          activity?: string
          brief?: Json
          created_at?: string
          destination?: string
          diagnostics?: Json
          featured?: boolean
          featured_look_id?: string | null
          id?: string
          notes?: string | null
          published_at?: string | null
          scoring?: Json
          season?: string | null
          status?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      editorial_memory_products: {
        Row: {
          brand: string
          category: string | null
          color_family: string | null
          created_at: string
          destinations: string[]
          first_used_at: string | null
          founder_override_reason: string | null
          image_url: string | null
          last_used_at: string | null
          material: string | null
          moment_id: string | null
          moments: string[]
          product_name: string | null
          product_url: string
          retailer: string | null
          signature_piece: boolean
          signature_reason: string | null
          silhouette: string | null
          style_family: string[]
          updated_at: string
          usage_count: number
        }
        Insert: {
          brand: string
          category?: string | null
          color_family?: string | null
          created_at?: string
          destinations?: string[]
          first_used_at?: string | null
          founder_override_reason?: string | null
          image_url?: string | null
          last_used_at?: string | null
          material?: string | null
          moment_id?: string | null
          moments?: string[]
          product_name?: string | null
          product_url: string
          retailer?: string | null
          signature_piece?: boolean
          signature_reason?: string | null
          silhouette?: string | null
          style_family?: string[]
          updated_at?: string
          usage_count?: number
        }
        Update: {
          brand?: string
          category?: string | null
          color_family?: string | null
          created_at?: string
          destinations?: string[]
          first_used_at?: string | null
          founder_override_reason?: string | null
          image_url?: string | null
          last_used_at?: string | null
          material?: string | null
          moment_id?: string | null
          moments?: string[]
          product_name?: string | null
          product_url?: string
          retailer?: string | null
          signature_piece?: boolean
          signature_reason?: string | null
          silhouette?: string | null
          style_family?: string[]
          updated_at?: string
          usage_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "editorial_memory_products_moment_id_fkey"
            columns: ["moment_id"]
            isOneToOne: false
            referencedRelation: "moments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "editorial_memory_products_moment_id_fkey"
            columns: ["moment_id"]
            isOneToOne: false
            referencedRelation: "moments_public"
            referencedColumns: ["id"]
          },
        ]
      }
      editorial_memory_usages: {
        Row: {
          destination: string
          founder_look_id: string | null
          id: string
          moment: string
          product_url: string
          role: string | null
          slot: string | null
          used_at: string
        }
        Insert: {
          destination: string
          founder_look_id?: string | null
          id?: string
          moment: string
          product_url: string
          role?: string | null
          slot?: string | null
          used_at?: string
        }
        Update: {
          destination?: string
          founder_look_id?: string | null
          id?: string
          moment?: string
          product_url?: string
          role?: string | null
          slot?: string | null
          used_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "editorial_memory_usages_product_url_fkey"
            columns: ["product_url"]
            isOneToOne: false
            referencedRelation: "editorial_memory_products"
            referencedColumns: ["product_url"]
          },
        ]
      }
      editorial_reference_library: {
        Row: {
          accessory_strategy: string | null
          activity: string | null
          brands_detected: Json
          category_mix: Json
          collection: string
          color_story: string | null
          created_at: string
          destination: string | null
          destination_signals: Json
          editorial_priority: string
          editorial_story: string | null
          editorial_tags: Json
          engagement_unlock_keyword: string | null
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
          reference_type: string | null
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
          collection?: string
          color_story?: string | null
          created_at?: string
          destination?: string | null
          destination_signals?: Json
          editorial_priority?: string
          editorial_story?: string | null
          editorial_tags?: Json
          engagement_unlock_keyword?: string | null
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
          reference_type?: string | null
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
          collection?: string
          color_story?: string | null
          created_at?: string
          destination?: string | null
          destination_signals?: Json
          editorial_priority?: string
          editorial_story?: string | null
          editorial_tags?: Json
          engagement_unlock_keyword?: string | null
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
          reference_type?: string | null
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
      editorial_review_queue: {
        Row: {
          collection_id: string | null
          created_at: string
          id: string
          look_id: string | null
          payload: Json
          priority: string
          reason: string
          resolution_note: string | null
          resolved_at: string | null
          slot_id: string | null
          status: string
        }
        Insert: {
          collection_id?: string | null
          created_at?: string
          id?: string
          look_id?: string | null
          payload?: Json
          priority?: string
          reason: string
          resolution_note?: string | null
          resolved_at?: string | null
          slot_id?: string | null
          status?: string
        }
        Update: {
          collection_id?: string | null
          created_at?: string
          id?: string
          look_id?: string | null
          payload?: Json
          priority?: string
          reason?: string
          resolution_note?: string | null
          resolved_at?: string | null
          slot_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "editorial_review_queue_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "editorial_collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "editorial_review_queue_look_id_fkey"
            columns: ["look_id"]
            isOneToOne: false
            referencedRelation: "editorial_collection_looks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "editorial_review_queue_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "editorial_collection_look_slots"
            referencedColumns: ["id"]
          },
        ]
      }
      founder_hero_outfits: {
        Row: {
          activity: string | null
          color_palette: string[]
          created_at: string
          custom_components: Json
          destination: string
          editorial_dna: Json
          founder_look_id: string | null
          founder_notes: string | null
          id: string
          look_number: number | null
          moment: string
          preview_image_url: string | null
          primary_brand: string | null
          promoted_at: string | null
          published_at: string | null
          retailers: string[]
          session_id: string
          silhouette: string | null
          status: string
          title: string | null
          updated_at: string
        }
        Insert: {
          activity?: string | null
          color_palette?: string[]
          created_at?: string
          custom_components?: Json
          destination: string
          editorial_dna?: Json
          founder_look_id?: string | null
          founder_notes?: string | null
          id?: string
          look_number?: number | null
          moment: string
          preview_image_url?: string | null
          primary_brand?: string | null
          promoted_at?: string | null
          published_at?: string | null
          retailers?: string[]
          session_id: string
          silhouette?: string | null
          status?: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          activity?: string | null
          color_palette?: string[]
          created_at?: string
          custom_components?: Json
          destination?: string
          editorial_dna?: Json
          founder_look_id?: string | null
          founder_notes?: string | null
          id?: string
          look_number?: number | null
          moment?: string
          preview_image_url?: string | null
          primary_brand?: string | null
          promoted_at?: string | null
          published_at?: string | null
          retailers?: string[]
          session_id?: string
          silhouette?: string | null
          status?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "founder_hero_outfits_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "buying_search_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      founder_looks: {
        Row: {
          accessory_philosophy: string | null
          activity_sequence: string[]
          color_palette: Json
          created_at: string
          destination: string
          editorial_dna: string | null
          founder_notes: string | null
          hero_philosophy: string | null
          hero_urls: Json
          id: string
          luxury_level: string
          moment: string
          negative_rules: Json
          positive_rules: Json
          published_at: string | null
          slug: string
          status: string
          style_family: string[]
          title: string
          updated_at: string
          visual_weight: string
        }
        Insert: {
          accessory_philosophy?: string | null
          activity_sequence?: string[]
          color_palette?: Json
          created_at?: string
          destination: string
          editorial_dna?: string | null
          founder_notes?: string | null
          hero_philosophy?: string | null
          hero_urls?: Json
          id?: string
          luxury_level?: string
          moment: string
          negative_rules?: Json
          positive_rules?: Json
          published_at?: string | null
          slug: string
          status?: string
          style_family?: string[]
          title: string
          updated_at?: string
          visual_weight?: string
        }
        Update: {
          accessory_philosophy?: string | null
          activity_sequence?: string[]
          color_palette?: Json
          created_at?: string
          destination?: string
          editorial_dna?: string | null
          founder_notes?: string | null
          hero_philosophy?: string | null
          hero_urls?: Json
          id?: string
          luxury_level?: string
          moment?: string
          negative_rules?: Json
          positive_rules?: Json
          published_at?: string | null
          slug?: string
          status?: string
          style_family?: string[]
          title?: string
          updated_at?: string
          visual_weight?: string
        }
        Relationships: []
      }
      founder_product_feedback: {
        Row: {
          brand: string | null
          created_at: string
          destination: string | null
          founder_look_id: string | null
          id: string
          image_url: string | null
          moment: string | null
          notes: string | null
          product_title: string | null
          product_url: string | null
          reason_code: string
          reason_label: string | null
          retailer: string | null
          slot: string
          variant: string | null
        }
        Insert: {
          brand?: string | null
          created_at?: string
          destination?: string | null
          founder_look_id?: string | null
          id?: string
          image_url?: string | null
          moment?: string | null
          notes?: string | null
          product_title?: string | null
          product_url?: string | null
          reason_code: string
          reason_label?: string | null
          retailer?: string | null
          slot: string
          variant?: string | null
        }
        Update: {
          brand?: string | null
          created_at?: string
          destination?: string | null
          founder_look_id?: string | null
          id?: string
          image_url?: string | null
          moment?: string | null
          notes?: string | null
          product_title?: string | null
          product_url?: string | null
          reason_code?: string
          reason_label?: string | null
          retailer?: string | null
          slot?: string
          variant?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "founder_product_feedback_founder_look_id_fkey"
            columns: ["founder_look_id"]
            isOneToOne: false
            referencedRelation: "founder_looks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "founder_product_feedback_founder_look_id_fkey"
            columns: ["founder_look_id"]
            isOneToOne: false
            referencedRelation: "founder_looks_public"
            referencedColumns: ["id"]
          },
        ]
      }
      founder_reference_products: {
        Row: {
          activity_tags: string[]
          approval_date: string
          brand: string
          channel_type: string
          color_story: string[]
          created_at: string
          destination_tags: string[]
          founder_approved: boolean
          founder_look_id: string | null
          founder_notes: string | null
          id: string
          image_review_status: string | null
          image_source: string
          image_url: string | null
          print_language: string | null
          product_category: string | null
          product_name: string | null
          retailer: string | null
          silhouette: string | null
          source_url: string | null
          style_tags: string[]
          texture: string | null
          updated_at: string
        }
        Insert: {
          activity_tags?: string[]
          approval_date?: string
          brand: string
          channel_type?: string
          color_story?: string[]
          created_at?: string
          destination_tags?: string[]
          founder_approved?: boolean
          founder_look_id?: string | null
          founder_notes?: string | null
          id?: string
          image_review_status?: string | null
          image_source?: string
          image_url?: string | null
          print_language?: string | null
          product_category?: string | null
          product_name?: string | null
          retailer?: string | null
          silhouette?: string | null
          source_url?: string | null
          style_tags?: string[]
          texture?: string | null
          updated_at?: string
        }
        Update: {
          activity_tags?: string[]
          approval_date?: string
          brand?: string
          channel_type?: string
          color_story?: string[]
          created_at?: string
          destination_tags?: string[]
          founder_approved?: boolean
          founder_look_id?: string | null
          founder_notes?: string | null
          id?: string
          image_review_status?: string | null
          image_source?: string
          image_url?: string | null
          print_language?: string | null
          product_category?: string | null
          product_name?: string | null
          retailer?: string | null
          silhouette?: string | null
          source_url?: string | null
          style_tags?: string[]
          texture?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "founder_reference_products_founder_look_id_fkey"
            columns: ["founder_look_id"]
            isOneToOne: false
            referencedRelation: "founder_looks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "founder_reference_products_founder_look_id_fkey"
            columns: ["founder_look_id"]
            isOneToOne: false
            referencedRelation: "founder_looks_public"
            referencedColumns: ["id"]
          },
        ]
      }
      founder_uploaded_urls: {
        Row: {
          activity_hint: string | null
          brands_found: number
          created_at: string
          destination_hint: string | null
          harvest_error: string | null
          harvest_payload: Json | null
          harvest_status: string
          harvested_at: string | null
          id: string
          new_brands_count: number
          notes: string | null
          products_found: number
          source_type: string | null
          updated_at: string
          url: string
        }
        Insert: {
          activity_hint?: string | null
          brands_found?: number
          created_at?: string
          destination_hint?: string | null
          harvest_error?: string | null
          harvest_payload?: Json | null
          harvest_status?: string
          harvested_at?: string | null
          id?: string
          new_brands_count?: number
          notes?: string | null
          products_found?: number
          source_type?: string | null
          updated_at?: string
          url: string
        }
        Update: {
          activity_hint?: string | null
          brands_found?: number
          created_at?: string
          destination_hint?: string | null
          harvest_error?: string | null
          harvest_payload?: Json | null
          harvest_status?: string
          harvested_at?: string | null
          id?: string
          new_brands_count?: number
          notes?: string | null
          products_found?: number
          source_type?: string | null
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      founder_validation_runs: {
        Row: {
          created_at: string
          destination: string
          founder_look_id: string | null
          founder_side: string
          id: string
          moment: string
          notes: string | null
          run_a: Json
          run_b: Json
        }
        Insert: {
          created_at?: string
          destination: string
          founder_look_id?: string | null
          founder_side: string
          id?: string
          moment: string
          notes?: string | null
          run_a: Json
          run_b: Json
        }
        Update: {
          created_at?: string
          destination?: string
          founder_look_id?: string | null
          founder_side?: string
          id?: string
          moment?: string
          notes?: string | null
          run_a?: Json
          run_b?: Json
        }
        Relationships: [
          {
            foreignKeyName: "founder_validation_runs_founder_look_id_fkey"
            columns: ["founder_look_id"]
            isOneToOne: false
            referencedRelation: "founder_looks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "founder_validation_runs_founder_look_id_fkey"
            columns: ["founder_look_id"]
            isOneToOne: false
            referencedRelation: "founder_looks_public"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_health_events: {
        Row: {
          collection_id: string | null
          created_at: string
          event_type: string
          http_status: number | null
          id: string
          look_id: string | null
          message: string | null
          outcome: string
          payload: Json
          slot_id: string | null
        }
        Insert: {
          collection_id?: string | null
          created_at?: string
          event_type: string
          http_status?: number | null
          id?: string
          look_id?: string | null
          message?: string | null
          outcome: string
          payload?: Json
          slot_id?: string | null
        }
        Update: {
          collection_id?: string | null
          created_at?: string
          event_type?: string
          http_status?: number | null
          id?: string
          look_id?: string | null
          message?: string | null
          outcome?: string
          payload?: Json
          slot_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_health_events_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "editorial_collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_health_events_look_id_fkey"
            columns: ["look_id"]
            isOneToOne: false
            referencedRelation: "editorial_collection_looks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_health_events_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "editorial_collection_look_slots"
            referencedColumns: ["id"]
          },
        ]
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
          moment_slug: string | null
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
          moment_slug?: string | null
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
          moment_slug?: string | null
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
      moment_runs: {
        Row: {
          created_at: string
          id: string
          last_error: string | null
          moment_id: string
          output: Json
          params: Json
          stage: number
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_error?: string | null
          moment_id: string
          output?: Json
          params?: Json
          stage?: number
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_error?: string | null
          moment_id?: string
          output?: Json
          params?: Json
          stage?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "moment_runs_moment_id_fkey"
            columns: ["moment_id"]
            isOneToOne: true
            referencedRelation: "moments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moment_runs_moment_id_fkey"
            columns: ["moment_id"]
            isOneToOne: true
            referencedRelation: "moments_public"
            referencedColumns: ["id"]
          },
        ]
      }
      moments: {
        Row: {
          brief: Json
          copy: Json
          created_at: string
          destination: string
          hero_image: string | null
          id: string
          legacy_day_slug: string | null
          legacy_look_slug: string | null
          name: string
          published_at: string | null
          sequence: number
          slug: string
          status: string
          updated_at: string
        }
        Insert: {
          brief?: Json
          copy?: Json
          created_at?: string
          destination: string
          hero_image?: string | null
          id?: string
          legacy_day_slug?: string | null
          legacy_look_slug?: string | null
          name: string
          published_at?: string | null
          sequence: number
          slug: string
          status?: string
          updated_at?: string
        }
        Update: {
          brief?: Json
          copy?: Json
          created_at?: string
          destination?: string
          hero_image?: string | null
          id?: string
          legacy_day_slug?: string | null
          legacy_look_slug?: string | null
          name?: string
          published_at?: string | null
          sequence?: number
          slug?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      product_cache: {
        Row: {
          activity_tags: string[]
          brand: string
          brand_id: string | null
          canonical_url: string
          created_at: string
          currency: string | null
          destination_tags: string[]
          discovered_at: string
          editorial_score: number
          id: string
          image_url: string | null
          inventory_health: string
          last_used_at: string | null
          last_verified_at: string
          price: number | null
          product_name: string | null
          quality_source: string
          retailer: string | null
          slot_category: string
          times_used: number
          updated_at: string
        }
        Insert: {
          activity_tags?: string[]
          brand: string
          brand_id?: string | null
          canonical_url: string
          created_at?: string
          currency?: string | null
          destination_tags?: string[]
          discovered_at?: string
          editorial_score?: number
          id?: string
          image_url?: string | null
          inventory_health?: string
          last_used_at?: string | null
          last_verified_at?: string
          price?: number | null
          product_name?: string | null
          quality_source?: string
          retailer?: string | null
          slot_category: string
          times_used?: number
          updated_at?: string
        }
        Update: {
          activity_tags?: string[]
          brand?: string
          brand_id?: string | null
          canonical_url?: string
          created_at?: string
          currency?: string | null
          destination_tags?: string[]
          discovered_at?: string
          editorial_score?: number
          id?: string
          image_url?: string | null
          inventory_health?: string
          last_used_at?: string | null
          last_verified_at?: string
          price?: number | null
          product_name?: string | null
          quality_source?: string
          retailer?: string | null
          slot_category?: string
          times_used?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_cache_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      product_replacement_candidates: {
        Row: {
          approval_status: string
          brand: string
          created_at: string
          destination: string
          id: string
          look_key: string
          matching_score: number | null
          moment: string
          pdp_url: string
          price: string | null
          product_name: string
          promoted_product_id: string | null
          rationale: string | null
          retailer: string | null
          slot: string
          slot_product_id: string | null
          source: string
          style_dna: Json
          updated_at: string
          verified_at: string | null
        }
        Insert: {
          approval_status?: string
          brand: string
          created_at?: string
          destination: string
          id?: string
          look_key: string
          matching_score?: number | null
          moment: string
          pdp_url: string
          price?: string | null
          product_name: string
          promoted_product_id?: string | null
          rationale?: string | null
          retailer?: string | null
          slot: string
          slot_product_id?: string | null
          source?: string
          style_dna?: Json
          updated_at?: string
          verified_at?: string | null
        }
        Update: {
          approval_status?: string
          brand?: string
          created_at?: string
          destination?: string
          id?: string
          look_key?: string
          matching_score?: number | null
          moment?: string
          pdp_url?: string
          price?: string | null
          product_name?: string
          promoted_product_id?: string | null
          rationale?: string | null
          retailer?: string | null
          slot?: string
          slot_product_id?: string | null
          source?: string
          style_dna?: Json
          updated_at?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_replacement_candidates_promoted_product_id_fkey"
            columns: ["promoted_product_id"]
            isOneToOne: false
            referencedRelation: "shop_slot_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_replacement_candidates_slot_product_id_fkey"
            columns: ["slot_product_id"]
            isOneToOne: false
            referencedRelation: "shop_slot_products"
            referencedColumns: ["id"]
          },
        ]
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
      shop_slot_products: {
        Row: {
          brand: string
          created_at: string
          destination: string
          id: string
          is_primary: boolean
          last_checked_at: string | null
          last_http_status: number | null
          last_seen_available_at: string | null
          look_key: string
          moment: string
          notes: string | null
          price: string | null
          product_name: string
          replacement_priority: number
          retailer: string | null
          slot: string
          slot_label: string | null
          status: string
          style_dna: Json
          updated_at: string
          url: string | null
        }
        Insert: {
          brand: string
          created_at?: string
          destination: string
          id?: string
          is_primary?: boolean
          last_checked_at?: string | null
          last_http_status?: number | null
          last_seen_available_at?: string | null
          look_key: string
          moment: string
          notes?: string | null
          price?: string | null
          product_name: string
          replacement_priority?: number
          retailer?: string | null
          slot: string
          slot_label?: string | null
          status?: string
          style_dna?: Json
          updated_at?: string
          url?: string | null
        }
        Update: {
          brand?: string
          created_at?: string
          destination?: string
          id?: string
          is_primary?: boolean
          last_checked_at?: string | null
          last_http_status?: number | null
          last_seen_available_at?: string | null
          look_key?: string
          moment?: string
          notes?: string | null
          price?: string | null
          product_name?: string
          replacement_priority?: number
          retailer?: string | null
          slot?: string
          slot_label?: string | null
          status?: string
          style_dna?: Json
          updated_at?: string
          url?: string | null
        }
        Relationships: []
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
      brand_founder_signal_view: {
        Row: {
          activity: string | null
          approvals: number | null
          avg_editorial_score: number | null
          brand_name: string | null
          collection_approvals: number | null
          destination: string | null
          last_seen_at: string | null
          rejections: number | null
          total_appearances: number | null
        }
        Relationships: []
      }
      brands_public: {
        Row: {
          brand: string | null
          channel_type: string | null
          slug: string | null
          suggested_activities: string[] | null
          suggested_destinations: string[] | null
          suggested_tier: string | null
        }
        Insert: {
          brand?: string | null
          channel_type?: string | null
          slug?: string | null
          suggested_activities?: string[] | null
          suggested_destinations?: string[] | null
          suggested_tier?: string | null
        }
        Update: {
          brand?: string | null
          channel_type?: string | null
          slug?: string | null
          suggested_activities?: string[] | null
          suggested_destinations?: string[] | null
          suggested_tier?: string | null
        }
        Relationships: []
      }
      founder_looks_public: {
        Row: {
          color_palette: Json | null
          destination: string | null
          editorial_dna: string | null
          hero_urls: Json | null
          id: string | null
          moment: string | null
          published_at: string | null
          slug: string | null
          style_family: string[] | null
          title: string | null
        }
        Insert: {
          color_palette?: Json | null
          destination?: string | null
          editorial_dna?: string | null
          hero_urls?: Json | null
          id?: string | null
          moment?: string | null
          published_at?: string | null
          slug?: string | null
          style_family?: string[] | null
          title?: string | null
        }
        Update: {
          color_palette?: Json | null
          destination?: string | null
          editorial_dna?: string | null
          hero_urls?: Json | null
          id?: string | null
          moment?: string | null
          published_at?: string | null
          slug?: string | null
          style_family?: string[] | null
          title?: string | null
        }
        Relationships: []
      }
      moments_public: {
        Row: {
          copy: Json | null
          destination: string | null
          hero_image: string | null
          id: string | null
          name: string | null
          published_at: string | null
          sequence: number | null
          slug: string | null
        }
        Insert: {
          copy?: Json | null
          destination?: string | null
          hero_image?: string | null
          id?: string | null
          name?: string | null
          published_at?: string | null
          sequence?: number | null
          slug?: string | null
        }
        Update: {
          copy?: Json | null
          destination?: string | null
          hero_image?: string | null
          id?: string | null
          name?: string | null
          published_at?: string | null
          sequence?: number | null
          slug?: string | null
        }
        Relationships: []
      }
      public_shop_slot_display: {
        Row: {
          brand: string | null
          destination: string | null
          is_primary: boolean | null
          look_key: string | null
          moment: string | null
          price: string | null
          product_name: string | null
          replacement_priority: number | null
          retailer: string | null
          slot: string | null
          slot_label: string | null
          status: string | null
          url: string | null
        }
        Insert: {
          brand?: string | null
          destination?: string | null
          is_primary?: boolean | null
          look_key?: string | null
          moment?: string | null
          price?: string | null
          product_name?: string | null
          replacement_priority?: number | null
          retailer?: string | null
          slot?: string | null
          slot_label?: string | null
          status?: string | null
          url?: string | null
        }
        Update: {
          brand?: string | null
          destination?: string | null
          is_primary?: boolean | null
          look_key?: string | null
          moment?: string | null
          price?: string | null
          product_name?: string | null
          replacement_priority?: number | null
          retailer?: string | null
          slot?: string | null
          slot_label?: string | null
          status?: string | null
          url?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      publish_founder_look: {
        Args: { look_id: string }
        Returns: {
          brands_written: number
          refs_written: number
        }[]
      }
      record_editorial_memory_usage: {
        Args: {
          p_brand: string
          p_category: string
          p_color_family: string
          p_destination: string
          p_founder_look_id: string
          p_image_url: string
          p_material: string
          p_moment: string
          p_product_name: string
          p_product_url: string
          p_retailer: string
          p_role: string
          p_silhouette: string
          p_slot: string
          p_style_family: string[]
        }
        Returns: number
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
