export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type UserRole = 'admin' | 'financeiro' | 'producao' | 'social_media' | 'atendente'
export type OrderStatus = 'orcamento' | 'confirmado' | 'em_producao' | 'finalizado' | 'entregue' | 'cancelado'
export type QuoteStatus = 'rascunho' | 'enviado' | 'aprovado' | 'recusado' | 'expirado'
export type PostStatus = 'ideia' | 'rascunho' | 'aprovado' | 'agendado' | 'publicado'
export type SocialChannel = 'instagram' | 'facebook' | 'whatsapp' | 'tiktok'
export type DeliveryType = 'retirada' | 'entrega'
export type MovementType = 'entrada' | 'saida' | 'ajuste' | 'consumo'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          email: string
          role: UserRole
          avatar_url: string | null
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      customers: {
        Row: {
          id: string
          business_id: string
          name: string
          phone: string | null
          email: string | null
          address: Json | null
          birthdate: string | null
          preferences: string | null
          restrictions: string | null
          notes: string | null
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['customers']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['customers']['Insert']>
      }
      products: {
        Row: {
          id: string
          business_id: string
          name: string
          category_id: string | null
          description: string | null
          base_price: number
          images: string[]
          min_production_days: number
          available: boolean
          featured: boolean
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['products']['Insert']>
      }
      ingredients: {
        Row: {
          id: string
          business_id: string
          name: string
          category: string | null
          supplier_id: string | null
          unit: string
          cost_per_unit: number
          stock_quantity: number
          min_stock: number
          expiry_date: string | null
          lot: string | null
          notes: string | null
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['ingredients']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['ingredients']['Insert']>
      }
      recipes: {
        Row: {
          id: string
          business_id: string
          name: string
          category: string | null
          yield_quantity: number
          yield_unit: string
          prep_time_minutes: number | null
          instructions: string | null
          notes: string | null
          image_url: string | null
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['recipes']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['recipes']['Insert']>
      }
      orders: {
        Row: {
          id: string
          business_id: string
          customer_id: string | null
          order_number: string
          status: OrderStatus
          total_amount: number
          estimated_cost: number
          deposit_paid: number
          balance_due: number
          payment_method: string | null
          delivery_date: string
          notes: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['orders']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['orders']['Insert']>
      }
      suppliers: {
        Row: {
          id: string
          business_id: string
          name: string
          contact_name: string | null
          phone: string | null
          email: string | null
          address: Json | null
          notes: string | null
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['suppliers']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['suppliers']['Insert']>
      }
      cashflow_entries: {
        Row: {
          id: string
          business_id: string
          type: 'receita' | 'despesa'
          category: string
          description: string
          amount: number
          date: string
          payment_method: string | null
          order_id: string | null
          paid: boolean
          notes: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['cashflow_entries']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['cashflow_entries']['Insert']>
      }
      content_posts: {
        Row: {
          id: string
          business_id: string
          title: string
          caption: string | null
          hashtags: string | null
          cta: string | null
          channel: SocialChannel
          status: PostStatus
          scheduled_at: string | null
          published_at: string | null
          media_urls: string[]
          notes: string | null
          campaign_id: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['content_posts']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['content_posts']['Insert']>
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          business_id: string
          type: string
          title: string
          message: string
          read: boolean
          link: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
