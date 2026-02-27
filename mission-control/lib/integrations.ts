import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export type IntegrationProvider = 'slack' | 'zapier' | 'webhook' | 'email' | 'discord';

export interface Integration {
  id: string;
  organization_id: string;
  provider: IntegrationProvider;
  name: string;
  credentials: Record<string, string>;
  is_active: boolean;
  created_at: string;
}

// Create integration
export async function createIntegration(
  orgId: string,
  provider: IntegrationProvider,
  name: string,
  credentials: Record<string, string>
) {
  const { data, error } = await supabaseAdmin
    .from('integrations')
    .insert({
      organization_id: orgId,
      provider,
      name,
      credentials,
      is_active: true
    })
    .select()
    .single();
  
  return { integration: data, error };
}

// List integrations
export async function listIntegrations(orgId: string) {
  const { data, error } = await supabaseAdmin
    .from('integrations')
    .select('*')
    .eq('organization_id', orgId)
    .eq('is_active', true);
  
  return { integrations: data || [], error };
}

// Delete integration
export async function deleteIntegration(integrationId: string, orgId: string) {
  const { error } = await supabaseAdmin
    .from('integrations')
    .delete()
    .eq('id', integrationId)
    .eq('organization_id', orgId);
  
  return { error };
}

// Send Slack message
export async function sendSlackMessage(webhookUrl: string, message: string) {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: message })
    });
    return { success: response.ok };
  } catch (error) {
    return { success: false, error };
  }
}

// Trigger Zapier webhook
export async function triggerZapier(webhookUrl: string, data: any) {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return { success: response.ok };
  } catch (error) {
    return { success: false, error };
  }
}

// Generic webhook
export async function sendWebhook(url: string, payload: any) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return { success: response.ok };
  } catch (error) {
    return { success: false, error };
  }
}

// Trigger integration event
export async function triggerIntegration(
  orgId: string,
  eventType: string,
  data: any
) {
  const { integrations } = await listIntegrations(orgId);
  
  const results = [];
  for (const integration of integrations) {
    try {
      let result = { provider: integration.provider, success: false };
      
      switch (integration.provider) {
        case 'slack':
          if (integration.credentials.webhook_url) {
            result = { 
              ...result, 
              ...await sendSlackMessage(
                integration.credentials.webhook_url, 
                `${eventType}: ${JSON.stringify(data)}`
              ) 
            };
          }
          break;
          
        case 'zapier':
        case 'webhook':
          if (integration.credentials.webhook_url) {
            result = { 
              ...result, 
              ...await triggerZapier(
                integration.credentials.webhook_url, 
                { event: eventType, ...data }
              ) 
            };
          }
          break;
      }
      
      results.push(result);
    } catch (error) {
      results.push({ provider: integration.provider, success: false, error });
    }
  }
  
  return results;
}
