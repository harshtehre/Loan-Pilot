import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { canAdmin, requireAuth } from '../auth.js';
import { supabaseAdmin } from '../supabase.js';
import { audit } from '../services/audit.js';

const businessType = z.enum(['nbfc', 'fintech_startup', 'loan_agency', 'consultant']);
const preferencesInput = z.object({
  organization_name: z.string().trim().min(2).max(120).optional(),
  business_type: businessType.optional(),
  ai_detail: z.enum(['concise', 'standard', 'detailed']).optional(),
  notification_preferences: z.object({
    new_application: z.boolean().optional(),
    high_risk: z.boolean().optional(),
  }).optional(),
}).strict().refine(value => Object.keys(value).length > 0, 'At least one setting must be provided.');

const defaultNotificationPreferences = { new_application: true, high_risk: true };

async function readSettings(orgId: string, userId: string) {
  const { data: organization, error: organizationError } = await supabaseAdmin
    .from('organizations').select('id,name,business_type,plan').eq('id', orgId).single();
  if (organizationError) throw organizationError;

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('users').select('id,full_name,email,roles(role)').eq('id', userId).eq('organization_id', orgId).single();
  if (profileError) throw profileError;

  const roleRows = Array.isArray((profile as any).roles) ? (profile as any).roles : [];
  const role = roleRows[0]?.role ?? 'viewer';

  const { data: existingSettings, error: readError } = await supabaseAdmin
    .from('organization_settings').select('ai_detail,notification_preferences,updated_at').eq('organization_id', orgId).maybeSingle();
  if (readError) throw readError;
  let settings = existingSettings;
  if (!settings) {
    const { data: insertedSettings, error: insertError } = await supabaseAdmin
      .from('organization_settings').insert({ organization_id: orgId }).select('ai_detail,notification_preferences,updated_at').single();
    if (insertError) throw insertError;
    settings = insertedSettings;
  }

  return {
    user: { id: profile.id, full_name: profile.full_name, email: profile.email, role },
    organization,
    settings: {
      ...settings,
      notification_preferences: { ...defaultNotificationPreferences, ...((settings.notification_preferences ?? {}) as Record<string, boolean>) },
    },
  };
}

export async function settingsRoutes(app: FastifyInstance) {
  app.get('/settings', async req => {
    const auth = await requireAuth(req);
    return readSettings(auth.orgId, auth.userId);
  });

  app.put('/settings', async (req, res) => {
    const auth = await requireAuth(req);
    if (!canAdmin(auth.role)) return res.code(403).send({ error: 'FORBIDDEN' });
    const values = preferencesInput.parse(req.body);

    const organizationPatch: Record<string, string> = {};
    if (values.organization_name !== undefined) organizationPatch.name = values.organization_name;
    if (values.business_type !== undefined) organizationPatch.business_type = values.business_type;
    if (Object.keys(organizationPatch).length) {
      const { error } = await supabaseAdmin.from('organizations').update(organizationPatch).eq('id', auth.orgId);
      if (error) throw error;
    }

    const current = await readSettings(auth.orgId, auth.userId);
    const notificationPreferences = {
      ...defaultNotificationPreferences,
      ...(current.settings.notification_preferences as Record<string, boolean>),
      ...(values.notification_preferences ?? {}),
    };
    const preferencePatch = {
      organization_id: auth.orgId,
      ai_detail: values.ai_detail ?? current.settings.ai_detail,
      notification_preferences: notificationPreferences,
      updated_at: new Date().toISOString(),
    };
    const { error: saveError } = await supabaseAdmin.from('organization_settings').upsert(preferencePatch, { onConflict: 'organization_id' });
    if (saveError) throw saveError;

    await audit(auth.orgId, auth.userId, 'settings.updated', {
      organization_fields: Object.keys(organizationPatch),
      preferences_updated: Boolean(values.ai_detail || values.notification_preferences),
    });
    return readSettings(auth.orgId, auth.userId);
  });
}
