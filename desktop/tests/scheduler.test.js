/* Tests de la planification des agents — module pur, aucune dépendance Electron.
   Lancement : node --test desktop/tests/ */
const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const {
  defaultJob,
  normalizeJob,
  nextRunAt,
  scheduleLabel,
  fmtNext,
} = require("../src/scheduler");

const at = (s) => new Date(s);

describe("nextRunAt", () => {
  it("nightly : prochaine nuit après l'heure courante", () => {
    const job = { ...defaultJob(), schedule: { type: "nightly", hour: 2, minute: 0 }, enabled: true };
    const next = new Date(nextRunAt(job, at("2026-08-29T10:00:00")));
    assert.equal(next.getDate(), 30); // demain
    assert.equal(next.getHours(), 2);
    assert.equal(next.getMinutes(), 0);
  });

  it("nightly : aujourd'hui même si l'heure n'est pas encore passée", () => {
    const job = { ...defaultJob(), schedule: { type: "nightly", hour: 2, minute: 0 }, enabled: true };
    const next = new Date(nextRunAt(job, at("2026-08-29T01:00:00")));
    assert.equal(next.getDate(), 29);
    assert.equal(next.getHours(), 2);
  });

  it("hourly : prochaine minute donnée, à l'heure suivante si dépassée", () => {
    const job = { ...defaultJob(), schedule: { type: "hourly", minute: 15 }, enabled: true };
    const next = new Date(nextRunAt(job, at("2026-08-29T10:20:00")));
    assert.equal(next.getHours(), 11);
    assert.equal(next.getMinutes(), 15);
    const next2 = new Date(nextRunAt(job, at("2026-08-29T10:10:00")));
    assert.equal(next2.getHours(), 10);
    assert.equal(next2.getMinutes(), 15);
  });

  it("interval : maintenant + minutes", () => {
    const job = { ...defaultJob(), schedule: { type: "interval", minutes: 30 }, enabled: true };
    const next = new Date(nextRunAt(job, at("2026-08-29T10:00:00")));
    assert.equal(next.getTime() - at("2026-08-29T10:00:00").getTime(), 30 * 60_000);
  });

  it("désactivé → null", () => {
    const job = { ...defaultJob(), schedule: { type: "nightly", hour: 2 }, enabled: false };
    assert.equal(nextRunAt(job, at("2026-08-29T10:00:00")), null);
  });
});

describe("normalizeJob", () => {
  it("borne les heures/minutes/minutes d'intervalle", () => {
    const j = normalizeJob({
      schedule: { type: "nightly", hour: 99, minute: -5, minutes: 0 },
    });
    assert.equal(j.schedule.hour, 23);
    assert.equal(j.schedule.minute, 0);
    assert.equal(j.schedule.minutes, 1);
  });

  it("type inconnu → nightly", () => {
    assert.equal(normalizeJob({ schedule: { type: "weekly" } }).schedule.type, "nightly");
  });

  it("defaultJob intact après passage", () => {
    const d = normalizeJob(null);
    assert.equal(d.schedule.type, "nightly");
    assert.equal(d.enabled, true);
    assert.equal(d.running, false);
  });
});

describe("libellés", () => {
  it("scheduleLabel couvre les trois types", () => {
    assert.equal(scheduleLabel({ type: "nightly", hour: 2, minute: 0 }), "Chaque nuit à 02:00");
    assert.equal(scheduleLabel({ type: "hourly", minute: 30 }), "Toutes les heures, minute 30");
    assert.equal(scheduleLabel({ type: "interval", minutes: 45 }), "Toutes les 45 min");
  });

  it("fmtNext : aujourd'hui / demain / proche", () => {
    const now = at("2026-08-29T10:00:00");
    assert.equal(fmtNext(at("2026-08-29T11:00:00").toISOString(), now), "aujourd'hui 11:00");
    assert.equal(fmtNext(at("2026-08-30T02:00:00").toISOString(), now), "demain 02:00");
    assert.equal(fmtNext(at("2026-08-29T10:02:00").toISOString(), now), "dans 2 min");
    assert.equal(fmtNext(null, now), "—");
  });
});