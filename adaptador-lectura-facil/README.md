# Adaptador de Lectura Fácil

Copia de respaldo del código de la aplicación **Lectura Fácil**, que adapta textos de clase (cuentos, poemas, textos del libro, problemas y consignas) a Lectura Fácil según el perfil de cada estudiante.

## Dónde se usa

La aplicación funciona **solo desde su enlace de Claude**:

https://claude.ai/artifact/TuAXtS8wJKRVgVUtL4ePrE

Abrir este archivo `.html` directamente (desde el repositorio o descargado) muestra la página, pero **no adapta textos**: la conexión con la inteligencia artificial la proporciona claude.ai, con la cuenta de quien la abre.

## Qué hace

- Perfiles de estudiante (curso y nivel de lectura) y todas las materias.
- Versión fácil del mismo cuento o poema, con pictogramas, glosario y «Guía del original» (de qué párrafo del original sale cada parte).
- Edición manual del texto adaptado y del glosario.
- PDF A5 o cuadernillo A4 para imprimir, en blanco y negro o color.
- Descarga en Word, lectura en voz alta y vista para el estudiante.

## Cómo actualizar el respaldo

Cuando la aplicación cambie, reemplazar `adaptador-lectura-facil.html` por la versión nueva y hacer commit.

## Versión con clave de API (sin cuenta de Claude)

Hay una segunda versión que funciona con la **clave de API propia** de cada docente, de
**Anthropic (Claude)**, **OpenAI (ChatGPT)** o **Google (Gemini)**. Se publica con GitHub Pages:

https://estoesunagrabacion-wq.github.io/catalogador-libros/lectura-facil/

- La clave se guarda solo en el navegador de cada docente y se envía únicamente a la empresa elegida.
- El uso se cobra en la cuenta de esa empresa (Gemini tiene plan gratuito con límites).
- Tiene las mismas funciones que la versión de Claude.

### Cómo se genera

La versión con clave **no se edita a mano**: se genera a partir de la aplicación principal.

```
python3 adaptador-lectura-facil/api/build.py
```

- `api/shim.js`: conecta la aplicación con las APIs (reemplaza la conexión del visor de Claude).
- `api/ui.html` y `api/ui.js`: panel «Configurar la IA» (empresa, modelo y clave).
- `api/build.py`: cambia los textos que hablan de la cuenta de Claude y escribe `docs/lectura-facil/index.html`.

Después de cambiar la aplicación principal, volver a correr el script y hacer commit de `docs/`.

### Activar GitHub Pages (una sola vez)

En GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: `main` / carpeta `/docs`** → Save.
