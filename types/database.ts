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
