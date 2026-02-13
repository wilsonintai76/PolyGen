
import React, { useState } from 'react';
import { GlobalMqf } from '../../types';

interface GlobalMqfManagerProps {
  attributes: GlobalMqf[];
  onUpdate: (attrs: GlobalMqf[]) => void;
}

export const GlobalMqfManager: React.FC<GlobalMqfManagerProps> = ({ attributes, onUpdate }) => {
  const [newItem, setNewItem] = useState({ code: '', description: '' });

  const addItem = () => {
    if (!newItem.code || !newItem.description) return;
    onUpdate([...attributes, { id: Date.now().toString(), ...newItem }]);
    setNewItem({ code: '', description: '' });
  };

  const removeItem = (id: string) => {
    onUpdate(attributes.filter(a => a.id !== id));
  };

  return (
    <div className="p-10 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="mb-12">
        <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Global MQF / DA Standards</h2>
        <p className="text-slate-500 font-bold uppercase text-[11px] tracking-widest mt-2">Manage centralized attributes for all curriculum items</p>
      </div>

      <div className="bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden mb-12">
        <div className="p-10 bg-slate-50 border-b border-slate-100">
          <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-6">Add Global Attribute</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
             <input 
               className="md:col-span-1 border-2 border-white bg-white rounded-2xl p-4 text-xs font-black outline-none focus:border-blue-400 transition text-center" 
               placeholder="CODE (e.g. DK1)"
               value={newItem.code}
               onChange={e => setNewItem({...newItem, code: e.target.value.toUpperCase()})}
             />
             <input 
               className="md:col-span-2 border-2 border-white bg-white rounded-2xl p-4 text-xs font-bold outline-none focus:border-blue-400 transition" 
               placeholder="Description of the Knowledge Profile/Attribute"
               value={newItem.description}
               onChange={e => setNewItem({...newItem, description: e.target.value})}
             />
             <button 
               onClick={addItem}
               className="md:col-span-1 bg-slate-900 text-white font-black py-4 rounded-2xl shadow-xl hover:bg-slate-800 transition active:scale-95 uppercase tracking-widest text-xs"
             >
               Add Standard
             </button>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {attributes.map(item => (
            <div key={item.id} className="p-8 flex items-center gap-8 group hover:bg-slate-50 transition-colors">
              <div className="w-20 h-20 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-xl shadow-sm border border-indigo-100 shrink-0">
                {item.code}
              </div>
              <div className="flex-grow">
                <p className="text-sm font-bold text-slate-700 leading-relaxed">{item.description}</p>
              </div>
              <button 
                onClick={() => removeItem(item.id)}
                className="text-slate-300 hover:text-rose-500 font-black text-xl p-4 transition-colors"
              >
                &times;
              </button>
            </div>
          ))}
          {attributes.length === 0 && (
            <div className="py-20 text-center flex flex-col items-center">
               <span className="text-4xl mb-4 grayscale opacity-20">🧬</span>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No standards defined in registry</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
