import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    if (!FIRECRAWL_API_KEY) {
      throw new Error("FIRECRAWL_API_KEY is not configured");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    console.log("Step 1: Searching for Liga Premier standings...");

    // Search for standings
    const standingsSearch = await fetch("https://api.firecrawl.dev/v1/search", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: "Liga Premier de México Serie A tabla de posiciones 2024-2025",
        limit: 5,
        scrapeOptions: { formats: ["markdown"] },
      }),
    });

    const standingsData = await standingsSearch.json();
    const standingsMarkdown = standingsData?.data
      ?.map((r: any) => r.markdown || "")
      .join("\n\n---\n\n")
      .slice(0, 15000) || "";

    console.log("Step 2: Searching for Los Cabos United matches...");

    // Search for matches
    const matchesSearch = await fetch("https://api.firecrawl.dev/v1/search", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: "Los Cabos United resultados partidos Liga Premier de México 2024 2025",
        limit: 5,
        scrapeOptions: { formats: ["markdown"] },
      }),
    });

    const matchesData = await matchesSearch.json();
    const matchesMarkdown = matchesData?.data
      ?.map((r: any) => r.markdown || "")
      .join("\n\n---\n\n")
      .slice(0, 15000) || "";

    console.log("Step 3: Searching for top scorers...");

    const scorersSearch = await fetch("https://api.firecrawl.dev/v1/search", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: "Liga Premier de México Serie A goleadores líderes de goleo 2024-2025",
        limit: 3,
        scrapeOptions: { formats: ["markdown"] },
      }),
    });

    const scorersData = await scorersSearch.json();
    const scorersMarkdown = scorersData?.data
      ?.map((r: any) => r.markdown || "")
      .join("\n\n---\n\n")
      .slice(0, 8000) || "";

    console.log("Step 4: Parsing data with AI...");

    const aiPrompt = `Analiza los siguientes datos web sobre la Liga Premier de México (Serie A) y extrae la información estructurada.

DATOS DE TABLA DE POSICIONES:
${standingsMarkdown}

DATOS DE PARTIDOS DE LOS CABOS UNITED:
${matchesMarkdown}

DATOS DE GOLEADORES:
${scorersMarkdown}

Devuelve un JSON con exactamente esta estructura:
{
  "standings": [
    { "team": "Nombre del Equipo", "pos": 1, "jj": 10, "jg": 8, "je": 1, "jp": 1, "gf": 22, "gc": 8, "dg": 14, "pts": 25 }
  ],
  "matches": [
    { "home_team": "Equipo Local", "away_team": "Equipo Visitante", "home_score": 2, "away_score": 1, "match_date": "2025-01-15", "match_time": "19:00", "venue": "Estadio X", "status": "finished", "jornada": 1, "is_home_game": true }
  ],
  "topScorers": [
    { "player_name": "Nombre Jugador", "team": "Nombre Equipo", "goals": 9 }
  ]
}

REGLAS:
- En standings incluye TODOS los equipos que encuentres en la tabla
- En matches incluye SOLO partidos de "Los Cabos United" (como local o visitante)
- is_home_game = true cuando Los Cabos United es el equipo local
- Si un partido ya se jugó, status = "finished". Si es futuro, status = "scheduled" y scores = null
- En topScorers incluye los 10 primeros goleadores
- Si no encuentras datos suficientes para una sección, devuelve un array vacío []
- El formato de fecha debe ser YYYY-MM-DD
- Solo devuelve el JSON, sin texto adicional`;

    const aiResponse = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: "Eres un experto en datos de fútbol mexicano. Extrae datos estructurados de contenido web. Responde SOLO con JSON válido, sin markdown ni texto adicional." },
            { role: "user", content: aiPrompt },
          ],
        }),
      }
    );

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);
      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const aiResult = await aiResponse.json();
    let content = aiResult.choices?.[0]?.message?.content || "";

    // Clean markdown code blocks if present
    content = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

    console.log("AI response content (first 500 chars):", content.slice(0, 500));

    let parsed: { standings: any[]; matches: any[]; topScorers: any[] };
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      console.error("Failed to parse AI response:", content.slice(0, 1000));
      throw new Error("Failed to parse AI response as JSON");
    }

    console.log("Step 5: Upserting data to database...");

    const results = { standings: 0, matches: 0, topScorers: 0 };

    // Upsert standings
    if (parsed.standings?.length > 0) {
      // Clear existing standings for this season
      await supabase.from("league_standings").delete().eq("season", "2024-2025");

      const standingsRows = parsed.standings.map((s: any) => ({
        team: s.team,
        pos: s.pos || 0,
        jj: s.jj || 0,
        jg: s.jg || 0,
        je: s.je || 0,
        jp: s.jp || 0,
        gf: s.gf || 0,
        gc: s.gc || 0,
        dg: s.dg || 0,
        pts: s.pts || 0,
        group_name: s.group_name || null,
        season: "2024-2025",
        updated_at: new Date().toISOString(),
      }));

      const { error: standErr } = await supabase
        .from("league_standings")
        .insert(standingsRows);
      if (standErr) console.error("Standings insert error:", standErr);
      else results.standings = standingsRows.length;
    }

    // Upsert matches
    if (parsed.matches?.length > 0) {
      for (const m of parsed.matches) {
        const matchRow = {
          home_team: m.home_team,
          away_team: m.away_team,
          home_score: m.home_score ?? 0,
          away_score: m.away_score ?? 0,
          match_date: m.match_date,
          match_time: m.match_time || null,
          venue: m.venue || null,
          status: m.status || "scheduled",
          jornada: m.jornada || null,
          is_home_game: m.is_home_game ?? true,
          season: "2024-2025",
          source: "scraped" as const,
          updated_at: new Date().toISOString(),
        };

        // Check if match already exists
        const { data: existing } = await supabase
          .from("matches")
          .select("id")
          .eq("home_team", matchRow.home_team)
          .eq("away_team", matchRow.away_team)
          .eq("match_date", matchRow.match_date)
          .maybeSingle();

        if (existing) {
          await supabase.from("matches").update(matchRow).eq("id", existing.id);
        } else {
          await supabase.from("matches").insert(matchRow);
        }
        results.matches++;
      }
    }

    // Upsert top scorers
    if (parsed.topScorers?.length > 0) {
      await supabase.from("top_scorers").delete().eq("season", "2024-2025");

      const scorerRows = parsed.topScorers.map((s: any) => ({
        player_name: s.player_name,
        team: s.team,
        goals: s.goals || 0,
        season: "2024-2025",
        updated_at: new Date().toISOString(),
      }));

      const { error: scorErr } = await supabase
        .from("top_scorers")
        .insert(scorerRows);
      if (scorErr) console.error("Scorers insert error:", scorErr);
      else results.topScorers = scorerRows.length;
    }

    console.log("Done! Results:", results);

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("scrape-league-data error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
