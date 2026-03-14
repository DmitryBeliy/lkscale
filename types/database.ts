export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      customers: {
        Row: {
          address: string | null
          avatar_url: string | null
          average_check: number | null
          company: string | null
          created_at: string | null
          email: string | null
          id: string
          last_order_date: string | null
          name: string
          notes: string | null
          phone: string | null
          top_categories: string[] | null
          total_orders: number | null
          total_spent: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          average_check?: number | null
          company?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          last_order_date?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          top_categories?: string[] | null
          total_orders?: number | null
          total_spent?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          average_check?: number | null
          company?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          last_order_date?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          top_categories?: string[] | null
          total_orders?: number | null
          total_spent?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string | null
          customer_address: string | null
          customer_id: string | null
          customer_name: string | null
          customer_phone: string | null
          id: string
          items: Json | null
          items_count: number | null
          notes: string | null
          order_number: string | null
          payment_method: string | null
          status: string | null
          total_amount: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          customer_address?: string | null
          customer_id?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          items?: Json | null
          items_count?: number | null
          notes?: string | null
          order_number?: string | null
          payment_method?: string | null
          status?: string | null
          total_amount?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          customer_address?: string | null
          customer_id?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          items?: Json | null
          items_count?: number | null
          notes?: string | null
          order_number?: string | null
          payment_method?: string | null
          status?: string | null
          total_amount?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          barcode: string | null
          category: string | null
          category_id: string | null
          cost_price: number | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          images: string[] | null
          is_active: boolean | null
          min_stock: number | null
          name: string
          price: number
          sku: string | null
          stock: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          barcode?: string | null
          category?: string | null
          category_id?: string | null
          cost_price?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          images?: string[] | null
          is_active?: boolean | null
          min_stock?: number | null
          name: string
          price?: number
          sku?: string | null
          stock?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          barcode?: string | null
          category?: string | null
          category_id?: string | null
          cost_price?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          images?: string[] | null
          is_active?: boolean | null
          min_stock?: number | null
          name?: string
          price?: number
          sku?: string | null
          stock?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          balance: number | null
          created_at: string | null
          email: string | null
          id: string
          name: string | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          balance?: number | null
          created_at?: string | null
          email?: string | null
          id: string
          name?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          balance?: number | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      store_settings: {
        Row: {
          id: string
          user_id: string
          business_name: string | null
          logo_url: string | null
          currency: string | null
          currency_symbol: string | null
          tax_rate: number | null
          tax_name: string | null
          address: string | null
          phone: string | null
          email: string | null
          website: string | null
          invoice_prefix: string | null
          invoice_notes: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          business_name?: string | null
          logo_url?: string | null
          currency?: string | null
          currency_symbol?: string | null
          tax_rate?: number | null
          tax_name?: string | null
          address?: string | null
          phone?: string | null
          email?: string | null
          website?: string | null
          invoice_prefix?: string | null
          invoice_notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          business_name?: string | null
          logo_url?: string | null
          currency?: string | null
          currency_symbol?: string | null
          tax_rate?: number | null
          tax_name?: string | null
          address?: string | null
          phone?: string | null
          email?: string | null
          website?: string | null
          invoice_prefix?: string | null
          invoice_notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "store_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      suppliers: {
        Row: {
          id: string
          user_id: string | null
          name: string
          contact_name: string | null
          email: string | null
          phone: string | null
          address: string | null
          website: string | null
          notes: string | null
          payment_terms: string | null
          lead_time_days: number | null
          rating: number | null
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          name: string
          contact_name?: string | null
          email?: string | null
          phone?: string | null
          address?: string | null
          website?: string | null
          notes?: string | null
          payment_terms?: string | null
          lead_time_days?: number | null
          rating?: number | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          name?: string
          contact_name?: string | null
          email?: string | null
          phone?: string | null
          address?: string | null
          website?: string | null
          notes?: string | null
          payment_terms?: string | null
          lead_time_days?: number | null
          rating?: number | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "suppliers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      purchase_orders: {
        Row: {
          id: string
          user_id: string | null
          supplier_id: string | null
          order_number: string
          status: string | null
          total_amount: number | null
          total_items: number | null
          notes: string | null
          expected_date: string | null
          received_date: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          supplier_id?: string | null
          order_number: string
          status?: string | null
          total_amount?: number | null
          total_items?: number | null
          notes?: string | null
          expected_date?: string | null
          received_date?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          supplier_id?: string | null
          order_number?: string
          status?: string | null
          total_amount?: number | null
          total_items?: number | null
          notes?: string | null
          expected_date?: string | null
          received_date?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          }
        ]
      }
      purchase_order_items: {
        Row: {
          id: string
          purchase_order_id: string | null
          product_id: string | null
          product_name: string
          product_sku: string | null
          quantity_ordered: number
          quantity_received: number | null
          unit_cost: number
          total_cost: number
          created_at: string | null
        }
        Insert: {
          id?: string
          purchase_order_id?: string | null
          product_id?: string | null
          product_name: string
          product_sku?: string | null
          quantity_ordered: number
          quantity_received?: number | null
          unit_cost: number
          total_cost: number
          created_at?: string | null
        }
        Update: {
          id?: string
          purchase_order_id?: string | null
          product_id?: string | null
          product_name?: string
          product_sku?: string | null
          quantity_ordered?: number
          quantity_received?: number | null
          unit_cost?: number
          total_cost?: number
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_items_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      stock_adjustments: {
        Row: {
          id: string
          user_id: string | null
          product_id: string | null
          product_name: string
          product_sku: string | null
          adjustment_type: string
          quantity_change: number
          previous_stock: number
          new_stock: number
          unit_cost: number | null
          total_value: number | null
          reason: string | null
          reference_number: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          product_id?: string | null
          product_name: string
          product_sku?: string | null
          adjustment_type: string
          quantity_change: number
          previous_stock: number
          new_stock: number
          unit_cost?: number | null
          total_value?: number | null
          reason?: string | null
          reference_number?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          product_id?: string | null
          product_name?: string
          product_sku?: string | null
          adjustment_type?: string
          quantity_change?: number
          previous_stock?: number
          new_stock?: number
          unit_cost?: number | null
          total_value?: number | null
          reason?: string | null
          reference_number?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_adjustments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_adjustments_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      product_suppliers: {
        Row: {
          id: string
          product_id: string | null
          supplier_id: string | null
          supplier_sku: string | null
          cost_price: number | null
          min_order_quantity: number | null
          is_preferred: boolean | null
          last_order_date: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          product_id?: string | null
          supplier_id?: string | null
          supplier_sku?: string | null
          cost_price?: number | null
          min_order_quantity?: number | null
          is_preferred?: boolean | null
          last_order_date?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          product_id?: string | null
          supplier_id?: string | null
          supplier_sku?: string | null
          cost_price?: number | null
          min_order_quantity?: number | null
          is_preferred?: boolean | null
          last_order_date?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_suppliers_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_suppliers_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          }
        ]
      }
      manufacturers: {
        Row: {
          id: string
          name: string
          description: string | null
          website: string | null
          logo_url: string | null
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          website?: string | null
          logo_url?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          website?: string | null
          logo_url?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      locations: {
        Row: {
          id: string
          user_id: string | null
          name: string
          type: string | null
          address: string | null
          phone: string | null
          manager_id: string | null
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          name: string
          type?: string | null
          address?: string | null
          phone?: string | null
          manager_id?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          name?: string
          type?: string | null
          address?: string | null
          phone?: string | null
          manager_id?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "locations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      outlets: {
        Row: {
          id: string
          user_id: string | null
          location_id: string | null
          name: string
          code: string | null
          address: string | null
          phone: string | null
          email: string | null
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          location_id?: string | null
          name: string
          code?: string | null
          address?: string | null
          phone?: string | null
          email?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          location_id?: string | null
          name?: string
          code?: string | null
          address?: string | null
          phone?: string | null
          email?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "outlets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outlets_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          }
        ]
      }
      consignment_notes: {
        Row: {
          id: string
          user_id: string | null
          supplier_id: string | null
          location_id: string | null
          note_number: string
          status: string | null
          total_amount: number | null
          total_items: number | null
          notes: string | null
          document_date: string | null
          received_date: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          supplier_id?: string | null
          location_id?: string | null
          note_number: string
          status?: string | null
          total_amount?: number | null
          total_items?: number | null
          notes?: string | null
          document_date?: string | null
          received_date?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          supplier_id?: string | null
          location_id?: string | null
          note_number?: string
          status?: string | null
          total_amount?: number | null
          total_items?: number | null
          notes?: string | null
          document_date?: string | null
          received_date?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consignment_notes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consignment_notes_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consignment_notes_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          }
        ]
      }
      consignment_note_products: {
        Row: {
          id: string
          consignment_note_id: string | null
          product_id: string | null
          product_name: string
          product_sku: string | null
          quantity: number
          unit_cost: number
          total_cost: number
          created_at: string | null
        }
        Insert: {
          id?: string
          consignment_note_id?: string | null
          product_id?: string | null
          product_name: string
          product_sku?: string | null
          quantity: number
          unit_cost: number
          total_cost: number
          created_at?: string | null
        }
        Update: {
          id?: string
          consignment_note_id?: string | null
          product_id?: string | null
          product_name?: string
          product_sku?: string | null
          quantity?: number
          unit_cost?: number
          total_cost?: number
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consignment_note_products_consignment_note_id_fkey"
            columns: ["consignment_note_id"]
            isOneToOne: false
            referencedRelation: "consignment_notes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consignment_note_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      product_locations: {
        Row: {
          id: string
          product_id: string | null
          location_id: string | null
          quantity: number | null
          min_quantity: number | null
          max_quantity: number | null
          shelf_location: string | null
          bin_location: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          product_id?: string | null
          location_id?: string | null
          quantity?: number | null
          min_quantity?: number | null
          max_quantity?: number | null
          shelf_location?: string | null
          bin_location?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          product_id?: string | null
          location_id?: string | null
          quantity?: number | null
          min_quantity?: number | null
          max_quantity?: number | null
          shelf_location?: string | null
          bin_location?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_locations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_locations_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          }
        ]
      }
      write_offs: {
        Row: {
          id: string
          user_id: string | null
          product_id: string | null
          location_id: string | null
          quantity: number
          reason: string | null
          write_off_type: string | null
          unit_cost: number | null
          total_cost: number | null
          notes: string | null
          document_number: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          product_id?: string | null
          location_id?: string | null
          quantity: number
          reason?: string | null
          write_off_type?: string | null
          unit_cost?: number | null
          total_cost?: number | null
          notes?: string | null
          document_number?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          product_id?: string | null
          location_id?: string | null
          quantity?: number
          reason?: string | null
          write_off_type?: string | null
          unit_cost?: number | null
          total_cost?: number | null
          notes?: string | null
          document_number?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "write_offs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "write_offs_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "write_offs_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          }
        ]
      }
      user_activity_logs: {
        Row: {
          id: string
          user_id: string | null
          action_type: string
          entity_type: string | null
          entity_id: string | null
          description: string | null
          metadata: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          action_type: string
          entity_type?: string | null
          entity_id?: string | null
          description?: string | null
          metadata?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          action_type?: string
          entity_type?: string | null
          entity_id?: string | null
          description?: string | null
          metadata?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
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

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
