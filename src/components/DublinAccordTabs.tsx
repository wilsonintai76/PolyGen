import React, { useState } from 'react';
import { DublinAccord } from '../types';
import { DublinAccordDK, DublinAccordDP, DublinAccordNA } from './DublinAccordProfiles';
import { Button } from '@/components/ui/button';

interface DublinAccordTabsProps {
  standards: DublinAccord[];
  onEdit?: (standard: DublinAccord) => void;
  onDelete?: (id: string) => void;
}

export const DublinAccordTabs: React.FC<DublinAccordTabsProps> = ({ standards, onEdit, onDelete }) => {
  const [activeTab, setActiveTab] = useState<'DK' | 'DP' | 'NA'>('DK');

  const tabs = [
    { id: 'DK', label: 'DK: Knowledge Profile', desc: 'Procedural & Codified' },
    { id: 'DP', label: 'DP: Problem Solving', desc: 'Well-defined' },
    { id: 'NA', label: 'NA: Engineering Activities', desc: 'Defined' },
  ] as const;

  return (
    <div className="w-full space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tabs.map((tab) => (
          <Button
            variant="outline"
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`p-4 rounded-xl border-2 transition-all text-left h-auto flex-col items-start ${
              activeTab === tab.id
                ? 'border-indigo-600 bg-indigo-50 shadow-md hover:bg-indigo-50 hover:border-indigo-600'
                : 'border-slate-200 bg-white hover:border-indigo-200 hover:bg-slate-50'
            }`}
          >
            <h3 className={`font-bold ${activeTab === tab.id ? 'text-indigo-900' : 'text-slate-900'}`}>
              {tab.label}
            </h3>
            <p className={`text-sm ${activeTab === tab.id ? 'text-indigo-700' : 'text-slate-500'}`}>
              {tab.desc}
            </p>
          </Button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4">
          {tabs.find(t => t.id === activeTab)?.label}
        </h2>
        {activeTab === 'DK' && <DublinAccordDK standards={standards} onEdit={onEdit} onDelete={onDelete} />}
        {activeTab === 'DP' && <DublinAccordDP standards={standards} onEdit={onEdit} onDelete={onDelete} />}
        {activeTab === 'NA' && <DublinAccordNA standards={standards} onEdit={onEdit} onDelete={onDelete} />}
      </div>
    </div>
  );
};
