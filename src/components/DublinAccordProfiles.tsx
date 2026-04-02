import React from 'react';
import { DublinAccord } from '../types';
import { DublinAccordSection } from './DublinAccordSection';

interface ProfileProps {
  standards: DublinAccord[];
  onEdit?: (standard: DublinAccord) => void;
  onDelete?: (id: string) => void;
}

export const DublinAccordDK: React.FC<ProfileProps> = ({ standards, onEdit, onDelete }) => (
  <DublinAccordSection standards={standards} profileType="DK" onEdit={onEdit} onDelete={onDelete} />
);

export const DublinAccordDP: React.FC<ProfileProps> = ({ standards, onEdit, onDelete }) => (
  <DublinAccordSection standards={standards} profileType="DP" onEdit={onEdit} onDelete={onDelete} />
);

export const DublinAccordNA: React.FC<ProfileProps> = ({ standards, onEdit, onDelete }) => (
  <DublinAccordSection standards={standards} profileType="NA" onEdit={onEdit} onDelete={onDelete} />
);
