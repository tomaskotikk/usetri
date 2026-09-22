/**
 * Mirrors the Supabase schema. Regenerate after a migration with
 * `supabase gen types typescript --project-id eveezgloymxzpveltkyq`.
 */
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; full_name: string | null; avatar_url: string | null; created_at: string }
        Insert: { id: string; full_name?: string | null; avatar_url?: string | null }
        Update: { full_name?: string | null; avatar_url?: string | null }
        Relationships: []
      }
      services: {
        Row: {
          slug: string
          name: string
          plan: string
          category: string
          color: string
          full_price: number
          seats: number
          glyph: string | null
        }
        Insert: never
        Update: never
        Relationships: []
      }
      groups: {
        Row: {
          id: string
          service_slug: string
          owner_id: string
          seats_total: number
          seats_taken: number
          price_per_seat: number
          note: string | null
          closed: boolean
          created_at: string
        }
        Insert: {
          service_slug: string
          owner_id: string
          seats_total: number
          price_per_seat: number
          note?: string | null
        }
        Update: { seats_total?: number; price_per_seat?: number; note?: string | null; closed?: boolean }
        Relationships: []
      }
      group_members: {
        Row: { id: string; group_id: string; user_id: string; role: string; joined_at: string }
        Insert: { group_id: string; user_id: string; role?: string }
        Update: never
        Relationships: []
      }
    }
    Views: Record<never, never>
    Functions: Record<never, never>
    Enums: Record<never, never>
    CompositeTypes: Record<never, never>
  }
}

export type ProfileRow = Database['public']['Tables']['profiles']['Row']
export type ServiceRow = Database['public']['Tables']['services']['Row']
export type GroupRow = Database['public']['Tables']['groups']['Row']
export type MemberRow = Database['public']['Tables']['group_members']['Row']
