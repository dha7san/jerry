import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Users, Loader2, Calendar, Share2, TrendingUp, Info, ExternalLink, MessageSquare, Repeat2, Send } from 'lucide-react';

const CommunityPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/linkedin/community', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPosts(res.data);
      } catch (err) {
        setError('Failed to load community insights.');
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#F4F2EE]">
        <div className="w-16 h-16 border-4 border-slate-200 border-t-green-core rounded-full animate-spin mb-4" />
        <p className="text-slate-400 font-bold tracking-widest uppercase text-xs">Awaiting Collective Intelligence</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-[#F4F2EE]">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-6xl mx-auto"
      >
        <header className="mb-14 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-core/10 text-green-core text-[10px] font-black tracking-[0.2em] uppercase mb-4 border border-green-core/10">
              <TrendingUp size={12} /> Collective Brain Power
            </div>
            <h1 className="text-6xl font-black text-black-spore tracking-tighter mb-4 leading-none">
              Network Pulse
            </h1>
            <p className="text-slate-500 text-xl max-w-2xl font-medium leading-relaxed">
              Explore the professional journeys of the community. See how others are scaling their careers with Jerry AI.
            </p>
          </div>
          <div className="flex items-center gap-4 bg-white border border-slate-200 p-6 rounded-[28px] shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-black-spore flex items-center justify-center text-green-core font-black text-3xl shadow-xl shadow-black-spore/20">
              {posts.length}
            </div>
            <div>
              <p className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em]">Shared Feed</p>
              <p className="text-black-spore font-black text-lg">Total Success Stories</p>
            </div>
          </div>
        </header>

        {error ? (
          <div className="p-10 bg-red-50 border border-red-100 rounded-[32px] text-red-600 font-black text-center shadow-sm">
            {error}
          </div>
        ) : posts.length === 0 ? (
          <div className="p-24 text-center bg-white rounded-[48px] border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 text-slate-200 group-hover:bg-green-core/5 group-hover:text-green-core/20 transition-all duration-700">
              <Users size={64} />
            </div>
            <h2 className="text-3xl font-black text-black-spore mb-3 uppercase tracking-tighter">Quiet in the valley</h2>
            <p className="text-slate-400 font-medium text-lg">Be the pioneer and share your first milestone today!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {posts.map((post, idx) => (
              <motion.div
                key={post._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="group bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col max-w-[450px]"
              >
                {/* Header Section */}
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-slate-100 border border-slate-100 flex items-center justify-center text-slate-400 font-black text-lg group-hover:bg-green-core/10 group-hover:text-green-core transition-colors">
                      {post.userId?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <h3 className="text-black-spore font-black text-[15px] leading-tight hover:text-[#0a66c2] cursor-pointer">{post.userId?.name || 'Unknown User'}</h3>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                        <Calendar size={10} />
                        {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  </div>
                  <button className="p-2 rounded-lg hover:bg-slate-50 text-slate-300 transition-colors">
                    <ExternalLink size={18} />
                  </button>
                </div>

                {/* Content Section */}
                <div className="px-5 py-2 flex-1">
                  <div className="text-[14px] text-black-spore font-normal leading-relaxed whitespace-pre-wrap">
                    {post.content.length > 250 ? post.content.substring(0, 250) + '...' : post.content}
                  </div>
                  <div className="mt-2 text-[#0a66c2] text-xs font-black cursor-pointer hover:underline">...see more</div>
                </div>

                {/* Image Section (Ratio 1.91:1) */}
                <div className="mt-4 aspect-[1.91/1] overflow-hidden border-y border-slate-50 relative group/img">
                  <img 
                    src={post.imageUrl || ''} 
                    alt="Network Dynamic Visual" 
                    className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover/img:scale-110" 
                  />
                  <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity">
                      <p className="text-[10px] text-white font-black tracking-[0.2em] uppercase">Scale Milestone Visual</p>
                  </div>
                </div>

                {/* Social Preview */}
                <div className="px-5 py-3 border-b border-slate-50 flex items-center gap-2">
                    <div className="flex -space-x-1">
                        <div className="w-4 h-4 rounded-full bg-[#0a66c2] flex items-center justify-center text-[10px] text-white">👍</div>
                        <div className="w-4 h-4 rounded-full bg-[#df704d] flex items-center justify-center text-[10px] text-white">❤️</div>
                    </div>
                    <span className="text-[11px] text-slate-400 font-bold hover:text-[#0a66c2] cursor-pointer">128 reactions • 1.2k views</span>
                </div>

                {/* Actions Section */}
                <div className="flex items-center justify-around py-1">
                    {[
                        { icon: <MessageSquare size={16} />, label: 'Like' },
                        { icon: <Repeat2 size={16} />, label: 'Comment' },
                        { icon: <Send size={16} />, label: 'Repost' }
                    ].map(btn => (
                        <button key={btn.label} className="p-3 text-slate-500 hover:text-black-spore hover:bg-slate-50 rounded-lg transition-all">
                            {btn.icon}
                        </button>
                    ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default CommunityPosts;
