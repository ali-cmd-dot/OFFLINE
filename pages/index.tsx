import React, { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import { ShameData, ClientStat } from "@/lib/shame";

function offlineColor(pct: number): string {
  if (pct >= 0.5) return "#f87171";
  if (pct >= 0.25) return "#fde047";
  return "#4ade80";
}

// ── Sub-clients Modal ────────────────────────────────────────────────────────
function SubClientModal({ client, onClose }: { client: ClientStat; onClose: () => void }) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [onClose]);

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(5,12,5,0.88)",
        backdropFilter: "blur(16px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "20px",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: "#0e160e",
        border: "1px solid rgba(248,113,113,0.2)",
        borderRadius: "20px",
        width: "100%", maxWidth: "520px",
        maxHeight: "85vh",
        display: "flex", flexDirection: "column",
        boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
        overflow: "hidden",
      }}>
        {/* Modal Header */}
        <div style={{
          padding: "20px 24px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexShrink: 0,
        }}>
          <div>
            <div style={{
              fontSize: "9px", letterSpacing: "0.14em", textTransform: "uppercase",
              color: "rgba(248,113,113,0.55)", fontFamily: "'Inter', sans-serif",
              fontWeight: 600, marginBottom: "3px",
            }}>
              Sub-Clients · 72+ hrs offline
            </div>
            <h2 style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontWeight: 800, fontSize: "20px", color: "#f0f7f0", margin: 0,
            }}>
              {client.name}
            </h2>
            <div style={{
              fontSize: "12px", color: "rgba(255,255,255,0.3)",
              fontFamily: "'Inter', sans-serif", marginTop: "3px",
            }}>
              <span style={{ color: "#f87171", fontWeight: 700 }}>{client.offline}</span>
              {" "}offline &nbsp;/&nbsp; {client.total} total vehicles
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.06)", border: "none",
              borderRadius: "8px", width: "30px", height: "30px",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "rgba(255,255,255,0.4)", flexShrink: 0,
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Sub-client list */}
        <div style={{ flex: 1, overflowY: "auto", padding: "14px 24px 20px" }}>
          {client.subClients.length === 0 ? (
            <div style={{
              textAlign: "center", padding: "40px",
              color: "rgba(255,255,255,0.2)",
              fontFamily: "'Inter', sans-serif", fontSize: "13px",
            }}>
              No sub-clients with offline vehicles
            </div>
          ) : (
            <>
              {/* Column headers */}
              <div style={{
                display: "flex", justifyContent: "space-between",
                padding: "0 14px 8px",
                fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase",
                color: "rgba(255,255,255,0.22)", fontFamily: "'Inter', sans-serif",
              }}>
                <span>Sub-Client</span>
                <span>Offline / Total</span>
              </div>

              {client.subClients.map((sub, i) => {
                const pct = sub.total > 0 ? sub.offline / sub.total : 0;
                const clr = offlineColor(pct);
                return (
                  <div
                    key={sub.name}
                    className="card-anim"
                    style={{
                      animationDelay: `${i * 0.04}s`,
                      display: "flex", alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.05)",
                      marginBottom: "6px",
                    }}
                  >
                    {/* left: dot + name */}
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                      <div style={{
                        width: "7px", height: "7px", borderRadius: "50%",
                        background: clr, flexShrink: 0,
                        boxShadow: `0 0 6px ${clr}80`,
                      }} />
                      <span style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "13px", fontWeight: 500, color: "#f0f7f0",
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      }}>
                        {sub.name}
                      </span>
                    </div>

                    {/* right: bar + count */}
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
                      <div style={{
                        width: "72px", height: "3px",
                        background: "rgba(255,255,255,0.07)", borderRadius: "2px", overflow: "hidden",
                      }}>
                        <div style={{
                          height: "100%",
                          width: `${Math.min(100, (sub.offline / Math.max(sub.total, 1)) * 100)}%`,
                          background: clr, transition: "width 0.8s ease-out",
                        }} />
                      </div>
                      <span style={{
                        fontFamily: "'Bricolage Grotesque', sans-serif",
                        fontWeight: 800, fontSize: "14px", color: clr, minWidth: "28px", textAlign: "right",
                      }}>
                        {sub.offline}
                      </span>
                      <span style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "11px", color: "rgba(255,255,255,0.25)", minWidth: "40px",
                      }}>
                        / {sub.total}
                      </span>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Grand Total Box ──────────────────────────────────────────────────────────
function GrandBox({ offline, total }: { offline: number; total: number }) {
  return (
    <div className="card-anim shame-box shame-box--grand" style={{ animationDelay: "0s" }}>
      <div className="shame-box__label">Grand Total</div>
      <div className="shame-box__count" style={{ color: "#f87171" }}>{offline}</div>
      <div className="shame-box__total">{total}</div>
    </div>
  );
}

// ── Client Box ───────────────────────────────────────────────────────────────
function ClientBox({
  client, index, onClick,
}: {
  client: ClientStat; index: number; onClick: () => void;
}) {
  const pct = client.total > 0 ? client.offline / client.total : 0;
  const clr = offlineColor(pct);
  const hasSubClients = client.subClients.length > 1;

  return (
    <div
      className="card-anim shame-box"
      style={{ animationDelay: `${index * 0.05}s`, cursor: hasSubClients ? "pointer" : "default" }}
      title={hasSubClients ? `Click to see ${client.subClients.length} sub-clients` : client.name}
      onClick={hasSubClients ? onClick : undefined}
    >
      {/* top accent */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "2px",
        background: `linear-gradient(90deg, transparent, ${clr}60, transparent)`,
        borderRadius: "12px 12px 0 0",
      }} />

      {/* sub-client indicator */}
      {hasSubClients && (
        <div style={{
          position: "absolute", top: "10px", right: "10px",
          background: `${clr}18`, border: `1px solid ${clr}35`,
          borderRadius: "5px", padding: "1px 6px",
          fontSize: "9px", fontWeight: 700,
          color: clr, fontFamily: "'Inter', sans-serif",
          letterSpacing: "0.05em",
        }}>
          {client.subClients.length}
        </div>
      )}

      <div className="shame-box__label">{client.name}</div>
      <div className="shame-box__count" style={{ color: clr }}>{client.offline}</div>
      <div className="shame-box__total">{client.total}</div>
    </div>
  );
}

// ── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="shame-grid">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="shame-box shame-box--skeleton" />
      ))}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function WallOfShame() {
  const [data, setData]               = useState<ShameData | null>(null);
  const [loading, setLoading]         = useState(true);
  const [refreshing, setRefreshing]   = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [updated, setUpdated]         = useState("");
  const [search, setSearch]           = useState("");
  const [selected, setSelected]       = useState<ClientStat | null>(null);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    setError(null);
    try {
      const res = await fetch("/api/shame");
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.details || e.error || "Fetch failed");
      }
      const json: ShameData = await res.json();
      setData(json);
      setUpdated(
        new Date(json.lastUpdated).toLocaleString("en-IN", {
          day: "2-digit", month: "short", year: "numeric",
          hour: "2-digit", minute: "2-digit",
        })
      );
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = data?.clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  return (
    <>
      <Head>
        <title>Wall of Shame — Cautio</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 70% 40% at 15% 0%, rgba(248,113,113,0.06) 0%, transparent 60%)",
      }} />

      <div style={{ position: "relative", zIndex: 1, minHeight: "100vh" }}>

        {/* HEADER */}
        <header className="shame-header">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <img src="/favicon.png" alt="Cautio" style={{ width: "34px", height: "34px", objectFit: "contain" }} />
            <div>
              <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: "17px", color: "#f0f7f0", letterSpacing: "-0.01em", lineHeight: 1.2 }}>
                Cautio
              </div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "9px", color: "rgba(74,222,128,0.6)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
                Fleet Intelligence
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            {updated && (
              <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.22)", fontFamily: "'Inter', sans-serif" }}>
                {updated}
              </span>
            )}
            <button className="btn-green" onClick={() => fetchData(true)} disabled={refreshing}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                style={{ animation: refreshing ? "spin 1s linear infinite" : "none" }}>
                <polyline points="1 4 1 10 7 10" />
                <path d="M3.51 15a9 9 0 1 0 .49-4.14" />
              </svg>
              Refresh
            </button>
          </div>
        </header>

        {/* HERO */}
        <div style={{ padding: "36px 32px 20px" }}>
          <div style={{ fontSize: "10px", letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(248,113,113,0.6)", fontFamily: "'Inter', sans-serif", fontWeight: 600, marginBottom: "8px" }}>
            Offline &gt; 72 Hours
          </div>
          <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: "clamp(26px, 4vw, 44px)", color: "#f0f7f0", letterSpacing: "-0.025em", lineHeight: 1.1, marginBottom: "8px" }}>
            Wall Of <span style={{ color: "#f87171", fontStyle: "italic" }}>Shame</span>
          </h1>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "rgba(240,247,240,0.38)", lineHeight: 1.6, maxWidth: "480px" }}>
            Vehicles offline for 72+ hours, grouped by client. Excludes{" "}
            <span style={{ color: "rgba(255,255,255,0.55)" }}>Not Running</span> &{" "}
            <span style={{ color: "rgba(255,255,255,0.55)" }}>Device Removed</span>.
            Click a box to see sub-clients.
          </p>
        </div>

        {/* SEARCH + COUNT */}
        {data && (
          <div style={{ padding: "0 32px 20px", display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: 1, maxWidth: "300px" }}>
              <svg style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}
                width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search clients..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%", background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)", borderRadius: "9px",
                  padding: "8px 14px 8px 34px", color: "#f0f7f0",
                  fontFamily: "'Inter', sans-serif", fontSize: "13px", outline: "none",
                }}
              />
            </div>
            <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.22)", fontFamily: "'Inter', sans-serif" }}>
              {filtered.length} clients &nbsp;·&nbsp;{" "}
              <span style={{ color: "#f87171", fontWeight: 600 }}>{data.grandOffline}</span>{" "}
              offline &nbsp;/&nbsp; {data.grandTotal} total
            </span>
          </div>
        )}

        {/* CONTENT */}
        <div style={{ padding: "0 32px 60px" }}>
          {error && (
            <div style={{ padding: "14px 18px", borderRadius: "12px", background: "rgba(248,113,113,0.07)", border: "1px solid rgba(248,113,113,0.2)", marginBottom: "20px" }}>
              <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, color: "#f87171", fontSize: "13px", marginBottom: "4px" }}>
                ⚠️ Failed to load data
              </div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "rgba(255,255,255,0.35)", marginBottom: "10px", wordBreak: "break-all" }}>
                {error}
              </div>
              <button className="btn-green" onClick={() => fetchData(true)}>Retry</button>
            </div>
          )}

          {loading && <Skeleton />}

          {!loading && data && (
            <div className="shame-grid">
              {!search && <GrandBox offline={data.grandOffline} total={data.grandTotal} />}
              {filtered.map((client, i) => (
                <ClientBox
                  key={client.name}
                  client={client}
                  index={i}
                  onClick={() => setSelected(client)}
                />
              ))}
              {filtered.length === 0 && search && (
                <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "60px", color: "rgba(255,255,255,0.2)", fontFamily: "'Inter', sans-serif", fontSize: "14px" }}>
                  No results for &quot;{search}&quot;
                </div>
              )}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <footer style={{ borderTop: "1px solid rgba(255,255,255,0.04)", padding: "14px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "rgba(255,255,255,0.16)" }}>
            © {new Date().getFullYear()} Cautio · Fleet Intelligence Platform
          </span>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "rgba(74,222,128,0.3)" }}>
            cautio.com
          </span>
        </footer>
      </div>

      {/* MODAL */}
      {selected && <SubClientModal client={selected} onClose={() => setSelected(null)} />}

      <style jsx global>{`
        .shame-header {
          position: sticky; top: 0; z-index: 100; height: 60px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          background: rgba(10,15,10,0.92);
          backdrop-filter: blur(24px);
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 32px;
        }
        .shame-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
          gap: 12px;
        }
        .shame-box {
          position: relative;
          background: #111811;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          padding: 14px 16px 12px;
          transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
          overflow: hidden;
        }
        .shame-box:hover {
          border-color: rgba(255,255,255,0.18);
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(0,0,0,0.35);
        }
        .shame-box--grand {
          background: #130e0e;
          border-color: rgba(248,113,113,0.3);
        }
        .shame-box--grand:hover {
          border-color: rgba(248,113,113,0.55);
          box-shadow: 0 12px 32px rgba(248,113,113,0.08);
        }
        .shame-box--skeleton {
          background: rgba(255,255,255,0.03);
          border-color: rgba(255,255,255,0.05);
          height: 100px;
          animation: pulse 1.4s ease-in-out infinite;
        }
        @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.7; } }
        .shame-box__label {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 12px; font-weight: 700;
          color: rgba(240,247,240,0.55);
          margin-bottom: 4px;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          letter-spacing: 0.01em;
        }
        .shame-box__count {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 48px; font-weight: 900;
          line-height: 1; letter-spacing: -0.03em;
        }
        .shame-box__total {
          font-family: 'Inter', sans-serif;
          font-size: 13px; color: rgba(255,255,255,0.22); margin-top: 4px;
        }
        input:focus { outline: none; border-color: rgba(74,222,128,0.4) !important; }
        input::placeholder { color: rgba(255,255,255,0.2); }
      `}</style>
    </>
  );
}
