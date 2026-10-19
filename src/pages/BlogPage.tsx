import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, 
  Copy, 
  Check, 
  ShieldCheck, 
  Clock, 
  Calendar, 
  Share2, 
  Sparkles, 
  AlertTriangle, 
  ArrowRight,
  Search,
  BookOpen,
  Tag,
  ChevronRight,
  Filter
} from 'lucide-react';
import { BLOG_POSTS } from '../data/blogPosts';

interface BlogPageProps {
  onNavigateHome?: () => void;
  onNavigateModels?: () => void;
  onNavigatePricing?: () => void;
}

export const BlogPage: React.FC<BlogPageProps> = ({
  onNavigateHome,
  onNavigateModels,
  onNavigatePricing,
}) => {
  const getSlugFromLocation = (): string | null => {
    try {
      const pathname = window.location.pathname;
      const blogMatch = pathname.match(/\/blog\/([a-zA-Z0-9_-]+)/);
      if (blogMatch && blogMatch[1]) {
        const found = BLOG_POSTS.find(p => p.slug === blogMatch[1] || p.id === blogMatch[1]);
        if (found) return found.id;
      }

      const searchParams = new URLSearchParams(window.location.search);
      const searchSlug = searchParams.get('slug') || searchParams.get('post') || searchParams.get('id');
      if (searchSlug) {
        const found = BLOG_POSTS.find(p => p.slug === searchSlug || p.id === searchSlug);
        if (found) return found.id;
      }

      const hash = window.location.hash;
      if (hash.includes('?')) {
        const hashParams = new URLSearchParams(hash.split('?')[1]);
        const hashSlug = hashParams.get('slug') || hashParams.get('post') || hashParams.get('id');
        if (hashSlug) {
          const found = BLOG_POSTS.find(p => p.slug === hashSlug || p.id === hashSlug);
          if (found) return found.id;
        }
      }
    } catch {}
    return null;
  };

  const [selectedPostId, setSelectedPostId] = useState<string | null>(getSlugFromLocation);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    const handlePopState = () => {
      setSelectedPostId(getSlugFromLocation());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedPostId]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const categories = ['All', 'Guides', 'Cost Saving', 'Editor Setup', 'Architecture', 'Security'];

  const filteredPosts = useMemo(() => {
    return BLOG_POSTS.filter((post) => {
      const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery = !q || 
        post.title.toLowerCase().includes(q) ||
        post.subtitle.toLowerCase().includes(q) ||
        post.summary.toLowerCase().includes(q) ||
        post.tags.some(t => t.toLowerCase().includes(q));
      return matchesCategory && matchesQuery;
    });
  }, [selectedCategory, searchQuery]);

  const activePost = useMemo(() => {
    if (!selectedPostId) return null;
    return BLOG_POSTS.find(p => p.id === selectedPostId) || null;
  }, [selectedPostId]);

  useEffect(() => {
    if (activePost) {
      document.title = `${activePost.title} | OstraOps`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', activePost.summary);
      }
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      canonical.setAttribute('href', `https://ostraops.vercel.app/blog/${activePost.slug}`);
    } else {
      document.title = 'Open Source LLM Gateway Engineering & FinOps Guides | OstraOps';
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', 'Honest developer tutorials on building with AI without surprise bills. Setup guides for Cursor, Windsurf, token pricing comparisons, and runaway loop prevention.');
      }
      let canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) {
        canonical.setAttribute('href', 'https://ostraops.vercel.app/blog');
      }
    }
  }, [activePost]);

  const handleSelectPost = (id: string) => {
    setSelectedPostId(id);
    try {
      const post = BLOG_POSTS.find(p => p.id === id);
      if (post) {
        window.history.pushState(null, '', `/blog/${post.slug}`);
      }
    } catch {}
  };

  const handleBackToList = () => {
    setSelectedPostId(null);
    try {
      window.history.pushState(null, '', '/blog');
    } catch {}
  };

  return (
    <div className="min-h-screen bg-[#07090C] text-zinc-100 font-sans selection:bg-[#C59E5F]/30 selection:text-white pt-28 pb-20 relative overflow-hidden">
      {/* Ambient background glow matching FAQPage and AboutUsPage */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-gradient-to-b from-[#C59E5F]/10 via-[#E5C38D]/5 to-transparent blur-[160px] pointer-events-none -z-10" />

      {/* Sub-bar inside the page below the global fixed navbar */}
      <div className="max-w-6xl mx-auto px-6 mb-8 flex items-center justify-between gap-4">
        {activePost ? (
          <button
            onClick={handleBackToList}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white border border-white/[0.1] text-xs font-semibold shadow-2xs transition-all cursor-pointer group"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#E5C38D] group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to All Articles</span>
          </button>
        ) : (
          <button
            onClick={onNavigateHome}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white border border-white/[0.1] text-xs font-semibold shadow-2xs transition-all cursor-pointer group"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#E5C38D] group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Home</span>
          </button>
        )}

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-zinc-500 hidden sm:inline">
            Updated: October 2026
          </span>
          <button
            onClick={() => copyToClipboard(window.location.href, 'share')}
            className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-medium text-zinc-300 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer"
          >
            {copiedKey === 'share' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-medium">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* VIEW 1: FULL ARTICLE READER VIEW                          */}
      {/* ========================================================= */}
      {activePost ? (
        <article className="max-w-4xl mx-auto px-6 pb-12">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs text-zinc-400 mb-8 font-mono">
            <button onClick={handleBackToList} className="hover:text-white transition-colors cursor-pointer">
              Blog
            </button>
            <ChevronRight className="w-3 h-3 text-zinc-600" />
            <span className="text-[#E5C38D]">{activePost.category}</span>
            <ChevronRight className="w-3 h-3 text-zinc-600" />
            <span className="text-zinc-500 truncate max-w-xs">{activePost.title}</span>
          </div>

          {/* Article Header */}
          <div className="space-y-4 mb-10">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#C59E5F]/15 text-[#E5C38D] border border-[#C59E5F]/30">
                {activePost.category}
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {activePost.readTime}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-[1.18]">
              {activePost.title}
            </h1>

            <p className="text-lg sm:text-xl text-zinc-300 font-normal leading-relaxed">
              {activePost.subtitle}
            </p>

            <div className="flex items-center gap-6 pt-4 border-t border-white/[0.08] text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#C59E5F]/20 border border-[#C59E5F]/40 flex items-center justify-center text-[#E5C38D] font-bold text-[10px]">
                  OO
                </div>
                <span className="text-zinc-200 font-medium">OstraOps Engineering</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                <span>{activePost.publishDate}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-zinc-500" />
                <span>{activePost.readTime}</span>
              </div>
            </div>
          </div>

          {/* Overview Callout */}
          <div className="p-6 rounded-2xl bg-[#0B0E14] border border-white/[0.08] mb-12 shadow-xl">
            <div className="flex items-center gap-2 text-white font-semibold text-sm mb-2">
              <Sparkles className="w-4 h-4 text-[#E5C38D]" />
              <span>Overview</span>
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed">
              {activePost.content.overview}
            </p>
          </div>

          {/* Article Sections */}
          <div className="space-y-12">
            {activePost.content.sections.map((section, idx) => (
              <section key={idx} className="space-y-4">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {section.heading}
                </h2>

                <div className="space-y-3 text-zinc-300 leading-relaxed text-sm sm:text-base">
                  {section.body.map((para, pIdx) => (
                    <p key={pIdx}>{para}</p>
                  ))}
                </div>

                {/* Callout if any */}
                {section.callout && (
                  <div className={`p-4 rounded-xl border text-xs sm:text-sm flex items-start gap-3 my-4 ${
                    section.callout.type === 'warning'
                      ? 'bg-amber-500/10 border-amber-500/20 text-amber-200/90'
                      : section.callout.type === 'tip'
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-200/90'
                      : 'bg-[#C59E5F]/10 border-[#C59E5F]/20 text-zinc-200'
                  }`}>
                    <AlertTriangle className={`w-5 h-5 shrink-0 mt-0.5 ${
                      section.callout.type === 'warning' ? 'text-amber-400' : 'text-[#E5C38D]'
                    }`} />
                    <div>
                      <span className="font-bold block mb-1">{section.callout.title}</span>
                      <span>{section.callout.text}</span>
                    </div>
                  </div>
                )}

                {/* Code Snippet if any */}
                {section.codeSnippet && (
                  <div className="rounded-2xl bg-[#0B0E14] border border-white/[0.08] overflow-hidden shadow-2xl my-4">
                    <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-2 bg-black/40">
                      <span className="text-xs font-mono text-zinc-400">
                        {section.codeSnippet.label}
                      </span>
                      <button
                        onClick={() => copyToClipboard(section.codeSnippet!.code, `code-${idx}`)}
                        className="px-2.5 py-1 rounded bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-xs font-mono text-zinc-300 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        {copiedKey === `code-${idx}` ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="p-5 font-mono text-xs sm:text-sm text-zinc-300 overflow-x-auto leading-relaxed bg-[#07090C]">
                      <code>{section.codeSnippet.code}</code>
                    </pre>
                  </div>
                )}
              </section>
            ))}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap items-center gap-2 pt-8 mt-12 border-t border-white/[0.08]">
            <span className="text-xs text-zinc-500 font-mono flex items-center gap-1">
              <Tag className="w-3 h-3" /> Tags:
            </span>
            {activePost.tags.map((tag) => (
              <span key={tag} className="px-2.5 py-1 rounded-md bg-white/[0.03] border border-white/[0.06] text-xs text-zinc-400 font-mono">
                #{tag}
              </span>
            ))}
          </div>

          {/* Bottom CTA Banner */}
          <section className="p-8 rounded-3xl bg-gradient-to-br from-[#0B0E14] to-[#121620] border border-[#C59E5F]/30 text-center space-y-4 my-14">
            <div className="w-10 h-10 rounded-xl bg-[#C59E5F]/20 text-[#E5C38D] mx-auto flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-[#C59E5F]" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              Stop Runaway AI Spend in 30 Seconds
            </h3>
            <p className="text-sm text-zinc-400 max-w-lg mx-auto leading-relaxed">
              Run <code className="text-[#E5C38D] font-mono bg-black/40 px-1.5 py-0.5 rounded">npx ostraops-guard</code> on your laptop. Hard budget limits, real-time token tracking, and 100% private.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={handleBackToList}
                className="px-5 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-300 hover:text-white font-medium text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Explore More Guides</span>
              </button>
              {onNavigateModels && (
                <button
                  onClick={onNavigateModels}
                  className="px-5 py-2.5 rounded-xl bg-[#C59E5F] hover:bg-[#d6af70] text-[#07090C] font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-[#C59E5F]/20"
                >
                  <span>Model Rate Directory</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
              {onNavigatePricing && (
                <button
                  onClick={onNavigatePricing}
                  className="px-5 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-300 hover:text-white font-medium text-xs sm:text-sm transition-all cursor-pointer"
                >
                  View Plans &amp; Budgets
                </button>
              )}
            </div>
          </section>
        </article>
      ) : (
        /* ========================================================= */
        /* VIEW 2: BLOG DIRECTORY & ARTICLE LISTING HUB              */
        /* ========================================================= */
        <main className="max-w-6xl mx-auto px-6 pb-16">
          {/* Hero Header */}
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C59E5F]/15 border border-[#C59E5F]/30 text-[#E5C38D] text-xs font-semibold">
              <BookOpen className="w-3.5 h-3.5" />
              <span>OstraOps Engineering &amp; FinOps Hub</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
              Honest Guides to Building with AI{' '}
              <span className="text-[#E5C38D] block">Without the Surprise Bills</span>
            </h1>
            <p className="text-base text-zinc-400 leading-relaxed">
              Step-by-step tutorials on connecting models, locking down Cursor &amp; Windsurf guardrails, comparing token prices, and preventing runaway loops.
            </p>
          </div>

          {/* Search & Filter Bar */}
          <div className="space-y-4 mb-10 max-w-4xl mx-auto">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search articles by topic, model, or tool (e.g. Cursor, DeepSeek, Loop, Pricing)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0B0E14] border border-white/[0.08] focus:border-[#C59E5F]/50 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-zinc-500 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <span className="text-xs text-zinc-500 mr-2 flex items-center gap-1 font-mono">
                <Filter className="w-3 h-3" /> Category:
              </span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-[#C59E5F] text-[#07090C] font-semibold shadow-md shadow-[#C59E5F]/20'
                      : 'bg-white/[0.03] hover:bg-white/[0.06] text-zinc-400 hover:text-white border border-white/[0.06]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Articles Grid */}
          {filteredPosts.length === 0 ? (
            <div className="text-center py-16 p-8 rounded-3xl bg-[#0B0E14] border border-white/[0.08] space-y-3">
              <p className="text-lg font-bold text-white">No articles matched your search</p>
              <p className="text-xs text-zinc-400">Try searching for "Cursor", "Loop", "Pricing", or clear your filter.</p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                className="mt-2 px-4 py-2 rounded-xl bg-white/[0.08] text-xs font-semibold text-white hover:bg-white/[0.12]"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => handleSelectPost(post.id)}
                  className="group p-6 rounded-2xl bg-[#0B0E14] hover:bg-[#0E131C] border border-white/[0.08] hover:border-[#C59E5F]/40 transition-all duration-300 shadow-xl flex flex-col justify-between cursor-pointer hover:-translate-y-1"
                >
                  <div className="space-y-3.5">
                    {/* Card Meta */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="px-2.5 py-0.5 rounded-full font-semibold bg-[#C59E5F]/15 text-[#E5C38D] border border-[#C59E5F]/30 text-[11px]">
                        {post.category}
                      </span>
                      <span className="text-zinc-500 font-mono text-[11px] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.readTime}
                      </span>
                    </div>

                    {/* Title */}
                    <h2 className="text-lg font-bold text-white group-hover:text-[#E5C38D] transition-colors leading-snug">
                      {post.title}
                    </h2>

                    {/* Summary */}
                    <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">
                      {post.summary}
                    </p>
                  </div>

                  {/* Card Footer */}
                  <div className="pt-5 mt-4 border-t border-white/[0.06] flex items-center justify-between text-xs">
                    <span className="text-zinc-500 text-[11px]">
                      {post.publishDate}
                    </span>
                    <span className="text-[#E5C38D] font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>Read Guide</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quickstart Callout Box */}
          <div className="mt-16 p-8 rounded-3xl bg-[#0B0E14] border border-white/[0.08] flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
            <div className="space-y-2 text-left">
              <span className="text-xs font-mono text-[#E5C38D] uppercase tracking-wider font-semibold">
                Quick Dev Command
              </span>
              <h3 className="text-xl font-bold text-white">
                Start your local budget controller right now
              </h3>
              <p className="text-xs text-zinc-400 max-w-lg leading-relaxed">
                Zero configuration. Tracks every token against official rate cards and enforces real-time hard spending caps.
              </p>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="p-3 rounded-xl bg-black/60 border border-white/[0.1] font-mono text-xs text-[#E5C38D] flex items-center justify-between gap-4 w-full md:w-auto">
                <span>npx ostraops-guard</span>
                <button
                  onClick={() => copyToClipboard('npx ostraops-guard', 'npx-cmd')}
                  className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  title="Copy command"
                >
                  {copiedKey === 'npx-cmd' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </main>
      )}
    </div>
  );
};
