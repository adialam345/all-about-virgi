export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          role: 'user' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          role?: 'user' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          role?: 'user' | 'admin'
          created_at?: string
          updated_at?: string
        }
      }
      likes: {
        Row: {
          id: string
          item_name: string
          description: string | null
          is_like: boolean
          created_at: string
        }
        Insert: {
          id?: string
          item_name: string
          description?: string | null
          is_like: boolean
          created_at?: string
        }
        Update: {
          id?: string
          item_name?: string
          description?: string | null
          is_like?: boolean
          created_at?: string
        }
      }
      tags: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
        }
      }
      item_tags: {
        Row: {
          id: string
          like_id: string
          tag_id: string
        }
        Insert: {
          id?: string
          like_id: string
          tag_id: string
        }
        Update: {
          id?: string
          like_id?: string
          tag_id?: string
        }
      }
      fun_facts: {
        Row: {
          id: string
          title: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          created_at?: string
        }
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
  }
} 