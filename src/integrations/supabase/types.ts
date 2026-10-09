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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      interview_questions: {
        Row: {
          answer_text: string | null
          answered_at: string | null
          created_at: string
          id: string
          is_clarification_needed: boolean
          kind: string
          ord: number
          project_id: string
          source: string | null
          text: string
          user_id: string
        }
        Insert: {
          answer_text?: string | null
          answered_at?: string | null
          created_at?: string
          id?: string
          is_clarification_needed?: boolean
          kind?: string
          ord: number
          project_id: string
          source?: string | null
          text: string
          user_id?: string
        }
        Update: {
          answer_text?: string | null
          answered_at?: string | null
          created_at?: string
          id?: string
          is_clarification_needed?: boolean
          kind?: string
          ord?: number
          project_id?: string
          source?: string | null
          text?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "interview_questions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_sessions: {
        Row: {
          ended_at: string | null
          is_paused: boolean
          project_id: string
          started_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ended_at?: string | null
          is_paused?: boolean
          project_id: string
          started_at?: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          ended_at?: string | null
          is_paused?: boolean
          project_id?: string
          started_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "interview_sessions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      project_analyses: {
        Row: {
          assumptions: Json
          confirmed_at: string | null
          contradictions: Json
          created_at: string
          goal: string
          missing_info: Json
          project_id: string
          todo_items: Json
          understood_facts: Json
          updated_at: string
          user_id: string
          version: number
        }
        Insert: {
          assumptions?: Json
          confirmed_at?: string | null
          contradictions?: Json
          created_at?: string
          goal?: string
          missing_info?: Json
          project_id: string
          todo_items?: Json
          understood_facts?: Json
          updated_at?: string
          user_id?: string
          version?: number
        }
        Update: {
          assumptions?: Json
          confirmed_at?: string | null
          contradictions?: Json
          created_at?: string
          goal?: string
          missing_info?: Json
          project_id?: string
          todo_items?: Json
          understood_facts?: Json
          updated_at?: string
          user_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "project_analyses_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_contexts: {
        Row: {
          created_at: string
          project_id: string
          text: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          project_id: string
          text?: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          project_id?: string
          text?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_contexts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_resources: {
        Row: {
          extracted_text: string | null
          extracted_text_preview: string | null
          filename: string
          id: string
          mime_type: string
          project_id: string
          size_bytes: number
          stored_path: string
          uploaded_at: string
          user_id: string
        }
        Insert: {
          extracted_text?: string | null
          extracted_text_preview?: string | null
          filename: string
          id?: string
          mime_type: string
          project_id: string
          size_bytes: number
          stored_path: string
          uploaded_at?: string
          user_id?: string
        }
        Update: {
          extracted_text?: string | null
          extracted_text_preview?: string | null
          filename?: string
          id?: string
          mime_type?: string
          project_id?: string
          size_bytes?: number
          stored_path?: string
          uploaded_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_resources_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_timeline: {
        Row: {
          created_at: string
          details: Json | null
          id: string
          project_id: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          details?: Json | null
          id?: string
          project_id: string
          type: string
          user_id?: string
        }
        Update: {
          created_at?: string
          details?: Json | null
          id?: string
          project_id?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_timeline_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          description: string
          id: string
          is_deleted: boolean
          name: string
          status: Database["public"]["Enums"]["project_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          is_deleted?: boolean
          name: string
          status?: Database["public"]["Enums"]["project_status"]
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          is_deleted?: boolean
          name?: string
          status?: Database["public"]["Enums"]["project_status"]
          updated_at?: string
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
      project_status:
        | "Draft"
        | "Analyzing"
        | "Interviewing"
        | "Ready"
        | "Generated"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      project_status: [
        "Draft",
        "Analyzing",
        "Interviewing",
        "Ready",
        "Generated",
      ],
    },
  },
} as const
