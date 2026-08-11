"use client";

import { useEffect, useMemo, useState } from 'react';
import Button from '@/components/ui/button';

const DEFAULT_UPPER = Array.from({ length: 16 }, (_, i) => ({ key: i + 1, display: i + 1, arch: 'upper' }));
const DEFAULT_LOWER = Array.from({ length: 16 }, (_, i) => ({ key: 32 - i, display: 32 - i, arch: 'lower' }));
const OUTSIDE_SITES = [0, 1, 2];
const INSIDE_SITES = [3, 4, 5];
const SITE_LABELS = ['Distal', 'Center', 'Mesial'];

function normalizeTeeth(teeth) {
  if (!Array.isArray(teeth) || teeth.length === 0) {
    return { upper: DEFAULT_UPPER, lower: DEFAULT_LOWER };
  }

  const normalized = teeth
    .map((tooth) => {
      const key = Number(tooth.key ?? tooth.chartNumber ?? tooth.selectionNumber ?? tooth.tooth_number ?? tooth);
      if (!Number.isFinite(key)) return null;
      return {
        key,
        display: tooth.display ?? tooth.displayNumber ?? tooth.label ?? key,
        arch: tooth.arch || (key <= 16 ? 'upper' : 'lower'),
      };
    })
    .filter(Boolean);

  const upper = normalized
    .filter((tooth) => tooth.arch === 'upper')
    .sort((a, b) => a.key - b.key);
  const lower = normalized
    .filter((tooth) => tooth.arch === 'lower')
    .sort((a, b) => b.key - a.key);

  return {
    upper: upper.length > 0 ? upper : DEFAULT_UPPER,
    lower: lower.length > 0 ? lower : DEFAULT_LOWER,
  };
}

function readSite(source, tooth, site) {
  return source?.[tooth]?.[site] ?? '';
}

function parseInteger(value) {
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? '' : parsed;
}

function setNestedValue(setter, tooth, site, value) {
  setter((previous) => ({
    ...previous,
    [tooth]: {
      ...(previous[tooth] || {}),
      [site]: parseInteger(value),
    },
  }));
}

function MetricInput({ label, value, alert, onChange }) {
  return (
    <input
      aria-label={label}
      inputMode="numeric"
      pattern="-?[0-9]*"
      maxLength={3}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={`h-7 w-full rounded-none border-0 border-r border-slate-200 bg-white text-center text-xs outline-none last:border-r-0 focus:bg-teal-50 focus:ring-1 focus:ring-inset focus:ring-teal-500 ${alert ? 'bg-red-50 font-semibold text-red-700' : 'text-slate-700'}`}
    />
  );
}

function BleedingButton({ active, label, onClick }) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={`h-7 w-full border-r border-slate-200 text-xs last:border-r-0 ${active ? 'bg-red-100 text-red-700' : 'bg-white text-slate-300 hover:bg-slate-50'}`}
    >
      ●
    </button>
  );
}

export default function PerioGrid({ initialData = {}, onSave, teeth = [] }) {
  const [pd, setPd] = useState(initialData.pd || {});
  const [gm, setGm] = useState(initialData.gm || {});
  const [bop, setBop] = useState(initialData.bop || {});
  const [mobility, setMobility] = useState(initialData.mobility || {});

  useEffect(() => {
    setPd(initialData.pd || {});
    setGm(initialData.gm || {});
    setBop(initialData.bop || {});
    setMobility(initialData.mobility || {});
  }, [initialData]);

  const arches = useMemo(() => normalizeTeeth(teeth), [teeth]);

  const toggleBleeding = (tooth, site) => {
    setBop((previous) => ({
      ...previous,
      [tooth]: {
        ...(previous[tooth] || {}),
        [site]: !previous[tooth]?.[site],
      },
    }));
  };

  const setMobilityValue = (tooth, value) => {
    setMobility((previous) => ({
      ...previous,
      [tooth]: parseInteger(value),
    }));
  };

  const save = () => {
    onSave?.({ pd, gm, cal: {}, bop, mobility, furcation: {} });
  };

  const renderBleedingSites = (tooth, sites, sideLabel) => (
    <div className="flex border-b border-slate-200">
      {sites.map((site, index) => (
        <BleedingButton
          key={site}
          active={Boolean(bop[tooth.key]?.[site])}
          label={`${sideLabel} bleeding ${SITE_LABELS[index]} for tooth ${tooth.display}`}
          onClick={() => toggleBleeding(tooth.key, site)}
        />
      ))}
    </div>
  );

  const renderMetricSites = (tooth, sites, sideLabel, source, setter, alertAt) => (
    <div className="flex border-b border-slate-200">
      {sites.map((site, index) => {
        const value = readSite(source, tooth.key, site);
        return (
          <MetricInput
            key={site}
            label={`${sideLabel} ${SITE_LABELS[index]} for tooth ${tooth.display}`}
            value={value}
            alert={alertAt ? Number(value) >= alertAt : false}
            onChange={(next) => setNestedValue(setter, tooth.key, site, next)}
          />
        );
      })}
    </div>
  );

  const renderToothColumn = (tooth) => (
    <div key={tooth.key} className="min-w-[44px] border-r border-slate-200 last:border-r-0">
      <div className="border-b border-slate-200 bg-slate-100 py-1 text-center text-xs font-semibold text-slate-700">
        {tooth.display}
      </div>
      <div className="border-b border-slate-200">
        <MetricInput
          label={`Mobility for tooth ${tooth.display}`}
          value={mobility[tooth.key] ?? ''}
          onChange={(next) => setMobilityValue(tooth.key, next)}
        />
      </div>
      {renderBleedingSites(tooth, OUTSIDE_SITES, 'Outside')}
      {renderMetricSites(tooth, OUTSIDE_SITES, 'Outside pocket depth', pd, setPd, 4)}
      {renderMetricSites(tooth, OUTSIDE_SITES, 'Outside gum margin', gm, setGm)}
      {renderBleedingSites(tooth, INSIDE_SITES, 'Inside')}
      {renderMetricSites(tooth, INSIDE_SITES, 'Inside pocket depth', pd, setPd, 4)}
      {renderMetricSites(tooth, INSIDE_SITES, 'Inside gum margin', gm, setGm)}
    </div>
  );

  const renderArch = (title, archTeeth) => (
    <div>
      <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</div>
      <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
        <div
          className="grid min-w-[900px]"
          style={{ gridTemplateColumns: `130px repeat(${archTeeth.length}, minmax(44px, 1fr))` }}
        >
          <div className="border-r border-slate-200 bg-slate-50 text-xs font-medium text-slate-600">
            {['Tooth', 'Mobility', 'Bleeding outside', 'Pockets outside', 'Gum line outside', 'Bleeding inside', 'Pockets inside', 'Gum line inside'].map((label) => (
              <div key={label} className="flex h-7 items-center border-b border-slate-200 px-2 last:border-b-0">
                {label}
              </div>
            ))}
          </div>
          <div className="contents">
            {archTeeth.map(renderToothColumn)}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-app-muted">
          Enter whole millimeters. Pocket values of 4 or more are highlighted.
        </div>
        <Button size="sm" onClick={save}>Save Chart</Button>
      </div>

      {renderArch('Upper Teeth', arches.upper)}
      {renderArch('Lower Teeth', arches.lower)}
    </div>
  );
}
