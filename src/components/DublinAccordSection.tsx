import React from 'react';
import { DublinAccord } from '../types';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';

interface DublinAccordSectionProps {
  standards: DublinAccord[];
  profileType: 'DK' | 'DP' | 'NA';
  onEdit?: (standard: DublinAccord) => void;
  onDelete?: (id: string) => void;
}

export const DublinAccordSection: React.FC<DublinAccordSectionProps> = ({ standards, profileType, onEdit, onDelete }) => {
  const filtered = standards.filter(s => s.profile_type === profileType);
  
  return (
    <div className="space-y-4">
      {filtered.map((standard) => (
        <div key={standard.id} className="p-4 bg-slate-50 rounded-lg border border-slate-100 flex justify-between items-start group">
          <div>
            <h4 className="font-semibold text-slate-900 mb-1">
              {standard.code}: {standard.title}
            </h4>
            <p className="text-sm text-slate-600">{standard.description}</p>
          </div>
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(standard)}
                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors h-auto w-auto"
                title="Edit"
              >
                <Edit size={16} strokeWidth={2.5} />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(standard.id)}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors h-auto w-auto"
                title="Delete"
              >
                <Trash2 size={16} strokeWidth={2.5} />
              </Button>
            )}
          </div>
        </div>
      ))}
      {filtered.length === 0 && (
        <div className="p-8 text-center text-slate-500 text-sm">
          No standards found for this profile.
        </div>
      )}
    </div>
  );
};
