import { createClient } from "https://esm.sh/@supabase/supabase-js@2.93.2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MatchSchema = z.object({
  id: z.string().uuid().optional(),
  season: z.string().min(1).max(20).default('2024-2025'),
  jornada: z.number().int().min(1).max(50).nullable().optional(),
  home_team: z.string().min(1).max(100),
  away_team: z.string().min(1).max(100),
  home_score: z.number().int().min(0).max(99).default(0),
  away_score: z.number().int().min(0).max(99).default(0),
  match_date: z.string(),
  match_time: z.string().nullable().optional(),
  venue: z.string().max(200).nullable().optional(),
  status: z.enum(['scheduled', 'live', 'finished']).default('scheduled'),
  is_home_game: z.boolean().default(true),
  source: z.enum(['manual', 'scraped']).default('manual'),
});

const EventSchema = z.object({
  match_id: z.string().uuid(),
  minute: z.number().int().min(0).max(150),
  event_type: z.enum(['goal', 'yellow_card', 'red_card', 'substitution', 'penalty', 'own_goal']),
  player_name: z.string().max(100).nullable().optional(),
  team: z.string().max(100).nullable().optional(),
  description: z.string().max(500).nullable().optional(),
});

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(authHeader.replace('Bearer ', ''));
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Use service role for writes
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { action, data } = await req.json();

    switch (action) {
      case 'upsert_match': {
        const parsed = MatchSchema.safeParse(data);
        if (!parsed.success) {
          return new Response(JSON.stringify({ error: parsed.error.flatten().fieldErrors }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
        const { id, ...matchData } = parsed.data;
        let result;
        if (id) {
          result = await adminClient.from('matches').update({ ...matchData, updated_at: new Date().toISOString() }).eq('id', id).select().single();
        } else {
          result = await adminClient.from('matches').insert(matchData).select().single();
        }
        if (result.error) throw result.error;
        return new Response(JSON.stringify({ success: true, data: result.data }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'delete_match': {
        const { id } = z.object({ id: z.string().uuid() }).parse(data);
        const result = await adminClient.from('matches').delete().eq('id', id);
        if (result.error) throw result.error;
        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'add_event': {
        const parsed = EventSchema.safeParse(data);
        if (!parsed.success) {
          return new Response(JSON.stringify({ error: parsed.error.flatten().fieldErrors }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
        const result = await adminClient.from('match_events').insert(parsed.data).select().single();
        if (result.error) throw result.error;
        return new Response(JSON.stringify({ success: true, data: result.data }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'delete_event': {
        const { id } = z.object({ id: z.string().uuid() }).parse(data);
        const result = await adminClient.from('match_events').delete().eq('id', id);
        if (result.error) throw result.error;
        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
