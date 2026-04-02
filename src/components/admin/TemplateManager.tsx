
import React, { useState, useEffect } from 'react';
import { AssessmentTemplate } from '../../types';
import { api } from '../../services/api';
import { DEFAULT_TEMPLATE } from '../../constants';
import { LucideLayout, LucidePlus, LucideTrash2, LucideSave, LucideChevronUp, LucideChevronDown, LucideEye, LucideEyeOff, LucideSettings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface TemplateManagerProps {
  onUpdate?: () => void;
  showToast?: (message: string, section: string) => void;
}

export const TemplateManager: React.FC<TemplateManagerProps> = ({ onUpdate, showToast }) => {
  const [templates, setTemplates] = useState<AssessmentTemplate[]>([]);
  const [editingTemplate, setEditingTemplate] = useState<AssessmentTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      const data = await api.templates.list();
      // Ensure default template is always there if no templates exist
      if (data.length === 0) {
        setTemplates([DEFAULT_TEMPLATE]);
      } else {
        setTemplates(data);
      }
    } catch (error) {
      console.error("Failed to load templates", error);
      setTemplates([DEFAULT_TEMPLATE]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editingTemplate) return;
    try {
      await api.templates.save(editingTemplate);
      if (showToast) showToast("Template saved successfully!", "Template Manager");
      setEditingTemplate(null);
      loadTemplates();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Failed to save template", error);
      if (showToast) showToast("Failed to save template.", "Error");
    }
  };

  const handleDelete = async (id: string) => {
    if (id === DEFAULT_TEMPLATE.id) {
      if (showToast) showToast("Cannot delete the default template.", "Error");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this template?")) return;
    try {
      await api.templates.delete(id);
      if (showToast) showToast("Template deleted.", "Template Manager");
      loadTemplates();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Failed to delete template", error);
    }
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    if (!editingTemplate) return;
    const newSections = [...editingTemplate.sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSections.length) return;

    [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
    setEditingTemplate({ ...editingTemplate, sections: newSections });
  };

  const toggleSectionVisibility = (index: number) => {
    if (!editingTemplate) return;
    const newSections = [...editingTemplate.sections];
    newSections[index] = { ...newSections[index], visible: !newSections[index].visible };
    setEditingTemplate({ ...editingTemplate, sections: newSections });
  };

  if (editingTemplate) {
    return (
      <div className="p-8 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Edit Template</h2>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Customize layout and formatting</p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="ghost"
              onClick={() => setEditingTemplate(null)}
              className="px-6 py-2 text-slate-400 font-bold uppercase text-[10px] tracking-widest hover:text-slate-600"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              className="bg-blue-600 text-white px-8 py-6 rounded-full font-black flex items-center gap-2 shadow-lg hover:bg-blue-700 transition uppercase text-[10px] tracking-widest"
            >
              <LucideSave size={14} />
              Save Template
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
                <LucideLayout size={16} className="text-blue-500" />
                Section Order & Visibility
              </h3>
              <div className="space-y-3">
                {editingTemplate.sections.map((section, index) => (
                  <div 
                    key={section.id} 
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${section.visible ? 'bg-slate-50 border-slate-200' : 'bg-slate-100 border-slate-200 opacity-60'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col gap-1">
                        <Button 
                          variant="ghost"
                          size="icon"
                          disabled={index === 0}
                          onClick={() => moveSection(index, 'up')}
                          className="h-6 w-6 text-slate-400 hover:text-blue-500 disabled:opacity-20"
                        >
                          <LucideChevronUp size={16} />
                        </Button>
                        <Button 
                          variant="ghost"
                          size="icon"
                          disabled={index === editingTemplate.sections.length - 1}
                          onClick={() => moveSection(index, 'down')}
                          className="h-6 w-6 text-slate-400 hover:text-blue-500 disabled:opacity-20"
                        >
                          <LucideChevronDown size={16} />
                        </Button>
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-800 uppercase tracking-wider">{section.type.replace('-', ' ')}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{section.id}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleSectionVisibility(index)}
                        className={`p-2 rounded-xl transition-colors ${section.visible ? 'text-blue-600 bg-blue-50 hover:bg-blue-100' : 'text-slate-400 bg-slate-200 hover:bg-slate-300'}`}
                        title={section.visible ? "Hide Section" : "Show Section"}
                      >
                        {section.visible ? <LucideEye size={16} /> : <LucideEyeOff size={16} />}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
                <LucideSettings size={16} className="text-blue-500" />
                General Info
              </h3>
              <div className="space-y-4">
                <div>
                  <Label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Template Name</Label>
                  <Input 
                    type="text" 
                    value={editingTemplate.name}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                    className="w-full px-4 h-12 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus-visible:ring-2 focus-visible:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <Label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Description</Label>
                  <Textarea 
                    value={editingTemplate.description}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, description: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus-visible:ring-2 focus-visible:ring-blue-500 outline-none h-24 resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
                <LucideLayout size={16} className="text-blue-500" />
                Layout Rules
              </h3>
              <div className="space-y-4">
                <div>
                  <Label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Font Family</Label>
                  <select 
                    value={editingTemplate.layout.fontFamily}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, layout: { ...editingTemplate.layout, fontFamily: e.target.value } })}
                    className="w-full px-4 h-12 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus-visible:ring-2 focus-visible:ring-blue-500 outline-none"
                  >
                    <option value="Arimo, Arial, sans-serif">Arimo (Standard)</option>
                    <option value="'Times New Roman', serif">Times New Roman</option>
                    <option value="Helvetica, Arial, sans-serif">Helvetica</option>
                    <option value="'Courier New', monospace">Courier New</option>
                  </select>
                </div>
                <div>
                  <Label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Base Font Size</Label>
                  <Input 
                    type="text" 
                    value={editingTemplate.layout.fontSize}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, layout: { ...editingTemplate.layout, fontSize: e.target.value } })}
                    className="w-full px-4 h-12 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus-visible:ring-2 focus-visible:ring-blue-500 outline-none"
                    placeholder="e.g. 12pt"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Margin Top</Label>
                    <Input 
                      type="text" 
                      value={editingTemplate.layout.margins?.top}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, layout: { ...editingTemplate.layout, margins: { ...editingTemplate.layout.margins!, top: e.target.value } } })}
                      className="w-full px-4 h-12 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus-visible:ring-2 focus-visible:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <Label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Margin Bottom</Label>
                    <Input 
                      type="text" 
                      value={editingTemplate.layout.margins?.bottom}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, layout: { ...editingTemplate.layout, margins: { ...editingTemplate.layout.margins!, bottom: e.target.value } } })}
                      className="w-full px-4 h-12 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus-visible:ring-2 focus-visible:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-10 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700">
      <header className="mb-12 flex justify-between items-end">
        <div>
          <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase">Template Registry</h2>
          <p className="text-slate-500 font-bold uppercase text-[11px] tracking-[0.3em] mt-2 italic border-l-4 border-blue-600 pl-4">
            Customizable Assessment Layouts
          </p>
        </div>
        <Button 
          onClick={() => setEditingTemplate({
            id: crypto.randomUUID(),
            name: 'New Template',
            sections: [...DEFAULT_TEMPLATE.sections],
            layout: { ...DEFAULT_TEMPLATE.layout }
          })}
          className="bg-slate-900 text-white px-8 py-6 rounded-full font-black flex items-center gap-3 shadow-2xl hover:bg-slate-800 transition transform active:scale-95 uppercase text-[10px] tracking-widest"
        >
          <LucidePlus size={18} />
          Create New Template
        </Button>
      </header>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {templates.map((template) => (
            <div 
              key={template.id}
              className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 hover:shadow-xl hover:border-blue-200 transition-all group relative overflow-hidden flex flex-col"
            >
              {template.isDefault && (
                <div className="absolute top-0 right-0 bg-blue-600 text-white text-[9px] font-black px-4 py-1.5 rounded-bl-2xl uppercase tracking-widest">
                  System Default
                </div>
              )}
              <div className="mb-6">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-50 transition-colors">
                  <LucideLayout className="text-slate-400 group-hover:text-blue-600 transition-colors" size={24} />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">{template.name}</h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">{template.description || 'No description provided.'}</p>
              </div>

              <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                <div className="flex gap-2">
                  <Button 
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingTemplate(template)}
                    className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all"
                    title="Edit Template"
                  >
                    <LucideSettings size={18} />
                  </Button>
                  {!template.isDefault && (
                    <Button 
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(template.id)}
                      className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all"
                      title="Delete Template"
                    >
                      <LucideTrash2 size={18} />
                    </Button>
                  )}
                </div>
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                  {template.sections.filter(s => s.visible).length} Active Sections
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
