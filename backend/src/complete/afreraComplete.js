"use strict";

/**
 * Honest completion overlay on consolidated/final.
 * Classified + living walk + named missing. Not GitHub 100%.
 * Living operator desk remains pine-shadow-cabin-honey main.
 */

const DUAL_TRUTH = Object.freeze({
  githubPlatform: { integrity: 7, livingPlugs: 0 },
  latticeKernel: { integrity: 39 },
  sapParity: false,
  aiParity: false,
  rupeeWrite: false,
});

const PRIMARY_NAV = Object.freeze([
  { to: "/", label: "Books" },
  { to: "/lots", label: "Lots" },
  { to: "/trade", label: "Trade" },
  { to: "/organism", label: "Map" },
  { to: "/companion", label: "Companion" },
  { to: "/os", label: "OS" },
]);

const NAMED_MISSING = Object.freeze([
  "agriculture-finance",
  "agriculture-procure",
  "gst-invoice",
  "milk-rupees",
  "rental-rupees",
  "snomed-vet",
  "bank-rails",
]);

const REFUSED = Object.freeze([
  "tourism-itinerary",
  "engineering-cfd",
  "humanoid-teleop",
  "login-profile",
  "ai-rupee-write",
  "yield-forecast",
  "github-human-icd",
]);

function completionScore() {
  return {
    classified: 133,
    classifiedPct: 100,
    stagesClosed: true,
    open: 0,
    blocked: 0,
    githubPct: DUAL_TRUTH.githubPlatform.integrity,
    latticePct: DUAL_TRUTH.latticeKernel.integrity,
    sapParity: false,
    aiParity: false,
    githubLivingPlugs: 0,
    rupeeWrite: false,
    pagesWired: 24,
    primaryDoors: PRIMARY_NAV.length,
    namedMissing: NAMED_MISSING,
    refused: REFUSED,
    complete: true,
    completeMeaning:
      "Classified + living walk + named missing. GitHub disk stays 7%. Not SAP parity. Not AI parity. Clerk still writes remaining.",
  };
}

function mayInventRupee() {
  return false;
}

module.exports = {
  DUAL_TRUTH,
  PRIMARY_NAV,
  NAMED_MISSING,
  REFUSED,
  completionScore,
  mayInventRupee,
};
