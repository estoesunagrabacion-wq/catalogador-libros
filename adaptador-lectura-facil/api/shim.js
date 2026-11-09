/* Lectura Fácil · versión con clave de API.
   Reemplaza las capacidades del visor de Claude (sample, downloads, permissions)
   por llamadas directas a la API que elija cada docente: Anthropic, OpenAI o Google Gemini.
   La clave se guarda solo en este navegador (localStorage) y se envía solo a esa empresa. */
(function () {
  "use strict";
  const PROV = {
    anthropic: {
      nombre: "Anthropic (Claude)",
      modelos: ["claude-opus-5-5", "claude-sonnet-5-5", "claude-haiku-5-5"],
      defecto: "claude-opus-5-5",
      clave: "https://console.anthropic.com/settings/keys",
      nota: "Opus es el más capaz; Sonnet, el equilibrio entre calidad y costo; Haiku, el más barato."
    },
    openai: {
      nombre: "OpenAI (ChatGPT)",
      modelos: [],
      defecto: "",
      clave: "https://platform.openai.com/api-keys",
      nota: "Después de guardar la clave, la lista de modelos se carga desde tu cuenta."
    },
    gemini: {
      nombre: "Google (Gemini)",
      modelos: [],
      defecto: "",
      clave: "https://aistudio.google.com/apikey",
      nota: "Tiene plan gratuito con límites diarios. La lista de modelos se carga desde tu cuenta."
    }
  };
  const KEY = "lf-ai";
  function load() { try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) { return {}; } }
  function save(c) { try { localStorage.setItem(KEY, JSON.stringify(c)); } catch (e) {} }
  let cfg = Object.assign({ prov: "anthropic", keys: {}, models: {}, lists: {} }, load());
  const prov = () => cfg.prov in PROV ? cfg.prov : "anthropic";
  const keyOf = (p) => (cfg.keys || {})[p || prov()] || "";
  const modelOf = (p) => { p = p || prov(); return (cfg.models || {})[p] || PROV[p].defecto || ((cfg.lists || {})[p] || [])[0] || ""; };
  window.LF_AI = { PROV, get cfg() { return cfg; }, prov, keyOf, modelOf, set(next) { cfg = Object.assign(cfg, next); save(cfg); }, listModels, ping };

  const fail = (code, message, extra) => Object.assign({ code, message: message || code }, extra || {});
  function apiError(status, msg) {
    const m = String(msg || "");
    if (status === 401 || status === 403) return fail("bad_key", m);
    if (status === 400 && /api[_ -]?key|invalid x-api-key|key not valid/i.test(m)) return fail("bad_key", m);
    if (status === 404 || /model/i.test(m) && /not.?found|does not exist|invalid|unsupported|not supported/i.test(m)) return fail("bad_model", m);
    if (status === 429) return fail(/quota|billing|credit|insufficient/i.test(m) ? "no_credit" : "rate_limited", m);
    if (status === 402 || /credit balance|billing|insufficient_quota/i.test(m)) return fail("no_credit", m);
    if (status >= 500) return fail("upstream_error", m);
    try { window.ERRORS_API_DETAIL = m; } catch (e) {}
    return fail("api_error", m);
  }
  async function readError(r) {
    let msg = "";
    try { const j = await r.json(); msg = j?.error?.message || j?.error?.status || j?.message || JSON.stringify(j).slice(0, 300); } catch (e) { msg = r.statusText; }
    return apiError(r.status, msg);
  }
  function toTurns(input) {
    if (typeof input === "string") return [{ role: "user", content: input }];
    return (input || []).map(t => ({ role: t.role === "assistant" ? "assistant" : "user", content: String(t.content || "") }));
  }

  async function call(input, opts) {
    opts = opts || {};
    const p = prov(), key = keyOf(p), model = modelOf(p);
    if (!key) { setTimeout(() => window.LF_openAI && window.LF_openAI(), 50); throw fail("no_key"); }
    if (!model) { setTimeout(() => window.LF_openAI && window.LF_openAI(), 50); throw fail("bad_model", "Sin modelo elegido"); }
    const turns = toTurns(input);
    let r;
    try {
      if (p === "anthropic") {
        const body = { model, max_tokens: 16000, messages: turns };
        if (/^claude-(opus|sonnet|haiku)-5/.test(model)) body.output_config = { effort: opts.modelTier === "quick" ? "low" : "medium" };
        const headers = { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" };
        if (/^claude-(opus-5-5|opus-5|sonnet-5-5|fable-5-1)$/.test(model)) { headers["anthropic-beta"] = "server-side-fallback-2026-07-01"; body.fallbacks = "default"; }
        r = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers, body: JSON.stringify(body), signal: opts.signal });
        if (!r.ok) throw await readError(r);
        const d = await r.json();
        if (d.stop_reason === "refusal") throw fail("refused");
        const text = (d.content || []).filter(b => b.type === "text").map(b => b.text).join("");
        return { text, truncated: d.stop_reason === "max_tokens" };
      }
      if (p === "openai") {
        const body = { model, messages: turns, max_completion_tokens: 16000 };
        if (opts.json) body.response_format = { type: "json_object" };
        r = await fetch("https://api.openai.com/v1/chat/completions", { method: "POST", headers: { "content-type": "application/json", Authorization: "Bearer " + key }, body: JSON.stringify(body), signal: opts.signal });
        if (!r.ok) throw await readError(r);
        const d = await r.json(), ch = (d.choices || [])[0] || {};
        if (ch.message?.refusal) throw fail("refused");
        return { text: ch.message?.content || "", truncated: ch.finish_reason === "length" };
      }
      // Google Gemini
      const body = { contents: turns.map(t => ({ role: t.role === "assistant" ? "model" : "user", parts: [{ text: t.content }] })), generationConfig: { maxOutputTokens: 16000 } };
      if (opts.json) body.generationConfig.responseMimeType = "application/json";
      r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model.replace(/^models\//, ""))}:generateContent`, { method: "POST", headers: { "content-type": "application/json", "x-goog-api-key": key }, body: JSON.stringify(body), signal: opts.signal });
      if (!r.ok) throw await readError(r);
      const d = await r.json();
      if (d.promptFeedback?.blockReason) throw fail("refused");
      const c = (d.candidates || [])[0] || {};
      if (/SAFETY|PROHIBITED|BLOCKLIST|RECITATION/.test(c.finishReason || "")) throw fail("refused");
      const text = ((c.content || {}).parts || []).filter(x => !x.thought).map(x => x.text || "").join("");
      return { text, truncated: c.finishReason === "MAX_TOKENS" };
    } catch (e) {
      if (e && e.name === "AbortError") throw fail("cancelled");
      if (e && e.code) throw e;
      throw fail("network", String(e && e.message || e));
    }
  }
  function parseJSON(text) {
    const t = String(text || "").trim();
    try { return JSON.parse(t); } catch (e) {}
    const f = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (f) { try { return JSON.parse(f[1]); } catch (e) {} }
    const a = t.search(/[\[{]/), b = Math.max(t.lastIndexOf("}"), t.lastIndexOf("]"));
    if (a >= 0 && b > a) { try { return JSON.parse(t.slice(a, b + 1)); } catch (e) {} }
    throw fail("invalid_json", "No llegó un JSON válido", { text: t });
  }
  async function sample(input, opts) {
    const r = await call(input, opts);
    if (!r.text.trim()) throw fail("empty_completion");
    if (opts && typeof opts.onText === "function") { try { opts.onText({ text: r.text, delta: r.text }); } catch (e) {} }
    return { text: r.text, truncated: r.truncated, modelTierApplied: "default" };
  }
  sample.json = async function (input, opts) {
    const r = await call(input, Object.assign({}, opts, { json: true }));
    if (r.truncated) throw fail("invalid_json", "Respuesta cortada", { text: r.text });
    return parseJSON(r.text);
  };
  sample.limits = async () => ({ maxPromptBytes: 262144 });

  async function listModels(p, key) {
    p = p || prov(); key = key || keyOf(p);
    if (!key) throw fail("no_key");
    let r, ids = [];
    if (p === "anthropic") {
      r = await fetch("https://api.anthropic.com/v1/models?limit=100", { headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" } });
      if (!r.ok) throw await readError(r);
      ids = ((await r.json()).data || []).map(m => m.id);
    } else if (p === "openai") {
      r = await fetch("https://api.openai.com/v1/models", { headers: { Authorization: "Bearer " + key } });
      if (!r.ok) throw await readError(r);
      ids = ((await r.json()).data || []).map(m => m.id).filter(id => /^(gpt|o\d|chatgpt)/i.test(id) && !/audio|realtime|tts|transcribe|image|search|embedding|moderation|instruct|codex|preview/i.test(id)).sort().reverse();
    } else {
      r = await fetch("https://generativelanguage.googleapis.com/v1beta/models?pageSize=200", { headers: { "x-goog-api-key": key } });
      if (!r.ok) throw await readError(r);
      ids = ((await r.json()).models || []).filter(m => (m.supportedGenerationMethods || []).includes("generateContent")).map(m => m.name.replace(/^models\//, "")).filter(id => /gemini/i.test(id) && !/embedding|image|tts|audio|live|aqa|vision|learnlm/i.test(id)).sort().reverse();
    }
    return ids;
  }
  async function ping() {
    const r = await call("Respondé solamente con la palabra: listo", { modelTier: "quick" });
    return r.text.trim();
  }

  const downloads = {
    async save({ filename, data }) {
      const blob = data instanceof Blob ? data : new Blob([data]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = filename || "archivo"; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 30000);
    }
  };
  const permissions = { state: async () => "granted", request: async () => ({ sample: "granted" }), manage: async () => {} };
  window.claude = { use: async (name) => ({ sample, downloads, permissions })[name] || null };
})();
