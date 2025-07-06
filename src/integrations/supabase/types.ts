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
      blocked_users: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string
          id: string
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string
          id?: string
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      bouquets: {
        Row: {
          created_at: string
          id: string
          image_url: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          name?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      dating_preferences: {
        Row: {
          created_at: string
          id: string
          interested_in_gender:
            | Database["public"]["Enums"]["gender_preference_enum"]
            | null
          looking_for:
            | Database["public"]["Enums"]["relationship_type_enum"][]
            | null
          max_age_preference: number | null
          max_distance_preference: number | null
          min_age_preference: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          interested_in_gender?:
            | Database["public"]["Enums"]["gender_preference_enum"]
            | null
          looking_for?:
            | Database["public"]["Enums"]["relationship_type_enum"][]
            | null
          max_age_preference?: number | null
          max_distance_preference?: number | null
          min_age_preference?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          interested_in_gender?:
            | Database["public"]["Enums"]["gender_preference_enum"]
            | null
          looking_for?:
            | Database["public"]["Enums"]["relationship_type_enum"][]
            | null
          max_age_preference?: number | null
          max_distance_preference?: number | null
          min_age_preference?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dating_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      like_requests: {
        Row: {
          created_at: string
          id: string
          receiver_id: string
          sender_id: string
          status: Database["public"]["Enums"]["like_status"]
          type: Database["public"]["Enums"]["like_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          receiver_id: string
          sender_id: string
          status?: Database["public"]["Enums"]["like_status"]
          type: Database["public"]["Enums"]["like_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          receiver_id?: string
          sender_id?: string
          status?: Database["public"]["Enums"]["like_status"]
          type?: Database["public"]["Enums"]["like_type"]
          updated_at?: string
        }
        Relationships: []
      }
      likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          created_at: string
          id: string
          user1_id: string
          user2_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user1_id: string
          user2_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user1_id?: string
          user2_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string | null
          created_at: string
          id: string
          image_url: string | null
          match_id: string
          reactions: Json | null
          seen_at: string | null
          sender_id: string
          voice_note_url: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          match_id: string
          reactions?: Json | null
          seen_at?: string | null
          sender_id: string
          voice_note_url?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          match_id?: string
          reactions?: Json | null
          seen_at?: string | null
          sender_id?: string
          voice_note_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_settings: {
        Row: {
          like_accepted_enabled: boolean
          new_bouquet_enabled: boolean
          new_device_login_enabled: boolean
          new_like_request_enabled: boolean
          new_match_enabled: boolean
          new_message_enabled: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          like_accepted_enabled?: boolean
          new_bouquet_enabled?: boolean
          new_device_login_enabled?: boolean
          new_like_request_enabled?: boolean
          new_match_enabled?: boolean
          new_message_enabled?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          like_accepted_enabled?: boolean
          new_bouquet_enabled?: boolean
          new_device_login_enabled?: boolean
          new_like_request_enabled?: boolean
          new_match_enabled?: boolean
          new_message_enabled?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string | null
          read_at: string | null
          reference_id: string | null
          reference_table: string | null
          sender_id: string | null
          title: string | null
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string | null
          read_at?: string | null
          reference_id?: string | null
          reference_table?: string | null
          sender_id?: string | null
          title?: string | null
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string | null
          read_at?: string | null
          reference_id?: string | null
          reference_table?: string | null
          sender_id?: string | null
          title?: string | null
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: []
      }
      post_images: {
        Row: {
          id: string
          image_url: string
          order: number
          post_id: string
        }
        Insert: {
          id?: string
          image_url: string
          order?: number
          post_id: string
        }
        Update: {
          id?: string
          image_url?: string
          order?: number
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_images_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_tags: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_tags_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_tags_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      posts: {
        Row: {
          content: string | null
          created_at: string
          id: string
          image_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age: number | null
          bio: string | null
          created_at: string
          gender: string | null
          id: string
          images: string[] | null
          interested_in: string | null
          interests: string[] | null
          is_visible: boolean
          location: string | null
          mbti: string | null
          name: string
          updated_at: string
          user_id: string
          zodiac: string | null
        }
        Insert: {
          age?: number | null
          bio?: string | null
          created_at?: string
          gender?: string | null
          id?: string
          images?: string[] | null
          interested_in?: string | null
          interests?: string[] | null
          is_visible?: boolean
          location?: string | null
          mbti?: string | null
          name: string
          updated_at?: string
          user_id: string
          zodiac?: string | null
        }
        Update: {
          age?: number | null
          bio?: string | null
          created_at?: string
          gender?: string | null
          id?: string
          images?: string[] | null
          interested_in?: string | null
          interests?: string[] | null
          is_visible?: boolean
          location?: string | null
          mbti?: string | null
          name?: string
          updated_at?: string
          user_id?: string
          zodiac?: string | null
        }
        Relationships: []
      }
      swipes: {
        Row: {
          created_at: string
          direction: string
          id: string
          swiped_id: string
          swiper_id: string
        }
        Insert: {
          created_at?: string
          direction: string
          id?: string
          swiped_id: string
          swiper_id: string
        }
        Update: {
          created_at?: string
          direction?: string
          id?: string
          swiped_id?: string
          swiper_id?: string
        }
        Relationships: []
      }
      user_bouquets: {
        Row: {
          bouquet_id: string
          created_at: string
          id: string
          receiver_id: string
          sender_id: string
        }
        Insert: {
          bouquet_id: string
          created_at?: string
          id?: string
          receiver_id: string
          sender_id: string
        }
        Update: {
          bouquet_id?: string
          created_at?: string
          id?: string
          receiver_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_bouquets_bouquet_id_fkey"
            columns: ["bouquet_id"]
            isOneToOne: false
            referencedRelation: "bouquets"
            referencedColumns: ["id"]
          },
        ]
      }
      user_stats: {
        Row: {
          created_at: string
          id: string
          left_swipes: number | null
          right_swipes: number | null
          total_matches: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          left_swipes?: number | null
          right_swipes?: number | null
          total_matches?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          left_swipes?: number | null
          right_swipes?: number | null
          total_matches?: number | null
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
      are_notifications_enabled: {
        Args: {
          p_user_id: string
          p_type: Database["public"]["Enums"]["notification_type"]
        }
        Returns: boolean
      }
      block_user: {
        Args: { p_blocked_user_id: string }
        Returns: undefined
      }
      delete_user_data: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_blocked_user_ids: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_id: string
        }[]
      }
      get_my_sessions: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          user_agent: string
          created_at: string
          updated_at: string
        }[]
      }
      get_or_create_dating_preferences: {
        Args: { p_user_id: string }
        Returns: {
          created_at: string
          id: string
          interested_in_gender:
            | Database["public"]["Enums"]["gender_preference_enum"]
            | null
          looking_for:
            | Database["public"]["Enums"]["relationship_type_enum"][]
            | null
          max_age_preference: number | null
          max_distance_preference: number | null
          min_age_preference: number | null
          updated_at: string
          user_id: string
        }[]
      }
      get_or_create_notification_settings: {
        Args: { p_user_id: string }
        Returns: {
          like_accepted_enabled: boolean
          new_bouquet_enabled: boolean
          new_device_login_enabled: boolean
          new_like_request_enabled: boolean
          new_match_enabled: boolean
          new_message_enabled: boolean
          updated_at: string
          user_id: string
        }[]
      }
      get_received_bouquets_summary: {
        Args: { p_user_id: string }
        Returns: {
          sender_id: string
          sender_name: string
          sender_image: string
          bouquet_id: string
          bouquet_name: string
          bouquet_image_url: string
          bouquet_count: number
          last_sent_at: string
        }[]
      }
      get_user_profile_with_stats: {
        Args: { p_user_id: string }
        Returns: {
          user_id: string
          name: string
          images: string[]
          age: number
          bio: string
          location: string
          interests: string[]
          gender: string
          mbti: string
          zodiac: string
          total_matches: number
          likes_received: number
          posts_count: number
        }[]
      }
      get_users_who_blocked_me: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_id: string
        }[]
      }
      notify_on_new_device: {
        Args: { p_user_agent: string }
        Returns: undefined
      }
      search_users_for_tagging: {
        Args: { p_search_query: string; p_exclude_user_ids: string[] }
        Returns: {
          id: string
          name: string
        }[]
      }
      unblock_user: {
        Args: { p_unblocked_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      gender_preference_enum: "male" | "female" | "non-binary" | "everyone"
      like_status: "pending" | "accepted" | "rejected"
      like_type: "like" | "super_like"
      notification_type:
        | "new_message"
        | "new_like_request"
        | "like_accepted"
        | "new_match"
        | "new_device_login"
        | "new_bouquet"
      relationship_type_enum:
        | "long_term_relationship"
        | "short_term_relationship"
        | "new_friends"
        | "casual_dating"
        | "dont_know_yet"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      gender_preference_enum: ["male", "female", "non-binary", "everyone"],
      like_status: ["pending", "accepted", "rejected"],
      like_type: ["like", "super_like"],
      notification_type: [
        "new_message",
        "new_like_request",
        "like_accepted",
        "new_match",
        "new_device_login",
        "new_bouquet",
      ],
      relationship_type_enum: [
        "long_term_relationship",
        "short_term_relationship",
        "new_friends",
        "casual_dating",
        "dont_know_yet",
      ],
    },
  },
} as const
