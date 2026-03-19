import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Trash2, 
  ExternalLink, 
  Sparkles, 
  Database, 
  Tag, 
  Info,
  Loader2,
  X,
  Sun,
  Moon
} from 'lucide-react';
import { AITool, suggestAIDetails } from './services/geminiService';

export default function App() {
  const [tools, setTools] = useState<AITool[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as 'light' | 'dark') || 'dark';
  });

  const [formData, setFormData] = useState<AITool>({
    name: '',
    category: '',
    description: '',
    url: '',
    tags: ''
  });

  useEffect(() => {
    fetchTools();
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const fetchTools = async () => {
    try {
      const res = await fetch('/api/tools');
      const data = await res.json();
      setTools(data);
    } catch (error) {
      console.error('Failed to fetch tools:', error);
    }
  };

  const handleAddTool = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setFormData({ name: '', category: '', description: '', url: '', tags: '' });
        setIsAdding(false);
        fetchTools();
      }
    } catch (error) {
      console.error('Failed to add tool:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    console.log(`[CLIENT] Attempting to delete tool with ID: ${id}`);
    if (!confirm('Are you sure you want to delete this entry?')) return;
    try {
      const res = await fetch(`/api/tools/${id}`, { method: 'DELETE' });
      if (res.ok) {
        console.log(`[CLIENT] Successfully deleted tool with ID: ${id}`);
        await fetchTools();
      } else {
        const errorData = await res.json();
        console.error('Failed to delete tool:', errorData);
        alert(`Failed to delete tool: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to delete tool:', error);
      alert('An error occurred while deleting the tool.');
    }
  };

  const handleSuggest = async () => {
    if (!formData.name) return;
    setIsSuggesting(true);
    const suggestion = await suggestAIDetails(formData.name);
    if (suggestion) {
      setFormData(prev => ({
        ...prev,
        category: suggestion.category || '',
        description: suggestion.description || '',
        tags: suggestion.tags || ''
      }));
    }
    setIsSuggesting(false);
  };

  const filteredTools = tools.filter(tool => {
    const search = searchTerm.toLowerCase();
    return (
      (tool.name?.toLowerCase() || '').includes(search) ||
      (tool.category?.toLowerCase() || '').includes(search) ||
      (tool.tags?.toLowerCase() || '').includes(search)
    );
  });

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-[#0A0A0A] text-neutral-900 dark:text-neutral-100 pb-12 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white/80 dark:bg-[#0A0A0A]/80 backdrop-blur-md border-b border-neutral-200 dark:border-white/5 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-neutral-900 dark:bg-white p-1.5 rounded-lg">
              <Database className="w-5 h-5 text-white dark:text-black" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">AI Knowledge Vault</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 dark:text-neutral-500" />
              <input 
                type="text" 
                placeholder="Search vault..." 
                className="pl-10 pr-4 py-2 bg-neutral-100 dark:bg-white/5 border border-transparent dark:border-white/10 focus:bg-white focus:border-neutral-300 dark:focus:bg-white/10 dark:focus:border-white/20 rounded-full text-sm w-64 transition-all outline-none text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-600"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-white/5 rounded-full transition-colors"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <button 
              onClick={() => setIsAdding(true)}
              className="bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-black px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Add Tool
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Mobile Search */}
        <div className="sm:hidden mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 dark:text-neutral-500" />
            <input 
              type="text" 
              placeholder="Search vault..." 
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-xl text-sm outline-none shadow-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-600"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredTools.map((tool) => (
              <motion.div
                key={tool.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-[#141414] border border-neutral-200 dark:border-white/5 rounded-2xl p-6 shadow-sm dark:shadow-xl hover:shadow-md dark:hover:border-white/10 transition-all group relative overflow-hidden"
              >
                {/* Decorative background element */}
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-neutral-100 dark:bg-white/5 rounded-full blur-3xl group-hover:bg-neutral-200 dark:group-hover:bg-white/10 transition-colors" />

                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-neutral-100 dark:bg-white/5 text-neutral-500 dark:text-neutral-400 mb-2 border border-neutral-200 dark:border-white/5">
                      {tool.category || 'Uncategorized'}
                    </span>
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white leading-tight">{tool.name}</h3>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (tool.id !== undefined) handleDelete(tool.id);
                    }}
                    className="p-2 text-neutral-400 dark:text-neutral-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-400/10 transition-all rounded-lg sm:opacity-0 group-hover:opacity-100 focus:opacity-100 outline-none active:scale-90"
                    aria-label="Delete tool"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-6 line-clamp-3 min-h-[4.5rem] relative z-10">
                  {tool.description || 'No description provided.'}
                </p>

                <div className="flex flex-wrap gap-2 mb-6 relative z-10">
                  {tool.tags?.split(',').map((tag, i) => (
                    <span key={i} className="flex items-center gap-1 text-[11px] font-medium text-neutral-500 dark:text-neutral-500 bg-neutral-50 dark:bg-white/5 px-2 py-1 rounded-md border border-neutral-200 dark:border-white/5">
                      <Tag className="w-3 h-3" />
                      {tag.trim()}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-neutral-100 dark:border-white/5 relative z-10">
                  <span className="text-[10px] text-neutral-400 dark:text-neutral-600 font-mono uppercase tracking-widest">
                    {tool.created_at ? new Date(tool.created_at).toLocaleDateString() : ''}
                  </span>
                  {tool.url && (
                    <a 
                      href={tool.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-neutral-900 dark:text-white hover:text-neutral-600 dark:hover:text-neutral-300 inline-flex items-center gap-1.5 text-xs font-bold transition-colors"
                    >
                      Visit Site
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredTools.length === 0 && !isLoading && (
            <div className="col-span-full py-20 text-center">
              <div className="bg-neutral-100 dark:bg-white/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-neutral-200 dark:border-white/5">
                <Info className="w-8 h-8 text-neutral-400 dark:text-neutral-600" />
              </div>
              <h3 className="text-lg font-medium text-neutral-900 dark:text-white">No tools found</h3>
              <p className="text-neutral-500">Try adjusting your search or add a new tool to your vault.</p>
            </div>
          )}
        </div>
      </main>

      {/* Add Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdding(false)}
              className="absolute inset-0 bg-neutral-900/40 dark:bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white dark:bg-[#141414] w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-neutral-100 dark:border-white/10"
            >
              <div className="px-8 pt-8 pb-6 flex items-center justify-between border-b border-neutral-100 dark:border-white/5">
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Add AI Tool</h2>
                <button 
                  onClick={() => setIsAdding(false)}
                  className="p-2 hover:bg-neutral-100 dark:hover:bg-white/5 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-neutral-500" />
                </button>
              </div>

              <form onSubmit={handleAddTool} className="p-8 space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">Name</label>
                  <div className="relative">
                    <input 
                      required
                      type="text" 
                      className="w-full px-4 py-3 bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-neutral-900/5 dark:focus:ring-white/5 focus:border-neutral-900 dark:focus:border-white/40 outline-none transition-all text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-700"
                      placeholder="e.g. ChatGPT, Midjourney..."
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                    <button
                      type="button"
                      onClick={handleSuggest}
                      disabled={!formData.name || isSuggesting}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-neutral-400 dark:text-neutral-500 hover:text-neutral-900 dark:hover:text-white disabled:opacity-30 transition-colors"
                      title="Auto-fill with AI"
                    >
                      {isSuggesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">Category</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-neutral-900/5 dark:focus:ring-white/5 focus:border-neutral-900 dark:focus:border-white/40 outline-none transition-all text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-700"
                      placeholder="e.g. LLM, Image Gen"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">URL</label>
                    <input 
                      type="url" 
                      className="w-full px-4 py-3 bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-neutral-900/5 dark:focus:ring-white/5 focus:border-neutral-900 dark:focus:border-white/40 outline-none transition-all text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-700"
                      placeholder="https://..."
                      value={formData.url}
                      onChange={(e) => setFormData({...formData, url: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">Description</label>
                  <textarea 
                    rows={3}
                    className="w-full px-4 py-3 bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-neutral-900/5 dark:focus:ring-white/5 focus:border-neutral-900 dark:focus:border-white/40 outline-none transition-all resize-none text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-700"
                    placeholder="What does this tool do?"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">Tags (comma separated)</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-neutral-900/5 dark:focus:ring-white/5 focus:border-neutral-900 dark:focus:border-white/40 outline-none transition-all text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-700"
                    placeholder="productivity, creative, research"
                    value={formData.tags}
                    onChange={(e) => setFormData({...formData, tags: e.target.value})}
                  />
                </div>

                <div className="pt-4">
                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-black py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 active:scale-[0.98]"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save to Vault'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
