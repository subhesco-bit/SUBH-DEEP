export type SystemFamily = "core" | "agent" | "domain" | "mouth";
export type SystemActual =
  | "stub"
  | "skeleton"
  | "partial"
  | "duplicate"
  | "unplugged";

export type SystemPlugStatus = "missing" | "partial" | "living";

export type AiSystem = {
  id: string;
  name: string;
  short: string;
  moduleId: string;
  family: SystemFamily;
  /** What module.json claims. */
  declared: string;
  /** What the files actually are. */
  actual: SystemActual;
  bytesCanonical: number;
  bytesLegacy: number | null;
  liveCallers: number;
  isComplete: boolean;
  frontend: boolean;
  routes: boolean;
  tests: boolean;
  /** Organs this module was supposed to plug into. */
  organs: string[];
  path: string;
  contract: string;
  silo: string;
  plug: string;
};

export type SystemStats = {
  systems: number;
  wiredButSkeleton: number;
  stubs: number;
  duplicates: number;
  livingPlugs: number;
  partialPlugs: number;
  missingPlugs: number;
  moduleDirs: number;
  namedAiModules: number;
};
