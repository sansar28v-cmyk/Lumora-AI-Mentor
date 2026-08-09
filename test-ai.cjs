const fs = require('fs');

async function testOpenRouterFull() {
  const env = fs.readFileSync('.env', 'utf-8');
  let key = "";
  for (const line of env.split('\n')) {
    if (line.startsWith('OPENROUTER_API_KEY')) {
      key = line.split('=')[1].replace(/"/g, '').trim();
    }
  }
  
  const system = "You are a senior career coach and curriculum designer. You always answer with strict JSON only, no prose.";
  const prompt = `Learner profile:
- Career domain: Frontend Developer
- Goal: Get a Job
- Self-declared level: Beginner
- Weekly study time: 5 hours
- Assessment score: 30% (measured level: Beginner)
- Per-topic results: []

Produce a fully personalized plan for THIS domain only.

Return JSON with this exact shape:
{
 "analysis": {
   "summary": "3-4 sentence honest AI summary of strengths and gaps",
   "strengths": ["..."],
   "weakAreas": ["..."],
   "recommendations": ["5 concrete next actions"]
 },
 "roadmap": [{"week":1,"title":"...","focus":"...","topics":["..."],"hours":5,"outcome":"..."}],
 "certifications": [{"name":"...","provider":"...","description":"...","difficulty":"Beginner|Intermediate|Advanced","duration":"...","url":"https://official-site"}],
 "projects": [{"title":"...","level":"Beginner|Intermediate|Advanced","problem":"...","objectives":["..."],"stack":["..."],"time":"...","outcomes":["..."]}]
}

Requirements:
- roadmap: 12 sequential weeks sized to 5 hours/week, front-loading the weak topics.
- certifications: 4-6 REAL, official certifications relevant only to Frontend Developer, with real official URLs.
- projects: 6 projects spanning the learner's level and one step above, each targeting weak topics.`;

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "openai/gpt-4o-mini",
      max_tokens: 2000,
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    })
  });
  
  const data = await res.json();
  console.log("Full data:", JSON.stringify(data, null, 2));
}

testOpenRouterFull();
