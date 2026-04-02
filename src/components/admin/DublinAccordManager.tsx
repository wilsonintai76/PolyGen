import React, { useState } from "react";
import { DublinAccord } from "../../types";
import { Plus, X, Save } from "lucide-react";
import { DublinAccordTabs } from "../DublinAccordTabs";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface DublinAccordManagerProps {
  dublinAccords: DublinAccord[];
  onUpdateDublin: (attrs: DublinAccord[]) => void;
}

export const DublinAccordManager: React.FC<DublinAccordManagerProps> = ({
  dublinAccords,
  onUpdateDublin,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DublinAccord | null>(null);
  const [formData, setFormData] = useState<{ profile_type: "DK" | "DP" | "NA"; code: string; title: string; description: string }>({ profile_type: "DK", code: "", title: "", description: "" });

  const handleOpenModal = (item?: DublinAccord) => {
    if (item) {
      setEditingItem(item);
      setFormData({ profile_type: item.profile_type, code: item.code, title: item.title, description: item.description });
    } else {
      setEditingItem(null);
      setFormData({ profile_type: "DK", code: "", title: "", description: "" });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormData({ profile_type: "DK", code: "", title: "", description: "" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.title || !formData.description) return;

    if (editingItem) {
      const updatedAttributes = dublinAccords.map((attr) =>
        attr.id === editingItem.id
          ? {
              ...attr,
              profile_type: formData.profile_type,
              code: formData.code.toUpperCase(),
              title: formData.title,
              description: formData.description,
            }
          : attr,
      );
      onUpdateDublin(updatedAttributes);
    } else {
      const newAttribute: DublinAccord = {
        id: `local-${Date.now()}`,
        profile_type: formData.profile_type,
        code: formData.code.toUpperCase(),
        title: formData.title,
        description: formData.description,
      };
      onUpdateDublin([...dublinAccords, newAttribute]);
    }
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    onUpdateDublin(dublinAccords.filter((attr) => attr.id !== id));
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight uppercase">
            Dublin Accord Registry
          </h2>
          <p className="text-slate-500 font-bold uppercase text-[10px] md:text-[11px] tracking-widest mt-2">
            Manage centralized attributes for curriculum alignment
          </p>
        </div>
        <Button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 text-white px-6 py-6 rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition active:scale-95 flex items-center gap-2"
        >
          <Plus size={18} strokeWidth={3} />
          <span className="uppercase tracking-wider text-xs">Add Standard</span>
        </Button>
      </div>

      <div className="bg-white rounded-[24px] shadow-xl border border-slate-100 overflow-hidden">
        {/* Tabs */}
        <div className="p-6">
          <DublinAccordTabs 
            standards={dublinAccords} 
            onEdit={handleOpenModal} 
            onDelete={handleDelete} 
          />
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-slate-900 p-6 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight">
                  {editingItem ? "Edit Standard" : "New Standard"}
                </h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  {editingItem
                    ? "Update existing definition"
                    : `Add to Dublin Accord registry`}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X size={24} />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Profile Type
                </Label>
                <select
                  className="w-full bg-slate-50 border-2 border-slate-100 h-12 px-4 rounded-xl outline-none focus-visible:ring-blue-500 font-bold text-slate-700 transition"
                  value={formData.profile_type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      profile_type: e.target.value as "DK" | "DP" | "NA",
                    })
                  }
                  required
                >
                  <option value="DK">DK: Knowledge Profile</option>
                  <option value="DP">DP: Problem Solving</option>
                  <option value="NA">NA: Engineering Activities</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Standard Code
                </Label>
                <Input
                  autoFocus
                  type="text"
                  className="w-full bg-slate-50 border-2 border-slate-100 h-12 rounded-xl outline-none focus-visible:ring-blue-500 font-bold text-slate-700 transition placeholder:text-slate-300 uppercase"
                  placeholder="e.g. DK1, DP1"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      code: e.target.value.toUpperCase(),
                    })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Title
                </Label>
                <Input
                  type="text"
                  className="w-full bg-slate-50 border-2 border-slate-100 h-12 rounded-xl outline-none focus-visible:ring-blue-500 font-bold text-slate-700 transition placeholder:text-slate-300"
                  placeholder="e.g. Natural Sciences"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Description
                </Label>
                <Textarea
                  className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-xl outline-none focus-visible:ring-blue-500 font-bold text-slate-700 transition placeholder:text-slate-300 min-h-[120px] resize-none"
                  placeholder="Enter the full description of the standard..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseModal}
                  className="flex-1 bg-slate-100 text-slate-600 font-bold h-12 rounded-xl hover:bg-slate-200 transition text-sm uppercase tracking-wider"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white font-bold h-12 rounded-xl shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition active:scale-95 text-sm uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  Save Standard
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

