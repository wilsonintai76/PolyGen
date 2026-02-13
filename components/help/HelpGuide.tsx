
import React from 'react';

export const HelpGuide: React.FC = () => {
  return (
    <div className="p-10 max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 pb-20">
      {/* Header */}
      <div>
        <h2 className="text-4xl font-black text-slate-900 tracking-tight">User Guide</h2>
        <p className="text-slate-500 font-bold uppercase text-[11px] tracking-widest mt-2">Mastering the PolyAssessment Generator</p>
      </div>

      {/* Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Getting Started */}
        <section className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 hover:shadow-md transition">
           <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-sm">🚀</div>
           <h3 className="text-xl font-black text-slate-800 mb-4">Getting Started</h3>
           <ul className="space-y-4 text-sm text-slate-600 leading-relaxed">
             <li className="flex gap-3 items-start">
               <span className="mt-1 w-2 h-2 rounded-full bg-blue-400 shrink-0"></span>
               <span><strong>Branding:</strong> Set your institution logo and department name first in the Branding section. This applies to all generated papers.</span>
             </li>
             <li className="flex gap-3 items-start">
               <span className="mt-1 w-2 h-2 rounded-full bg-blue-400 shrink-0"></span>
               <span><strong>Courses:</strong> Define your courses, CLOs (Course Learning Outcomes), and MQF/Dublin attributes in the Course Repository.</span>
             </li>
             <li className="flex gap-3 items-start">
               <span className="mt-1 w-2 h-2 rounded-full bg-blue-400 shrink-0"></span>
               <span><strong>Create Paper:</strong> Click "+ Create New Paper" in the sidebar to start the assessment wizard.</span>
             </li>
           </ul>
        </section>

        {/* Question Bank */}
        <section className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 hover:shadow-md transition">
           <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-sm">🗄️</div>
           <h3 className="text-xl font-black text-slate-800 mb-4">Question Bank Management</h3>
           <ul className="space-y-4 text-sm text-slate-600 leading-relaxed">
             <li className="flex gap-3 items-start">
               <span className="mt-1 w-2 h-2 rounded-full bg-purple-400 shrink-0"></span>
               <span><strong>Adding Items:</strong> Create new questions with specific taxonomy, CLO mapping, and marks. Supports MCQ, Structured, and Essay types.</span>
             </li>
             <li className="flex gap-3 items-start">
               <span className="mt-1 w-2 h-2 rounded-full bg-purple-400 shrink-0"></span>
               <span><strong>AI Refinement:</strong> Use the "Refine with Gemini" button in the editor to polish your question text automatically for clarity and tone.</span>
             </li>
             <li className="flex gap-3 items-start">
               <span className="mt-1 w-2 h-2 rounded-full bg-purple-400 shrink-0"></span>
               <span><strong>Media Support:</strong> Upload images or create data tables directly within the editor. Tables can be formatted dynamically.</span>
             </li>
           </ul>
        </section>

        {/* LaTeX Guide */}
        <section className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 md:col-span-2 hover:shadow-md transition">
           <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl shadow-sm">∑</div>
              <div>
                <h3 className="text-xl font-black text-slate-800">LaTeX Mathematics Guide</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Type math symbols directly into question text</p>
              </div>
           </div>
           
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: 'Inline Math', code: '$x^2 + y^2 = z^2$' },
                { label: 'Block Math', code: '$$ \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a} $$' },
                { label: 'Fractions', code: '$\\frac{1}{2}$' },
                { label: 'Sub/Superscript', code: '$x_i^{2}$' },
                { label: 'Greek Letters', code: '$\\alpha, \\beta, \\pi, \\theta$' },
                { label: 'Roots', code: '$\\sqrt{x}, \\sqrt[3]{y}$' },
                { label: 'Summation', code: '$\\sum_{i=1}^{n} x_i$' },
                { label: 'Integral', code: '$\\int_{0}^{\\infty} f(x) dx$' },
                { label: 'Operators', code: '$\\le, \\ge, \\approx, \\ne$' }
              ].map((item, i) => (
                <div key={i} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col gap-2">
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.label}</div>
                  <code className="text-xs font-mono text-blue-600 bg-white border border-blue-100 px-2 py-1 rounded-lg block overflow-x-auto">{item.code}</code>
                </div>
              ))}
           </div>
           <div className="mt-6 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-xs text-emerald-800 leading-relaxed">
             <strong>Tip:</strong> You can see a live preview of your mathematical equations in the Question Editor as you type.
           </div>
        </section>

        {/* Printing & Export */}
        <section className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 hover:shadow-md transition">
           <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-sm">🖨️</div>
           <h3 className="text-xl font-black text-slate-800 mb-4">Exporting to PDF</h3>
           <ul className="space-y-4 text-sm text-slate-600 leading-relaxed">
             <li className="flex gap-3 items-start">
               <span className="mt-1 w-2 h-2 rounded-full bg-orange-400 shrink-0"></span>
               <span><strong>Paper Size:</strong> The layout is strictly optimized for <strong>A4</strong> paper size.</span>
             </li>
             <li className="flex gap-3 items-start">
               <span className="mt-1 w-2 h-2 rounded-full bg-orange-400 shrink-0"></span>
               <span><strong>Print Settings:</strong> When printing (Ctrl+P), ensure <strong>"Background graphics"</strong> is CHECKED to see colors, table fills, and borders.</span>
             </li>
             <li className="flex gap-3 items-start">
               <span className="mt-1 w-2 h-2 rounded-full bg-orange-400 shrink-0"></span>
               <span><strong>Margins:</strong> Set margins to 'None' or 'Default' depending on your printer's capability. Ideally, use 'None' as the app handles margins internally.</span>
             </li>
           </ul>
        </section>

        {/* Gemini AI Quota */}
        <section className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 hover:shadow-md transition">
           <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-sm">✨</div>
           <h3 className="text-xl font-black text-slate-800 mb-4">Gemini AI Quota & Reset</h3>
           <p className="text-sm text-slate-600 mb-4 leading-relaxed">
             If the "Refine with Gemini" AI feature stops working, you may have reached your current quota limit.
           </p>
           <ul className="space-y-4 text-sm text-slate-600 leading-relaxed">
             <li className="flex gap-3 items-start">
               <span className="mt-1 w-2 h-2 rounded-full bg-indigo-400 shrink-0"></span>
               <span><strong>Wait:</strong> Free tier limits typically reset daily or per minute. Waiting a short period often resolves rate limits.</span>
             </li>
             <li className="flex gap-3 items-start">
               <span className="mt-1 w-2 h-2 rounded-full bg-indigo-400 shrink-0"></span>
               <span><strong>Upgrade to Blaze:</strong> For higher limits, you can upgrade your Google Cloud project to the Blaze plan (Pay-as-you-go).</span>
             </li>
             <li className="flex gap-3 items-start">
               <span className="mt-1 w-2 h-2 rounded-full bg-indigo-400 shrink-0"></span>
               <span><strong>Buy Tokens:</strong> Ensure your billing account is active to purchase additional tokens or credits for extensive usage.</span>
             </li>
           </ul>
        </section>

        {/* Troubleshooting */}
         <section className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 hover:shadow-md transition">
           <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-sm">🔧</div>
           <h3 className="text-xl font-black text-slate-800 mb-4">Troubleshooting</h3>
           <ul className="space-y-4 text-sm text-slate-600 leading-relaxed">
             <li className="flex gap-3 items-start">
               <span className="mt-1 w-2 h-2 rounded-full bg-red-400 shrink-0"></span>
               <span><strong>Data Persistence:</strong> Data is saved locally in your browser (LocalStorage). Clearing browser cache will remove unsaved drafts and local settings.</span>
             </li>
             <li className="flex gap-3 items-start">
               <span className="mt-1 w-2 h-2 rounded-full bg-red-400 shrink-0"></span>
               <span><strong>Drafts:</strong> The app auto-saves your active paper draft every few seconds. Look for the "Resume Draft" option on the dashboard if you accidentally close the tab.</span>
             </li>
             <li className="flex gap-3 items-start">
               <span className="mt-1 w-2 h-2 rounded-full bg-red-400 shrink-0"></span>
               <span><strong>PDF Glitches:</strong> If the PDF layout breaks, ensure you are using a modern browser (Chrome/Edge recommended) and that the window size is not too small during generation.</span>
             </li>
           </ul>
        </section>
      </div>
    </div>
  );
};
