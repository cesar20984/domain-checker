import http from "node:http";
import { resolve4, resolveNs, resolveSoa } from "node:dns/promises";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "public");
const port = process.env.PORT || 3000;

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml"
};
const rdapBootstrapUrl = "https://data.iana.org/rdap/dns.json";
const rdapFallbackUrl = "https://rdap.org/";
const rdapTimeoutMs = 5200;
const dnsTimeoutMs = 1800;
let rdapBootstrapPromise;

const pageCopy = {
  en: {
    seoTitle: "Bulk Domain Availability Checker | Fast Domain Search Tool",
    seoDescription: "Check domain availability in bulk across .com, .net, .org, .io and more. A fast, simple tool for founders, marketers and domain researchers.",
    seoKeywords: "bulk domain checker, domain availability checker, bulk domain search, domain name checker, available domains, domain finder",
    name: "Bulk Domain Availability Checker",
    brandName: "Domain Checker",
    homeLink: "Home",
    eyebrow: "Bulk domain availability",
    h1: "Bulk Domain Availability Checker",
    intro: "Search one domain or paste a bulk list of names, pick the extensions you care about, and quickly see which domains are available.",
    languageLabel: "Language",
    clearHistory: "Clear history",
    inputLabel: "Names or domains",
    placeholder: "brand-name\nnewproduct, startupidea.com",
    inputHelp: "One name per line, or separated by commas.",
    tldsTitle: "Extensions",
    resetTlds: "Only .com",
    checkButton: "Check availability",
    clearButton: "Clear",
    resultsTitle: "Results",
    availableOnly: "Only available",
    ready: "Ready",
    historyTitle: "History",
    seoEyebrow: "Fast research workflow",
    seoHeading: "Find available domains from a bulk list",
    seoCopyOne: "This bulk domain availability checker is built for people who need to compare many domain name ideas quickly: founders naming a startup, marketers planning campaigns, agencies preparing client options, and domain researchers checking large lists.",
    seoCopyTwo: "Paste names on separate lines or separate them with commas. The tool automatically combines each name with your selected extensions, keeps your preferred TLDs in local storage, and lets you filter results to focus only on available domains.",
    seoCopyThree: "The checker uses RDAP data and DNS fallback signals to verify whether domains are registered, available, or uncertain. Search history stays in your browser so repeated naming sessions are easier to review.",
    footerTagline: "A simple bulk domain search tool for fast naming research.",
    footerAbout: "About",
    footerPrivacy: "Privacy",
    footerCookies: "Cookies",
    footerLegal: "Legal notice"
  },
  es: {
    seoTitle: "Buscador de Dominios por Lotes | Bulk Domain Checker",
    seoDescription: "Verifica dominios disponibles por lotes, en busqueda masiva o bulk para .com, .net, .org, .io y mas. Rapido, simple y gratis.",
    seoKeywords: "buscador de dominios por lotes, bulk domain checker, busqueda masiva de dominios, verificar dominios disponibles, disponibilidad de dominios, dominios disponibles",
    name: "Buscador de Dominios por Lotes",
    brandName: "Domain Checker",
    homeLink: "Inicio",
    eyebrow: "Disponibilidad de dominios por lotes",
    h1: "Buscador de Dominios por Lotes",
    intro: "Busca un dominio o pega una lista masiva de nombres, elige las terminaciones que te interesan y revisa rapidamente cuales estan disponibles. Tambien funciona como bulk domain checker para quienes buscan esa expresion.",
    languageLabel: "Idioma",
    clearHistory: "Limpiar historial",
    inputLabel: "Nombres o dominios",
    placeholder: "mi-marca\nproducto-nuevo, ideastartup.com",
    inputHelp: "Un nombre por linea, o separados por comas.",
    tldsTitle: "Terminaciones",
    resetTlds: "Solo .com",
    checkButton: "Buscar disponibilidad",
    clearButton: "Vaciar",
    resultsTitle: "Resultados",
    availableOnly: "Solo disponibles",
    ready: "Listo",
    historyTitle: "Historial",
    seoEyebrow: "Flujo rapido de investigacion",
    seoHeading: "Encuentra dominios disponibles desde una lista por lotes",
    seoCopyOne: "Esta herramienta para verificar dominios por lotes esta pensada para personas que necesitan comparar muchas ideas rapido: fundadores buscando nombre para una startup, marketers preparando campanas, agencias creando opciones para clientes e investigadores de dominios.",
    seoCopyTwo: "Puedes usarla como buscador masivo de dominios, comprobador por lotes o bulk domain checker. Pega nombres en lineas separadas o separados por comas, y la herramienta combina cada nombre con las terminaciones seleccionadas.",
    seoCopyThree: "El verificador guarda tus TLDs preferidos en localStorage, permite filtrar solo dominios disponibles y usa datos RDAP con senales DNS de respaldo para indicar si un dominio esta registrado, disponible o incierto.",
    footerTagline: "Una herramienta simple para buscar dominios por lotes, hacer busquedas masivas y acelerar investigaciones de nombres.",
    footerAbout: "Sobre nosotros",
    footerPrivacy: "Privacidad",
    footerCookies: "Cookies",
    footerLegal: "Aviso legal"
  }
};

const legalOwner = {
  name: "César Gámez Maldonado",
  rut: "26569414-4",
  phone: "+56956210042",
  address: "Sara del Campo 535, Código postal 8330094, Región Metropolitana, Santiago, Chile"
};

const contentRoutes = {
  "/about": { lang: "en", page: "about", alternate: "/es/sobre-nosotros" },
  "/privacy": { lang: "en", page: "privacy", alternate: "/es/privacidad" },
  "/cookies": { lang: "en", page: "cookies", alternate: "/es/cookies" },
  "/legal": { lang: "en", page: "legal", alternate: "/es/aviso-legal" },
  "/es/sobre-nosotros": { lang: "es", page: "about", alternate: "/about" },
  "/es/privacidad": { lang: "es", page: "privacy", alternate: "/privacy" },
  "/es/cookies": { lang: "es", page: "cookies", alternate: "/cookies" },
  "/es/aviso-legal": { lang: "es", page: "legal", alternate: "/legal" }
};

const sitemapRoutes = [
  { path: "/", priority: "1.0", changefreq: "weekly" },
  { path: "/es", priority: "1.0", changefreq: "weekly" },
  { path: "/about", priority: "0.6", changefreq: "monthly" },
  { path: "/privacy", priority: "0.4", changefreq: "yearly" },
  { path: "/cookies", priority: "0.4", changefreq: "yearly" },
  { path: "/legal", priority: "0.4", changefreq: "yearly" },
  { path: "/es/sobre-nosotros", priority: "0.6", changefreq: "monthly" },
  { path: "/es/privacidad", priority: "0.4", changefreq: "yearly" },
  { path: "/es/cookies", priority: "0.4", changefreq: "yearly" },
  { path: "/es/aviso-legal", priority: "0.4", changefreq: "yearly" }
];

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body)
  });
  res.end(body);
}

function getBaseUrl(req) {
  const proto = req.headers["x-forwarded-proto"] || "http";
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  return `${proto}://${host}`;
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function renderSitemap(req) {
  const baseUrl = getBaseUrl(req);
  const lastmod = new Date().toISOString().slice(0, 10);
  const urls = sitemapRoutes.map((route) => `  <url>
    <loc>${escapeXml(`${baseUrl}${route.path}`)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderIndexTemplate(template, lang, req) {
  const copy = pageCopy[lang] || pageCopy.en;
  const baseUrl = getBaseUrl(req);
  const canonicalUrl = lang === "es" ? `${baseUrl}/es` : `${baseUrl}/`;
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: copy.name,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Any",
    url: canonicalUrl,
    inLanguage: lang,
    description: copy.seoDescription,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD"
    },
    featureList: [
      "Bulk domain availability checks",
      "Multiple TLD selection",
      "Local search history",
      "Available-only result filtering"
    ]
  };

  const replacements = {
    __LANG__: lang,
    __BASE_URL__: baseUrl,
    __CANONICAL_URL__: canonicalUrl,
    __SCHEMA_JSON__: JSON.stringify(schema).replace(/</g, "\\u003c"),
    __SEO_TITLE__: copy.seoTitle,
    __SEO_DESCRIPTION__: copy.seoDescription,
    __SEO_KEYWORDS__: copy.seoKeywords,
    __BRAND_NAME__: copy.brandName,
    __HOME_LINK__: copy.homeLink,
    __HOME_URL__: lang === "es" ? "/es" : "/",
    __EYEBROW__: copy.eyebrow,
    __H1__: copy.h1,
    __INTRO__: copy.intro,
    __LANGUAGE_LABEL__: copy.languageLabel,
    __CLEAR_HISTORY__: copy.clearHistory,
    __INPUT_LABEL__: copy.inputLabel,
    __PLACEHOLDER__: copy.placeholder,
    __INPUT_HELP__: copy.inputHelp,
    __TLDS_TITLE__: copy.tldsTitle,
    __RESET_TLDS__: copy.resetTlds,
    __CHECK_BUTTON__: copy.checkButton,
    __CLEAR_BUTTON__: copy.clearButton,
    __RESULTS_TITLE__: copy.resultsTitle,
    __AVAILABLE_ONLY__: copy.availableOnly,
    __READY__: copy.ready,
    __HISTORY_TITLE__: copy.historyTitle,
    __SEO_EYEBROW__: copy.seoEyebrow,
    __SEO_HEADING__: copy.seoHeading,
    __SEO_COPY_ONE__: copy.seoCopyOne,
    __SEO_COPY_TWO__: copy.seoCopyTwo,
    __SEO_COPY_THREE__: copy.seoCopyThree,
    __FOOTER_TAGLINE__: copy.footerTagline,
    __FOOTER_ABOUT__: copy.footerAbout,
    __FOOTER_PRIVACY__: copy.footerPrivacy,
    __FOOTER_COOKIES__: copy.footerCookies,
    __FOOTER_LEGAL__: copy.footerLegal,
    __ABOUT_URL__: lang === "es" ? "/es/sobre-nosotros" : "/about",
    __PRIVACY_URL__: lang === "es" ? "/es/privacidad" : "/privacy",
    __COOKIES_URL__: lang === "es" ? "/es/cookies" : "/cookies",
    __LEGAL_URL__: lang === "es" ? "/es/aviso-legal" : "/legal"
  };

  return Object.entries(replacements).reduce((html, [key, value]) => {
    const safeValue = key === "__SCHEMA_JSON__" ? value : escapeHtml(value);
    return html.replaceAll(key, safeValue);
  }, template);
}

function getContentPage(lang, page) {
  const updated = lang === "es" ? "10 de mayo de 2026" : "May 10, 2026";

  const pages = {
    en: {
      about: {
        title: "About This Bulk Domain Checker",
        description: "Learn how this bulk domain availability checker helps founders, marketers and agencies search many domain ideas quickly.",
        h1: "About This Bulk Domain Checker",
        body: [
          ["What the tool does", "This website is a fast domain availability checker for people who need to research domain names in bulk. You can paste one name, many names, comma-separated ideas, or full domains, then select the extensions you want to compare."],
          ["Who it is for", "It is designed for founders, creators, marketers, agencies, domain researchers and anyone building a shortlist of brand names. The goal is to make bulk domain search, batch domain checking and naming research simple, fast and easy to repeat."],
          ["How it checks domains", "The tool uses public RDAP data and DNS fallback signals to classify domains as available, taken or uncertain. Your selected extensions, result filter and search history are stored locally in your browser to make repeat searches easier."],
          ["Why it exists", "The site focuses on speed, clarity and repeatable domain research. It helps you move from a raw list of name ideas to a cleaner shortlist of available domains without opening many registrar tabs."]
        ]
      },
      privacy: {
        title: "Privacy Policy",
        description: "Privacy policy for the bulk domain checker, including local storage, server requests and contact information.",
        h1: "Privacy Policy",
        body: [
          ["Last updated", updated],
          ["Controller", `The responsible operator of this website is ${legalOwner.name}, RUT ${legalOwner.rut}, with address at ${legalOwner.address}. Contact phone: ${legalOwner.phone}.`],
          ["Data processed", "The tool may process the domain names you submit, technical request data such as IP address, browser and server logs, and local preferences stored in your browser. The search history is stored in localStorage on your device unless a future account feature is added."],
          ["Purpose", "Data is used to provide the domain availability checker, maintain security, prevent abuse, improve reliability and remember local preferences such as selected TLDs, language, filters and history."],
          ["Legal basis", "Processing is based on the user's request to use the tool, legitimate interest in operating and securing the website, and applicable privacy rules, including Chilean personal data regulations where relevant."],
          ["Third-party services", "Domain checks may be sent to public RDAP registry services and DNS infrastructure. These services are necessary to verify availability and may receive the queried domain name and standard technical request data."],
          ["Retention", "Local storage remains in your browser until you clear it. Server logs, if enabled by the hosting provider, should be retained only for operational, security and legal purposes for a reasonable period."],
          ["Your rights", `You may request access, correction, deletion or information about personal data by contacting ${legalOwner.name} at ${legalOwner.phone}.`],
          ["Note", "This policy is a practical template for this tool and should be reviewed by a qualified professional before large-scale commercial deployment."]
        ]
      },
      cookies: {
        title: "Cookie Policy",
        description: "Cookie policy explaining localStorage, browser preferences and tracking choices for the bulk domain checker.",
        h1: "Cookie Policy",
        body: [
          ["Last updated", updated],
          ["What cookies are", "Cookies and similar browser storage technologies allow a website to remember information on your device, such as preferences, settings or usage choices."],
          ["What this site uses", "This tool currently relies on localStorage to remember selected domain extensions, the available-only filter and local search history. These are functional preferences needed to make the tool easier to use."],
          ["Analytics and advertising", "The current app does not require advertising cookies or analytics cookies to function. If analytics, ads or affiliate tracking are added later, this policy should be updated and a consent mechanism should be added where required."],
          ["How to control storage", "You can clear localStorage, cookies and site data from your browser settings. Clearing site data will remove selected TLDs, filters and history saved on your device."],
          ["Operator", `${legalOwner.name}, RUT ${legalOwner.rut}, ${legalOwner.address}. Phone: ${legalOwner.phone}.`]
        ]
      },
      legal: {
        title: "Legal Notice",
        description: "Legal notice and terms of use for the bulk domain availability checker.",
        h1: "Legal Notice",
        body: [
          ["Site operator", `${legalOwner.name}, RUT ${legalOwner.rut}, address: ${legalOwner.address}. Phone: ${legalOwner.phone}.`],
          ["Purpose of the website", "This website provides a free domain availability checker for individual and bulk searches across selected domain extensions."],
          ["No guarantee of registration", "Availability results are informational. Domain availability can change at any time and may vary by registry, registrar, premium pricing rules, reserved names, restrictions or temporary RDAP/DNS errors. A domain should be considered secured only after successful registration with an accredited registrar."],
          ["Acceptable use", "Users must not overload, abuse, scrape aggressively, interfere with, reverse engineer or use the service for unlawful purposes. The operator may limit or block traffic that affects stability or violates reasonable use."],
          ["External services", "The tool may query public RDAP and DNS services operated by third parties. The operator is not responsible for outages, rate limits, incorrect data or policies of those third-party services."],
          ["Liability", "The tool is provided as-is. To the maximum extent permitted by applicable law, the operator is not liable for business losses, missed registrations, inaccurate external data or service interruptions."],
          ["Governing context", "This notice is intended for a website operated from Chile and may need adaptation if the service is offered commercially in other jurisdictions."]
        ]
      }
    },
    es: {
      about: {
        title: "Sobre Nosotros | Buscador de Dominios por Lotes",
        description: "Conoce como funciona esta herramienta para buscar dominios por lotes, hacer busquedas masivas y verificar dominios disponibles.",
        h1: "Sobre Nosotros",
        body: [
          ["Que hace la herramienta", "Este sitio es un buscador de dominios por lotes para personas que necesitan investigar muchas ideas de nombres rapidamente. Puedes pegar un nombre, una lista masiva, ideas separadas por comas o dominios completos, y comparar varias terminaciones."],
          ["Para quien es", "Esta pensado para fundadores, emprendedores, marketers, agencias, creadores e investigadores de dominios. Sirve como verificador de dominios masivo, comprobador por lotes y bulk domain checker cuando quieres revisar muchas alternativas sin hacerlo una por una."],
          ["Como verifica dominios", "La herramienta usa datos publicos RDAP y senales DNS de respaldo para clasificar dominios como disponibles, ocupados o inciertos. Tus terminaciones seleccionadas, filtros e historial se guardan localmente en tu navegador."],
          ["Por que existe", "El sitio prioriza velocidad, claridad y un flujo repetible de investigacion de dominios. Ayuda a pasar de una lista de ideas de nombres a una seleccion mas clara de dominios disponibles sin abrir muchos registradores."]
        ]
      },
      privacy: {
        title: "Politica de Privacidad",
        description: "Politica de privacidad del buscador de dominios por lotes, incluyendo localStorage, consultas al servidor y datos de contacto.",
        h1: "Politica de Privacidad",
        body: [
          ["Ultima actualizacion", updated],
          ["Responsable", `El responsable de este sitio web es ${legalOwner.name}, RUT ${legalOwner.rut}, con domicilio en ${legalOwner.address}. Telefono de contacto: ${legalOwner.phone}.`],
          ["Datos tratados", "La herramienta puede tratar los dominios o nombres que ingresas, datos tecnicos de solicitud como direccion IP, navegador y registros del servidor, y preferencias locales guardadas en tu navegador. El historial de busquedas se guarda en localStorage en tu dispositivo."],
          ["Finalidad", "Los datos se usan para prestar la herramienta de verificacion de dominios, mantener seguridad, prevenir abuso, mejorar estabilidad y recordar preferencias como TLDs seleccionados, idioma, filtros e historial local."],
          ["Base y normativa", "El tratamiento se basa en la solicitud del usuario al usar la herramienta, el interes legitimo de operar y proteger el sitio, y la normativa aplicable sobre datos personales en Chile, incluyendo la Ley 19.628 y sus modificaciones cuando corresponda."],
          ["Servicios de terceros", "Las consultas de disponibilidad pueden enviarse a servicios RDAP publicos de registros y a infraestructura DNS. Estos servicios son necesarios para verificar dominios y pueden recibir el dominio consultado y datos tecnicos normales de la solicitud."],
          ["Conservacion", "Los datos en localStorage permanecen en tu navegador hasta que los elimines. Los registros del servidor, si el hosting los mantiene, deberian conservarse solo por motivos operativos, de seguridad o legales durante un plazo razonable."],
          ["Derechos", `Puedes solicitar informacion, correccion o eliminacion de datos personales contactando a ${legalOwner.name} al telefono ${legalOwner.phone}.`],
          ["Nota", "Esta politica es una base funcional para esta herramienta y conviene revisarla con un profesional calificado antes de una explotacion comercial a gran escala."]
        ]
      },
      cookies: {
        title: "Politica de Cookies",
        description: "Politica de cookies y almacenamiento local del buscador de dominios por lotes.",
        h1: "Politica de Cookies",
        body: [
          ["Ultima actualizacion", updated],
          ["Que son las cookies", "Las cookies y tecnologias similares permiten que un sitio recuerde informacion en tu navegador, como preferencias, configuraciones o decisiones de uso."],
          ["Que usa este sitio", "Actualmente la herramienta usa localStorage para recordar terminaciones de dominio seleccionadas, el filtro de solo disponibles y el historial local. Son preferencias funcionales para facilitar busquedas por lotes, masivas o bulk."],
          ["Analitica y publicidad", "La app actual no necesita cookies publicitarias ni de analitica para funcionar. Si se agregan analiticas, anuncios o tracking de afiliados en el futuro, esta politica deberia actualizarse y agregarse consentimiento cuando sea necesario."],
          ["Como controlar el almacenamiento", "Puedes borrar localStorage, cookies y datos del sitio desde la configuracion de tu navegador. Al hacerlo se eliminaran TLDs seleccionados, filtros e historial guardados en tu dispositivo."],
          ["Responsable", `${legalOwner.name}, RUT ${legalOwner.rut}, ${legalOwner.address}. Telefono: ${legalOwner.phone}.`]
        ]
      },
      legal: {
        title: "Aviso Legal",
        description: "Aviso legal y condiciones basicas de uso del buscador de dominios por lotes.",
        h1: "Aviso Legal",
        body: [
          ["Titular del sitio", `${legalOwner.name}, RUT ${legalOwner.rut}, domicilio: ${legalOwner.address}. Telefono: ${legalOwner.phone}.`],
          ["Objeto del sitio", "Este sitio ofrece una herramienta gratuita para verificar disponibilidad de dominios en busquedas individuales, por lotes, busqueda masiva o bulk, usando las terminaciones seleccionadas por el usuario."],
          ["Sin garantia de registro", "Los resultados son informativos. La disponibilidad de un dominio puede cambiar en cualquier momento y depender del registro, registrador, reglas de dominios premium, nombres reservados, restricciones o errores temporales de RDAP/DNS. Un dominio solo debe considerarse asegurado cuando se registra correctamente con un registrador acreditado."],
          ["Uso aceptable", "No esta permitido sobrecargar, abusar, automatizar agresivamente, interferir, descompilar o usar el servicio para fines ilicitos. El operador puede limitar o bloquear trafico que afecte la estabilidad o incumpla un uso razonable."],
          ["Servicios externos", "La herramienta puede consultar servicios RDAP y DNS publicos operados por terceros. El operador no es responsable por caidas, limites, datos incorrectos o politicas de esos terceros."],
          ["Responsabilidad", "La herramienta se entrega tal como esta. En la maxima medida permitida por la ley aplicable, el operador no responde por perdidas comerciales, registros no concretados, datos externos incorrectos o interrupciones del servicio."],
          ["Contexto legal", "Este aviso esta pensado para un sitio operado desde Chile y puede requerir adaptaciones si el servicio se explota comercialmente en otros paises."]
        ]
      }
    }
  };

  return pages[lang][page];
}

function renderContentPage(route, req) {
  const routeInfo = contentRoutes[route];
  const lang = routeInfo.lang;
  const copy = pageCopy[lang];
  const page = getContentPage(lang, routeInfo.page);
  const baseUrl = getBaseUrl(req);
  const canonicalUrl = `${baseUrl}${route}`;
  const alternateUrl = `${baseUrl}${routeInfo.alternate}`;
  const homeUrl = lang === "es" ? "/es" : "/";
  const aboutUrl = lang === "es" ? "/es/sobre-nosotros" : "/about";
  const privacyUrl = lang === "es" ? "/es/privacidad" : "/privacy";
  const cookiesUrl = lang === "es" ? "/es/cookies" : "/cookies";
  const legalUrl = lang === "es" ? "/es/aviso-legal" : "/legal";
  const sections = page.body.map(([title, text]) => `
        <section>
          <h2>${escapeHtml(title)}</h2>
          <p>${escapeHtml(text)}</p>
        </section>`).join("");
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: page.title,
    url: canonicalUrl,
    inLanguage: lang,
    description: page.description,
    isPartOf: {
      "@type": "WebSite",
      name: copy.name,
      url: `${baseUrl}${homeUrl}`
    }
  };

  return `<!doctype html>
<html lang="${lang}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(page.title)}</title>
    <meta name="description" content="${escapeHtml(page.description)}">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="${escapeHtml(canonicalUrl)}">
    <link rel="alternate" hreflang="${lang === "es" ? "es" : "en"}" href="${escapeHtml(canonicalUrl)}">
    <link rel="alternate" hreflang="${lang === "es" ? "en" : "es"}" href="${escapeHtml(alternateUrl)}">
    ${lang === "es" ? `<link rel="alternate" hreflang="es-CL" href="${escapeHtml(canonicalUrl)}">
    <link rel="alternate" hreflang="es-MX" href="${escapeHtml(canonicalUrl)}">
    <link rel="alternate" hreflang="es-ES" href="${escapeHtml(canonicalUrl)}">` : ""}
    <script type="application/ld+json">${JSON.stringify(schema).replace(/</g, "\\u003c")}</script>
    <link rel="icon" href="/favicon.ico" sizes="any">
    <link rel="stylesheet" href="/styles.css">
  </head>
  <body>
    <nav class="site-nav" aria-label="Main navigation">
      <div class="nav-inner">
        <a class="brand" href="${homeUrl}">${escapeHtml(copy.brandName)}</a>
        <div class="nav-actions">
          <a class="nav-link" href="${homeUrl}">${escapeHtml(copy.homeLink)}</a>
          <a class="nav-link" href="${lang === "es" ? routeInfo.alternate : routeInfo.alternate}">${lang === "es" ? "English" : "Español"}</a>
        </div>
      </div>
    </nav>
    <main class="shell">
      <header class="topbar">
        <div>
          <p class="eyebrow">${escapeHtml(copy.eyebrow)}</p>
          <h1><a href="${homeUrl}">${escapeHtml(page.h1)}</a></h1>
          <p class="intro">${escapeHtml(page.description)}</p>
        </div>
        <a class="ghost-link" href="${homeUrl}">${lang === "es" ? "Volver a la herramienta" : "Back to the tool"}</a>
      </header>
      <article class="content-page">
        ${sections}
      </article>
    </main>
    <footer class="site-footer">
      <div class="footer-inner">
        <span>${escapeHtml(copy.footerTagline)}</span>
        <nav aria-label="Footer">
          <a href="/">English</a>
          <a href="/es">Español</a>
          <a href="${aboutUrl}">${escapeHtml(copy.footerAbout)}</a>
          <a href="${privacyUrl}">${escapeHtml(copy.footerPrivacy)}</a>
          <a href="${cookiesUrl}">${escapeHtml(copy.footerCookies)}</a>
          <a href="${legalUrl}">${escapeHtml(copy.footerLegal)}</a>
        </nav>
      </div>
    </footer>
  </body>
</html>`;
}

function normalizeDomain(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split("/")[0]
    .replace(/^\.+|\.+$/g, "");
}

function isDomain(value) {
  return /^(?!-)(?:[a-z0-9-]{1,63}\.)+[a-z]{2,63}$/.test(value);
}

function getTld(domain) {
  return domain.split(".").pop();
}

function withTrailingSlash(value) {
  return value.endsWith("/") ? value : `${value}/`;
}

async function fetchWithTimeout(url, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      headers: { accept: "application/rdap+json, application/json" },
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function getRdapBootstrap() {
  if (!rdapBootstrapPromise) {
    rdapBootstrapPromise = fetchWithTimeout(rdapBootstrapUrl, 3500)
      .then((response) => (response.ok ? response.json() : null))
      .catch(() => null);
  }

  return rdapBootstrapPromise;
}

async function getRdapUrls(domain) {
  const tld = getTld(domain);
  const bootstrap = await getRdapBootstrap();
  const urls = [];

  if (bootstrap?.services) {
    for (const service of bootstrap.services) {
      const tlds = service[0] || [];
      const endpoints = service[1] || [];
      if (tlds.includes(tld)) {
        urls.push(...endpoints.map((endpoint) => `${withTrailingSlash(endpoint)}domain/${encodeURIComponent(domain)}`));
        break;
      }
    }
  }

  urls.push(`${rdapFallbackUrl}domain/${encodeURIComponent(domain)}`);
  return [...new Set(urls)];
}

async function queryRdap(domain) {
  const urls = await getRdapUrls(domain);
  let lastDetail = "RDAP no respondio";

  for (const url of urls) {
    try {
      const response = await fetchWithTimeout(url, rdapTimeoutMs);

      if (response.status === 404) {
        return { domain, status: "available", label: "Disponible" };
      }

      if (response.ok) {
        return { domain, status: "taken", label: "Ocupado" };
      }

      lastDetail = `RDAP respondio ${response.status}`;
    } catch (error) {
      lastDetail = error.name === "AbortError" ? "Tiempo de espera RDAP" : "No se pudo consultar RDAP";
    }
  }

  return { domain, status: "unknown", label: "Incierto", detail: lastDetail };
}

async function checkDnsFallback(domain) {
  const lookups = [resolveNs(domain), resolveSoa(domain), resolve4(domain)];
  const firstResolved = Promise.any(lookups).catch(() => null);
  const allSettled = Promise.allSettled(lookups);
  const timeout = new Promise((resolve) => {
    setTimeout(() => resolve({ timedOut: true }), dnsTimeoutMs);
  });

  const result = await Promise.race([
    firstResolved,
    allSettled,
    timeout
  ]);

  if (Array.isArray(result) && result.every((item) => item.status === "rejected" && ["ENOTFOUND", "ENODATA"].includes(item.reason?.code))) {
    return {
      domain,
      status: "available",
      label: "Disponible",
      detail: "RDAP no confirmo, pero DNS devuelve NXDOMAIN"
    };
  }

  if (!Array.isArray(result) && !result?.timedOut) {
    return {
      domain,
      status: "taken",
      label: "Ocupado",
      detail: "Confirmado por DNS"
    };
  }

  return null;
}

async function checkDomain(domain) {
  const rdapResult = await queryRdap(domain);
  if (rdapResult.status !== "unknown") return rdapResult;

  try {
    const dnsResult = await checkDnsFallback(domain);
    return dnsResult || rdapResult;
  } catch (error) {
    return {
      domain,
      status: "unknown",
      label: "Incierto",
      detail: rdapResult.detail || "No se pudo comprobar el dominio"
    };
  }
}

async function parseBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

async function handleCheck(req, res) {
  try {
    const body = await parseBody(req);
    const domains = Array.isArray(body.domains) ? body.domains : [];
    const uniqueDomains = [...new Set(domains.map(normalizeDomain).filter(isDomain))].slice(0, 150);

    if (!uniqueDomains.length) {
      sendJson(res, 400, { error: "No hay dominios validos para consultar." });
      return;
    }

    const results = [];
    const queue = [...uniqueDomains];
    const workers = Array.from({ length: Math.min(14, queue.length) }, async () => {
      while (queue.length) {
        const domain = queue.shift();
        results.push(await checkDomain(domain));
      }
    });

    await Promise.all(workers);
    const ordered = uniqueDomains.map((domain) => results.find((item) => item.domain === domain));
    sendJson(res, 200, { results: ordered });
  } catch {
    sendJson(res, 500, { error: "No se pudo procesar la busqueda." });
  }
}

async function serveStatic(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const routePath = url.pathname.replace(/\/+$/, "") || "/";
  const safePath = path.normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, "");
  const isIndexRoute = routePath === "/" || routePath === "/es";
  const filePath = path.join(publicDir, safePath === "/" ? "index.html" : safePath);

  if (contentRoutes[routePath]) {
    const html = renderContentPage(routePath, req);
    res.writeHead(200, { "Content-Type": mimeTypes[".html"] });
    res.end(html);
    return;
  }

  if (!filePath.startsWith(publicDir)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  try {
    if (isIndexRoute) {
      const template = await readFile(path.join(publicDir, "index.html"), "utf8");
      const html = renderIndexTemplate(template, routePath === "/es" ? "es" : "en", req);
      res.writeHead(200, { "Content-Type": mimeTypes[".html"] });
      res.end(html);
      return;
    }

    const data = await readFile(filePath);
    const ext = path.extname(filePath);
    res.writeHead(200, { "Content-Type": mimeTypes[ext] || "application/octet-stream" });
    res.end(data);
  } catch {
    const fallback = await readFile(path.join(publicDir, "index.html"), "utf8");
    const html = renderIndexTemplate(fallback, "en", req);
    res.writeHead(200, { "Content-Type": mimeTypes[".html"] });
    res.end(html);
  }
}

const server = http.createServer((req, res) => {
  if (req.method === "POST" && req.url === "/api/check") {
    handleCheck(req, res);
    return;
  }

  if ((req.method === "GET" || req.method === "HEAD") && req.url === "/sitemap.xml") {
    const sitemap = renderSitemap(req);
    res.writeHead(200, {
      "Content-Type": "application/xml; charset=utf-8",
      "Content-Length": Buffer.byteLength(sitemap)
    });
    if (req.method === "HEAD") {
      res.end();
      return;
    }
    res.end(sitemap);
    return;
  }

  if (req.method === "GET" || req.method === "HEAD") {
    serveStatic(req, res);
    return;
  }

  res.writeHead(405);
  res.end("Method not allowed");
});

server.listen(port, () => {
  console.log(`Domain checker running at http://localhost:${port}`);
});
