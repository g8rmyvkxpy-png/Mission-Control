import { useState, useEffect, useRef } from "react";

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const MOCK_RESPONSES = {
  bizverify_gstin: (q) => ({
    status: "success", module: "BizVerify / GSTIN",
    data: {
      gstin: q || "27AAPFU0939F1ZV", legal_name: "Urban Ladder Home Decor Solutions Pvt Ltd",
      trade_name: "Urban Ladder", status: "Active", registration_date: "2012-04-01",
      business_type: "Private Limited Company", state: "Maharashtra",
      filing_compliance: "94.2%", last_filed: "2025-02-15",
      hsn_codes: ["9403", "9404", "6304"], annual_turnover_band: "₹100Cr – ₹500Cr", compliance_score: 91,
    },
    ai_summary: "Urban Ladder Home Decor Solutions Pvt Ltd holds an active GSTIN in Maharashtra with a strong compliance rate of 94.2%. They operate in the furniture and furnishings sector (HSN 9403/9404). Last filing was February 2025. No adverse flags detected. Compliance score: 91/100 — low risk for vendor onboarding.",
    confidence: 0.96, sources: ["gstn.gov.in", "mca.gov.in"], credits_used: 1, latency_ms: 312,
  }),
  bizverify_company: (q) => ({
    status: "success", module: "BizVerify / Company",
    data: {
      cin: "U51900MH2006PLC166166", company_name: q || "Reliance Retail Ventures Ltd",
      status: "Active", incorporated: "2006-01-10", roc: "RoC-Mumbai",
      authorised_capital: "₹5,00,00,00,000", paid_up_capital: "₹4,81,47,03,000",
      directors: [
        { name: "Mukesh D Ambani", din: "00001695", status: "Active" },
        { name: "Isha M Ambani", din: "06984175", status: "Active" },
        { name: "Akash M Ambani", din: "06984194", status: "Active" },
      ],
      charges_outstanding: 0, last_agm: "2024-09-28", compliance_score: 97,
    },
    ai_summary: "Reliance Retail Ventures Ltd (CIN: U51900MH2006PLC166166) is an active private limited company incorporated in Mumbai in 2006. It has a paid-up capital of ₹4,814 Cr with zero outstanding charges. Three active directors on record including Mukesh Ambani. Last AGM filed September 2024. Compliance score 97/100 — excellent standing.",
    confidence: 0.99, sources: ["mca.gov.in"], credits_used: 2, latency_ms: 287,
  }),
  lexintel_case: (q) => ({
    status: "success", module: "LexIntel / Court Cases",
    data: {
      query: q || "Sharma Textiles vs HDFC Bank", cases_found: 2,
      cases: [
        { cnr: "MHCC010234562022", court: "Bombay High Court", filing_date: "2022-03-14", status: "Disposed", type: "Civil — Recovery of Money", petitioner: "Sharma Textiles Pvt Ltd", respondent: "HDFC Bank Ltd", last_hearing: "2023-11-08", next_hearing: null, orders: 14, result: "Settled out of court" },
        { cnr: "MHDC020045672021", court: "District Court, Mumbai", filing_date: "2021-07-22", status: "Active", type: "Civil — Cheque Dishonour (Sec 138)", petitioner: "Sharma Textiles Pvt Ltd", respondent: "Ratan Traders", last_hearing: "2025-01-20", next_hearing: "2025-04-14", orders: 8, result: null },
      ],
    },
    ai_summary: "2 cases found for 'Sharma Textiles'. One disposed Bombay High Court matter (HDFC Bank, settled 2023) and one active District Court cheque dishonour case with next hearing April 2025. No NCLT insolvency proceedings. No wilful defaulter designation. Risk flag: Minor — one active litigation.",
    confidence: 0.91, sources: ["services.ecourts.gov.in"], credits_used: 3, latency_ms: 521,
  }),
  lexintel_trademark: (q) => ({
    status: "success", module: "LexIntel / Trademark",
    data: {
      query: q || "BharatIntel",
      results: [{ application_no: "5234891", mark: "BHARATINTEL", class: "42 — Software & IT Services", status: "Objected", applicant: "PP Ventures Technology LLP", filing_date: "2025-01-15", examination_report: "2025-03-02" }],
      similar_marks: [],
    },
    ai_summary: "Trademark 'BHARATINTEL' filed under Class 42 by PP Ventures Technology LLP in January 2025 — currently objected pending examination response. No conflicting similar marks found in Class 42. Recommended action: respond to examination report by due date.",
    confidence: 0.95, sources: ["ipindiaonline.gov.in"], credits_used: 2, latency_ms: 398,
  }),
  regradar_latest: () => ({
    status: "success", module: "RegRadar / Latest Circulars",
    data: {
      regulator: "RBI", updates: [
        { id: "RBI/2025-26/47", title: "Master Direction – RBI (Regulatory Framework for Microfinance Loans) Directions, 2025", date: "2025-03-01", category: "Circular", impact_score: 8.4, summary: "Revised income assessment methodology for microfinance borrowers. Loan limit raised to ₹3L per borrower.", url: "rbi.org.in", tags: ["NBFC", "MFI", "Lending"] },
        { id: "RBI/2025-26/44", title: "Guidelines on Digital Lending – Amendments to Key Fact Statement", date: "2025-02-22", category: "Circular", impact_score: 7.1, summary: "KFS must now include APR in bold at top of document. Effective from April 1, 2025.", url: "rbi.org.in", tags: ["Digital Lending", "Fintech", "KFS"] },
        { id: "SEBI/HO/MIRSD/2025/P/38", title: "Circular on ESG Rating Providers – Enhanced Disclosure Norms", date: "2025-02-18", category: "Notification", impact_score: 6.2, summary: "ESG rating agencies must now publish methodology changes 30 days in advance.", url: "sebi.gov.in", tags: ["ESG", "Rating Agencies", "Disclosure"] },
      ],
    },
    ai_summary: "3 high-impact regulatory updates retrieved. Key alert: RBI revised microfinance lending directions effective March 2025 (impact 8.4/10) — NBFCs and MFIs must update income assessment processes. SEBI's ESG disclosure norms require immediate review by rating providers. Recommend legal review of RBI/2025-26/47 within 7 days.",
    confidence: 0.99, sources: ["rbi.org.in", "sebi.gov.in"], credits_used: 1, latency_ms: 198,
  }),
  bharatsearch: (q) => ({
    status: "success", module: "BharatSearch / Web",
    data: {
      query: q || "MSME loan scheme 2025 India", language: "en",
      results: [
        { title: "PM Mudra Yojana 2025 – Loan Limit Raised to ₹20 Lakh for Tarun Plus Category", url: "pib.gov.in/pressrelease/2025/jan/p2025jan0892.html", source: "Press Information Bureau", date: "2025-01-09", snippet: "The Union Budget 2025 announced an increase in the Tarun Plus loan limit under PM Mudra from ₹10L to ₹20L for entrepreneurs with proven track records...", relevance: 0.97 },
        { title: "CGTMSE Guarantee Cover Enhanced for Women-Led MSMEs – Full Details", url: "msme.gov.in/cgtmse-enhanced-2025", source: "Ministry of MSME", date: "2025-02-14", snippet: "Credit Guarantee Trust Fund for Micro and Small Enterprises has enhanced guarantee cover to 85% for women-led enterprises under the new FY2025-26 guidelines...", relevance: 0.93 },
        { title: "SIDBI: Interest Subvention Scheme for SC/ST Entrepreneurs Extended to March 2026", url: "sidbi.in/press/2025/interest-subvention", source: "SIDBI", date: "2025-03-01", snippet: "SIDBI's direct lending arm has extended the 2% interest subvention scheme for SC/ST entrepreneurs through March 2026 with simplified documentation...", relevance: 0.89 },
      ],
      answer: "As of early 2025, key MSME loan schemes include: PM Mudra Yojana (Tarun Plus limit raised to ₹20L), CGTMSE with 85% guarantee for women entrepreneurs, and SIDBI's subvention scheme for SC/ST businesses extended through March 2026.",
    },
    ai_summary: "Search returned 3 highly relevant results on MSME loan schemes updated in 2025. Budget 2025 raised PM Mudra limits; CGTMSE improved guarantees for women-led MSMEs; SIDBI extended SC/ST subvention. Direct answer synthesised from official government sources.",
    confidence: 0.94, sources: ["pib.gov.in", "msme.gov.in", "sidbi.in"], credits_used: 2, latency_ms: 445,
  }),
};

const MODULES = [
  { id: "bizverify_gstin", label: "BizVerify", sub: "GSTIN Lookup", icon: "🏢", color: "#3B82F6", placeholder: "Enter GSTIN (e.g. 27AAPFU0939F1ZV)", endpoint: "POST /v1/biz/gstin", description: "Verify any Indian business's GST registration, compliance history, and filing score." },
  { id: "bizverify_company", label: "BizVerify", sub: "Company Search", icon: "📋", color: "#8B5CF6", placeholder: "Enter company name or CIN", endpoint: "POST /v1/biz/company", description: "Full MCA/ROC data — directors, charges, compliance score, AGM history." },
  { id: "lexintel_case", label: "LexIntel", sub: "Court Cases", icon: "⚖️", color: "#EF4444", placeholder: "Enter party name or CNR number", endpoint: "POST /v1/lex/case", description: "Search eCourt cases across District and High Courts by party name." },
  { id: "lexintel_trademark", label: "LexIntel", sub: "Trademark Search", icon: "™️", color: "#F59E0B", placeholder: "Enter brand or trademark name", endpoint: "POST /v1/lex/trademark", description: "Check IP India trademark registry — status, class, conflicts." },
  { id: "regradar_latest", label: "RegRadar", sub: "RBI / SEBI Feed", icon: "📡", color: "#10B981", placeholder: "No input needed — fetches latest", endpoint: "GET /v1/reg/latest", description: "Live regulatory updates from RBI, SEBI, MCA — with impact scores." },
  { id: "bharatsearch", label: "BharatSearch", sub: "Indian Web Search", icon: "🔍", color: "#F97316", placeholder: "Search query (supports Hindi too)", endpoint: "POST /v1/search/web", description: "AI-native Indian web search with Indic language support and synthesised answers." },
];

const CODE_SNIPPETS = {
  bizverify_gstin: {
    python: `import bharatintel as bi

client = bi.Client(api_key="bi_live_pk_IN_...")

result = client.biz.verify_gstin(
    gstin="27AAPFU0939F1ZV"
)

print(result.ai_summary)
# → "Urban Ladder holds an active GSTIN..."
print(result.data.compliance_score)  # 91`,
    typescript: `import { BharatIntelClient } from "@bharatintel/sdk";

const client = new BharatIntelClient({
  apiKey: "bi_live_pk_IN_...",
});

const result = await client.biz.verifyGstin({
  gstin: "27AAPFU0939F1ZV",
});

console.log(result.aiSummary);
console.log(result.data.complianceScore); // 91`,
    curl: `curl -X POST https://api.bharatintel.in/v1/biz/gstin \\
  -H "Authorization: Bearer bi_live_pk_IN_..." \\
  -H "Content-Type: application/json" \\
  -d '{"gstin": "27AAPFU0939F1ZV"}'`,
  },
  bizverify_company: {
    python: `result = client.biz.company_search(
    query="Reliance Retail Ventures Ltd"
)
for director in result.data.directors:
    print(f"{director['name']} — DIN {director['din']}")`,
    typescript: `const result = await client.biz.companySearch({
  query: "Reliance Retail Ventures Ltd",
});
result.data.directors.forEach(d => {
  console.log(\`\${d.name} — DIN \${d.din}\`);
});`,
    curl: `curl -X POST https://api.bharatintel.in/v1/biz/company \\
  -H "Authorization: Bearer bi_live_pk_IN_..." \\
  -d '{"query": "Reliance Retail Ventures Ltd"}'`,
  },
  lexintel_case: {
    python: `result = client.lex.case_search(
    query="Sharma Textiles vs HDFC Bank"
)
print(f"{result.data.cases_found} cases found")
for case in result.data.cases:
    print(f"{case['court']}: {case['status']}")`,
    typescript: `const result = await client.lex.caseSearch({
  query: "Sharma Textiles vs HDFC Bank",
});
result.data.cases.forEach(c => {
  console.log(\`\${c.court}: \${c.status}\`);
});`,
    curl: `curl -X POST https://api.bharatintel.in/v1/lex/case \\
  -H "Authorization: Bearer bi_live_pk_IN_..." \\
  -d '{"query": "Sharma Textiles vs HDFC Bank"}'`,
  },
  lexintel_trademark: {
    python: `result = client.lex.trademark_search(
    brand="BharatIntel"
)
for mark in result.data.results:
    print(f"{mark['mark']} — {mark['status']}")`,
    typescript: `const result = await client.lex.trademarkSearch({
  brand: "BharatIntel",
});
result.data.results.forEach(m => {
  console.log(\`\${m.mark} — \${m.status}\`);
});`,
    curl: `curl -X POST https://api.bharatintel.in/v1/lex/trademark \\
  -H "Authorization: Bearer bi_live_pk_IN_..." \\
  -d '{"brand": "BharatIntel"}'`,
  },
  regradar_latest: {
    python: `result = client.reg.latest(
    regulators=["RBI", "SEBI"],
    limit=5
)
for update in result.data.updates:
    print(f"[{update['impact_score']}] {update['title']}")`,
    typescript: `const result = await client.reg.latest({
  regulators: ["RBI", "SEBI"],
  limit: 5,
});
result.data.updates.forEach(u => {
  console.log(\`[\${u.impactScore}] \${u.title}\`);
});`,
    curl: `curl https://api.bharatintel.in/v1/reg/latest \\
  -H "Authorization: Bearer bi_live_pk_IN_..." \\
  -G -d "regulators=RBI,SEBI&limit=5"`,
  },
  bharatsearch: {
    python: `result = client.search.web(
    query="MSME loan scheme 2025 India",
    language="en",
    max_results=5
)
print(result.data.answer)
for r in result.data.results:
    print(f"[{r['relevance']:.0%}] {r['title']}")`,
    typescript: `const result = await client.search.web({
  query: "MSME loan scheme 2025 India",
  language: "en",
  maxResults: 5,
});
console.log(result.data.answer);
result.data.results.forEach(r => {
  console.log(\`[\${r.relevance}] \${r.title}\`);
});`,
    curl: `curl -X POST https://api.bharatintel.in/v1/search/web \\
  -H "Authorization: Bearer bi_live_pk_IN_..." \\
  -d '{"query":"MSME loan scheme 2025","language":"en","max_results":5}'`,
  },
};

const USAGE_DATA = [
  { day: "Mon", calls: 1240 }, { day: "Tue", calls: 1890 }, { day: "Wed", calls: 2340 },
  { day: "Thu", calls: 1760 }, { day: "Fri", calls: 2890 }, { day: "Sat", calls: 1420 }, { day: "Sun", calls: 980 },
];

const TICKER_ITEMS = [
  { tag: "RBI", text: "RBI/2025-26/47 — Microfinance loan limit raised to ₹3L", impact: 8.4, color: "#10B981" },
  { tag: "SEBI", text: "SEBI/HO/MIRSD/2025/P/38 — ESG disclosure norms enhanced", impact: 6.2, color: "#3B82F6" },
  { tag: "MCA", text: "MCA clarifies AGM extension provisions for FY 2025-26", impact: 5.1, color: "#8B5CF6" },
  { tag: "GST", text: "GST Council: E-invoicing threshold lowered to ₹5Cr turnover", impact: 7.8, color: "#F59E0B" },
  { tag: "RBI", text: "RBI/2025-26/44 — KFS APR disclosure mandate effective Apr 1", impact: 7.1, color: "#10B981" },
  { tag: "IRDAI", text: "IRDAI extends health insurance claim settlement deadline norms", impact: 4.9, color: "#EF4444" },
];

const PRICING_TIERS = [
  {
    name: "Free", price: "₹0", period: "/forever", color: "#64748B", badge: null,
    credits: "500 credits/mo", description: "Perfect for building and testing your first AI agent.",
    features: ["500 API credits/month", "All 5 modules (rate limited)", "Community support", "Swagger playground", "Response latency: standard", "DPDP compliant data hosting"],
    cta: "Start Free",
  },
  {
    name: "Starter", price: "₹2,999", period: "/month", color: "#FF6B35", badge: "Most Popular",
    credits: "10,000 credits/mo", description: "For startups and small teams building production agents.",
    features: ["10,000 API credits/month", "All 5 modules unlocked", "Email support (48h SLA)", "Python + Node.js SDKs", "P95 latency < 500ms", "MCP server access", "LangChain integration", "99.5% uptime SLA"],
    cta: "Start Free Trial",
  },
  {
    name: "Growth", price: "₹9,999", period: "/month", color: "#00C896", badge: null,
    credits: "100,000 credits/mo", description: "For scale-ups and teams with heavy agent workflows.",
    features: ["100,000 API credits/month", "All modules + RegRadar webhooks", "Priority support (4h SLA)", "Dedicated Mumbai edge node", "P95 latency < 300ms", "Custom credit top-ups", "Annual invoice for TDS", "99.9% uptime SLA", "Quarterly data partnership review"],
    cta: "Get Started",
  },
];

const DOCS_ENDPOINTS = [
  {
    section: "BizVerify", color: "#3B82F6", icon: "🏢",
    endpoints: [
      { method: "POST", path: "/v1/biz/gstin", desc: "Verify GSTIN status, filing compliance, and turnover band", credits: 1, params: [{ name: "gstin", type: "string", required: true, desc: "15-character GSTIN" }] },
      { method: "POST", path: "/v1/biz/company", desc: "MCA company lookup by name or CIN — directors, charges, AGM", credits: 2, params: [{ name: "query", type: "string", required: true, desc: "Company name or CIN" }, { name: "include_directors", type: "boolean", required: false, desc: "Include director list (default: true)" }] },
      { method: "POST", path: "/v1/biz/pan", desc: "PAN to entity cross-reference lookup", credits: 1, params: [{ name: "pan", type: "string", required: true, desc: "10-character PAN" }] },
    ],
  },
  {
    section: "LexIntel", color: "#EF4444", icon: "⚖️",
    endpoints: [
      { method: "POST", path: "/v1/lex/case", desc: "Search eCourt cases by party name or CNR number", credits: 3, params: [{ name: "query", type: "string", required: true, desc: "Party name or CNR" }, { name: "courts", type: "array", required: false, desc: "Filter by court type" }] },
      { method: "POST", path: "/v1/lex/trademark", desc: "IP India trademark registry — status, class, conflicts", credits: 2, params: [{ name: "brand", type: "string", required: true, desc: "Brand or trademark name" }, { name: "class", type: "integer", required: false, desc: "Nice classification (1–45)" }] },
    ],
  },
  {
    section: "RegRadar", color: "#10B981", icon: "📡",
    endpoints: [
      { method: "GET", path: "/v1/reg/latest", desc: "Latest regulatory circulars from RBI, SEBI, MCA, IRDAI", credits: 1, params: [{ name: "regulators", type: "string", required: false, desc: "Comma-separated: RBI,SEBI,MCA" }, { name: "limit", type: "integer", required: false, desc: "Results per page (default: 10)" }] },
      { method: "GET", path: "/v1/reg/search", desc: "Full-text search across regulatory archive", credits: 2, params: [{ name: "q", type: "string", required: true, desc: "Search query" }, { name: "date_from", type: "date", required: false, desc: "Filter from date (YYYY-MM-DD)" }] },
    ],
  },
  {
    section: "BharatSearch", color: "#F97316", icon: "🔍",
    endpoints: [
      { method: "POST", path: "/v1/search/web", desc: "AI-native Indian web search with Indic language support", credits: 2, params: [{ name: "query", type: "string", required: true, desc: "Search query (any Indic language)" }, { name: "language", type: "string", required: false, desc: "en, hi, ta, te, bn, mr (default: en)" }, { name: "max_results", type: "integer", required: false, desc: "1–10 (default: 5)" }] },
    ],
  },
];

// ─── COMPONENTS ───────────────────────────────────────────────────────────────

function LatencyBadge({ ms }) {
  const color = ms < 350 ? "#00C896" : ms < 600 ? "#F59E0B" : "#EF4444";
  const label = ms < 350 ? "fast" : ms < 600 ? "normal" : "slow";
  return (
    <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, color, border: `1px solid ${color}30`, padding: "2px 8px", borderRadius: 4 }}>
      {ms}ms <span style={{ opacity: 0.6 }}>{label}</span>
    </span>
  );
}

function JsonHighlight({ data }) {
  const json = JSON.stringify(data, null, 2);
  return (
    <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12, lineHeight: 1.75 }}>
      {json.split("\n").map((line, i) => {
        if (line.match(/"status".*"success"/)) return <div key={i} style={{ color: "#00C896" }}>{line}</div>;
        if (line.match(/"latency_ms"/)) return <div key={i} style={{ color: "#F59E0B" }}>{line}</div>;
        if (line.match(/"confidence"/)) return <div key={i} style={{ color: "#A78BFA" }}>{line}</div>;
        if (line.match(/"ai_summary"/)) return <div key={i} style={{ color: "#FF6B35" }}>{line}</div>;
        const keyMatch = line.match(/^(\s*)("[\w_]+")\s*:/);
        if (keyMatch) {
          const rest = line.slice(keyMatch[1].length + keyMatch[2].length + 1);
          const isStr = rest.trim().startsWith('"');
          const isNum = rest.trim().match(/^[\d.]/);
          return (
            <div key={i}>
              <span style={{ color: "#475569" }}>{keyMatch[1]}</span>
              <span style={{ color: "#7DD3FC" }}>{keyMatch[2]}</span>
              <span style={{ color: "#475569" }}>:</span>
              <span style={{ color: isStr ? "#86EFAC" : isNum ? "#FCD34D" : "#E2E8F0" }}>{rest}</span>
            </div>
          );
        }
        return <div key={i} style={{ color: "#334155" }}>{line}</div>;
      })}
    </div>
  );
}

function CodeBlock({ code, lang }) {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard?.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const tokenize = (line, lang) => {
    if (lang === "python") {
      return line
        .replace(/(#.*)$/, '<span style="color:#475569">$1</span>')
        .replace(/\b(import|from|def|return|for|in|print|if|else)\b/g, '<span style="color:#C084FC">$1</span>')
        .replace(/"([^"]*)"/g, '<span style="color:#86EFAC">"$1"</span>')
        .replace(/\b(\d[\d.]*)\b/g, '<span style="color:#FCD34D">$1</span>');
    }
    if (lang === "typescript") {
      return line
        .replace(/(\/\/.*)$/, '<span style="color:#475569">$1</span>')
        .replace(/\b(const|await|import|from|new|forEach|console)\b/g, '<span style="color:#7DD3FC">$1</span>')
        .replace(/"([^"]*)"/g, '<span style="color:#86EFAC">"$1"</span>')
        .replace(/`([^`]*)`/g, '<span style="color:#FCD34D">`$1`</span>');
    }
    if (lang === "curl") {
      return line
        .replace(/(curl|-X|-H|-d|-G)\b/g, '<span style="color:#FF6B35">$1</span>')
        .replace(/'([^']*)'/g, '<span style="color:#86EFAC">\'$1\'</span>')
        .replace(/(https?:\/\/[^\s\\]+)/g, '<span style="color:#7DD3FC">$1</span>');
    }
    return line;
  };
  return (
    <div style={{ position: "relative", background: "#060D1A", borderRadius: 10, overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 14px", background: "#0A1428", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10, color: "#475569", textTransform: "uppercase", letterSpacing: "0.1em" }}>{lang}</span>
        <button onClick={copy} style={{ background: copied ? "rgba(0,200,150,0.15)" : "rgba(255,255,255,0.05)", border: `1px solid ${copied ? "rgba(0,200,150,0.3)" : "rgba(255,255,255,0.1)"}`, color: copied ? "#00C896" : "#64748B", padding: "3px 10px", borderRadius: 4, fontSize: 11, cursor: "pointer", fontFamily: "JetBrains Mono, monospace" }}>
          {copied ? "✓ copied" : "copy"}
        </button>
      </div>
      <div style={{ padding: "14px 16px", overflowX: "auto" }}>
        {code.split("\n").map((line, i) => (
          <div key={i} style={{ display: "flex", gap: 16, lineHeight: 1.75 }}>
            <span style={{ color: "#1E293B", fontFamily: "JetBrains Mono, monospace", fontSize: 11, userSelect: "none", minWidth: 20, textAlign: "right" }}>{i + 1}</span>
            <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12, color: "#94A3B8" }} dangerouslySetInnerHTML={{ __html: tokenize(line, lang) }} />
          </div>
        ))}
      </div>
    </div>
  );
}

function UsageBar({ data }) {
  const max = Math.max(...data.map(d => d.calls));
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 72, padding: "0 4px" }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 9, color: "#334155" }}>{d.calls >= 1000 ? `${(d.calls / 1000).toFixed(1)}k` : d.calls}</span>
          <div style={{ width: "100%", height: `${(d.calls / max) * 100}%`, background: i === 4 ? "linear-gradient(to top, #FF6B35, #FF9A3C)" : "rgba(255,107,53,0.2)", borderRadius: "3px 3px 0 0", minHeight: 4, transition: "all 0.4s ease", boxShadow: i === 4 ? "0 0 10px rgba(255,107,53,0.4)" : "none" }} />
          <span style={{ fontSize: 10, color: "#334155", fontFamily: "JetBrains Mono, monospace" }}>{d.day}</span>
        </div>
      ))}
    </div>
  );
}

function RegTicker() {
  const [pos, setPos] = useState(0);
  const containerRef = useRef(null);
  useEffect(() => {
    const id = setInterval(() => setPos(p => p - 1), 30);
    return () => clearInterval(id);
  }, []);
  const totalWidth = TICKER_ITEMS.length * 420;
  const loopedPos = ((pos % totalWidth) + totalWidth) % totalWidth;
  return (
    <div style={{ background: "#0A1428", borderTop: "1px solid rgba(255,107,53,0.15)", borderBottom: "1px solid rgba(255,107,53,0.15)", padding: "8px 0", overflow: "hidden", position: "relative" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 0, whiteSpace: "nowrap", transform: `translateX(-${loopedPos % totalWidth}px)`, willChange: "transform" }}>
        {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
          <div key={i} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "0 28px" }}>
            <span style={{ background: `${item.color}20`, color: item.color, fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 3, fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.06em" }}>{item.tag}</span>
            <span style={{ color: "#94A3B8", fontSize: 12 }}>{item.text}</span>
            <span style={{ color: item.color, fontSize: 11, fontFamily: "JetBrains Mono, monospace" }}>↑{item.impact}</span>
            <span style={{ color: "#1E293B", fontSize: 16 }}>·</span>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 48, background: "linear-gradient(to right, #0A1428, transparent)" }} />
      <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 48, background: "linear-gradient(to left, #0A1428, transparent)" }} />
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function BharatIntelMVP() {
  const [activeTab, setActiveTab] = useState("landing");
  const [selectedModule, setSelectedModule] = useState(MODULES[0]);
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiKey] = useState("bi_live_pk_IN_52e15535c78dbafea0d87f9ab124281d6af160819c9ba318");
  const [keyVisible, setKeyVisible] = useState(false);
  const [keyCopied, setKeyCopied] = useState(false);
  const [jsonCopied, setJsonCopied] = useState(false);
  const [showDot, setShowDot] = useState(true);
  const [codeLang, setCodeLang] = useState("python");
  const [history, setHistory] = useState([]);
  const [expandedDoc, setExpandedDoc] = useState(null);
  const responseRef = useRef(null);

  // Backend configuration
  const API_BASE = "http://72.62.231.18:8000/v1";
  const LIVE_KEY = "bi_live_pk_IN_52e15535c78dbafea0d87f9ab124281d6af160819c9ba318";

  useEffect(() => {
    const id = setInterval(() => setShowDot(d => !d), 600);
    return () => clearInterval(id);
  }, []);

  const handleCall = async () => {
    setLoading(true);
    setResponse(null);

    const headers = {
      "Content-Type": "application/json",
      "X-BharatIntel-Key": LIVE_KEY,
    };

    const endpointMap = {
      bizverify_gstin:    { method: "POST", url: `${API_BASE}/biz/gstin`,    body: { gstin: query || "27AAPFU0939F1ZV" } },
      bizverify_company:  { method: "POST", url: `${API_BASE}/biz/company`,  body: { query: query || "Reliance Retail Ventures" } },
      lexintel_case:      { method: "POST", url: `${API_BASE}/lex/case`,      body: { query: query || "Tata Motors vs Income Tax" } },
      lexintel_trademark: { method: "POST", url: `${API_BASE}/lex/trademark`, body: { query: query || "BharatIntel" } },
      regradar_latest:    { method: "GET",  url: `${API_BASE}/reg/latest?regulators=RBI,SEBI&limit=5` },
      bharatsearch:       { method: "POST", url: `${API_BASE}/search/web`,    body: { query: query || "MSME loan scheme 2025 India", language: "en" } },
    };

    const config = endpointMap[selectedModule?.id];
    if (!config) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(config.url, {
        method: config.method,
        headers,
        body: config.method === "POST" ? JSON.stringify(config.body) : undefined,
      });
      const data = await res.json();
      setResponse(data);
      setHistory(h => [{
        module: selectedModule.label,
        sub: selectedModule.sub,
        query: query || "(default)",
        status: res.status,
        latency: data.latency_ms || 0,
        credits: data.credits_used || 1,
        time: new Date().toLocaleTimeString("en-IN", { hour12: false }),
      }, ...h].slice(0, 8));
    } catch (err) {
      setResponse({
        status: "error",
        module: selectedModule?.label || "Unknown",
        ai_summary: `Could not reach backend at http://localhost:8000 — ${err.message}`,
        data: {}, confidence: 0, sources: [], credits_used: 0, latency_ms: 0,
      });
    }

    setLoading(false);
    setTimeout(() => responseRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 100);
  };

  const copyKey = () => { navigator.clipboard?.writeText(apiKey); setKeyCopied(true); setTimeout(() => setKeyCopied(false), 2000); };
  const copyJson = () => { if (response) { navigator.clipboard?.writeText(JSON.stringify(response, null, 2)); setJsonCopied(true); setTimeout(() => setJsonCopied(false), 2000); } };

  const C = { bg: "#040810", surface: "rgba(12,20,38,0.95)", border: "rgba(255,255,255,0.06)", accent: "#FF6B35", green: "#00C896", navy: "#0A1428" };

  const NAV_TABS = [
    { id: "landing", label: "🏠 Home" },
    { id: "playground", label: "⚡ Playground" },
    { id: "dashboard", label: "📊 Dashboard" },
    { id: "pricing", label: "💳 Pricing" },
    { id: "docs", label: "📚 Docs" },
  ];

  // ── LANDING ──────────────────────────────────────────────────────────────────
  const renderLanding = () => (
    <div>
      {/* Hero */}
      <div style={{ textAlign: "center", padding: "60px 24px 40px", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 800px 400px at 50% 0%, rgba(255,107,53,0.07), transparent)", pointerEvents: "none" }} />
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,107,53,0.08)", border: "1px solid rgba(255,107,53,0.2)", padding: "5px 14px", borderRadius: 20, marginBottom: 24, fontSize: 12, color: "#FF6B35", fontFamily: "JetBrains Mono, monospace" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#00C896", display: "inline-block", boxShadow: "0 0 6px #00C896" }} />
          Now in Beta · India's First AI-Native Data API
        </div>
        <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "clamp(36px,6vw,68px)", fontWeight: 400, lineHeight: 1.1, letterSpacing: "-0.02em", marginBottom: 20, color: "#F1F5F9" }}>
          The Data Layer for<br />
          <span style={{ fontStyle: "italic", color: "#FF6B35" }}>India's AI Agents</span>
        </h1>
        <p style={{ fontSize: 16, color: "#64748B", lineHeight: 1.7, maxWidth: 560, margin: "0 auto 36px", fontFamily: "'DM Sans', sans-serif" }}>
          One API key. GSTIN verification, MCA company data, court records, RBI/SEBI circulars, and Indic web search — structured for LLMs, built for India.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => setActiveTab("playground")} style={{ padding: "13px 28px", background: "linear-gradient(135deg, #FF6B35, #FF9A3C)", border: "none", borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 24px rgba(255,107,53,0.35)", fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.02em" }}>
            ⚡ Try Playground
          </button>
          <button onClick={() => setActiveTab("pricing")} style={{ padding: "13px 28px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#94A3B8", fontSize: 14, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
            View Pricing →
          </button>
        </div>
        {/* Quick stats */}
        <div style={{ display: "flex", gap: 32, justifyContent: "center", marginTop: 48, paddingTop: 32, borderTop: "1px solid rgba(255,255,255,0.05)", flexWrap: "wrap" }}>
          {[["6", "API Modules"], ["<500ms", "P95 Latency"], ["99.5%", "Uptime SLA"], ["DPDP", "Compliant"]].map(([v, l]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 22, fontWeight: 700, color: "#FF6B35" }}>{v}</div>
              <div style={{ fontSize: 12, color: "#475569", marginTop: 3, fontFamily: "JetBrains Mono, monospace", textTransform: "uppercase", letterSpacing: "0.06em" }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Module cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16, marginBottom: 40 }}>
        {MODULES.map(m => (
          <div key={m.id} onClick={() => { setActiveTab("playground"); setSelectedModule(m); }} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20, cursor: "pointer", transition: "all 0.2s", position: "relative", overflow: "hidden" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = m.color + "44"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 32px ${m.color}18`; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
            <div style={{ position: "absolute", top: 0, right: 0, width: 100, height: 100, background: `radial-gradient(circle, ${m.color}10, transparent 70%)`, pointerEvents: "none" }} />
            <div style={{ fontSize: 28, marginBottom: 12 }}>{m.icon}</div>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2, fontFamily: "'DM Sans', sans-serif" }}>{m.label}</div>
            <div style={{ fontSize: 12, color: m.color, marginBottom: 10, fontFamily: "JetBrains Mono, monospace" }}>{m.sub}</div>
            <div style={{ fontSize: 13, color: "#64748B", lineHeight: 1.55, marginBottom: 14, fontFamily: "'DM Sans', sans-serif" }}>{m.description}</div>
            <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10, color: "#1E293B" }}>{m.endpoint}</div>
          </div>
        ))}
      </div>

      {/* Code quickstart */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden", marginBottom: 32 }}>
        <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.08em" }}>Quick Start — Python</span>
          <span style={{ fontSize: 11, color: "#FF6B35", fontFamily: "JetBrains Mono, monospace" }}>pip install bharatintel</span>
        </div>
        <CodeBlock lang="python" code={`import bharatintel as bi

client = bi.Client(api_key="bi_live_pk_IN_...")

# Verify a business GSTIN
gstin = client.biz.verify_gstin("27AAPFU0939F1ZV")
print(gstin.ai_summary)

# Search Indian regulatory updates
updates = client.reg.latest(regulators=["RBI", "SEBI"])
for u in updates.data.updates:
    print(f"[{u['impact_score']}] {u['title']}")`} />
      </div>

      {/* Feature pillars */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {[
          { icon: "🇮🇳", title: "India-Native", desc: "Built for Indian regulatory infrastructure — not a wrapper around foreign APIs." },
          { icon: "⚡", title: "Sub-500ms", desc: "Edge nodes in Mumbai with Redis caching for real-time agent workflows." },
          { icon: "🔒", title: "DPDP Ready", desc: "All data stored and processed in India — compliant with the DPDP Act 2023." },
          { icon: "🤖", title: "Agent-First", desc: "AI summaries, confidence scores, MCP server for Claude / GPT-4 / Gemini." },
        ].map(f => (
          <div key={f.title} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "18px 16px" }}>
            <div style={{ fontSize: 24, marginBottom: 10 }}>{f.icon}</div>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, fontFamily: "'DM Sans', sans-serif" }}>{f.title}</div>
            <div style={{ fontSize: 12, color: "#64748B", lineHeight: 1.55, fontFamily: "'DM Sans', sans-serif" }}>{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );

  // ── PLAYGROUND ───────────────────────────────────────────────────────────────
  const renderPlayground = () => (
    <div>
      {/* API Key bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(255,107,53,0.06)", border: "1px solid rgba(255,107,53,0.15)", borderRadius: 10, padding: "12px 18px", marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 10, color: "#64748B", fontFamily: "JetBrains Mono, monospace", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Your API Key</div>
          <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 13, color: "#E2E8F0", letterSpacing: "0.04em" }}>
            {keyVisible ? apiKey : apiKey.slice(0, 22) + "••••••••••••••••••"}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setKeyVisible(v => !v)} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#94A3B8", padding: "5px 12px", borderRadius: 6, fontSize: 12, cursor: "pointer", fontFamily: "JetBrains Mono, monospace" }}>
            {keyVisible ? "🙈 hide" : "👁 reveal"}
          </button>
          <button onClick={copyKey} style={{ background: keyCopied ? "rgba(0,200,150,0.15)" : "rgba(255,107,53,0.12)", border: `1px solid ${keyCopied ? "rgba(0,200,150,0.3)" : "rgba(255,107,53,0.25)"}`, color: keyCopied ? "#00C896" : "#FF6B35", padding: "5px 14px", borderRadius: 6, fontSize: 12, cursor: "pointer", fontFamily: "JetBrains Mono, monospace" }}>
            {keyCopied ? "✓ copied!" : "copy key"}
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 20, alignItems: "start" }}>
        {/* Left: Module list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.08em" }}>Modules</span>
              <span style={{ background: "rgba(0,200,150,0.12)", border: "1px solid rgba(0,200,150,0.25)", color: "#00C896", fontSize: 10, padding: "2px 8px", borderRadius: 10, fontFamily: "JetBrains Mono, monospace" }}>● live</span>
            </div>
            {MODULES.map(m => (
              <button key={m.id} onClick={() => { setSelectedModule(m); setResponse(null); setQuery(""); }} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", cursor: "pointer", background: selectedModule.id === m.id ? `${m.color}0F` : "transparent", borderLeft: selectedModule.id === m.id ? `3px solid ${m.color}` : "3px solid transparent", border: "none", width: "100%", textAlign: "left", color: "inherit", transition: "all 0.15s", borderBottom: `1px solid ${C.border}` }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: `${m.color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{m.icon}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: selectedModule.id === m.id ? "#E2E8F0" : "#94A3B8", fontFamily: "'DM Sans', sans-serif" }}>
                    {m.label} <span style={{ color: m.color, fontWeight: 400 }}>/ {m.sub}</span>
                  </div>
                  <div style={{ fontSize: 10, color: "#334155", fontFamily: "JetBrains Mono, monospace", marginTop: 1 }}>{m.endpoint}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Request History */}
          {history.length > 0 && (
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
              <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}` }}>
                <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.08em" }}>Recent Calls</span>
              </div>
              {history.map((h, i) => {
                const m = MODULES.find(m => m.label === h.module);
                return (
                  <div key={i} style={{ padding: "10px 14px", borderBottom: i < history.length - 1 ? `1px solid ${C.border}` : "none", display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 26, height: 26, borderRadius: 6, background: `${m?.color || "#666"}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>{m?.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, color: "#94A3B8", fontFamily: "'DM Sans', sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.sub}</div>
                      <div style={{ fontSize: 10, color: "#334155", fontFamily: "JetBrains Mono, monospace" }}>{h.time} · {h.credits}cr</div>
                    </div>
                    <LatencyBadge ms={h.latency} />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Terminal + Code tabs */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Terminal */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
            <div style={{ background: "#0A1428", padding: "10px 18px", display: "flex", alignItems: "center", gap: 8, borderBottom: `1px solid ${C.border}` }}>
              {["#EF4444", "#F59E0B", "#10B981"].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />)}
              <span style={{ marginLeft: 8, fontSize: 12, color: "#334155", fontFamily: "JetBrains Mono, monospace" }}>
                bharatintel ~ {selectedModule.endpoint}
              </span>
            </div>

            <div style={{ padding: "16px 20px 0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <span style={{ background: `${selectedModule.color}18`, color: selectedModule.color, fontSize: 10, padding: "2px 8px", borderRadius: 4, fontFamily: "JetBrains Mono, monospace", fontWeight: 700 }}>{selectedModule.endpoint.split(" ")[0]}</span>
                <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12, color: "#475569" }}>{selectedModule.endpoint.split(" ")[1]}</span>
              </div>
              <div style={{ fontSize: 13, color: "#475569", marginBottom: 14, fontFamily: "'DM Sans', sans-serif" }}>{selectedModule.description}</div>

              {selectedModule.id !== "regradar_latest" && (
                <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
                  <input
                    value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && !loading && handleCall()}
                    placeholder={selectedModule.placeholder}
                    style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "10px 14px", color: "#E2E8F0", fontSize: 13, outline: "none", fontFamily: "JetBrains Mono, monospace" }} />
                </div>
              )}

              <button onClick={handleCall} disabled={loading} style={{ padding: "10px 22px", background: loading ? "rgba(255,107,53,0.25)" : "linear-gradient(135deg, #FF6B35, #FF9A3C)", border: "none", borderRadius: 8, color: "#fff", fontSize: 13, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 8, boxShadow: loading ? "none" : "0 4px 20px rgba(255,107,53,0.3)", transition: "all 0.2s", fontFamily: "'DM Sans', sans-serif", marginBottom: 16 }}>
                {loading ? <><span style={{ opacity: 0.7 }}>●●●</span> Calling API...</> : <><span>⚡</span> Call API</>}
              </button>
            </div>

            {/* Response */}
            <div style={{ padding: "0 20px 20px" }} ref={responseRef}>
              {loading && (
                <div style={{ background: "#060D1A", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, overflow: "hidden" }}>
                  <div style={{ background: "#0A1428", padding: "8px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: "#475569" }}>Response</span>
                    <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: "#F59E0B" }}>● fetching{showDot ? "..." : "   "}</span>
                  </div>
                  <div style={{ padding: "20px", fontFamily: "JetBrains Mono, monospace", fontSize: 12, color: "#334155", lineHeight: 1.8 }}>
                    <div>POST {selectedModule.endpoint.split(" ")[1]}</div>
                    <div style={{ marginTop: 6 }}>Connecting to BharatIntel edge node (ap-south-1)...</div>
                    <div style={{ marginTop: 4, color: "#1E293B" }}>Querying data sources {showDot ? "█" : " "}</div>
                  </div>
                </div>
              )}

              {response && !loading && (
                <div style={{ background: "#060D1A", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, overflow: "hidden" }}>
                  <div style={{ background: "#0A1428", padding: "8px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <span style={{ background: "rgba(0,200,150,0.12)", color: "#00C896", fontSize: 10, padding: "2px 8px", borderRadius: 4, fontFamily: "JetBrains Mono, monospace" }}>200 OK</span>
                      <LatencyBadge ms={response.latency_ms} />
                      <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: "#334155" }}>{response.credits_used} credit{response.credits_used > 1 ? "s" : ""}</span>
                    </div>
                    <button onClick={copyJson} style={{ background: jsonCopied ? "rgba(0,200,150,0.1)" : "rgba(255,255,255,0.04)", border: `1px solid ${jsonCopied ? "rgba(0,200,150,0.25)" : "rgba(255,255,255,0.08)"}`, color: jsonCopied ? "#00C896" : "#64748B", padding: "3px 10px", borderRadius: 4, fontSize: 11, cursor: "pointer", fontFamily: "JetBrains Mono, monospace" }}>
                      {jsonCopied ? "✓ copied" : "copy JSON"}
                    </button>
                  </div>

                  <div style={{ margin: 16, background: "linear-gradient(135deg, rgba(255,107,53,0.08), rgba(255,154,60,0.04))", border: "1px solid rgba(255,107,53,0.15)", borderRadius: 10, padding: "12px 16px" }}>
                    <div style={{ fontSize: 10, color: "#FF6B35", fontFamily: "JetBrains Mono, monospace", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 8 }}>✦ AI_SUMMARY</div>
                    <div style={{ fontSize: 13, color: "#CBD5E1", lineHeight: 1.65, fontFamily: "'DM Sans', sans-serif" }}>{response.ai_summary}</div>
                    <div style={{ display: "flex", gap: 12, marginTop: 10, flexWrap: "wrap", alignItems: "center" }}>
                      <span style={{ fontSize: 11, color: "#475569", fontFamily: "JetBrains Mono, monospace" }}>confidence:</span>
                      <span style={{ fontSize: 11, color: "#00C896", fontFamily: "JetBrains Mono, monospace" }}>{(response.confidence * 100).toFixed(0)}%</span>
                      <span style={{ fontSize: 11, color: "#475569", fontFamily: "JetBrains Mono, monospace" }}>sources:</span>
                      {response.sources.map(s => <span key={s} style={{ fontSize: 11, color: "#7DD3FC", fontFamily: "JetBrains Mono, monospace" }}>{s}</span>)}
                    </div>
                  </div>

                  <div style={{ padding: "0 16px 16px" }}>
                    <div style={{ fontSize: 10, color: "#334155", fontFamily: "JetBrains Mono, monospace", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>Raw JSON</div>
                    <div style={{ background: "#040810", borderRadius: 8, padding: 14, maxHeight: 340, overflowY: "auto" }}>
                      <JsonHighlight data={response} />
                    </div>
                  </div>
                </div>
              )}

              {!response && !loading && (
                <div style={{ textAlign: "center", padding: "40px 20px", color: "#1E293B", fontFamily: "JetBrains Mono, monospace", fontSize: 13 }}>
                  <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.4 }}>⚡</div>
                  Select a module and fire your first call
                </div>
              )}
            </div>
          </div>

          {/* Code Snippet Tabs */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
            <div style={{ background: "#0A1428", padding: "10px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", gap: 4, alignItems: "center" }}>
              <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10, color: "#334155", textTransform: "uppercase", letterSpacing: "0.1em", marginRight: 12 }}>Code</span>
              {["python", "typescript", "curl"].map(lang => (
                <button key={lang} onClick={() => setCodeLang(lang)} style={{ padding: "4px 12px", borderRadius: 6, border: "none", background: codeLang === lang ? "rgba(255,107,53,0.15)" : "transparent", color: codeLang === lang ? "#FF6B35" : "#475569", fontSize: 12, cursor: "pointer", fontFamily: "JetBrains Mono, monospace", transition: "all 0.15s" }}>
                  {lang}
                </button>
              ))}
            </div>
            <div style={{ padding: 16 }}>
              <CodeBlock code={CODE_SNIPPETS[selectedModule.id]?.[codeLang] || "// coming soon"} lang={codeLang} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ── DASHBOARD ────────────────────────────────────────────────────────────────
  const renderDashboard = () => (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 20 }}>
        {[
          { label: "API Calls This Month", value: "12,847", delta: "+23% vs last month", color: "#3B82F6", icon: "📈" },
          { label: "Avg Latency (P95)", value: "342ms", delta: "−18ms improvement", color: "#00C896", icon: "⚡" },
          { label: "Credits Remaining", value: "12,153", delta: "of 25,000 · resets in 8d", color: "#FF6B35", icon: "💳" },
          { label: "Success Rate", value: "99.4%", delta: "↑ 0.2% from last week", color: "#8B5CF6", icon: "✅" },
        ].map(s => (
          <div key={s.label} style={{ background: C.surface, border: `1px solid ${s.color}18`, borderRadius: 14, padding: "18px 20px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, right: 0, width: 80, height: 80, background: `radial-gradient(circle, ${s.color}15, transparent 70%)`, pointerEvents: "none" }} />
            <div style={{ fontSize: 11, color: "#64748B", fontFamily: "JetBrains Mono, monospace", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontSize: 30, fontWeight: 800, color: s.color, fontFamily: "JetBrains Mono, monospace", letterSpacing: "-1px", marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "#475569", fontFamily: "'DM Sans', sans-serif" }}>{s.delta}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
          <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.08em" }}>API Calls — Last 7 Days</span>
            <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: "#FF6B35" }}>12,847 total</span>
          </div>
          <div style={{ padding: "16px 20px 20px" }}>
            <UsageBar data={USAGE_DATA} />
          </div>
        </div>

        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
          <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border}` }}>
            <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.08em" }}>Calls by Module</span>
          </div>
          <div style={{ padding: "14px 20px" }}>
            {[
              { label: "BizVerify / GSTIN", pct: 38, color: "#3B82F6", calls: "4,882" },
              { label: "BizVerify / Company", pct: 22, color: "#8B5CF6", calls: "2,826" },
              { label: "LexIntel", pct: 18, color: "#EF4444", calls: "2,312" },
              { label: "RegRadar", pct: 12, color: "#10B981", calls: "1,542" },
              { label: "BharatSearch", pct: 10, color: "#F97316", calls: "1,285" },
            ].map(m => (
              <div key={m.label} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 12, color: "#94A3B8", fontFamily: "'DM Sans', sans-serif" }}>{m.label}</span>
                  <span style={{ fontSize: 12, color: m.color, fontFamily: "JetBrains Mono, monospace" }}>{m.calls}</span>
                </div>
                <div style={{ height: 4, background: "rgba(255,255,255,0.05)", borderRadius: 2 }}>
                  <div style={{ height: "100%", width: `${m.pct}%`, background: m.color, borderRadius: 2, boxShadow: `0 0 6px ${m.color}60` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Health */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden", marginBottom: 16 }}>
        <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border}` }}>
          <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.08em" }}>Module Health</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0 }}>
          {[
            { name: "BizVerify API", latency: "287ms", uptime: "99.8%", status: "operational", color: "#00C896" },
            { name: "LexIntel API", latency: "521ms", uptime: "99.4%", status: "operational", color: "#00C896" },
            { name: "RegRadar Feed", latency: "198ms", uptime: "100%", status: "operational", color: "#00C896" },
            { name: "BharatSearch", latency: "445ms", uptime: "99.6%", status: "operational", color: "#00C896" },
            { name: "MCP Server", latency: "n/a", uptime: "99.9%", status: "operational", color: "#00C896" },
            { name: "Redis Cache", latency: "3ms", uptime: "100%", status: "operational", color: "#00C896" },
          ].map((s, i) => (
            <div key={s.name} style={{ padding: "14px 20px", borderRight: i % 3 !== 2 ? `1px solid ${C.border}` : "none", borderBottom: i < 3 ? `1px solid ${C.border}` : "none", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#E2E8F0", fontFamily: "'DM Sans', sans-serif", marginBottom: 4 }}>{s.name}</div>
                <div style={{ display: "flex", gap: 10, fontSize: 11, color: "#475569", fontFamily: "JetBrains Mono, monospace" }}>
                  <span>p95: {s.latency}</span>
                  <span>up: {s.uptime}</span>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, background: `${s.color}12`, border: `1px solid ${s.color}25`, padding: "3px 10px", borderRadius: 10 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: s.color, boxShadow: `0 0 5px ${s.color}` }} />
                <span style={{ fontSize: 10, color: s.color, fontFamily: "JetBrains Mono, monospace" }}>{s.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent calls log */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
        <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.08em" }}>Recent API Calls</span>
          <span style={{ fontSize: 11, color: "#334155", fontFamily: "JetBrains Mono, monospace" }}>live log</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                {["Timestamp", "Module", "Query", "Status", "Latency", "Credits"].map(h => (
                  <th key={h} style={{ padding: "8px 16px", textAlign: "left", fontSize: 10, color: "#334155", fontFamily: "JetBrains Mono, monospace", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { time: "14:32:18", module: "BizVerify", query: "27AAPFU0939F1ZV", color: "#3B82F6", latency: 312, credits: 1 },
                { time: "14:31:55", module: "LexIntel", query: "Sharma Textiles vs HDFC", color: "#EF4444", latency: 521, credits: 3 },
                { time: "14:30:42", module: "RegRadar", query: "RBI circulars", color: "#10B981", latency: 198, credits: 1 },
                { time: "14:29:11", module: "BharatSearch", query: "MSME loan scheme 2025", color: "#F97316", latency: 445, credits: 2 },
                { time: "14:28:03", module: "BizVerify", query: "Reliance Retail CIN", color: "#8B5CF6", latency: 287, credits: 2 },
              ].map((row, i) => (
                <tr key={i} style={{ borderBottom: `1px solid rgba(255,255,255,0.025)` }}>
                  <td style={{ padding: "10px 16px", fontFamily: "JetBrains Mono, monospace", fontSize: 12, color: "#334155" }}>{row.time}</td>
                  <td style={{ padding: "10px 16px" }}><span style={{ background: `${row.color}15`, color: row.color, fontSize: 11, padding: "3px 8px", borderRadius: 4, fontFamily: "JetBrains Mono, monospace" }}>{row.module}</span></td>
                  <td style={{ padding: "10px 16px", fontFamily: "JetBrains Mono, monospace", fontSize: 12, color: "#94A3B8", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.query}</td>
                  <td style={{ padding: "10px 16px" }}><span style={{ background: "rgba(0,200,150,0.1)", color: "#00C896", fontSize: 11, padding: "3px 8px", borderRadius: 4, fontFamily: "JetBrains Mono, monospace" }}>200</span></td>
                  <td style={{ padding: "10px 16px" }}><LatencyBadge ms={row.latency} /></td>
                  <td style={{ padding: "10px 16px", fontFamily: "JetBrains Mono, monospace", fontSize: 12, color: "#FF6B35" }}>{row.credits}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // ── PRICING ──────────────────────────────────────────────────────────────────
  const renderPricing = () => (
    <div>
      <div style={{ textAlign: "center", padding: "32px 24px 40px" }}>
        <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 42, fontWeight: 400, letterSpacing: "-0.02em", marginBottom: 12, color: "#F1F5F9" }}>
          Simple, <span style={{ fontStyle: "italic", color: "#FF6B35" }}>honest</span> pricing
        </h2>
        <p style={{ color: "#64748B", fontSize: 15, fontFamily: "'DM Sans', sans-serif" }}>No USD pricing. No hidden seats. INR invoices with TDS support.</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, maxWidth: 900, margin: "0 auto", marginBottom: 40 }}>
        {PRICING_TIERS.map(tier => (
          <div key={tier.name} style={{ background: tier.badge ? `linear-gradient(135deg, rgba(255,107,53,0.06), rgba(255,154,60,0.03))` : C.surface, border: `1px solid ${tier.badge ? "rgba(255,107,53,0.3)" : C.border}`, borderRadius: 16, padding: 28, display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
            {tier.badge && <div style={{ position: "absolute", top: 16, right: 16, background: "#FF6B35", color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 10, fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.06em" }}>{tier.badge}</div>}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12, color: tier.color, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>{tier.name}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 4 }}>
                <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 40, fontWeight: 400, color: "#F1F5F9" }}>{tier.price}</span>
                <span style={{ fontSize: 13, color: "#475569", fontFamily: "JetBrains Mono, monospace" }}>{tier.period}</span>
              </div>
              <div style={{ fontSize: 12, color: tier.color, fontFamily: "JetBrains Mono, monospace", marginBottom: 12 }}>{tier.credits}</div>
              <div style={{ fontSize: 13, color: "#64748B", lineHeight: 1.55, fontFamily: "'DM Sans', sans-serif" }}>{tier.description}</div>
            </div>
            <div style={{ flex: 1, marginBottom: 24 }}>
              {tier.features.map(f => (
                <div key={f} style={{ display: "flex", gap: 10, marginBottom: 8, fontSize: 13, color: "#94A3B8", fontFamily: "'DM Sans', sans-serif", alignItems: "flex-start" }}>
                  <span style={{ color: tier.color, flexShrink: 0, fontSize: 14, lineHeight: 1.4 }}>✓</span>
                  <span>{f}</span>
                </div>
              ))}
            </div>
            <button style={{ width: "100%", padding: "12px", background: tier.badge ? "linear-gradient(135deg, #FF6B35, #FF9A3C)" : "rgba(255,255,255,0.05)", border: tier.badge ? "none" : "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: tier.badge ? "#fff" : "#94A3B8", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", boxShadow: tier.badge ? "0 4px 20px rgba(255,107,53,0.3)" : "none" }}>
              {tier.cta}
            </button>
          </div>
        ))}
      </div>
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px 28px", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>Credit Consumption Reference</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {[
            { call: "GSTIN Verification", credits: 1 }, { call: "Company Lookup", credits: 2 }, { call: "Court Case Search", credits: 3 },
            { call: "Trademark Search", credits: 2 }, { call: "RegRadar Latest", credits: 1 }, { call: "BharatSearch Query", credits: 2 },
          ].map(r => (
            <div key={r.call} style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "rgba(255,255,255,0.02)", borderRadius: 8 }}>
              <span style={{ fontSize: 13, color: "#94A3B8", fontFamily: "'DM Sans', sans-serif" }}>{r.call}</span>
              <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12, color: "#FF6B35" }}>{r.credits} cr</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── DOCS ─────────────────────────────────────────────────────────────────────
  const renderDocs = () => (
    <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 24, alignItems: "start" }}>
      {/* Sidebar */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden", position: "sticky", top: 80 }}>
        <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}` }}>
          <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.08em" }}>API Reference</span>
        </div>
        {DOCS_ENDPOINTS.map(section => (
          <div key={section.section}>
            <div style={{ padding: "10px 16px", fontSize: 12, fontWeight: 700, color: section.color, fontFamily: "JetBrains Mono, monospace", background: "rgba(255,255,255,0.02)", borderBottom: `1px solid ${C.border}` }}>
              {section.icon} {section.section}
            </div>
            {section.endpoints.map(ep => (
              <button key={ep.path} onClick={() => setExpandedDoc(expandedDoc === ep.path ? null : ep.path)} style={{ display: "block", width: "100%", textAlign: "left", padding: "8px 16px 8px 24px", fontSize: 11, fontFamily: "JetBrains Mono, monospace", color: expandedDoc === ep.path ? "#E2E8F0" : "#475569", background: expandedDoc === ep.path ? "rgba(255,107,53,0.08)" : "transparent", border: "none", borderBottom: `1px solid ${C.border}`, cursor: "pointer", transition: "all 0.15s" }}>
                <span style={{ color: ep.method === "GET" ? "#00C896" : "#3B82F6", marginRight: 6 }}>{ep.method}</span>
                {ep.path.replace("/v1/", "")}
              </button>
            ))}
          </div>
        ))}
        <div style={{ padding: "14px 16px", borderTop: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 11, color: "#334155", fontFamily: "JetBrains Mono, monospace", marginBottom: 6 }}>Base URL</div>
          <div style={{ fontSize: 11, color: "#7DD3FC", fontFamily: "JetBrains Mono, monospace", wordBreak: "break-all" }}>api.bharatintel.in</div>
        </div>
      </div>

      {/* Content */}
      <div>
        <div style={{ background: "rgba(255,107,53,0.06)", border: "1px solid rgba(255,107,53,0.15)", borderRadius: 10, padding: "14px 20px", marginBottom: 20, display: "flex", gap: 16, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 10, color: "#64748B", fontFamily: "JetBrains Mono, monospace", marginBottom: 4 }}>Authentication</div>
            <code style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12, color: "#FF6B35" }}>Authorization: Bearer bi_live_pk_IN_...</code>
          </div>
          <div>
            <div style={{ fontSize: 10, color: "#64748B", fontFamily: "JetBrains Mono, monospace", marginBottom: 4 }}>Content-Type</div>
            <code style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12, color: "#86EFAC" }}>application/json</code>
          </div>
          <div>
            <div style={{ fontSize: 10, color: "#64748B", fontFamily: "JetBrains Mono, monospace", marginBottom: 4 }}>Rate Limit Headers</div>
            <code style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12, color: "#7DD3FC" }}>X-RateLimit-Remaining · X-RateLimit-Reset</code>
          </div>
        </div>

        {DOCS_ENDPOINTS.map(section => (
          <div key={section.section} style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <span style={{ fontSize: 18 }}>{section.icon}</span>
              <h3 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 24, fontWeight: 400, color: section.color }}>{section.section}</h3>
            </div>
            {section.endpoints.map(ep => (
              <div key={ep.path} style={{ background: C.surface, border: `1px solid ${expandedDoc === ep.path ? section.color + "30" : C.border}`, borderRadius: 12, overflow: "hidden", marginBottom: 12, cursor: "pointer" }} onClick={() => setExpandedDoc(expandedDoc === ep.path ? null : ep.path)}>
                <div style={{ padding: "14px 20px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                  <span style={{ background: ep.method === "GET" ? "rgba(0,200,150,0.12)" : "rgba(59,130,246,0.12)", color: ep.method === "GET" ? "#00C896" : "#3B82F6", fontSize: 11, padding: "3px 10px", borderRadius: 4, fontFamily: "JetBrains Mono, monospace", fontWeight: 700, flexShrink: 0 }}>{ep.method}</span>
                  <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 14, color: "#E2E8F0" }}>{ep.path}</span>
                  <span style={{ fontSize: 13, color: "#64748B", fontFamily: "'DM Sans', sans-serif", flex: 1 }}>{ep.desc}</span>
                  <span style={{ background: "rgba(255,107,53,0.1)", color: "#FF6B35", fontSize: 10, padding: "2px 8px", borderRadius: 10, fontFamily: "JetBrains Mono, monospace", flexShrink: 0 }}>{ep.credits} credit{ep.credits > 1 ? "s" : ""}</span>
                  <span style={{ color: "#334155", fontSize: 16 }}>{expandedDoc === ep.path ? "−" : "+"}</span>
                </div>
                {expandedDoc === ep.path && (
                  <div style={{ borderTop: `1px solid ${C.border}`, padding: "16px 20px" }}>
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Parameters</div>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                        <thead>
                          <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                            {["name", "type", "required", "description"].map(h => <th key={h} style={{ padding: "6px 12px", textAlign: "left", fontFamily: "JetBrains Mono, monospace", fontSize: 10, color: "#334155", textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</th>)}
                          </tr>
                        </thead>
                        <tbody>
                          {ep.params.map(p => (
                            <tr key={p.name} style={{ borderBottom: `1px solid rgba(255,255,255,0.03)` }}>
                              <td style={{ padding: "8px 12px", fontFamily: "JetBrains Mono, monospace", color: "#7DD3FC", fontSize: 12 }}>{p.name}</td>
                              <td style={{ padding: "8px 12px", fontFamily: "JetBrains Mono, monospace", color: "#A78BFA", fontSize: 12 }}>{p.type}</td>
                              <td style={{ padding: "8px 12px", fontFamily: "JetBrains Mono, monospace", fontSize: 11 }}><span style={{ color: p.required ? "#EF4444" : "#475569", background: `${p.required ? "#EF4444" : "#475569"}15`, padding: "2px 8px", borderRadius: 4 }}>{p.required ? "required" : "optional"}</span></td>
                              <td style={{ padding: "8px 12px", color: "#94A3B8", fontFamily: "'DM Sans', sans-serif" }}>{p.desc}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div>
                      <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Quick Example</div>
                      <CodeBlock lang="python" code={CODE_SNIPPETS[MODULES.find(m => m.endpoint.includes(ep.path.replace("/v1/", "/").replace("/", "_")))?.id]?.python || `# See playground for full example`} />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: "#E2E8F0", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&family=Instrument+Serif:ital@0;1&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,107,53,0.3); border-radius: 2px; }
        button:focus { outline: none; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .page { animation: fadeUp 0.3s ease both; }
      `}</style>

      {/* Grid background */}
      <div style={{ position: "fixed", inset: 0, backgroundImage: "linear-gradient(rgba(255,107,53,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,107,53,0.025) 1px, transparent 1px)", backgroundSize: "52px 52px", pointerEvents: "none" }} />

      {/* Navbar */}
      <nav style={{ background: "rgba(4,8,16,0.92)", backdropFilter: "blur(24px)", borderBottom: "1px solid rgba(255,107,53,0.12)", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60, position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, background: "linear-gradient(135deg, #FF6B35, #FF9A3C)", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "JetBrains Mono, monospace", fontWeight: 700, fontSize: 14, color: "#fff", boxShadow: "0 0 16px rgba(255,107,53,0.45)" }}>BI</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.3px", fontFamily: "'DM Sans', sans-serif" }}>BharatIntel <span style={{ color: "#FF6B35" }}>API</span></div>
            <div style={{ fontSize: 10, color: "#FF6B35", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "JetBrains Mono, monospace" }}>by PPventures.tech</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 2 }}>
          {NAV_TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ padding: "6px 14px", borderRadius: 7, fontSize: 13, cursor: "pointer", border: "none", background: activeTab === t.id ? "rgba(255,107,53,0.12)" : "transparent", color: activeTab === t.id ? "#FF6B35" : "#64748B", fontFamily: "'DM Sans', sans-serif", fontWeight: activeTab === t.id ? 600 : 400, transition: "all 0.15s" }}>
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ background: "rgba(0,200,150,0.1)", border: "1px solid rgba(0,200,150,0.2)", color: "#00C896", fontSize: 11, padding: "4px 10px", borderRadius: 20, fontFamily: "JetBrains Mono, monospace", display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#00C896", display: "inline-block", boxShadow: "0 0 5px #00C896" }} />
            All Systems Operational
          </div>
          <div style={{ background: "rgba(255,107,53,0.1)", border: "1px solid rgba(255,107,53,0.2)", color: "#FF6B35", fontSize: 11, padding: "4px 10px", borderRadius: 20, fontFamily: "JetBrains Mono, monospace" }}>
            MVP Beta
          </div>
        </div>
      </nav>

      {/* RegRadar Ticker */}
      <RegTicker />

      {/* Main content */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 24px" }} className="page" key={activeTab}>
        {activeTab === "landing" && renderLanding()}
        {activeTab === "playground" && renderPlayground()}
        {activeTab === "dashboard" && renderDashboard()}
        {activeTab === "pricing" && renderPricing()}
        {activeTab === "docs" && renderDocs()}
      </div>

      {/* Footer */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.04)", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: 1200, margin: "0 auto" }}>
        <span style={{ fontSize: 12, color: "#1E293B", fontFamily: "JetBrains Mono, monospace" }}>BharatIntel API v0.1.0-beta · PPventures.tech · Mumbai Edge Node</span>
        <div style={{ display: "flex", gap: 20 }}>
          {["Docs", "GitHub", "Status", "Pricing"].map(l => (
            <span key={l} onClick={() => l === "Docs" ? setActiveTab("docs") : l === "Pricing" ? setActiveTab("pricing") : null} style={{ fontSize: 12, color: "#334155", fontFamily: "JetBrains Mono, monospace", cursor: "pointer", transition: "color 0.15s" }}
              onMouseEnter={e => e.target.style.color = "#FF6B35"} onMouseLeave={e => e.target.style.color = "#334155"}>{l}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
