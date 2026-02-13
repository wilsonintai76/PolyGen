
import React, { useRef } from 'react';
import { InstitutionalBranding } from '../types';

interface BrandingManagerProps {
  branding: InstitutionalBranding;
  onUpdate: (b: InstitutionalBranding) => void;
}

export const BrandingManager: React.FC<BrandingManagerProps> = ({ branding, onUpdate }) => {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => onUpdate({ ...branding, logoUrl: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-10 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="mb-10">
        <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Institutional Branding</h2>
        <p className="text-slate-500 font-bold uppercase text-[11px] tracking-widest mt-2 border-l-4 border-blue-600 pl-4">Standardize logo and identity across all assessment papers</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 space-y-8">
          <div className="bg-white p-10 rounded-[40px] shadow-2xl border border-slate-100 ring-1 ring-black/5">
            <div className="flex items-center gap-2 mb-6">
               <span className="w-3 h-3 rounded-full bg-blue-500"></span>
               <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Institution Full Name</label>
            </div>
            <input 
              className="w-full border-2 border-slate-50 bg-slate-50/50 rounded-2xl p-5 outline-none focus:border-blue-400 transition font-black text-slate-700 text-lg shadow-inner"
              value={branding.institutionName}
              onChange={e => onUpdate({ ...branding, institutionName: e.target.value.toUpperCase() })}
              placeholder="e.g. POLITEKNIK MALAYSIA KUCHING SARAWAK"
            />
            <p className="mt-4 text-[10px] text-slate-400 font-bold italic uppercase tracking-tighter">This name will appear on the top header of every generated examination paper.</p>
          </div>
          
          <div className="bg-blue-50 p-8 rounded-[32px] border border-blue-100/50">
             <h4 className="text-[11px] font-black text-blue-600 uppercase tracking-widest mb-2">Note on Department Identity</h4>
             <p className="text-xs text-blue-800 leading-relaxed font-medium">Department names are now managed dynamically via the <span className="font-bold">Department Manager</span> page. When creating a paper, the system automatically pulls the relevant department name based on the Course selection.</p>
          </div>
        </div>

        <div className="lg:col-span-5">
           <div className="bg-white p-10 rounded-[40px] shadow-2xl border border-slate-100 ring-1 ring-black/5 flex flex-col items-center justify-center text-center">
             <div className="flex items-center gap-2 mb-8 self-start">
               <span className="w-3 h-3 rounded-full bg-indigo-500"></span>
               <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Official Institution Logo</label>
             </div>
             
             <div 
               onClick={() => fileRef.current?.click()}
               className="cursor-pointer group relative w-full aspect-square max-w-[320px] border-4 border-dashed border-slate-100 rounded-[48px] flex items-center justify-center bg-slate-50 hover:bg-blue-50 hover:border-blue-200 transition-all overflow-hidden shadow-inner"
             >
               {branding.logoUrl ? (
                 <>
                   <img src={branding.logoUrl} className="h-full w-full object-contain p-8" alt="Logo" />
                   <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition backdrop-blur-[2px]">
                     <span className="text-white font-black text-xs bg-blue-600 px-6 py-3 rounded-full shadow-2xl transform group-hover:scale-110 transition-transform uppercase tracking-widest">Replace Identity Asset</span>
                   </div>
                 </>
               ) : (
                 <div className="flex flex-col items-center animate-pulse">
                   <span className="text-7xl mb-4 grayscale opacity-20">🏛️</span>
                   <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Upload Institution Logo</p>
                 </div>
               )}
               <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={handleUpload} />
             </div>
             <div className="mt-10 space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Supported Formats: PNG, SVG, JPG</p>
                <p className="text-[9px] text-slate-300 font-bold italic">Recommended: 1:1 Aspect Ratio with transparent background for best results on A4 layout.</p>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};
