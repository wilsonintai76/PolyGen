import React, { useRef } from 'react';

interface BrandingSectionProps {
  logoUrl?: string;
  onUpdateLogo: (url: string) => void;
}

export const BrandingSection: React.FC<BrandingSectionProps> = ({ logoUrl, onUpdateLogo }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => onUpdateLogo(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <section className="space-y-4">
      <h3 className="font-bold text-blue-600 uppercase tracking-wider text-xs border-b pb-1">1. Institutional Branding</h3>
      <div 
        onClick={() => inputRef.current?.click()}
        className="group relative h-32 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all overflow-hidden bg-gray-50"
      >
        {logoUrl ? (
          <>
            <img src={logoUrl} className="h-full w-full object-contain p-2" alt="Logo" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <span className="text-white text-xs font-bold">Change Logo</span>
            </div>
          </>
        ) : (
          <div className="text-center p-4">
            <span className="text-2xl mb-1 block">🏫</span>
            <p className="text-[10px] font-bold text-gray-400 uppercase">Upload Institution Logo</p>
          </div>
        )}
        <input type="file" ref={inputRef} className="hidden" accept="image/*" onChange={handleUpload} />
      </div>
    </section>
  );
};