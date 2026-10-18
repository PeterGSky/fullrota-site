// FullRota WhatsApp webhook. No dependencies, just Node's built-ins.
// Env vars (set in DigitalOcean, never in code):
//   WHATSAPP_VERIFY_TOKEN  any secret string you also type into Meta's webhook settings
//   META_APP_SECRET        App settings > Basic > App secret (used to check requests really come from Meta)
const http = require("http");
const crypto = require("crypto");

const PORT = process.env.PORT || 8080;
const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "";
const APP_SECRET = process.env.META_APP_SECRET || "";

function validSignature(raw, header) {
  if (!APP_SECRET) return false;
  if (!header || !header.startsWith("sha256=")) return false;
  const expected = "sha256=" + crypto.createHmac("sha256", APP_SECRET).update(raw).digest("hex");
  const a = Buffer.from(expected), b = Buffer.from(header);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function summarise(body) {
  // One log line per event so they're easy to read in DigitalOcean's Runtime Logs.
  for (const entry of body.entry || []) {
    for (const change of entry.changes || []) {
      const v = change.value || {};
      const field = change.field;
      for (const m of v.messages || []) console.log(`[${field}] message from ${m.from} type=${m.type}`, m.text ? JSON.stringify(m.text.body) : "");
      for (const s of v.statuses || []) console.log(`[${field}] status ${s.status} for ${s.recipient_id}`);
      for (const e of v.message_echoes || []) console.log(`[${field}] echo (sent from WhatsApp Business app) to ${e.to} type=${e.type}`);
      if (!v.messages && !v.statuses && !v.message_echoes) console.log(`[${field}]`, JSON.stringify(v).slice(0, 2000));
    }
  }
}

http.createServer((req, res) => {
  const url = new URL(req.url, "http://localhost");

  if (req.method === "GET" && url.searchParams.has("hub.mode")) {
    // Meta's one-off check when you save the webhook URL.
    if (url.searchParams.get("hub.mode") === "subscribe" && VERIFY_TOKEN && url.searchParams.get("hub.verify_token") === VERIFY_TOKEN) {
      res.writeHead(200, { "Content-Type": "text/plain" });
      return res.end(url.searchParams.get("hub.challenge") || "");
    }
    res.writeHead(403); return res.end("Forbidden");
  }

  if (req.method === "GET") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    return res.end("FullRota webhook is running");
  }

  if (req.method === "POST") {
    const chunks = [];
    req.on("data", c => chunks.push(c));
    req.on("end", () => {
      const raw = Buffer.concat(chunks);
      if (!validSignature(raw, req.headers["x-hub-signature-256"])) {
        console.warn("Rejected webhook: bad or missing signature");
        res.writeHead(401); return res.end();
      }
      res.writeHead(200); res.end("OK"); // reply fast; Meta retries if we're slow
      try { summarise(JSON.parse(raw.toString("utf8"))); } catch (e) { console.error("Could not parse webhook", e.message); }
    });
    return;
  }

  res.writeHead(405); res.end();
}).listen(PORT, () => console.log(`FullRota webhook listening on ${PORT}`));
