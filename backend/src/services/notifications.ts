import { supabaseAdmin } from '../supabase.js';

export type NotificationKind = 'new_application' | 'high_risk';

/** Create an organization-wide in-app alert when the preference permits it. */
export async function notifyOrganization(orgId: string, message: string, kind: NotificationKind) {
  const { data: settings, error: settingsError } = await supabaseAdmin
    .from('organization_settings').select('notification_preferences').eq('organization_id', orgId).maybeSingle();
  if (settingsError) {
    console.warn('Notification preferences could not be loaded.');
    return;
  }
  const preferences = (settings?.notification_preferences ?? {}) as Record<string, boolean>;
  if (preferences[kind] === false) return;
  const { error } = await supabaseAdmin.from('notifications').insert({
    organization_id: orgId,
    user_id: null,
    message,
    read: false,
  });
  if (error) console.warn('In-app notification could not be created.');
}
