const TLD_OPTIONS = [
  "com",
  "net",
  "org",
  "io",
  "co",
  "app",
  "dev",
  "ai",
  "me",
  "info",
  "biz",
  "store",
  "shop",
  "online",
  "site",
  "xyz",
  "tech",
  "digital",
  "agency",
  "cl"
];

const I18N = {
  en: {
    seoTitle: "lotdom.com | Bulk Domain Availability Checker",
    seoDescription: "lotdom.com helps you check domain availability in bulk across .com, .net, .org, .io and more. Fast domain search for founders and marketers.",
    brandName: "lotdom.com",
    homeLink: "Home",
    eyebrow: "Bulk domain availability",
    h1: "lotdom.com Bulk Domain Checker",
    intro: "Use lotdom.com to search one domain or paste a bulk list of names, pick the extensions you care about, and quickly see which domains are available.",
    languageLabel: "Language",
    clearHistory: "Clear history",
    inputLabel: "Names or domains",
    placeholder: "brand-name\nnewproduct, startupidea.com",
    inputHelp: "One name per line, or separated by commas.",
    tldsTitle: "Extensions",
    resetTlds: "Only .com",
    checkButton: "Check availability",
    checking: "Checking...",
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
    footerTagline: "lotdom.com is a simple bulk domain search tool for fast naming research.",
    footerAbout: "About",
    footerPrivacy: "Privacy",
    footerCookies: "Cookies",
    footerLegal: "Legal notice",
    domainSingular: "domain",
    domainPlural: "domains",
    noResults: "Results will appear here.",
    noAvailable: "No available domains in these results.",
    emptyHistory: "No searches yet.",
    deleteHistoryItem: "Delete search",
    consulting: "Checking RDAP",
    invalidInput: "Add at least one valid name",
    checkedCount: "checked",
    restored: "restored",
    available: "Available",
    taken: "Taken",
    unknown: "Uncertain",
    historyDateLocale: "en"
  },
  es: {
    seoTitle: "lotdom.com | Buscador de Dominios por Lotes",
    seoDescription: "lotdom.com verifica dominios disponibles por lotes, en busqueda masiva o bulk para .com, .net, .org, .io y mas. Rapido y simple.",
    brandName: "lotdom.com",
    homeLink: "Inicio",
    eyebrow: "Disponibilidad de dominios por lotes",
    h1: "lotdom.com Buscador de Dominios por Lotes",
    intro: "Usa lotdom.com para buscar un dominio o pegar una lista masiva de nombres, elegir terminaciones y revisar rapidamente cuales estan disponibles. Tambien funciona como bulk domain checker para quienes buscan esa expresion.",
    languageLabel: "Idioma",
    clearHistory: "Limpiar historial",
    inputLabel: "Nombres o dominios",
    placeholder: "mi-marca\nproducto-nuevo, ideastartup.com",
    inputHelp: "Un nombre por linea, o separados por comas.",
    tldsTitle: "Terminaciones",
    resetTlds: "Solo .com",
    checkButton: "Buscar disponibilidad",
    checking: "Buscando...",
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
    footerTagline: "lotdom.com es una herramienta simple para buscar dominios por lotes, hacer busquedas masivas y acelerar investigaciones de nombres.",
    footerAbout: "Sobre nosotros",
    footerPrivacy: "Privacidad",
    footerCookies: "Cookies",
    footerLegal: "Aviso legal",
    domainSingular: "dominio",
    domainPlural: "dominios",
    noResults: "Los resultados apareceran aqui.",
    noAvailable: "No hay dominios disponibles en estos resultados.",
    emptyHistory: "Sin busquedas todavia.",
    deleteHistoryItem: "Borrar busqueda",
    consulting: "Consultando RDAP",
    invalidInput: "Agrega al menos un nombre valido",
    checkedCount: "revisados",
    restored: "restaurados",
    available: "Disponible",
    taken: "Ocupado",
    unknown: "Incierto",
    historyDateLocale: "es"
  }
};

const storageKeys = {
  tlds: "domainChecker:selectedTlds",
  history: "domainChecker:history",
  availableOnly: "domainChecker:availableOnly"
};

const state = {
  language: window.__INITIAL_LANG__ || (location.pathname.startsWith("/es") ? "es" : "en"),
  selectedTlds: loadSelectedTlds(),
  availableOnly: loadAvailableOnly(),
  history: loadHistory(),
  results: []
};

const elements = {
  tldGrid: document.querySelector("#tldGrid"),
  domainInput: document.querySelector("#domainInput"),
  previewCount: document.querySelector("#previewCount"),
  checkButton: document.querySelector("#checkButton"),
  clearButton: document.querySelector("#clearButton"),
  resetTldsButton: document.querySelector("#resetTldsButton"),
  availableOnlyToggle: document.querySelector("#availableOnlyToggle"),
  languageSelect: document.querySelector("#languageSelect"),
  clearHistoryButton: document.querySelector("#clearHistoryButton"),
  results: document.querySelector("#results"),
  history: document.querySelector("#history"),
  historyCount: document.querySelector("#historyCount"),
  statusText: document.querySelector("#statusText"),
  footerAboutLink: document.querySelector("#footerAboutLink"),
  footerPrivacyLink: document.querySelector("#footerPrivacyLink"),
  footerCookiesLink: document.querySelector("#footerCookiesLink"),
  footerLegalLink: document.querySelector("#footerLegalLink"),
  homeLink: document.querySelector("#homeLink"),
  heroHomeLink: document.querySelector("#heroHomeLink")
};

function loadSelectedTlds() {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKeys.tlds));
    if (Array.isArray(stored) && stored.length) return stored;
  } catch {}
  return ["com"];
}

function loadHistory() {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKeys.history));
    return Array.isArray(stored) ? stored : [];
  } catch {}
  return [];
}

function loadAvailableOnly() {
  return localStorage.getItem(storageKeys.availableOnly) === "true";
}

function saveSelectedTlds() {
  localStorage.setItem(storageKeys.tlds, JSON.stringify(state.selectedTlds));
}

function saveAvailableOnly() {
  localStorage.setItem(storageKeys.availableOnly, String(state.availableOnly));
}

function saveHistory() {
  localStorage.setItem(storageKeys.history, JSON.stringify(state.history));
}

function t(key) {
  return I18N[state.language][key] || I18N.en[key] || key;
}

function applyLanguage(pushUrl = false) {
  document.documentElement.lang = state.language;
  document.title = t("seoTitle");
  const description = document.querySelector("meta[name='description']");
  const ogTitle = document.querySelector("meta[property='og:title']");
  const ogDescription = document.querySelector("meta[property='og:description']");
  if (description) description.setAttribute("content", t("seoDescription"));
  if (ogTitle) ogTitle.setAttribute("content", t("seoTitle"));
  if (ogDescription) ogDescription.setAttribute("content", t("seoDescription"));

  document.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });
  elements.domainInput.placeholder = t("placeholder");
  elements.languageSelect.value = state.language;
  elements.footerAboutLink.href = state.language === "es" ? "/es/sobre-nosotros" : "/about";
  elements.footerPrivacyLink.href = state.language === "es" ? "/es/privacidad" : "/privacy";
  elements.footerCookiesLink.href = state.language === "es" ? "/es/cookies" : "/cookies";
  elements.footerLegalLink.href = state.language === "es" ? "/es/aviso-legal" : "/legal";
  elements.homeLink.href = state.language === "es" ? "/es" : "/";
  elements.heroHomeLink.href = state.language === "es" ? "/es" : "/";

  if (pushUrl) {
    history.pushState({}, "", state.language === "es" ? "/es" : "/");
  }

  renderPreviewCount();
  renderResults();
  renderHistory();
}

function parseInput(value) {
  return value
    .split(/[\n,;]+/)
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function cleanName(value) {
  return value
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split("/")[0]
    .replace(/^\.+|\.+$/g, "")
    .replace(/\s+/g, "-");
}

function buildDomainList() {
  const rawItems = parseInput(elements.domainInput.value).map(cleanName).filter(Boolean);
  const domains = rawItems.flatMap((item) => {
    const parts = item.split(".");
    const baseName = parts.length > 1 ? parts.slice(0, -1).join(".") : item;
    const selectedDomains = state.selectedTlds.map((tld) => `${baseName}.${tld}`);

    return parts.length > 1 ? [item, ...selectedDomains] : selectedDomains;
  });

  return [...new Set(domains)].filter((domain) => /^(?!-)(?:[a-z0-9-]{1,63}\.)+[a-z]{2,63}$/.test(domain));
}

function renderTlds() {
  elements.tldGrid.innerHTML = TLD_OPTIONS.map((tld) => {
    const checked = state.selectedTlds.includes(tld) ? "checked" : "";
    return `
      <label class="tld-chip">
        <input type="checkbox" value="${tld}" ${checked}>
        <span>.${tld}</span>
      </label>
    `;
  }).join("");
}

function renderPreviewCount() {
  const count = buildDomainList().length;
  elements.previewCount.textContent = `${count} ${count === 1 ? t("domainSingular") : t("domainPlural")}`;
}

function renderResults() {
  if (!state.results.length) {
    elements.results.innerHTML = `<div class="empty">${escapeHtml(t("noResults"))}</div>`;
    return;
  }

  const visibleResults = state.availableOnly
    ? state.results.filter((result) => result.status === "available")
    : state.results;

  if (!visibleResults.length) {
    elements.results.innerHTML = `<div class="empty">${escapeHtml(t("noAvailable"))}</div>`;
    return;
  }

  elements.results.innerHTML = visibleResults.map((result) => `
    <div class="result-row">
      <span class="domain">${escapeHtml(result.domain)}</span>
      <span class="badge ${result.status}" title="${escapeHtml(result.detail || "")}">${escapeHtml(getStatusLabel(result.status))}</span>
    </div>
  `).join("");
}

function renderHistory() {
  elements.historyCount.textContent = state.history.length;

  if (!state.history.length) {
    elements.history.innerHTML = `<div class="empty">${escapeHtml(t("emptyHistory"))}</div>`;
    return;
  }

  elements.history.innerHTML = state.history.map((entry, index) => `
    <div class="history-item">
      <button class="history-restore" type="button" data-index="${index}">
        <span class="history-meta">
          <span class="history-title">${escapeHtml(entry.query)}</span>
          <span class="history-subtitle">${entry.count} ${entry.count === 1 ? t("domainSingular") : t("domainPlural")} - ${escapeHtml(entry.tlds.map((tld) => `.${tld}`).join(", "))}</span>
        </span>
        <span class="history-subtitle">${escapeHtml(entry.date)}</span>
      </button>
      <button class="history-delete" type="button" data-index="${index}" aria-label="${escapeHtml(t("deleteHistoryItem"))}" title="${escapeHtml(t("deleteHistoryItem"))}">x</button>
    </div>
  `).join("");
}

function setLoading(isLoading) {
  elements.checkButton.disabled = isLoading;
  elements.checkButton.textContent = isLoading ? t("checking") : t("checkButton");
  if (isLoading) elements.statusText.textContent = t("consulting");
}

function getStatusLabel(status) {
  if (status === "available") return t("available");
  if (status === "taken") return t("taken");
  return t("unknown");
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function addToHistory(domains) {
  const rawQuery = elements.domainInput.value.trim();
  const entry = {
    query: rawQuery.split(/\n/).join(", "),
    input: elements.domainInput.value,
    tlds: [...state.selectedTlds],
    count: domains.length,
    results: state.results,
    date: new Intl.DateTimeFormat(t("historyDateLocale"), {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date())
  };

  state.history = [entry, ...state.history].slice(0, 30);
  saveHistory();
  renderHistory();
}

async function checkDomains() {
  const domains = buildDomainList();
  renderPreviewCount();

  if (!domains.length) {
    elements.statusText.textContent = t("invalidInput");
    return;
  }

  setLoading(true);
  state.results = [];
  renderResults();

  try {
    const response = await fetch("/api/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domains })
    });
    const data = await response.json();

    if (!response.ok) throw new Error(data.error || "Error checking domains");
    state.results = data.results;
    elements.statusText.textContent = `${data.results.length} ${t("checkedCount")}`;
    renderResults();
    addToHistory(domains);
  } catch (error) {
    elements.statusText.textContent = error.message;
    state.results = [];
    renderResults();
  } finally {
    setLoading(false);
  }
}

elements.tldGrid.addEventListener("change", (event) => {
  if (!event.target.matches("input[type='checkbox']")) return;
  const checked = [...elements.tldGrid.querySelectorAll("input:checked")].map((input) => input.value);
  state.selectedTlds = checked.length ? checked : ["com"];
  saveSelectedTlds();
  renderTlds();
  renderPreviewCount();
});

elements.resetTldsButton.addEventListener("click", () => {
  state.selectedTlds = ["com"];
  saveSelectedTlds();
  renderTlds();
  renderPreviewCount();
});
elements.availableOnlyToggle.addEventListener("change", () => {
  state.availableOnly = elements.availableOnlyToggle.checked;
  saveAvailableOnly();
  renderResults();
});
elements.languageSelect.addEventListener("change", () => {
  state.language = elements.languageSelect.value === "es" ? "es" : "en";
  applyLanguage(true);
});
window.addEventListener("popstate", () => {
  state.language = location.pathname.startsWith("/es") ? "es" : "en";
  applyLanguage(false);
});
elements.domainInput.addEventListener("input", renderPreviewCount);
elements.checkButton.addEventListener("click", checkDomains);
elements.clearButton.addEventListener("click", () => {
  elements.domainInput.value = "";
  state.results = [];
  elements.statusText.textContent = t("ready");
  renderPreviewCount();
  renderResults();
});
elements.clearHistoryButton.addEventListener("click", () => {
  state.history = [];
  saveHistory();
  renderHistory();
});
elements.history.addEventListener("click", (event) => {
  const deleteButton = event.target.closest(".history-delete");
  if (deleteButton) {
    const index = Number(deleteButton.dataset.index);
    if (!Number.isInteger(index)) return;
    state.history.splice(index, 1);
    saveHistory();
    renderHistory();
    return;
  }

  const item = event.target.closest(".history-restore");
  if (!item) return;
  const entry = state.history[Number(item.dataset.index)];
  if (!entry) return;
  elements.domainInput.value = entry.input;
  state.selectedTlds = entry.tlds;
  state.results = entry.results || [];
  saveSelectedTlds();
  renderTlds();
  renderPreviewCount();
  renderResults();
  elements.statusText.textContent = `${state.results.length} ${t("restored")}`;
});

renderTlds();
elements.availableOnlyToggle.checked = state.availableOnly;
applyLanguage(false);
