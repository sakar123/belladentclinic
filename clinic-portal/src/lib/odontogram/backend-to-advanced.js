"use client";

import { backendToAdvancedToothNumber, isBackendPrimaryTooth } from "./tooth-map";

const DEFAULT_GLOBALS = {
  wisdomVisible: true,
  showBase: true,
  occlusalVisible: true,
  showHealthyPulp: true,
  edentulous: false,
};

function statusCodeFor(tooth) {
  return String(
    tooth?.tooth_status?.code ||
    tooth?.toothStatus?.code ||
    tooth?.status_code ||
    tooth?.statusCode ||
    tooth?.code ||
    ""
  ).toUpperCase();
}

function descriptionFor(tooth) {
  return tooth?.tooth_status?.description || tooth?.toothStatus?.description || tooth?.status || "";
}

function advancedStateForTooth(tooth, options = {}) {
  const code = statusCodeFor(tooth);
  const rawNumber = tooth.tooth_number ?? tooth.toothNumber ?? tooth.number;
  const state = {
    toothSelection: isBackendPrimaryTooth(rawNumber, options) ? "milktooth" : "tooth-base",
  };

  if (code.includes("MISSING")) {
    return { toothSelection: "none" };
  }
  if (code.includes("EXTRACT")) {
    return { toothSelection: "none", extractionWound: true };
  }
  if (code.includes("IMPACT")) {
    return { toothSelection: "tooth-under-gum" };
  }
  if (code.includes("IMPLANT")) {
    return { toothSelection: "implant" };
  }
  if (code.includes("DENTURE")) {
    return { toothSelection: "none", prosthesis: "removable-partial" };
  }
  if (code.includes("CROWN") || code.includes("BRIDGE") || code.includes("PONTIC") || code.includes("VENEER")) {
    state.restorationType = code.includes("BRIDGE") || code.includes("PONTIC") ? "bridge" : code.includes("VENEER") ? "veneer" : "crown";
    state.restorationMaterial = "metal-ceramic";
  }
  if (code.includes("FILLED") || code.includes("FILLING")) {
    state.fillingMaterial = "composite";
  }
  if (code.includes("RCT") || code.includes("ROOT_CANAL")) {
    state.endo = "endo-filling";
  }
  if (code.includes("POST")) {
    state.endo = "endo-metal-pin";
  }
  if (code.includes("ROOT") || code.includes("RADIX")) {
    state.toothSubstrate = "radix";
  }
  if (code.includes("FRACT")) {
    state.toothSubstrate = "broken";
  }
  if (code.includes("CALCULUS")) {
    state.calculus = true;
  }
  if (code.includes("MOBILITY")) {
    state.mobility = "grade1";
  }
  if (code.includes("PERIOD") || code.includes("ABSCESS")) {
    state.mods = ["inflammation"];
  }
  if (code.includes("CARIES") || code.includes("CAVITY")) {
    state.caries = ["occlusal"];
  }

  const note = descriptionFor(tooth);
  if (note && !code.includes("HEALTHY")) {
    state.note = note;
  }

  return state;
}

export function unwrapAdvancedSnapshotPayload(snapshot) {
  const payload = snapshot?.payload || snapshot;
  if (!payload) return null;
  return payload.statusChart || payload.chart || payload;
}

function shouldUseLegacyPrimaryUniversal(teeth = [], primaryMode = false) {
  if (!primaryMode) return false;
  const numbers = (teeth || [])
    .map((tooth) => Number(tooth.tooth_number ?? tooth.toothNumber ?? tooth.number))
    .filter(Number.isFinite);
  return numbers.length > 0 && numbers.every((number) => number >= 1 && number <= 20);
}

export function buildAdvancedOdontogramPayload({ teeth = [], snapshot = null, primaryMode = false } = {}) {
  const persisted = unwrapAdvancedSnapshotPayload(snapshot);
  if (persisted?.version && persisted?.teeth) {
    return persisted;
  }

  const adapterOptions = {
    primaryUniversal: shouldUseLegacyPrimaryUniversal(teeth, primaryMode),
  };
  const advancedTeeth = {};
  for (const tooth of teeth || []) {
    const rawNumber = tooth.tooth_number ?? tooth.toothNumber ?? tooth.number;
    const advancedNumber = backendToAdvancedToothNumber(rawNumber, adapterOptions);
    if (!advancedNumber) continue;
    advancedTeeth[String(advancedNumber)] = advancedStateForTooth(tooth, adapterOptions);
  }

  return {
    version: "2.19",
    globals: DEFAULT_GLOBALS,
    teeth: advancedTeeth,
  };
}
