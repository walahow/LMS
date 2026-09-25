/**
 * Hand-written to match supabase/migrations/0001_schema.sql. Regenerate with
 * `supabase gen types typescript` once a live project exists, and keep this
 * file's shape in sync with the migration until then.
 */

export type UserRole = "student" | "teacher" | "admin";

export interface Database {
  __InternalSupabase: {
    PostgrestVersion: "13";
  };
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: UserRole;
          full_name: string;
          created_at: string;
        };
        Insert: {
          id: string;
          role?: UserRole;
          full_name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          role?: UserRole;
          full_name?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      question_sets: {
        Row: {
          id: string;
          title: string;
          indicator: string;
          subject: string | null;
          grade: string | null;
          published: boolean;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          indicator: string;
          subject?: string | null;
          grade?: string | null;
          published?: boolean;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          indicator?: string;
          subject?: string | null;
          grade?: string | null;
          published?: boolean;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      questions: {
        Row: {
          id: string;
          set_id: string;
          position: number;
          stem: string;
          options: string[];
          correct_option: number;
          reasons: string[];
          correct_reason: number;
        };
        Insert: {
          id?: string;
          set_id: string;
          position: number;
          stem: string;
          options: string[];
          correct_option: number;
          reasons: string[];
          correct_reason: number;
        };
        Update: {
          id?: string;
          set_id?: string;
          position?: number;
          stem?: string;
          options?: string[];
          correct_option?: number;
          reasons?: string[];
          correct_reason?: number;
        };
        Relationships: [];
      };
      attempts: {
        Row: {
          id: string;
          student_id: string;
          set_id: string;
          started_at: string;
          submitted_at: string | null;
        };
        Insert: {
          id?: string;
          student_id: string;
          set_id: string;
          started_at?: string;
          submitted_at?: string | null;
        };
        Update: {
          id?: string;
          student_id?: string;
          set_id?: string;
          started_at?: string;
          submitted_at?: string | null;
        };
        Relationships: [];
      };
      responses: {
        Row: {
          attempt_id: string;
          question_id: string;
          answer: number;
          reason: number;
          confident: boolean;
        };
        Insert: {
          attempt_id: string;
          question_id: string;
          answer: number;
          reason: number;
          confident: boolean;
        };
        Update: {
          attempt_id?: string;
          question_id?: string;
          answer?: number;
          reason?: number;
          confident?: boolean;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
    };
    CompositeTypes: Record<string, never>;
  };
}

/** Columns safe to send a student before they submit — never correct_option/correct_reason. */
export type QuestionForStudent = Pick<
  Database["public"]["Tables"]["questions"]["Row"],
  "id" | "set_id" | "position" | "stem" | "options" | "reasons"
>;
