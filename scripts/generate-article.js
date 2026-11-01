import Anthropic from '@anthropic-ai/sdk';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const MONTHS_SHORT = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
const MONTHS_LONG  = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];

function dateShort(iso) {
  const [, m, d] = iso.split('-');
  return `${parseInt(d)} ${MONTHS_SHORT[parseInt(m) - 1]}`;
}
function dateLong(iso) {
  const [y, m, d] = iso.split('-');
  return `${parseInt(d)} de ${MONTHS_LONG[parseInt(m) - 1]}, ${y}`;
}

const topicsPath = join(__dirname, 'topics.json');
const topics = JSON.parse(readFileSync(topicsPath, 'utf-8'));

if (!topics.queue.length) {
  console.log('Cola vacía — no hay temas pendientes.');
  process.exit(0);
}

const topic = topics.queue[0];
const today = new Date().toISOString().split('T')[0];

console.log(`Generando: "${topic.title}" (${topic.slug})`);

const client = new Anthropic();

const contentPrompt = `Eres el redactor experto de Güeregrove, agencia de marketing digital en Chile.
Escribes en español de Chile, con tuteo estándar (tú: "vendes", "sabes", "ofreces"). Usa "ustedes" y "acá". Sin voseo ni argentinismos. Estilo directo, sin rodeos, sin clichés, sin emojis.

TEMA DEL ARTÍCULO:
- Título: ${topic.title}
- Categoría: ${topic.tag}
- Foco SEO: ${topic.keyFocus}

INSTRUCCIÓN: Genera ÚNICAMENTE el HTML del cuerpo del artículo. Empieza directo con <p class="article-lead"> y termina antes del CTA. Sin DOCTYPE, sin <head>, sin <nav>, sin <footer>.

ESTRUCTURA OBLIGATORIA (en este orden):
1. <p class="article-lead">
   Párrafo introductorio impactante. Empieza con un dato concreto o estadística real. 150-200 palabras.

2. De 4 a 6 secciones. Cada sección empieza con <h2>TÍTULO EN MAYÚSCULAS</h2>.
   Entre las secciones, incluye OBLIGATORIAMENTE:

   a) Al menos 1 bloque <div class="stat-row"> con exactamente 3 celdas:
      <div class="stat-row">
        <div class="stat-cell"><span class="stat-big">X%</span><p>descripción breve</p></div>
        <div class="stat-cell"><span class="stat-big">X</span><p>descripción breve</p></div>
        <div class="stat-cell"><span class="stat-big">$X</span><p>descripción breve</p></div>
      </div>

   b) Al menos 1 bloque <div class="callout"> con:
      <div class="callout"><p class="callout-label">Etiqueta</p><p>contenido del callout</p></div>

   c) Al menos 1 <div class="pull-quote">Frase poderosa que resuma un punto clave del artículo</div>
      (sin comillas, escrita en mayúsculas con el estilo natural del texto)

   d) Al menos 1 componente adicional, a elección:
      - <div class="pillar-grid"> con 3 <div class="pillar-card"> que incluyan <div class="pillar-number">01</div> <div class="pillar-title">Título</div> y un <p>
      - <div class="compare-grid"> con pares de <div class="compare-cell"> (los headers llevan class="compare-cell compare-cell--header"), con <span class="compare-label"> para subtítulos dentro de celdas

   e) Al menos 1 lista <ul> o <ol> con <li> que usen <strong> para la parte clave de cada ítem

REGLAS DE CONTENIDO:
- Usa datos reales y verificables del marketing digital (porcentajes de industria, benchmarks conocidos, estudios de HubSpot, Google, Nielsen, etc.)
- No uses frases como "en el mundo actual", "en el competitivo panorama", "en la era digital"
- No repitas el título del artículo dentro del contenido
- Total de palabras: entre 900 y 1200
- Todas las estadísticas deben ser plausibles y ancladas al contexto de negocios en Latinoamérica cuando sea posible

Devuelve SOLO el HTML, sin explicaciones, sin bloques de código markdown, sin comentarios.`;

const message = await client.messages.create({
  model: 'claude-sonnet-4-6',
  max_tokens: 6000,
  messages: [{ role: 'user', content: contentPrompt }],
});

const articleContent = message.content[0].text.trim();
console.log(`✓ Contenido generado (${articleContent.length} caracteres)`);

// ─── Scaffold HTML ──────────────────────────────────────────────────────────

const GTM_HEAD = `  <!-- Google Tag Manager -->
  <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','GTM-PJ3XX3JQ');</script>
  <!-- End Google Tag Manager -->`;

const GTM_BODY = `<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-PJ3XX3JQ"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>`;

const NAV = `  <header class="site-header" id="site-header">
    <nav class="nav" aria-label="Navegación principal">
      <a href="/" class="nav-logo" aria-label="Güeregrove – Inicio" title="Güeregrove – Agencia de Marketing Digital">
        <span class="logo-gg" aria-hidden="true"><span>G</span><span class="logo-gg-mirror">G</span></span>
        <span>GÜEREGROVE</span>
      </a>
      <button class="nav-toggle" id="nav-toggle" aria-expanded="false" aria-controls="nav-menu" aria-label="Abrir menú">
        <span></span><span></span><span></span>
      </button>
      <ul class="nav-menu" id="nav-menu" role="list">
        <li><a href="/#servicios">Servicios</a></li>
        <li><a href="/#metodologia">Metodología</a></li>
        <li><a href="/blog/">Blog</a></li>
        <li><a href="/#nosotros">Nosotros</a></li>
        <li><a href="/#contacto" class="nav-cta">Contacto</a></li>
      </ul>
    </nav>
  </header>`;

const FOOTER = `  <footer class="site-footer" role="contentinfo">
    <div class="container footer-top">
      <div class="footer-brand">
        <span class="logo-gg logo-gg--footer" aria-hidden="true"><span>G</span><span class="logo-gg-mirror">G</span></span>
        <div>
          <p class="footer-name">GÜEREGROVE</p>
          <p class="footer-tagline">Keep on it.</p>
        </div>
      </div>
      <nav class="footer-nav" aria-label="Pie de página">
        <a href="/#servicios">Servicios</a>
        <a href="/#metodologia">Metodología</a>
        <a href="/blog/">Blog</a>
        <a href="/#nosotros">Nosotros</a>
        <a href="/#contacto">Contacto</a>
      </nav>
      <div class="footer-social">
        <a href="https://instagram.com/gueregrove" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><span aria-hidden="true">IG</span></a>
        <a href="https://twitter.com/gueregrove" target="_blank" rel="noopener noreferrer" aria-label="Twitter"><span aria-hidden="true">TW</span></a>
      </div>
    </div>
    <div class="footer-bottom">
      <div class="container">
        <p>© <span id="year"></span> Güeregrove. Todos los derechos reservados.</p>
        <p class="footer-seo-note">Sitio construido con HTML semántico, Schema.org y SEO técnico.</p>
      </div>
    </div>
  </footer>`;

const cta = topic.cta || {
  kicker: '¿Listo para aplicarlo en tu negocio?',
  headline: 'Hablemos de tu estrategia.',
  description: 'Analizamos tu situación y te mostramos un plan concreto para crecer online. Sin compromiso.',
  button: 'Agendar consulta gratuita',
};

const relatedCards = topic.related.map(r => `          <article class="blog-card">
            <div class="blog-card-meta">
              <span class="blog-tag">${r.tag}</span>
              <time datetime="${r.date}">${dateShort(r.date)} ${r.date.split('-')[0]}</time>
            </div>
            <h3 class="blog-card-title">${r.title}</h3>
            <p class="blog-card-excerpt">${r.excerpt}</p>
            <a href="/blog/${r.slug}" class="blog-card-link" aria-label="Leer artículo">Leer artículo <span aria-hidden="true">→</span></a>
          </article>`).join('\n');

const fullHtml = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

${GTM_HEAD}

  <title>${topic.title} | Güeregrove</title>
  <meta name="description" content="${topic.metaDescription}">
  <meta name="robots" content="index, follow">
  <meta name="author" content="Güeregrove">
  <link rel="canonical" href="https://gueregrove.com/blog/${topic.slug}">

  <meta property="og:type" content="article">
  <meta property="og:url" content="https://gueregrove.com/blog/${topic.slug}">
  <meta property="og:title" content="${topic.title}">
  <meta property="og:description" content="${topic.metaDescription}">
  <meta property="og:locale" content="es_CL">
  <meta property="article:published_time" content="${today}">

  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "${topic.title}",
    "description": "${topic.metaDescription}",
    "datePublished": "${today}",
    "dateModified": "${today}",
    "author": { "@type": "Organization", "name": "Güeregrove" },
    "publisher": {
      "@type": "Organization",
      "name": "Güeregrove",
      "logo": { "@type": "ImageObject", "url": "https://gueregrove.com/assets/favicon/favicon.svg" }
    },
    "mainEntityOfPage": { "@type": "WebPage", "@id": "https://gueregrove.com/blog/${topic.slug}" }
  }
  </script>

  <link rel="icon" type="image/x-icon" href="/assets/favicon/favicon.ico">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,400;0,600;0,700;0,800;0,900;1,900&family=Barlow:wght@300;400;500;600&family=Bebas+Neue&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/style.css">
</head>
<body>
${GTM_BODY}

${NAV}

  <main>
    <div class="article-header">
      <div class="container">
        <nav class="breadcrumb" aria-label="Ruta de navegación">
          <a href="/blog/">Blog</a>
          <span aria-hidden="true">›</span>
          <span>${topic.tag}</span>
        </nav>
        <span class="blog-tag">${topic.tag}</span>
        <h1 class="article-title">${topic.title}</h1>
        <div class="article-meta">
          <time datetime="${today}">${dateLong(today)}</time>
          <span>·</span>
          <span>${topic.readingTime} de lectura</span>
          <span>·</span>
          <span>Por <strong style="color:var(--cream);">Güeregrove</strong></span>
        </div>
      </div>
    </div>

    <article class="article-body">

${articleContent}

      <div class="article-cta">
        <span class="cta-kicker">${cta.kicker}</span>
        <h2>${cta.headline}</h2>
        <p>${cta.description}</p>
        <a href="/#contacto" class="btn btn-primary" title="Contactar a Güeregrove">${cta.button}</a>
      </div>

    </article>

    <section class="related-section" aria-labelledby="related-heading">
      <div class="container" style="max-width:760px;">
        <p class="section-kicker">Sigue leyendo</p>
        <h2 id="related-heading" class="section-title" style="font-size:clamp(1.75rem,3vw,2.5rem);">Artículos relacionados</h2>
        <div class="related-grid">
${relatedCards}
        </div>
      </div>
    </section>
  </main>

${FOOTER}

  <script src="/main.js"></script>
</body>
</html>`;

// ─── Save article ────────────────────────────────────────────────────────────

const articlePath = join(ROOT, 'blog', `${topic.slug}.html`);
writeFileSync(articlePath, fullHtml, 'utf-8');
console.log(`✓ Artículo guardado: blog/${topic.slug}.html`);

// ─── Update blog/index.html ──────────────────────────────────────────────────

const indexPath = join(ROOT, 'blog', 'index.html');
let indexHtml = readFileSync(indexPath, 'utf-8');

const MARKER = '<!-- NEW_ARTICLES_HERE -->';
if (!indexHtml.includes(MARKER)) {
  console.error(`Error: marcador "${MARKER}" no encontrado en blog/index.html`);
  process.exit(1);
}

const newCard = `
          <article class="blog-listing-card">
            <div class="blog-card-meta">
              <span class="blog-tag">${topic.tag}</span>
              <time datetime="${today}">${dateShort(today)} ${today.split('-')[0]}</time>
              <span style="font-size:0.75rem;color:var(--gray-dark);">${topic.readingTime}</span>
            </div>
            <h2 class="blog-card-title">${topic.title}</h2>
            <p class="blog-card-excerpt">${topic.excerpt}</p>
            <a href="/blog/${topic.slug}" class="blog-card-link" aria-label="Leer artículo sobre ${topic.tag.toLowerCase()}">Leer artículo <span aria-hidden="true">→</span></a>
          </article>
`;

indexHtml = indexHtml.replace(MARKER, MARKER + '\n' + newCard);
writeFileSync(indexPath, indexHtml, 'utf-8');
console.log(`✓ blog/index.html actualizado`);

// ─── Update topics.json ──────────────────────────────────────────────────────

topics.published.push({ ...topic, publishedAt: today });
topics.queue.shift();
writeFileSync(topicsPath, JSON.stringify(topics, null, 2) + '\n', 'utf-8');
console.log(`✓ topics.json actualizado — ${topics.queue.length} temas restantes en cola`);
