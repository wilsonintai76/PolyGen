import React from 'react';

interface LandingPageProps {
  onNavigate: (step: any) => void;
  hasDraft: boolean;
  onRestoreDraft: () => void;
  onClearDraft: () => void;
  currentLogo?: string;
}

const PoliteknikLogoLarge = () => (
  <div className="flex flex-col items-center mb-4">
    <svg width="240" height="110" viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M40 42 Q 100 10 160 42" stroke="black" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M55 36 Q 100 18 145 36" stroke="black" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <text x="50%" y="65" textAnchor="middle" fill="#ed1c24" style={{ fontSize: '24px', fontWeight: '900', fontFamily: 'Arial Black, sans-serif', letterSpacing: '-1px' }}>
        POLITEKNIK
      </text>
      <line x1="20" y1="72" x2="180" y2="72" stroke="#ed1c24" strokeWidth="2.5" />
      <text x="50%" y="84" textAnchor="middle" fill="#ed1c24" style={{ fontSize: '10px', fontWeight: 'bold', fontFamily: 'Arial, sans-serif', letterSpacing: '4px' }}>
        MALAYSIA
      </text>
      <text x="50%" y="96" textAnchor="middle" fill="black" style={{ fontSize: '11px', fontWeight: '900', fontFamily: 'Arial, sans-serif', letterSpacing: '1px' }}>
        KUCHING SARAWAK
      </text>
    </svg>
  </div>
);

export const LandingPage: React.FC<LandingPageProps> = ({ 
  onNavigate, 
  hasDraft, 
  onRestoreDraft,
  onClearDraft,
  currentLogo
}) => {
  const cards = [
    {
      title: 'New Assessment',
      desc: 'Start the wizard to generate a new paper from scratch.',
      icon: '📄',
      step: 'setup',
      color: 'bg-blue-600'
    },
    {
      title: 'Manage Bank',
      desc: 'Add and edit your personal question database.',
      icon: '🗄️',
      step: 'manage-bank',
      color: 'bg-purple-600'
    },
    {
      title: 'View Library',
      desc: 'Access saved assessments by course and type.',
      icon: '📚',
      step: 'library',
      color: 'bg-green-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="max-w-5xl w-full">
        <header className="text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="inline-block p-6 rounded-3xl bg-white shadow-xl mb-6">
            {currentLogo ? (
              <img src={currentLogo} className="h-28 max-w-[300px] object-contain" alt="Institution Logo" />
            ) : (
              <PoliteknikLogoLarge />
            )}
          </div>
          <h2 className="text-3xl font-extrabold text-gray-800">Assessment Generator</h2>
          <p className="text-gray-500 mt-2">Professional academic paper production for Malaysian standards.</p>
        </header>

        {hasDraft && (
          <div className="mb-10 animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-orange-50 border-2 border-orange-200 rounded-3xl p-8 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-orange-500 text-white text-3xl flex items-center justify-center rounded-2xl shadow-md">
                  ⏳
                </div>
                <div>
                  <h3 className="text-xl font-bold text-orange-800">Unfinished Draft Found</h3>
                  <p className="text-orange-600 text-sm">You were recently working on an assessment. Would you like to continue?</p>
                </div>
              </div>
              <div className="flex gap-4 w-full md:w-auto">
                <button 
                  onClick={onClearDraft}
                  className="flex-1 md:flex-none px-6 py-3 rounded-xl border-2 border-orange-200 text-orange-600 font-bold hover:bg-orange-100 transition"
                >
                  Discard
                </button>
                <button 
                  onClick={onRestoreDraft}
                  className="flex-1 md:flex-none px-8 py-3 rounded-xl bg-orange-600 text-white font-bold shadow-lg hover:bg-orange-700 transition active:scale-95"
                >
                  Resume Draft
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in zoom-in duration-700 delay-200">
          {cards.map((card, i) => (
            <div 
              key={i}
              onClick={() => onNavigate(card.step)}
              className="group bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 border-b-8 border-transparent hover:border-gray-200"
            >
              <div className={`w-16 h-16 ${card.color} text-white text-3xl flex items-center justify-center rounded-2xl mb-6 shadow-inner`}>
                {card.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{card.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{card.desc}</p>
              <div className="mt-8 flex items-center text-blue-600 font-bold text-sm">
                Get Started <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          ))}
        </div>

        <footer className="mt-16 text-center text-gray-400 text-xs">
          PolyAssessment Gen v2.5 • Component-based academic tool with Auto-save
        </footer>
      </div>
    </div>
  );
};