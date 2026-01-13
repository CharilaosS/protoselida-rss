const fs = require("fs");
const path = require("path");
const https = require("https");

// Αρχείο RSS
const rssFile = path.join(__dirname, "rss.xml");

// Όλες οι εφημερίδες και τα slugs τους
const papers = {
  "Καθημερινή": "kathimerini",
  "Δημοκρατία": "dimokratia",
  "Εστία": "estia",
  "Πρώτο Θέμα": "protothema",
  "Real News": "realnews",
  "Το Βήμα Κυριακής": "tovimatiskyriakis",
  "MetroSport": "metrosport",
  "Μακελειό": "makelio",
  "iEfimerida": "iefimerida",
  "Τύπος Θεσσαλονίκης": "typosthessalonikis",
  "Ναυτεμπορική": "naftemporiki",
  "Ελεύθερος Τύπος": "eleftherostypos",
  "ΤΑ ΝΕΑ": "tanea",
  "Kontra News": "kontranews",
  "Το Manifesto": "to-manifesto",
  "Ελεύθερη Ωρα": "eleftheriora"
};

// Helper: check αν υπάρχει η εικόνα (HEAD request)
function checkImage(url) {
  return new Promise(resolve => {
    https.request(url, { method: "HEAD" }, res => {
      resolve(res.statusCode === 200);
    }).on("error", () => resolve(false)).end();
  });
}

// Helper: generate array of last N dates as ddmmyy
function getLastNDates(n) {
  const dates = [];
  const now = new Date();
  for (let i=0; i<n; i++) {
    const d = new Date(now.getTime() - i*24*60*60*1000);
    const dd = String(d.getDate()).padStart(2,"0");
    const mm = String(d.getMonth()+1).padStart(2,"0");
    const yy = String(d.getFullYear()).slice(-2);
    const display = `${dd}/${mm}/${d.getFullYear()}`;
    dates.push({ urlPart: `${dd}${mm}${yy}`, display });
  }
  return dates;
}

// Διαβάζουμε παλιό RSS και κρατάμε μέχρι 6 προηγούμενες μέρες
let oldItems = [];
let existingUrls = new Set();
if (fs.existsSync(rssFile)) {
  const content = fs.readFileSync(rssFile, "utf8");
  const itemsMatch = content.match(/<item>[\s\S]*?<\/item>/g);
  if (itemsMatch) {
    const cutoff = new Date(Date.now() - 6*24*60*60*1000);
    oldItems = itemsMatch.filter(item => {
      const dateMatch = item.match(/<title>.* – (\d+)\/(\d+)\/(\d+)<\/title>/);
      if (!dateMatch) return false;
      const [ , d, m, y ] = dateMatch;
      const itemDate = new Date(`${y}-${m}-${d}`);
      return itemDate >= cutoff;
    });

    oldItems.forEach(item => {
      const linkMatch = item.match(/<link>(.*?)<\/link>/);
      if (linkMatch) existingUrls.add(linkMatch[1]);
    });
  }
}

// Δημιουργούμε νέα items για σήμερα/πιο πρόσφατα
async function createRSS() {
  let newItems = "";

  const last7Dates = getLastNDates(7); // δοκιμάζουμε 7 τελευταίες μέρες για κάθε εφημερίδα

  for (const [title, slug] of Object.entries(papers)) {
    let found = false;
    for (const {urlPart, display} of last7Dates) {
      const imgUrl = `https://protoselidaefimeridon.gr/efimerides/${urlPart}/${slug}.JPG`;
      if (existingUrls.has(imgUrl)) {
        newItems += oldItems.find(i=>i.includes(imgUrl)) + "\n";
        found = true;
        break;
      }
      const exists = await checkImage(imgUrl);
      if (exists) {
        newItems += `
<item>
<title>${title} – ${display}</title>
<link>${imgUrl}</link>
<description><![CDATA[
<img src="${imgUrl}" style="max-width:100%;" />
]]></description>
</item>`;
        found = true;
        break;
      }
    }
    // Αν δεν βρέθηκε εικόνα σε 7 μέρες, skip
  }

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
<title>Πρωτοσέλιδα Εφημερίδων</title>
<link>https://protoselidaefimeridon.gr</link>
<description>Ημερήσια πρωτοσέλιδα</description>

${newItems}
${oldItems.join("\n")}

</channel>
</rss>`;

  fs.writeFileSync(rssFile, rss, "utf8");
  console.log("RSS updated successfully with 7-day history!");
}

createRSS();
