const SHEET_ID = "180CqEujgBjJPjP9eU8C--xMj-VTBSrRUrM_98-S0gjo";
const OFFLINE_THRESHOLD = 48;
const SKIP_RN = ["not running", "device removed"];

export interface ClientStat {
  name: string;
  offline: number;
  total: number;
}

export interface ShameData {
  clients: ClientStat[];
  grandOffline: number;
  grandTotal: number;
  lastUpdated: string;
}

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  for (const line of text.split("\n")) {
    if (!line.trim()) continue;
    const cols: string[] = [];
    let inQ = false, cur = "";
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQ && line[i + 1] === '"') { cur += '"'; i++; }
        else inQ = !inQ;
      } else if (ch === "," && !inQ) {
        cols.push(cur.trim()); cur = "";
      } else {
        cur += ch;
      }
    }
    cols.push(cur.trim());
    rows.push(cols);
  }
  return rows;
}

function findCol(headers: string[], ...names: string[]): number {
  for (const name of names) {
    const needle = name.toLowerCase().replace(/[^a-z0-9]/g, "");
    const i = headers.findIndex(
      (h) => h.toLowerCase().replace(/[^a-z0-9]/g, "").includes(needle)
    );
    if (i !== -1) return i;
  }
  return -1;
}

export async function getShameData(): Promise<ShameData> {
  const urls = [
    `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=0`,
    `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Sheet1`,
  ];

  let text = "";
  let lastErr = "";

  for (const url of urls) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (res.ok) { text = await res.text(); break; }
      lastErr = `HTTP ${res.status}`;
    } catch (e: unknown) {
      lastErr = e instanceof Error ? e.message : "Unknown error";
    }
  }

  if (!text) throw new Error("Sheet fetch failed: " + lastErr);

  const rows = parseCSV(text);
  if (rows.length < 2) throw new Error("Sheet is empty or has no data rows");

  const H = rows[0].map((h) => h.trim());
  const cC = findCol(H, "client");
  const vC = findCol(H, "vehiclenumber", "vehicle number", "vehicle");
  const oC = findCol(H, "offlinehicehrs", "offline since", "offline");
  const rC = findCol(H, "r/n", "rn", "running");

  if (cC === -1) throw new Error("'client' column not found. Headers: " + H.join(", "));
  if (vC === -1) throw new Error("'Vehicle Number' column not found. Headers: " + H.join(", "));
  if (oC === -1) throw new Error("'Offline Since' column not found. Headers: " + H.join(", "));

  const clientOffline: Record<string, number> = {};
  const clientTotal: Record<string, number> = {};
  let grandOffline = 0;
  let grandTotal = 0;

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const client = (row[cC] || "").trim();
    const vehicle = (row[vC] || "").trim();
    if (!client || !vehicle) continue;

    grandTotal++;
    clientTotal[client] = (clientTotal[client] || 0) + 1;

    if (rC !== -1) {
      const rnVal = (row[rC] || "").trim().toLowerCase();
      if (SKIP_RN.some((s) => rnVal.includes(s))) continue;
    }

    const hrs = parseFloat((row[oC] || "").replace(/,/g, ""));
    if (isNaN(hrs) || hrs < OFFLINE_THRESHOLD) continue;

    grandOffline++;
    clientOffline[client] = (clientOffline[client] || 0) + 1;
  }

  const clients: ClientStat[] = Object.entries(clientOffline)
    .map(([name, offline]) => ({ name, offline, total: clientTotal[name] || 0 }))
    .sort((a, b) => b.offline - a.offline);

  return {
    clients,
    grandOffline,
    grandTotal,
    lastUpdated: new Date().toISOString(),
  };
}
