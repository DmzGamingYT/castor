/* Planification des agents — module pur, testable sans Electron.
   Les jobs sont décrits par un objet { schedule, enabled, lastRunAt… }
   et l'échéance suivante se calcule de manière *stateless* depuis
   « maintenant » : après chaque cycle, le main recalcule nextRunAt(job). */

const SCHEDULE_TYPES = ["nightly", "hourly", "interval"];

function defaultJob() {
  return {
    id: null,
    name: "",
    prompt: "",
    schedule: { type: "nightly", hour: 2, minute: 0, minutes: 30 },
    providerId: "",
    model: "",
    wsPath: null,
    enabled: true,
    autoApprove: false,
    running: false,
    createdAt: null,
    lastRunAt: null,
    lastStatus: null, // "ok" | "error" | "cancelled" | null
    lastSummary: "",
    lastError: "",
    nextRunAt: null,
    lastResults: [], // [{ t, status, summary }] — détail des derniers cycles
  };
}

/* Assainit un job venu du renderer ou du fichier (bornes, types). */
function normalizeJob(raw) {
  const base = defaultJob();
  const j = {
    ...base,
    ...(raw || {}),
    schedule: { ...base.schedule, ...((raw && raw.schedule) || {}) },
  };
  if (!SCHEDULE_TYPES.includes(j.schedule.type)) j.schedule.type = "nightly";
  const clamp = (v, lo, hi, fallback) => {
    const n = Math.floor(Number(v));
    return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : fallback;
  };
  j.schedule.hour = clamp(j.schedule.hour, 0, 23, 2);
  j.schedule.minute = clamp(j.schedule.minute, 0, 59, 0);
  j.schedule.minutes = clamp(j.schedule.minutes, 1, 1440, 30);
  if (!Array.isArray(j.lastResults)) j.lastResults = [];
  return j;
}

/* Prochaine échéance strictement après `now` (ISO), null si désactivé. */
function nextRunAt(job, now = new Date()) {
  const j = normalizeJob(job);
  if (!j.enabled) return null;
  const s = j.schedule;
  if (s.type === "interval") {
    return new Date(now.getTime() + s.minutes * 60_000).toISOString();
  }
  // jamais « maintenant » : on part une seconde après l'instant présent
  const d = new Date(now.getTime() + 1000);
  if (s.type === "nightly") {
    const t = new Date(d);
    t.setHours(s.hour, s.minute, 0, 0);
    if (t <= d) t.setDate(t.getDate() + 1);
    return t.toISOString();
  }
  // hourly : à la minute donnée, à l'heure suivante
  const t = new Date(d);
  t.setMinutes(s.minute, 0, 0);
  if (t <= d) t.setTime(t.getTime() + 3_600_000);
  return t.toISOString();
}

/* Libellé court de la fréquence (affiché dans la sidebar). */
function scheduleLabel(s) {
  if (!s) return "";
  if (s.type === "nightly")
    return `Chaque nuit à ${String(s.hour).padStart(2, "0")}:${String(s.minute).padStart(2, "0")}`;
  if (s.type === "hourly") return `Toutes les heures, minute ${String(s.minute).padStart(2, "0")}`;
  return `Toutes les ${s.minutes} min`;
}

/* Libellé humain d'une échéance ISO (aujourd'hui/demain/date + heure). */
function fmtNext(iso, now = new Date()) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const diff = d.getTime() - now.getTime();
  if (diff < 0) return "maintenant";
  if (diff < 60_000) return "à l'instant";
  if (diff < 3_600_000) return `dans ${Math.max(1, Math.round(diff / 60_000))} min`;
  const hm = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  if (d.toDateString() === now.toDateString()) return `aujourd'hui ${hm}`;
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (d.toDateString() === tomorrow.toDateString()) return `demain ${hm}`;
  return `${d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })} ${hm}`;
}

module.exports = {
  SCHEDULE_TYPES,
  defaultJob,
  normalizeJob,
  nextRunAt,
  scheduleLabel,
  fmtNext,
};