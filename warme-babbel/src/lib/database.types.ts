/**
 * Handmatig bijgehouden databasetypes (spiegel van supabase/migrations).
 * Regenereren kan later met: supabase gen types typescript --project-id <id> > src/lib/database.types.ts
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type UserRole = "seeker" | "listener" | "admin";
export type AccountStatus = "active" | "suspended" | "blocked";
export type ListingStatus = "pending" | "approved" | "rejected";
export type ReportCategory = "ongewenst_gedrag" | "spam" | "ongepaste_inhoud" | "intimidatie" | "andere";
export type ReportStatus = "open" | "in_behandeling" | "afgehandeld" | "afgewezen";
export type NotificationType = "new_message" | "report_update" | "listing_approved" | "account_status" | "system";
export type ModerationAction =
  | "set_role"
  | "set_account_status"
  | "set_listing_status"
  | "report_status"
  | "note"
  | "delete_message"
  | "account_deleted";
export type OptionKind = "region" | "theme" | "relation" | "contact_method" | "age_group" | "gender";

export type ProfileRow = {
  id: string;
  role: UserRole;
  account_status: AccountStatus;
  listing_status: ListingStatus;
  display_name: string;
  avatar_path: string | null;
  story: string | null;
  regions: string[];
  themes: string[];
  relations: string[];
  contact_methods: string[];
  age_group: string | null;
  gender: string | null;
  walk_in: boolean;
  is_available: boolean;
  is_hidden: boolean;
  show_photo_public: boolean;
  created_at: string;
  updated_at: string;
  last_seen_at: string | null;
}

export type ProfilePreferencesRow = {
  user_id: string;
  email_on_message: boolean;
  email_on_system: boolean;
  accepted_privacy_at: string | null;
  updated_at: string;
}

export type ProfileOptionRow = {
  kind: OptionKind;
  slug: string;
  label: string;
  sort_order: number;
  is_active: boolean;
}

export type BlockRow = {
  blocker_id: string;
  blocked_id: string;
  reason: string | null;
  created_at: string;
}

export type ConversationRow = {
  id: string;
  created_by: string | null;
  user_low: string;
  user_high: string;
  created_at: string;
  last_message_at: string | null;
  last_message_preview: string | null;
  last_message_sender: string | null;
}

export type ConversationMemberRow = {
  conversation_id: string;
  user_id: string;
  joined_at: string;
  last_read_at: string;
  is_archived: boolean;
  last_email_at: string | null;
}

export type MessageRow = {
  id: number;
  conversation_id: string;
  sender_id: string | null;
  body: string;
  created_at: string;
  edited_at: string | null;
  deleted_at: string | null;
}

export type MessageAttachmentRow = {
  id: string;
  message_id: number;
  storage_path: string;
  mime_type: string;
  size_bytes: number;
  created_at: string;
}

export type ReportRow = {
  id: string;
  reporter_id: string | null;
  target_user_id: string | null;
  target_conversation_id: string | null;
  target_message_id: number | null;
  category: ReportCategory;
  description: string | null;
  status: ReportStatus;
  admin_notes: string | null;
  handled_by: string | null;
  handled_at: string | null;
  created_at: string;
  updated_at: string;
}

export type ModerationEventRow = {
  id: number;
  actor_id: string | null;
  target_user_id: string | null;
  report_id: string | null;
  action: ModerationAction;
  details: Json;
  created_at: string;
}

export type NotificationRow = {
  id: number;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  link: string | null;
  conversation_id: string | null;
  read_at: string | null;
  created_at: string;
}

export type PlaceRow = {
  id: string;
  name: string;
  kind: "inloophuis" | "babbelplek" | "luisterlijn" | "andere";
  description: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  opening_hours: string | null;
  regions: string[];
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type MyConversationRow = {
  id: string;
  created_at: string;
  last_message_at: string | null;
  last_message_preview: string | null;
  last_message_sender: string | null;
  is_archived: boolean;
  last_read_at: string;
  other_user_id: string | null;
  other_display_name: string | null;
  other_avatar_path: string | null;
  other_role: UserRole | null;
  other_account_status: AccountStatus | null;
  unread_count: number;
  is_blocked: boolean;
}

type Table<Row, Insert = Partial<Row>, Update = Partial<Row>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      profiles: Table<ProfileRow>;
      profile_preferences: Table<ProfilePreferencesRow>;
      profile_options: Table<ProfileOptionRow>;
      blocks: Table<BlockRow, { blocker_id: string; blocked_id: string; reason?: string | null }>;
      conversations: Table<ConversationRow>;
      conversation_members: Table<ConversationMemberRow>;
      messages: Table<MessageRow, { conversation_id: string; sender_id: string; body: string }>;
      message_attachments: Table<MessageAttachmentRow>;
      reports: Table<
        ReportRow,
        {
          reporter_id: string;
          target_user_id?: string | null;
          target_conversation_id?: string | null;
          target_message_id?: number | null;
          category: ReportCategory;
          description?: string | null;
        }
      >;
      moderation_events: Table<ModerationEventRow>;
      notifications: Table<NotificationRow>;
      places: Table<PlaceRow>;
    };
    Views: {
      my_conversations: { Row: MyConversationRow; Relationships: [] };
    };
    Functions: {
      start_conversation: { Args: { p_other: string }; Returns: string };
      mark_conversation_read: { Args: { p_conversation: string }; Returns: undefined };
      set_conversation_archived: { Args: { p_conversation: string; p_archived: boolean }; Returns: undefined };
      unread_count: { Args: { p_conversation: string }; Returns: number };
      total_unread: { Args: Record<string, never>; Returns: number };
      is_admin: { Args: Record<string, never>; Returns: boolean };
      admin_set_role: { Args: { p_user: string; p_role: UserRole; p_note?: string | null }; Returns: undefined };
      admin_set_account_status: { Args: { p_user: string; p_status: AccountStatus; p_note?: string | null }; Returns: undefined };
      admin_set_listing_status: { Args: { p_user: string; p_status: ListingStatus; p_note?: string | null }; Returns: undefined };
      admin_update_report: { Args: { p_report: string; p_status: ReportStatus; p_notes?: string | null }; Returns: undefined };
      admin_add_note: { Args: { p_user: string; p_note: string }; Returns: undefined };
      admin_stats: { Args: Record<string, never>; Returns: Json };
      anonymize_own_profile: { Args: Record<string, never>; Returns: undefined };
    };
    Enums: {
      user_role: UserRole;
      account_status: AccountStatus;
      listing_status: ListingStatus;
      report_category: ReportCategory;
      report_status: ReportStatus;
      notification_type: NotificationType;
      moderation_action: ModerationAction;
    };
    CompositeTypes: Record<string, never>;
  };
}

export type AdminStats = {
  users_total: number;
  seekers: number;
  listeners: number;
  listeners_listed: number;
  listeners_pending: number;
  admins: number;
  suspended: number;
  conversations: number;
  conversations_7d: number;
  messages: number;
  messages_7d: number;
  reports_open: number;
  reports_total: number;
  new_users_30d: number;
}
