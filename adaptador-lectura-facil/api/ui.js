/* Lectura Fácil · versión con clave: panel «Configurar la IA» y mensajes propios */
(function () {
  const AI = window.LF_AI;
  Object.assign(ERRORS, {
    no_key: "Falta configurar la IA: pulsa el botón 🔑 de arriba y pega tu clave de API.",
    bad_key: "La clave no es válida o no tiene permiso. Revísala en «🔑 Configurar la IA».",
    bad_model: "Ese modelo no está disponible en tu cuenta. En «🔑 Configurar la IA», pulsa «Cargar modelos de mi cuenta» y elige otro.",
    no_credit: "Tu cuenta de la IA no tiene saldo o llegó a su límite. Carga saldo en la página de la empresa o prueba con otra.",
    rate_limited: "Se hicieron muchas consultas seguidas. Espera un minuto y vuelve a intentarlo.",
    network: "No se pudo conectar con la IA. Revisa la conexión a internet; si usas un bloqueador de anuncios, desactívalo para esta página.",
    refused: "La IA no quiso procesar este texto. Prueba con otro fragmento o con otra empresa."
  });
  Object.defineProperty(ERRORS, "api_error", { configurable: true, get() { return "La IA respondió con un error: " + (window.ERRORS_API_DETAIL || "sin detalle") + "."; } });

  const $ = (id) => document.getElementById(id);
  function label() {
    const p = AI.prov(), m = AI.modelOf(p);
    $("ai-lbl").textContent = AI.keyOf(p) ? (m || AI.PROV[p].nombre) : "Configurar IA";
    $("btn-ai").classList.toggle("ai-missing", !AI.keyOf(p));
  }
  function fillModels(p, keep) {
    const list = Array.from(new Set([].concat(AI.PROV[p].modelos, (AI.cfg.lists || {})[p] || [])));
    const cur = keep || AI.modelOf(p);
    if (cur && !list.includes(cur)) list.unshift(cur);
    $("ai-model").innerHTML = list.length ? list.map(m => `<option value="${esc(m)}">${esc(m)}</option>`).join("") : '<option value="">(guarda la clave para cargar la lista)</option>';
    if (cur) $("ai-model").value = cur;
  }
  function showProv(p) {
    $("ai-prov").value = p;
    $("ai-key").value = AI.keyOf(p);
    $("ai-key").placeholder = p === "anthropic" ? "sk-ant-…" : p === "openai" ? "sk-…" : "AIza…";
    $("ai-link").href = AI.PROV[p].clave;
    $("ai-nota").textContent = AI.PROV[p].nota;
    fillModels(p);
  }
  function msg(t, kind) { $("ai-status").className = "status" + (kind === "err" ? " err" : ""); $("ai-status").innerHTML = (kind === "busy" ? '<span class="spinner" aria-hidden="true"></span>' : "") + `<span>${esc(t)}</span>`; }
  function pickDefault(p, ids) {
    if (p === "openai") return ids.find(i => /sol/i.test(i)) || ids.find(i => /^gpt-6/.test(i) && !/mini|nano|luna/i.test(i)) || ids[0];
    if (p === "gemini") return ids.find(i => /flash/i.test(i) && !/lite|thinking|exp/i.test(i)) || ids[0];
    return AI.PROV[p].defecto;
  }
  async function loadModels(silent) {
    const p = $("ai-prov").value, key = $("ai-key").value.trim();
    if (!key) { msg("Primero pega la clave.", "err"); return; }
    if (!silent) msg("Cargando los modelos de tu cuenta…", "busy");
    try {
      const ids = await AI.listModels(p, key);
      const lists = Object.assign({}, AI.cfg.lists, { [p]: ids });
      const models = Object.assign({}, AI.cfg.models);
      if (!models[p] || (ids.length && !ids.includes(models[p]) && !AI.PROV[p].modelos.includes(models[p]))) models[p] = pickDefault(p, ids) || models[p];
      AI.set({ lists, models });
      fillModels(p, models[p]);
      if (!silent) msg(`Se cargaron ${ids.length} modelos.`);
      return true;
    } catch (e) { msg(ERRORS[e.code] || "No se pudo cargar la lista de modelos.", "err"); return false; }
  }
  $("ai-prov").addEventListener("change", () => showProv($("ai-prov").value));
  $("ai-model").addEventListener("change", () => { const p = $("ai-prov").value; AI.set({ models: Object.assign({}, AI.cfg.models, { [p]: $("ai-model").value }) }); label(); });
  $("ai-show").onclick = () => { const k = $("ai-key"); k.type = k.type === "password" ? "text" : "password"; $("ai-show").textContent = k.type === "password" ? "Mostrar" : "Ocultar"; };
  $("ai-load").onclick = () => loadModels(false);
  $("ai-forget").onclick = () => { const p = $("ai-prov").value; const keys = Object.assign({}, AI.cfg.keys); delete keys[p]; AI.set({ keys }); $("ai-key").value = ""; label(); msg("Se borró la clave de este navegador."); };
  $("ai-save").onclick = async () => {
    const p = $("ai-prov").value, key = $("ai-key").value.trim();
    if (!key) { msg("Pega la clave antes de guardar.", "err"); return; }
    AI.set({ prov: p, keys: Object.assign({}, AI.cfg.keys, { [p]: key }), models: Object.assign({}, AI.cfg.models, { [p]: $("ai-model").value || AI.cfg.models?.[p] || "" }) });
    $("ai-save").disabled = true;
    try {
      if (p !== "anthropic" || !AI.modelOf(p)) await loadModels(true);
      msg("Probando la conexión…", "busy");
      await AI.ping();
      msg(`Listo: la IA responde (${AI.modelOf(p)}). Ya puedes adaptar textos.`);
      setStatus("");
      $("btn-go").disabled = false;
    } catch (e) { msg(ERRORS[e.code] || "No se pudo probar la conexión.", "err"); }
    finally { $("ai-save").disabled = false; label(); }
  };
  window.LF_openAI = () => { showProv(AI.prov()); $("ai-status").textContent = ""; openSheet("sheet-ai"); setTimeout(() => (AI.keyOf() ? $("ai-model") : $("ai-key")).focus(), 50); };
  $("btn-ai").onclick = window.LF_openAI;
  $("btn-welcome-ai").onclick = () => { closeSheets(); window.LF_openAI(); };
  label();
  if (!AI.keyOf()) setTimeout(() => { setStatus("Antes de empezar, configura la IA: pulsa «🔑 Configurar IA», arriba, y pega tu clave."); }, 1200);
})();
