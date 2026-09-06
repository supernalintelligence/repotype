/**
 * REQ-IMPL-006(a): board-location-suggested-path adapter
 *
 * Compares each `storage.locations[]` entry's `path` (module.yaml/board.yaml)
 * against a suggested convention derived from its `role` (per
 * 2026-09-03-unified-board-data-location-architecture.md §4). Fires a WARN
 * only — never blocks a push, since an explicit `path:` is the author's own
 * deliberate choice and "reminiscent of our structure" is a suggestion, not a
 * mandate.
 *
 * Rule ID: board-location-suggested-path
 * Severity: warning (always — this rule never emits "error")
 */

import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import type { Diagnostic, ValidatorAdapter, ValidatorContext } from "../core/types.js";

interface StorageLocation {
  id?: unknown;
  role?: unknown;
  path?: unknown;
}

/** role -> suggested path prefix, keyed on the single-string form of `role`. */
const ROLE_SUGGESTED_PREFIX: Record<string, (boardId: string) => string> = {
  "asset-cache": (id) => `.supernal/modules/${id}/assets`,
  "bespoke-company-data": (id) => `.supernal/applications`,
};

function isBoardYaml(filePath: string): boolean {
  const normalized = filePath.replace(/\\/g, "/");
  return normalized.endsWith("/module.yaml") || normalized === "module.yaml" ||
    normalized.endsWith("/board.yaml") || normalized === "board.yaml";
}

function rolesOf(location: StorageLocation): string[] {
  if (typeof location.role === "string") return [location.role];
  if (Array.isArray(location.role)) {
    return location.role.filter((r): r is string => typeof r === "string");
  }
  return [];
}

export class BoardLocationSuggestedPathAdapter implements ValidatorAdapter {
  id = "board-location-suggested-path";

  supports(filePath: string, _context: ValidatorContext): boolean {
    return isBoardYaml(filePath);
  }

  async validate(filePath: string, _context: ValidatorContext): Promise<Diagnostic[]> {
    let raw: string;
    try {
      raw = fs.readFileSync(filePath, "utf8");
    } catch {
      return [];
    }

    let doc: Record<string, unknown>;
    try {
      const parsed = yaml.load(raw);
      if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return [];
      doc = parsed as Record<string, unknown>;
    } catch {
      return [];
    }

    const storage = doc["storage"];
    if (typeof storage !== "object" || storage === null) return [];
    const locations = (storage as Record<string, unknown>)["locations"];
    if (!Array.isArray(locations)) return [];

    const boardId =
      typeof doc["id"] === "string" ? (doc["id"] as string) : path.basename(path.dirname(filePath));

    const diagnostics: Diagnostic[] = [];

    for (const entry of locations) {
      if (typeof entry !== "object" || entry === null) continue;
      const location = entry as StorageLocation;
      if (typeof location.path !== "string" || location.path.length === 0) {
        // No explicit path at all — the entry falls back to its kind-specific
        // default (§2's `reports-cloud` example). Nothing to compare against
        // a suggested convention, so no drift to report.
        continue;
      }

      const actualPath = location.path.replace(/\/+$/, "");
      let matchedAnyRole = false;
      let suggested: string | null = null;

      for (const role of rolesOf(location)) {
        const deriveSuggested = ROLE_SUGGESTED_PREFIX[role];
        if (!deriveSuggested) continue;
        matchedAnyRole = true;
        const candidate = deriveSuggested(boardId);
        if (actualPath === candidate || actualPath.startsWith(`${candidate}/`)) {
          suggested = null;
          break;
        }
        suggested = candidate;
      }

      if (matchedAnyRole && suggested) {
        const locationId = typeof location.id === "string" ? location.id : "(no id)";
        diagnostics.push({
          code: "board_location_suggested_path_drift",
          message: `storage.locations[] entry '${locationId}' has path '${actualPath}', which does not match the suggested convention for its role ('${suggested}'). This is a suggestion, not a requirement — an explicit deviation is fine.`,
          severity: "warning",
          file: filePath,
          ruleId: this.id,
          details: {
            locationId,
            actualPath,
            suggestedPath: suggested,
          },
        });
      }
    }

    return diagnostics;
  }
}
