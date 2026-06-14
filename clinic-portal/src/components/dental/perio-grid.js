"use client";
import React, { useMemo, useState } from 'react';
import { getAdultToothName } from './tooth-data';
import { Input } from '@/components/ui/input';

const UPPER_TEETH = Array.from({ length: 16 }, (_, i) => i + 1);
const LOWER_TEETH = Array.from({ length: 16 }, (_, i) => 32 - i);

// 6 sites per tooth: 0: DB, 1: B, 2: MB, 3: ML, 4: L, 5: DL
const SITES = ['DB', 'B', 'MB', 'ML', 'L', 'DL'];

export default function PerioGrid({ patientId, initialData = {}, onSave }) {
  // State shape: { pd: {}, gm: {}, cal: {}, bop: {}, mobility: {}, furcation: {} }
  const [pd, setPd] = useState(initialData.pd || {});
  const [gm, setGm] = useState(initialData.gm || {});
  const [cal, setCal] = useState(initialData.cal || {}); // can be auto-computed from PD+recession
  const [bop, setBop] = useState(initialData.bop || {}); // boolean per site
  const [mobility, setMobility] = useState(initialData.mobility || {});
  const [furcation, setFurcation] = useState(initialData.furcation || {});

  const handlePdChange = (tooth, site, val) => {
    const num = parseInt(val, 10);
    setPd(prev => ({
      ...prev,
      [tooth]: {
        ...(prev[tooth] || {}),
        [site]: isNaN(num) ? '' : num
      }
    }));
  };

  const handleGmChange = (tooth, site, val) => {
    const num = parseInt(val, 10);
    setGm(prev => ({
      ...prev,
      [tooth]: {
        ...(prev[tooth] || {}),
        [site]: isNaN(num) ? '' : num
      }
    }));
  };

  const handleCalChange = (tooth, site, val) => {
    const num = parseInt(val, 10);
    setCal(prev => ({
      ...prev,
      [tooth]: {
        ...(prev[tooth] || {}),
        [site]: isNaN(num) ? '' : num
      }
    }));
  };

  const toggleBop = (tooth, site) => {
    setBop(prev => ({
      ...prev,
      [tooth]: {
        ...(prev[tooth] || {}),
        [site]: !(prev[tooth]?.[site])
      }
    }));
  };

  const handleMobilityChange = (tooth, val) => {
    const num = parseInt(val, 10);
    setMobility(prev => ({ ...prev, [tooth]: isNaN(num) ? '' : num }));
  };

  const handleFurcationChange = (tooth, site, val) => {
    const num = parseInt(val, 10);
    setFurcation(prev => ({
      ...prev,
      [tooth]: {
        ...(prev[tooth] || {}),
        [site]: isNaN(num) ? '' : num
      }
    }));
  };

  const renderCell = (val, isAlert) => {
    return (
      <span className={`font-semibold ${isAlert ? 'text-red-600' : 'text-slate-700'}`}>
        {val !== '' && val !== undefined ? val : '-'}
      </span>
    );
  };

  const renderToothColumn = (t, isUpper) => {
    const mVal = mobility[t] ?? '';
    return (
      <div key={t} className="flex flex-col items-center border-r border-slate-200 min-w-[40px] flex-1">
        {/* Tooth number header */}
        <div className="w-full text-center py-1 bg-slate-100 font-bold text-xs border-b border-slate-200">
          {t}
        </div>
        
        {/* Mobility */}
        <div className="w-full p-1 border-b border-slate-200 flex justify-center">
          <input
            type="text"
            maxLength={1}
            value={mVal}
            onChange={(e) => handleMobilityChange(t, e.target.value)}
            className="w-6 h-6 text-center text-xs border rounded hover:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            title="Mobility (0, 1, 2, 3)"
          />
        </div>

        {/* BOP Buccal (sites 0,1,2) */}
        <div className="w-full flex border-b border-slate-200">
          {[0,1,2].map(site => (
            <button key={site} onClick={() => toggleBop(t, site)}
              className={`w-1/3 h-6 text-center text-[10px] border-r last:border-r-0 ${bop[t]?.[site] ? 'bg-red-100 text-red-600' : 'bg-white text-slate-400'}`}
              title={`BOP ${SITES[site]}`}
            >•</button>
          ))}
        </div>
        {/* PD Buccal (0,1,2) */}
        <div className="w-full flex border-b border-slate-200">
          {[0, 1, 2].map(site => {
            const val = pd[t]?.[site] ?? '';
            const isAlert = val >= 4;
            return (
              <input key={site} type="text" maxLength={2} value={val}
                onChange={(e) => handlePdChange(t, site, e.target.value)}
                className={`w-1/3 h-6 text-center text-xs border-r last:border-r-0 hover:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 ${isAlert ? 'text-red-600 font-bold bg-red-50' : ''}`}
                title={`PD ${SITES[site]}`} />
            );
          })}
        </div>
        {/* GM Buccal (0,1,2) */}
        <div className="w-full flex border-b border-slate-200">
          {[0,1,2].map(site => (
            <input key={site} type="text" maxLength={3} value={gm[t]?.[site] ?? ''}
              onChange={(e) => handleGmChange(t, site, e.target.value)}
              className="w-1/3 h-6 text-center text-xs border-r last:border-r-0 hover:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              title={`GM ${SITES[site]}`} />
          ))}
        </div>
        {/* CAL Buccal (0,1,2) */}
        <div className="w-full flex border-b border-slate-200 bg-slate-50/60">
          {[0,1,2].map(site => (
            <input key={site} type="text" maxLength={3} value={cal[t]?.[site] ?? ''}
              onChange={(e) => handleCalChange(t, site, e.target.value)}
              className="w-1/3 h-6 text-center text-xs border-r last:border-r-0 hover:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              title={`CAL ${SITES[site]}`} />
          ))}
        </div>

        {/* BOP Lingual (3,4,5) */}
        <div className="w-full flex border-b border-slate-200">
          {[3,4,5].map(site => (
            <button key={site} onClick={() => toggleBop(t, site)}
              className={`w-1/3 h-6 text-center text-[10px] border-r last:border-r-0 ${bop[t]?.[site] ? 'bg-red-100 text-red-600' : 'bg-white text-slate-400'}`}
              title={`BOP ${SITES[site]}`}
            >•</button>
          ))}
        </div>
        {/* PD Lingual (3,4,5) */}
        <div className="w-full flex border-b border-slate-200">
          {[3, 4, 5].map(site => {
            const val = pd[t]?.[site] ?? '';
            const isAlert = val >= 4;
            return (
              <input key={site} type="text" maxLength={2} value={val}
                onChange={(e) => handlePdChange(t, site, e.target.value)}
                className={`w-1/3 h-6 text-center text-xs border-r last:border-r-0 hover:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 ${isAlert ? 'text-red-600 font-bold bg-red-50' : ''}`}
                title={`PD ${SITES[site]}`} />
            );
          })}
        </div>
        {/* GM Lingual (3,4,5) */}
        <div className="w-full flex border-b border-slate-200">
          {[3,4,5].map(site => (
            <input key={site} type="text" maxLength={3} value={gm[t]?.[site] ?? ''}
              onChange={(e) => handleGmChange(t, site, e.target.value)}
              className="w-1/3 h-6 text-center text-xs border-r last:border-r-0 hover:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              title={`GM ${SITES[site]}`} />
          ))}
        </div>
        {/* CAL Lingual (3,4,5) */}
        <div className="w-full flex bg-slate-50/60">
          {[3,4,5].map(site => (
            <input key={site} type="text" maxLength={3} value={cal[t]?.[site] ?? ''}
              onChange={(e) => handleCalChange(t, site, e.target.value)}
              className="w-1/3 h-6 text-center text-xs border-r last:border-r-0 hover:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              title={`CAL ${SITES[site]}`} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 overflow-x-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-slate-800">Periodontal Chart</h3>
        <button
          onClick={() => onSave?.({ pd, gm, cal, bop, mobility, furcation })}
          className="px-3 py-1 bg-teal-600 text-white text-sm rounded hover:bg-teal-700"
        >
          Save Perio Data
        </button>
      </div>

      <div className="min-w-[800px]">
        {/* Upper Arch */}
        <div className="flex border-l border-t border-slate-200 mb-8 shadow-sm">
          <div className="w-24 shrink-0 bg-slate-50 border-r border-b border-slate-200 flex flex-col font-medium text-xs text-slate-500">
            <div className="flex-1 flex items-center px-2 border-b border-slate-200">Tooth</div>
            <div className="flex-1 flex items-center px-2 border-b border-slate-200">Mobility</div>
            <div className="flex-1 flex items-center px-2 border-b border-slate-200">BOP (Buc)</div>
            <div className="flex-1 flex items-center px-2 border-b border-slate-200" title="Buccal Pocket Depth">PD (Buccal)</div>
            <div className="flex-1 flex items-center px-2 border-b border-slate-200">GM (Buccal)</div>
            <div className="flex-1 flex items-center px-2" title="Buccal CAL">CAL (Buccal)</div>
          </div>
          <div className="flex flex-1 border-b border-slate-200">
            {UPPER_TEETH.map(t => renderToothColumn(t, true))}
          </div>
        </div>

        {/* Lower Arch */}
        <div className="flex border-l border-t border-slate-200 shadow-sm">
          <div className="w-24 shrink-0 bg-slate-50 border-r border-b border-slate-200 flex flex-col font-medium text-xs text-slate-500">
            <div className="flex-1 flex items-center px-2 border-b border-slate-200">Tooth</div>
            <div className="flex-1 flex items-center px-2 border-b border-slate-200">Mobility</div>
            <div className="flex-1 flex items-center px-2 border-b border-slate-200">BOP (Ling)</div>
            <div className="flex-1 flex items-center px-2 border-b border-slate-200" title="Buccal Pocket Depth">PD (Buccal)</div>
            <div className="flex-1 flex items-center px-2 border-b border-slate-200">GM (Lingual)</div>
            <div className="flex-1 flex items-center px-2" title="Lingual CAL">CAL (Lingual)</div>
          </div>
          <div className="flex flex-1 border-b border-slate-200">
            {LOWER_TEETH.map(t => renderToothColumn(t, false))}
          </div>
        </div>
      </div>
    </div>
  );
}
