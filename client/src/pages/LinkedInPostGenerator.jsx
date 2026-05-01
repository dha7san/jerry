import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Wand2, Globe, Lock, Info, Image as ImageIcon, CheckCircle, Share2, Loader2, Sparkles, MessageSquare, Repeat2, Send, Bookmark, Cpu, Layout, FileText, ChevronRight } from 'lucide-react';

const LinkedInPostGenerator = () => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [selectedImg, setSelectedImg] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [fetchedData, setFetchedData] = useState(null);
  const [prompt, setPrompt] = useState('Create a high-impact LinkedIn post based on these milestones. Maintain a professional yet visionary tone. Include 3 strategic hashtags.');
  
  const [generatedImg, setGeneratedImg] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/linkedin/templates', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTemplates(res.data);
        if (res.data.length > 0) setSelectedImg(res.data[0].url);
      } catch (err) {
        console.error('Failed to fetch templates');
      }
    };
    fetchTemplates();
  }, []);

  const fetchMilestones = async () => {
    setFetching(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/linkedin/generate', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFetchedData(res.data.tasksSnapshot);
    } catch (err) {
      setError('Neural data extraction failed. No metrics found.');
    } finally {
      setFetching(false);
    }
  };

  const handleSynthesize = async () => {
    if (!fetchedData) return setError('Please fetch protocol metrics first.');
    setLoading(true);
    setSuccess(false);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/api/linkedin/generate-v2', {
        stats: {
          dsaProblems: fetchedData.dsa.problems,
          dsaTopics: fetchedData.dsa.topics.join(', '),
          devMinutes: fetchedData.dev.minutes,
          devProject: fetchedData.dev.project,
          englishMinutes: fetchedData.english.minutes,
          englishTopic: fetchedData.english.topic,
          overallScore: fetchedData.score,
          appsTopic: fetchedData.apps.topic
        },
        templateUrl: selectedImg,
        customPrompt: prompt,
        isPublic
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGeneratedContent(res.data.content);
      setGeneratedImg(res.data.imageUrl);
      setSuccess(true);
    } catch (err) {
      setError('Synthesis interrupt. Connection to neural model lost.');
    } finally {
      setLoading(false);
    }
  };

  const dataSummary = fetchedData ? `
PROTOCOL EXTRACTED:
- DSA Performance: ${fetchedData.dsa.problems} Solved (${fetchedData.dsa.platform || 'General'})
- Aptitude Synthesis: ${fetchedData.apps.topic || 'In Progress'}
- Linguistic Tuning: ${fetchedData.english.topic || 'In Progress'}
- Core Engineering: ${fetchedData.dev.project || 'Proprietary Project'}
  `.trim() : 'Awaiting manual initialization...';

  return (
    <div className="flex-1 h-full bg-[#f8f9fb] flex overflow-hidden">
      {/* 🚀 Control Center Sidebar */}
      <aside className="w-[420px] bg-white border-r border-[#e1e4e8] flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-20">
        <header className="p-10 border-b border-[#f1f3f5]">
            <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 bg-[#0077b5] rounded-2xl flex items-center justify-center shadow-lg shadow-[#0077b5]/10">
                    <Cpu className="text-white" size={26} />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-[#1e2329] tracking-tight leading-none">Architect</h1>
                    <span className="text-[10px] font-black text-[#0077b5] uppercase tracking-[0.2em] mt-2 block opacity-70">Neural Post Logic</span>
                </div>
            </div>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">
                Transform database milestones into professional growth engineering.
            </p>
        </header>

        <div className="flex-1 overflow-y-auto px-10 py-10 space-y-12 no-scrollbar">
            {/* Action Group 1: Data Extraction */}
            <section className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Database size={14} /> Extraction
                    </h2>
                    {error && <span className="text-[10px] text-red-500 font-black flex items-center gap-1"><Info size={10}/> Error</span>}
                </div>

                <button
                    onClick={fetchMilestones}
                    disabled={fetching}
                    className="w-full py-5 bg-white border-2 border-[#0077b5] text-[#0077b5] font-black rounded-3xl flex items-center justify-center gap-3 transition-all hover:bg-[#0077b5] hover:text-white active:scale-95 disabled:opacity-50 group"
                >
                    {fetching ? <Loader2 className="animate-spin" size={20} /> : <Database className="group-hover:translate-y-[-2px] transition-transform" size={20} />}
                    Sync Metrics From DB
                </button>

                <div className="p-6 bg-[#f8f9fb] rounded-[32px] border border-[#e1e4e8] min-h-[220px] relative overflow-hidden group">
                    <div className="space-y-5 relative z-10">
                        {[
                            { label: 'PLATFORM', value: fetchedData?.dsa?.platform },
                            { label: 'DSA COUNT', value: fetchedData?.dsa?.problems },
                            { label: 'APTITUDE', value: fetchedData?.apps?.topic },
                            { label: 'DEV LOG', value: fetchedData?.dev?.project },
                        ].map((m, i) => (
                            <div key={i} className="flex flex-col border-l-2 border-[#e1e4e8] pl-4 transition-colors group-hover:border-[#0077b5]">
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{m.label}</span>
                                <span className="text-sm font-black text-slate-700 truncate">{m.value || 'Wait for extraction...'}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Action Group 2: Layout Style */}
            <section className="space-y-5">
                 <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Layout size={14} /> Visual Template
                 </h2>
                 <div className="grid grid-cols-3 gap-3">
                    {templates.map((img) => (
                        <button
                            key={img.id}
                            onClick={() => setSelectedImg(img.url)}
                            className={`relative rounded-3xl overflow-hidden aspect-square border-4 shadow-sm transition-all float-up ${selectedImg === img.url ? 'border-[#0077b5] scale-105 z-10' : 'border-transparent opacity-40 hover:opacity-100 hover:scale-[1.05]'}`}
                        >
                            <img src={img.url} alt="Style" className="w-full h-full object-cover" />
                            <div className={`absolute inset-0 bg-[#0077b5]/10 ${selectedImg === img.url ? 'block' : 'hidden'}`} />
                        </button>
                    ))}
                 </div>
            </section>

            {/* Action Group 3: Broadcast */}
            <section className="space-y-4">
                <div 
                    onClick={() => setIsPublic(!isPublic)}
                    className={`flex items-center justify-between p-6 rounded-[32px] border-2 cursor-pointer transition-all duration-300 ${isPublic ? 'border-[#0077b5]/20 bg-[#f0f7ff]' : 'border-slate-100 bg-[#f8f9fb]'}`}
                >
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isPublic ? 'bg-[#0077b5] text-white shadow-lg' : 'bg-slate-200 text-slate-400'}`}>
                           {isPublic ? <Globe size={20} /> : <Lock size={20} />}
                        </div>
                        <div>
                            <p className="font-black text-slate-700 leading-tight">Sync Global</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mt-1">{isPublic ? 'Show in Collective' : 'Private Storage'}</p>
                        </div>
                    </div>
                    <div className={`w-10 h-6 rounded-full relative transition-colors ${isPublic ? 'bg-[#0077b5]' : 'bg-slate-300'}`}>
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all transform ${isPublic ? 'translate-x-[20px]' : 'translate-x-[4px]'}`} />
                    </div>
                </div>
            </section>
        </div>

        <footer className="p-10 border-t border-[#f1f3f5] bg-[#f8f9fb]">
             <button
                onClick={handleSynthesize}
                disabled={loading || !fetchedData}
                className="w-full py-6 bg-[#0077b5] hover:bg-[#005c8c] text-white font-black rounded-3xl flex items-center justify-center gap-4 transition-all shadow-[0_12px_24px_rgba(0,119,181,0.2)] active:scale-95 disabled:opacity-50 relative overflow-hidden"
             >
                {loading ? <Loader2 className="animate-spin" /> : (
                    <>
                        <Sparkles size={22} className="text-white/80" />
                        Synthesize Growth Card
                    </>
                )}
                {success && !loading && <div className="absolute inset-0 bg-emerald-500 flex items-center justify-center gap-2 animate-in fade-in duration-300 font-bold"><CheckCircle /> System Complete</div>}
             </button>
        </footer>
      </aside>

      {/* 🏙️ Production Bay: Result & Editor */}
      <main className="flex-1 p-12 overflow-y-auto no-scrollbar flex flex-col items-center">
        <div className="w-full max-w-[800px] flex flex-col gap-10">
            {/* Top Workspace: Strategy & Prompts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <section className="bg-white p-8 rounded-[40px] shadow-[0_4px_32px_rgba(0,0,0,0.03)] border border-[#e1e4e8]">
                    <h3 className="text-xs font-black text-[#0077b5] uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                        <FileText size={14} /> AI Context Script
                    </h3>
                    <textarea 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="w-full p-6 bg-[#f8f9fb] border border-[#e1e4e8] rounded-[28px] min-h-[160px] font-medium text-slate-600 text-[15px] focus:ring-4 focus:ring-[#0077b5]/5 transition-all outline-none leading-relaxed no-scrollbar"
                        placeholder="Define your professional narrative directive..."
                    />
                </section>

                <section className="bg-white p-8 rounded-[40px] shadow-[0_4px_32px_rgba(0,0,0,0.03)] border border-[#e1e4e8]">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                        <Cpu size={14} /> Database Context (Lock)
                    </h3>
                    <div className="w-full p-6 bg-[#f8f9fb] border border-[#e1e4e8] rounded-[28px] min-h-[160px] font-black text-[#8e9aaf] text-[13px] whitespace-pre-wrap leading-relaxed shadow-inner opacity-80 overflow-y-auto max-h-[160px] no-scrollbar">
                        {dataSummary}
                    </div>
                </section>
            </div>

            {/* Bottom Workspace: Professional Card Card */}
            <div className="w-full flex justify-center">
                <div className="w-full max-w-[650px] bg-white border border-[#e1e4e8] rounded-2xl shadow-[0_32px_64px_rgba(0,0,0,0.06)] overflow-hidden transition-all duration-700">
                    {/* LinkedIn Header Simulation */}
                    <div className="p-5 flex items-center justify-between border-b border-[#f1f3f5]">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                                <Cpu size={24} className="text-[#0077b5] opacity-20" />
                            </div>
                            <div>
                                <h4 className="font-black text-[16px] text-slate-800 flex items-center gap-2">
                                    Growth Protocol User
                                    <span className="text-[10px] bg-[#f8f9fb] px-2 py-0.5 rounded text-slate-400">SYNCED</span>
                                </h4>
                                <p className="text-[12px] text-slate-400 font-bold uppercase tracking-wider mt-1 flex items-center gap-1.5">
                                    AI Orchestration • 1st • <Globe size={10}/>
                                </p>
                            </div>
                        </div>
                        <button className="p-3 text-slate-300 hover:text-[#0077b5] hover:bg-[#f0f7ff] rounded-2xl transition-all">
                            <Info size={18} />
                        </button>
                    </div>

                    {/* Synthesized Text Preview */}
                    <article className="p-8 min-h-[200px]">
                        <AnimatePresence mode="wait">
                            {generatedContent ? (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                    className="text-[16px] text-slate-700 font-medium leading-relaxed whitespace-pre-wrap font-sans"
                                >
                                    {generatedContent}
                                </motion.div>
                            ) : (
                                <div className="space-y-4 py-4">
                                    <div className="h-4 bg-slate-100 rounded-[20px] w-full animate-pulse" />
                                    <div className="h-4 bg-slate-100 rounded-[20px] w-[90%] animate-pulse delay-75" />
                                    <div className="h-4 bg-slate-100 rounded-[20px] w-[50%] animate-pulse delay-150" />
                                </div>
                            )}
                        </AnimatePresence>
                    </article>

                    {/* The Visual Masterpiece */}
                    <div className="aspect-[1.91/1] bg-[#1e2329] overflow-hidden relative group">
                        <AnimatePresence mode="wait">
                            {generatedImg ? (
                                <motion.img 
                                    key={generatedImg}
                                    initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }}
                                    src={generatedImg} 
                                    className="w-full h-full object-cover" 
                                    alt="Engineered Growth Visual"
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center bg-slate-50 transition-colors">
                                    <div className="flex flex-col items-center gap-6">
                                         <div className="w-24 h-24 rounded-[40px] bg-white shadow-2xl flex items-center justify-center animate-bounce border border-slate-100">
                                            <ImageIcon className="text-[#0077b5]/20" size={40} />
                                         </div>
                                         <div className="flex flex-col items-center gap-2">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Visual Synthesis Ready</span>
                                            <div className="h-1 w-24 bg-slate-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-[#0077b5]/10 w-1/3 animate-ping" />
                                            </div>
                                         </div>
                                    </div>
                                    <img src={selectedImg} className="absolute inset-0 w-full h-full object-cover opacity-[0.03] grayscale pointer-events-none" alt="Base Grid" />
                                </div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Fake Engagement Bar */}
                    <div className="px-5 py-4 flex items-center justify-between border-t border-[#f1f3f5]">
                        <div className="flex items-center gap-2">
                             <div className="flex -space-x-1.5 pointer-events-none">
                                <div className="w-5 h-5 rounded-full bg-[#0077b5] text-white flex items-center justify-center text-[10px] border-2 border-white">👍</div>
                                <div className="w-5 h-5 rounded-full bg-[#df704d] text-white flex items-center justify-center text-[10px] border-2 border-white">❤️</div>
                            </div>
                            <span className="text-[12px] text-slate-400 font-bold ml-1">Pre-Production Mockup</span>
                        </div>
                        <p className="text-[11px] text-slate-300 font-bold uppercase tracking-wider flex items-center gap-2">
                            Validated By Jerry <ChevronRight size={10}/>
                        </p>
                    </div>

                    {/* LinkedIn Action Buttons (Mock) */}
                    <div className="flex items-center justify-around px-2 pb-2">
                        {['Like', 'Comment', 'Repost', 'Send'].map(btn => (
                            <button key={btn} className="flex-1 py-4 text-slate-400 font-black text-[11px] uppercase tracking-wider hover:bg-[#f8f9fb] hover:text-[#0077b5] rounded-xl transition-all">{btn}</button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      </main>

      {/* Subtle Aesthetic Elements */}
      <div className="fixed top-0 left-0 w-full h-[6px] bg-gradient-to-r from-[#0077b5] to-[#00bfff]/30 z-[100]" />
    </div>
  );
};

export default LinkedInPostGenerator;
