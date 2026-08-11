"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { Save, RotateCcw } from "lucide-react";
import { api } from "@/lib/api";
import Button from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { buildAdvancedOdontogramPayload } from "@/lib/odontogram/backend-to-advanced";

const OdontogramShell = dynamic(
  () => import("react-advanced-odontogram").then((mod) => mod.OdontogramShell || mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[520px] rounded border border-app-border bg-white p-6 text-sm text-app-muted">
        Loading odontogram...
      </div>
    ),
  }
);

const SOURCE_VERSION = "react-advanced-odontogram@2.2.0";

export default function AdvancedOdontogramClient({ patientId, teeth, snapshot, readOnly = false, primaryMode = false }) {
  const { notify } = useToast();
  const payload = useMemo(() => buildAdvancedOdontogramPayload({ teeth, snapshot, primaryMode }), [teeth, snapshot, primaryMode]);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const loadedPayloadRef = useRef("");

  useEffect(() => {
    let cancelled = false;
    let unsubscribe = null;
    let timer = null;
    const serialized = JSON.stringify(payload || {});
    const loadedKey = `${reloadKey}:${serialized}`;

    import("react-advanced-odontogram").then((mod) => {
      if (cancelled) return;
      timer = window.setTimeout(() => {
        if (cancelled || loadedPayloadRef.current === loadedKey) return;
        mod.importStatus(payload);
        if (payload?._planChart && typeof mod.setPlanChart === "function") {
          mod.setPlanChart(payload._planChart);
        }
        loadedPayloadRef.current = loadedKey;
        setDirty(false);
        unsubscribe = mod.onStateChange?.(() => setDirty(true));
      }, 100);
    });

    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
      if (unsubscribe) unsubscribe();
    };
  }, [payload, reloadKey]);

  async function saveSnapshot() {
    if (readOnly) return;
    setSaving(true);
    try {
      const mod = await import("react-advanced-odontogram");
      const statusChart = mod.getStatusChart();
      const planChart = mod.getPlanChart?.();
      await api.odontogram.saveSnapshot(patientId, {
        source_version: SOURCE_VERSION,
        payload: {
          ...statusChart,
          _planChart: planChart,
          _clinic: {
            provider: "react-advanced-odontogram",
            sourceVersion: SOURCE_VERSION,
            savedAt: new Date().toISOString(),
          },
        },
      });
      setDirty(false);
      notify({ title: "Odontogram saved" });
    } catch (error) {
      notify({ title: "Could not save odontogram", description: error?.info?.message || error?.message || "Save failed" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded border border-app-border bg-white px-3 py-2">
        <div>
          <div className="text-sm font-semibold">Advanced odontogram</div>
          <div className="text-xs text-app-muted">{dirty ? "Unsaved chart edits" : "Synced with saved snapshot or backend teeth"}</div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => setReloadKey((value) => value + 1)}>
            <RotateCcw size={14} className="mr-1" /> Reload
          </Button>
          {!readOnly && (
            <Button size="sm" onClick={saveSnapshot} disabled={saving}>
              <Save size={14} className="mr-1" /> {saving ? "Saving..." : "Save snapshot"}
            </Button>
          )}
        </div>
      </div>
      <div className="advanced-odontogram-scope min-h-[720px] overflow-x-auto rounded border border-app-border bg-white">
        <div className="min-w-[1180px]">
          <OdontogramShell
            key={reloadKey}
            language="en"
            numberingSystem="FDI"
            darkMode={false}
            readOnly={readOnly}
            enableNotes
            enableIcdas
            surfaceNotation="full"
            themeConfig={{
              colors: {
                background: "#f8fafc",
                panel: "#ffffff",
                card: "#ffffff",
                text: "#0f172a",
                muted: "#64748b",
                line: "#d7e0ec",
                accent: "#0f766e",
                accent2: "#0284c7",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
