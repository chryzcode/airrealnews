import React, { useState, useEffect } from 'react';
import { 
  X, 
  Volume2, 
  Pause, 
  Play, 
  Bookmark, 
  Share2, 
  Clock, 
  MessageSquare, 
  ThumbsUp, 
  Send, 
  CheckCircle2, 
  Quote, 
  Type,
  ExternalLink
} from 'lucide-react';
import { Article, Comment } from '../types/news';
import * as api from '../services/api';

interface ArticleModalProps {
  article: Article;
  onClose: () => void;
  onOpenArticle: (article: Article) => void;
  allArticles: Article[];
  isBookmarked: boolean;
  onToggleBookmark: (articleId: string) => void;
}

export const ArticleModal: React.FC<ArticleModalProps> = ({
  article,
  onClose,
  onOpenArticle,
  allArticles,
  isBookmarked,
  onToggleBookmark,
}) => {
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'huge'>('normal');
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentName, setNewCommentName] = useState('');
  const [newCommentText, setNewCommentText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Load comments from backend
  const loadComments = async () => {
    try {
      const data = await api.fetchComments(article.id);
      setComments(data);
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  };

  useEffect(() => {
    loadComments();
  }, [article.id]);

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleToggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const fullText = `${article.title}. ${article.subtitle || ''}. ${article.content.join(' ')}`;
      const utterance = new SpeechSynthesisUtterance(fullText);
      utterance.rate = 0.98;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    try {
      const created = await api.postComment({
        articleId: article.id,
        authorName: newCommentName.trim() || 'Verified Reader',
        text: newCommentText.trim()
      });

      setComments([created, ...comments]);
      setNewCommentText('');
      setNewCommentName('');
    } catch (err) {
      console.error('Error submitting comment to backend:', err);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    try {
      await api.likeComment(commentId);
      setComments(comments.map(c => c.id === commentId ? { ...c, likes: c.likes + 1 } : c));
    } catch (err) {
      console.error('Error liking comment:', err);
    }
  };

  const relatedArticles = allArticles.filter(a => a.id !== article.id).slice(0, 3);

  const getFontSizeClasses = () => {
    switch (fontSize) {
      case 'large':
        return 'text-lg sm:text-xl leading-relaxed';
      case 'huge':
        return 'text-xl sm:text-2xl leading-loose';
      default:
        return 'text-base sm:text-lg leading-relaxed';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex justify-center p-2 sm:p-4 md:p-6 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-slate-800 flex flex-col my-auto max-h-[92vh]">
        
        {/* Sticky Article Header Bar */}
        <div className="sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-5 py-3.5 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-black text-red-600 uppercase tracking-wider truncate mr-4 font-mono">
            <span>AIR REAL NEWS</span>
            <span>&bull;</span>
            <span className="text-gray-700 dark:text-gray-200">{article.category}</span>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {/* Text Sizing */}
            <div className="hidden sm:flex items-center space-x-1 bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded-lg text-xs">
              <Type className="w-3.5 h-3.5 text-slate-400 mr-1" />
              <button
                onClick={() => setFontSize('normal')}
                className={`px-1.5 py-0.5 rounded font-bold ${fontSize === 'normal' ? 'bg-white dark:bg-slate-700 shadow-sm text-red-600' : 'text-slate-500'}`}
              >
                A
              </button>
              <button
                onClick={() => setFontSize('large')}
                className={`px-1.5 py-0.5 rounded font-bold text-sm ${fontSize === 'large' ? 'bg-white dark:bg-slate-700 shadow-sm text-red-600' : 'text-slate-500'}`}
              >
                A+
              </button>
            </div>

            {/* Bookmark button */}
            <button
              onClick={() => onToggleBookmark(article.id)}
              className={`p-2 rounded-lg border transition-colors ${
                isBookmarked
                  ? 'bg-red-50 dark:bg-red-950/60 border-red-600 text-red-600'
                  : 'border-gray-200 dark:border-slate-700 text-gray-500 hover:text-red-600 hover:border-red-600'
              }`}
              title="Bookmark story"
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-red-600' : ''}`} />
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Article Body */}
        <div className="overflow-y-auto px-5 sm:px-8 lg:px-12 py-6 sm:py-8 space-y-8">
          
          {/* Header Metadata & Headline */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="bg-red-600 text-white text-xs font-black uppercase px-2.5 py-0.5 rounded tracking-wider">
                {article.category}
              </span>
              {article.isBreaking ? (
                <span className="bg-slate-900 text-white text-xs font-black uppercase px-2.5 py-0.5 rounded tracking-wider border border-slate-700">
                  BREAKING REPORT
                </span>
              ) : article.sourceName ? (
                <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold px-2 py-0.5 rounded border border-slate-300 dark:border-slate-700">
                  Syndicated via {article.sourceName}
                </span>
              ) : null}
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white leading-[1.18] mb-4 font-sans tracking-tight">
              {article.title}
            </h1>

            {article.subtitle && (
              <p className="text-base sm:text-xl text-gray-600 dark:text-gray-300 leading-relaxed font-light mb-6">
                {article.subtitle}
              </p>
            )}

            {/* Author Byline Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-gray-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center space-x-3">
                {article.author.avatar && (
                  <img
                    src={article.author.avatar}
                    alt={article.author.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-red-600"
                  />
                )}
                <div>
                  <div className="font-extrabold text-sm text-gray-900 dark:text-gray-100">
                    {article.author.name}
                  </div>
                  <div className="text-slate-400">
                    {article.author.role} {article.author.bureau ? `• ${article.author.bureau}` : ''}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4 font-mono">
                <span className="flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-red-600" />
                  <span>Published {article.publishedAt}</span>
                </span>
                <span>&bull;</span>
                <span className="font-bold text-red-600">{article.readTime}</span>
              </div>
            </div>
          </div>

          {/* Syndicated Wire Source Alert if applicable */}
          {article.sourceUrl && (
            <div className="bg-slate-100 dark:bg-slate-800/80 p-3 rounded-lg border border-slate-300 dark:border-slate-700 flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-300 font-medium">
                This dispatch was ingested in real time from <strong className="text-slate-900 dark:text-white">{article.sourceName}</strong> for Air Real News readers.
              </span>
              <a
                href={article.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-600 hover:text-red-700 font-bold flex items-center shrink-0 ml-3 underline"
              >
                <span>View Source Wire</span>
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </div>
          )}

          {/* Audio Speech Narrator */}
          <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <button
                onClick={handleToggleSpeech}
                className={`p-3 rounded-full text-white transition-all shadow ${
                  isSpeaking ? 'bg-red-600 animate-pulse' : 'bg-slate-900 hover:bg-slate-800'
                }`}
                title={isSpeaking ? 'Pause speech narration' : 'Listen to speech narration'}
              >
                {isSpeaking ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
              </button>
              <div>
                <div className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center space-x-1.5 font-mono">
                  <Volume2 className="w-4 h-4 text-red-600" />
                  <span>{isSpeaking ? 'Narrating Air Real News Audio...' : 'Listen to Audio Narration'}</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {isSpeaking ? 'AI speech synthesis voice reading full report' : `Estimated listen time: ${article.audioDuration || '4:20 min'}`}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopyLink}
                className="flex items-center space-x-1.5 bg-white dark:bg-slate-700 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-600 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50"
              >
                <Share2 className="w-3.5 h-3.5 text-red-600" />
                <span>{copiedLink ? 'Link Copied!' : 'Share'}</span>
              </button>
            </div>
          </div>

          {/* Lead Image & Caption */}
          <div className="rounded-xl overflow-hidden bg-slate-900 border border-gray-200 dark:border-slate-800">
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-full max-h-[500px] object-cover"
            />
            {article.imageCaption && (
              <div className="p-3 bg-gray-50 dark:bg-slate-950 text-xs text-slate-500 dark:text-slate-400 italic">
                Caption: {article.imageCaption}
              </div>
            )}
          </div>

          {/* Key Takeaways Box */}
          {article.keyTakeaways && article.keyTakeaways.length > 0 && (
            <div className="bg-slate-50 dark:bg-slate-800/60 border-l-4 border-red-600 p-5 rounded-r-xl">
              <h4 className="text-xs font-black uppercase tracking-wider text-red-600 mb-3 flex items-center space-x-2 font-mono">
                <CheckCircle2 className="w-4 h-4 text-red-600" />
                <span>Verified Key Takeaways & Developments</span>
              </h4>
              <ul className="space-y-2.5">
                {article.keyTakeaways.map((takeaway, idx) => (
                  <li key={idx} className="flex items-start text-sm sm:text-base text-gray-800 dark:text-gray-200">
                    <span className="text-red-600 font-bold mr-2 text-lg leading-none">&bull;</span>
                    <span>{takeaway}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Article Text Content */}
          <div className={`space-y-6 text-gray-800 dark:text-gray-200 ${getFontSizeClasses()}`}>
            {article.content.map((paragraph, index) => {
              if (index === 0) {
                return (
                  <p key={index} className="first-letter:text-5xl first-letter:font-black first-letter:float-left first-letter:mr-3 first-letter:text-red-600 font-sans leading-relaxed">
                    {paragraph}
                  </p>
                );
              }

              if (index === 2 && article.pullQuote) {
                return (
                  <React.Fragment key={index}>
                    <div className="my-8 p-6 bg-slate-50 dark:bg-slate-800/80 rounded-xl border-l-4 border-red-600 shadow-sm">
                      <Quote className="w-8 h-8 text-red-600 mb-2 opacity-60" />
                      <blockquote className="text-lg sm:text-2xl font-bold italic text-slate-900 dark:text-white leading-snug font-serif">
                        &ldquo;{article.pullQuote.text}&rdquo;
                      </blockquote>
                      <div className="text-xs font-bold uppercase text-red-600 mt-3 tracking-wider font-mono">
                        — {article.pullQuote.attribution}
                      </div>
                    </div>
                    <p className="font-sans leading-relaxed">{paragraph}</p>
                  </React.Fragment>
                );
              }

              return (
                <p key={index} className="font-sans leading-relaxed">
                  {paragraph}
                </p>
              );
            })}
          </div>

          {/* Article Tags */}
          <div className="pt-6 border-t border-gray-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2 font-mono">
              Topic Tags:
            </span>
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 text-xs font-medium px-3 py-1 rounded-full hover:bg-red-600 hover:text-white cursor-pointer transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Reader Discussion / Comments Section (Backed by SQLite DB) */}
          <div className="pt-8 border-t border-gray-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-red-600" />
                <span>Reader Discussion ({comments.length})</span>
              </h3>
              <span className="text-xs text-slate-500 font-mono">ARN Database Verified</span>
            </div>

            {/* Comment Form */}
            <form onSubmit={handleAddComment} className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-xl border border-gray-200 dark:border-slate-700 mb-6 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Your Name / Designation (e.g. Flight Captain, London)"
                  value={newCommentName}
                  onChange={(e) => setNewCommentName(e.target.value)}
                  className="px-3.5 py-2 text-xs rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>
              <textarea
                rows={3}
                placeholder="Share your technical observation or verified perspective..."
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!newCommentText.trim()}
                  className="flex items-center space-x-1.5 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit to Database</span>
                </button>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-white dark:bg-slate-800/40 p-4 rounded-xl border border-gray-100 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2.5">
                      <img
                        src={comment.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                        alt={comment.authorName}
                        className="w-7 h-7 rounded-full object-cover border border-red-600"
                      />
                      <span className="font-bold text-gray-900 dark:text-white">
                        {comment.authorName}
                      </span>
                    </div>
                    <span className="text-slate-400 text-[11px] font-mono">{comment.timestamp}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {comment.text}
                  </p>
                  <div className="flex items-center space-x-4 pt-1 text-xs text-slate-400">
                    <button
                      onClick={() => handleLikeComment(comment.id)}
                      className="flex items-center space-x-1 hover:text-red-600 transition-colors"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{comment.likes}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Related Stories Bar */}
          <div className="pt-8 border-t border-gray-200 dark:border-slate-800">
            <h4 className="text-lg font-black text-gray-900 dark:text-white mb-4">
              More In-Depth Dispatches
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedArticles.map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => onOpenArticle(rel)}
                  className="bg-gray-50 dark:bg-slate-800/50 p-3 rounded-lg border border-gray-200 dark:border-slate-700 cursor-pointer hover:border-red-600 transition-colors group"
                >
                  <span className="text-[10px] font-black uppercase text-red-600 font-mono">
                    {rel.category}
                  </span>
                  <h5 className="font-bold text-xs text-gray-900 dark:text-gray-100 group-hover:text-red-600 transition-colors line-clamp-2 mt-1">
                    {rel.title}
                  </h5>
                  <span className="text-[10px] text-slate-400 mt-2 block font-mono">{rel.readTime}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
