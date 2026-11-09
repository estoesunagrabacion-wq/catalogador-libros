#!/usr/bin/env python3
"""Genera la versión con clave de API de Lectura Fácil.

Toma la aplicación publicada en Claude (../adaptador-lectura-facil.html), le cambia
los textos que hablan de la cuenta de Claude, le agrega el panel «Configurar la IA»
(ui.html, ui.js) y la capa que conecta con las APIs (shim.js), y escribe una página
HTML completa en docs/lectura-facil/index.html, lista para GitHub Pages.

Uso:  python3 adaptador-lectura-facil/api/build.py   (desde la raíz del repositorio)
"""
import pathlib, sys

AQUI = pathlib.Path(__file__).resolve().parent
RAIZ = AQUI.parent.parent
FUENTE = AQUI.parent / "adaptador-lectura-facil.html"
DESTINO = RAIZ / "docs" / "lectura-facil" / "index.html"
ENLACE_CLAUDE = "https://claude.ai/artifact/TuAXtS8wJKRVgVUtL4ePrE"
ENLACE_API = "https://estoesunagrabacion-wq.github.io/catalogador-libros/lectura-facil/"

s = FUENTE.read_text(encoding="utf-8")


def rep(old, new, count=1):
    global s
    n = s.count(old)
    if n != count:
        sys.exit(f"No se encontró exactamente {count} vez/veces ({n}): {old[:80]!r}")
    s = s.replace(old, new)


# --- Textos: de «cuenta de Claude» a «clave de API» ---
rep("<title>Adaptador de Lectura Fácil</title>", "<title>Lectura Fácil · versión con clave</title>")
rep('<meta name="claude:viewport-fit-sides" content="cover">\n', "")
rep(ENLACE_CLAUDE, ENLACE_API, s.count(ENLACE_CLAUDE))
rep("Abre este mismo enlace en el celular, con tu cuenta de Claude iniciada, y añádelo a la pantalla de inicio.",
    "Abre este mismo enlace en el celular, configura tu clave la primera vez y añádelo a la pantalla de inicio.")
rep("""    <div class="osbox"><b>En la app de Claude</b>
      <p style="margin:0">También puedes abrirla desde la app de Claude, en la sección de artefactos. Si la fijas, aparece siempre arriba.</p></div>
""", "")
rep("""      <li>Necesitas una <b>cuenta de Claude</b> (gratuita, en claude.ai) con la <b>sesión iniciada</b>.</li>
      <li>Ábrela siempre desde el enlace. <b>No descargues el archivo</b>: descargado no funciona.</li>
      <li>La primera vez que pulses <b>«Adaptar texto»</b>, elige <b>«Permitir»</b>.</li>""",
    """      <li>Esta versión funciona con <b>tu propia clave de API</b> de Anthropic (Claude), OpenAI (ChatGPT) o Google (Gemini, que tiene plan gratuito).</li>
      <li>Pulsa <b>«Configurar la IA»</b>, elige la empresa y pega tu clave. Se guarda solo en este navegador.</li>
      <li>El uso se cobra en tu cuenta de esa empresa: adaptar un cuento cuesta, en general, centavos de dólar.</li>""")
rep('<button class="btn primary" type="button" id="btn-welcome-go">Empezar</button>',
    '<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn primary" type="button" id="btn-welcome-ai" style="width:auto">🔑 Configurar la IA</button><button class="btn" type="button" id="btn-welcome-go">Empezar</button></div>')
rep("La adaptación la hace Claude, una inteligencia artificial.",
    "La adaptación la hace la inteligencia artificial que elijas (Claude, ChatGPT o Gemini), con tu propia clave de API.")
rep("""        <li>Una <b>cuenta de Claude</b>, gratuita o de pago. Se crea en <b>claude.ai</b> con un correo.</li>
        <li><b>Iniciar sesión</b> en ese navegador o en la app de Claude, en cada dispositivo donde la uses.</li>
        <li>El <b>enlace</b> de esta aplicación (te lo comparte quien la creó).</li>
        <li>La primera vez que pulses «Adaptar texto», Claude te pregunta si permites que la aplicación lo use. Elige <b>Permitir</b>.</li>
      </ul>
      <p class="hint" style="margin:8px 0 0">Cada docente usa su propia cuenta. Las adaptaciones cuentan para el uso de tu cuenta; la cuenta gratuita tiene un límite diario.</p>""",
    """        <li>Una <b>clave de API</b> de Anthropic (Claude), OpenAI (ChatGPT) o Google (Gemini). En <b>🔑 Configurar la IA</b> está el paso a paso para sacarla.</li>
        <li>Cargarla una vez en cada navegador donde uses la aplicación. Se guarda solo ahí y se envía únicamente a esa empresa.</li>
        <li>El <b>enlace</b> de esta aplicación.</li>
      </ul>
      <p class="hint" style="margin:8px 0 0">Cada docente usa su propia clave y paga su propio uso. Gemini tiene un plan gratuito con límites diarios.</p>""")
rep("<li>Inicia sesión en Claude con <b>tu</b> cuenta.</li>", "<li>Vuelve a cargar <b>tu</b> clave en ese dispositivo (botón 🔑, arriba).</li>")
rep("""        <dt>El botón «Adaptar texto» está gris</dt><dd>No hay sesión de Claude en este navegador, o la página se abrió fuera de Claude. Inicia sesión en claude.ai y vuelve a abrir el enlace.</dd>
        <dt>Dice «No se dio permiso» o «no tiene permiso»</dt><dd>Pulsa el botón <b>Dar permiso</b> y activa Claude. Si no aparece, busca el menú <b>Permisos</b> de la página en la barra de Claude, arriba.</dd>
        <dt>Dice «Claude no está disponible en esta ventana»</dt><dd>No uses ventana privada o de incógnito. Desactiva el bloqueo de cookies o los bloqueadores de anuncios para claude.ai, o prueba en Chrome o Edge.</dd>
        <dt>Aparece una línea «Diagnóstico…»</dt><dd>Si no logras que funcione, copia esa línea y envíasela a quien te compartió la aplicación.</dd>
        <dt>Dice que se hicieron muchas adaptaciones</dt><dd>Llegaste al límite de uso de tu cuenta por un rato. Espera y vuelve a intentarlo.</dd>""",
    """        <dt>Dice que falta configurar la IA o que la clave no es válida</dt><dd>Pulsa <b>🔑</b>, arriba, pega la clave completa y pulsa <b>Guardar y probar</b>.</dd>
        <dt>Dice que el modelo no está disponible</dt><dd>En <b>🔑 Configurar la IA</b>, pulsa <b>Cargar modelos de mi cuenta</b> y elige otro.</dd>
        <dt>Dice que la cuenta no tiene saldo</dt><dd>Carga saldo en la página de la empresa, o usa Gemini con su plan gratuito.</dd>
        <dt>Dice que no se pudo conectar</dt><dd>Revisa internet. Si tienes un bloqueador de anuncios, desactívalo para esta página.</dd>
        <dt>Dice que se hicieron muchas consultas</dt><dd>Llegaste al límite por minuto de tu cuenta. Espera un minuto y vuelve a intentarlo.</dd>""")
rep("""        <li>Quien creó la aplicación pulsa <b>Compartir</b>, en la barra de Claude arriba de la página.</li>
        <li>Puede invitar por correo o crear un enlace y enviarlo.</li>
        <li>Cada docente necesita su propia cuenta de Claude (sección 1). Lo que guarda cada uno no lo ven los demás.</li>""",
    """        <li>Envía el enlace de la aplicación (botón de abajo).</li>
        <li>Cada docente carga su propia clave (sección 1). Lo que guarda cada uno, incluida la clave, no lo ven los demás.</li>""")
rep("Necesitas una cuenta de Claude (gratuita, en claude.ai) con la sesión iniciada. Ábrela siempre desde el enlace, no descargues el archivo. La primera vez que pulses «Adaptar texto», elige «Permitir». El botón de Ayuda (?) explica todo paso a paso.",
    "Funciona con tu propia clave de API de Anthropic (Claude), OpenAI (ChatGPT) o Google (Gemini, que tiene plan gratuito). En el botón 🔑 está el paso a paso. El botón de Ayuda (?) explica todo lo demás.")
rep('if (!lsGet("lf-bienvenida2"))', 'if (!lsGet("lf-bienvenida-api"))')
rep('lsSet("lf-bienvenida2", "1");', 'lsSet("lf-bienvenida-api", "1");')

# --- Botón 🔑 en la barra y panel de configuración ---
rep('    <button class="iconbtn" id="btn-help"',
    '    <button class="iconbtn" id="btn-ai" type="button" aria-label="Configurar la IA">🔑 <span class="lbl" id="ai-lbl">IA</span></button>\n    <button class="iconbtn" id="btn-help"')
rep('<div class="sheet" id="sheet-install"', (AQUI / "ui.html").read_text(encoding="utf-8") + '\n<div class="sheet" id="sheet-install"')
rep(".sheet-in.wide {", "#btn-ai.ai-missing { border-color: var(--bad); color: var(--bad); }\n#btn-ai .lbl { max-width: 14em; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n.sheet-in.wide {")

# --- Capa de conexión (antes del código) y panel (después) ---
shim = (AQUI / "shim.js").read_text(encoding="utf-8")
ui = (AQUI / "ui.js").read_text(encoding="utf-8")
rep('<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>',
    "<script>\n" + shim + "</script>\n" + '<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>')
i = s.rindex("</script>")
s = s[:i] + "</script>\n<script>\n" + ui + s[i:]

# --- Página completa: <head> con metadatos y estilos, <body> con el resto ---
corte = s.index("</style>") + len("</style>")
cabeza, cuerpo = s[:corte], s[corte:]
reset = ('<style>:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}'
         'body{margin:0;font:14px system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style>')
html = ('<!doctype html>\n<html lang="es">\n<head>\n<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
        + reset + "\n" + cabeza + "\n</head>\n<body>" + cuerpo + "\n</body>\n</html>\n")
DESTINO.parent.mkdir(parents=True, exist_ok=True)
DESTINO.write_text(html, encoding="utf-8")
print(f"Listo: {DESTINO.relative_to(RAIZ)} ({len(html):,} bytes)")
