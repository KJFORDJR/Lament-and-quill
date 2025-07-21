'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import { Search, Filter, Map, User, Eye, Edit3, Trash2 } from 'lucide-react';

interface DossierEntry {
  id: string;
  title: string;
  summary: string;
  content: string;
  type: 'character' | 'location' | 'event';
  city: 'crimson' | 'silver';
  classification: 'public' | 'confidential' | 'secret' | 'top-secret';
  image_url?: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export default function Dossier() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [dossiers, setDossiers] = useState<DossierEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal state
  const [showDossierReadModal, setShowDossierReadModal] = useState(false);
  const [readingDossier, setReadingDossier] = useState<DossierEntry | null>(null);

  const filters = [
    { id: 'all', label: 'All Dossiers' },
    { id: 'characters', label: 'Characters' },
    { id: 'maps', label: 'Locations' },
    { id: 'crimson', label: 'Crimson City' },
    { id: 'silver', label: 'Silver Heights' }
  ];

  // Fetch dossiers from API
  useEffect(() => {
    const fetchDossiers = async () => {
      try {
        const response = await fetch('/api/dossier');
        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch dossiers');
        }
        
        setDossiers(result.data || []);
      } catch (err: any) {
        console.error('Error fetching dossiers:', err);
        setError(err.message || 'Failed to load dossiers');
      } finally {
        setLoading(false);
      }
    };

    fetchDossiers();
  }, []);

  const filteredDossiers = dossiers.filter(dossier => {
    const matchesSearch = dossier.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dossier.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dossier.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeFilter === 'all') return matchesSearch;
    if (activeFilter === 'characters') return matchesSearch && dossier.type === 'character';
    if (activeFilter === 'maps') return matchesSearch && dossier.type === 'location';
    return matchesSearch && dossier.city === activeFilter;
  });

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-gothic font-bold text-gothic-silver glow-text mb-4">
            The Dossier
          </h1>
          <p className="text-xl text-gothic-steel max-w-3xl mx-auto">
            Complete archives of characters, locations, and secrets from both cities. 
            Navigate the complex web of connections that bind the twin realms together.
          </p>
        </motion.div>

        {/* Search and Filter Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-8 space-y-4"
        >
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gothic-steel" />
            <input
              type="text"
              placeholder="Search dossiers, characters, locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gothic-charcoal/50 border border-gothic-dark-gray rounded-lg 
                       text-gothic-silver placeholder-gothic-steel focus:outline-none focus:border-gothic-crimson 
                       focus:ring-1 focus:ring-gothic-crimson transition-colors text-lg"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap justify-center gap-2">
            {filters.map(filter => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`px-4 py-2 rounded-full transition-all duration-300 ${
                  activeFilter === filter.id
                    ? 'bg-gothic-crimson text-gothic-silver shadow-lg shadow-gothic-crimson/30'
                    : 'bg-gothic-dark-gray/50 text-gothic-steel hover:bg-gothic-dark-gray hover:text-gothic-silver'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Results Count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-center mb-8"
        >
          {loading ? (
            <p className="text-gothic-steel">Loading dossiers...</p>
          ) : error ? (
            <p className="text-red-400">Error: {error}</p>
          ) : (
            <p className="text-gothic-steel">
              <span className="text-gothic-silver font-bold">{filteredDossiers.length}</span> dossiers found
            </p>
          )}
        </motion.div>

        {/* Dossier Grid */}
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="animate-spin w-12 h-12 border-2 border-gothic-crimson border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gothic-steel">Loading classified archives...</p>
          </motion.div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <p className="text-red-400 text-xl mb-4">Failed to access dossier archives</p>
            <p className="text-gothic-steel">The archives may be under maintenance. Please try again later.</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
          >
            {filteredDossiers.length === 0 && !loading && !error ? (
              <div className="col-span-full text-center py-16">
                <p className="text-gothic-steel text-xl">No files found matching current filters.</p>
              </div>
            ) : (
              filteredDossiers.map((entry: DossierEntry, index: number) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="group cursor-pointer"
                  onClick={() => {
                    setReadingDossier(entry);
                    setShowDossierReadModal(true);
                  }}
                >
                  <div className={`h-full p-6 rounded-lg tech-border transition-all duration-300 hover:scale-105 ${
                    entry.city === 'crimson' 
                      ? 'crimson-theme hover:shadow-lg hover:shadow-gothic-red/20' 
                      : 'silver-theme hover:shadow-lg hover:shadow-gothic-silver/20'
                  }`}>
                    {/* Classification Badge */}
                    <div className="flex justify-between items-start mb-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        entry.type === 'character' 
                          ? 'bg-gothic-crimson/20 text-gothic-crimson' 
                          : entry.type === 'location'
                          ? 'bg-gothic-silver/20 text-gothic-silver'
                          : 'bg-purple-500/20 text-purple-400'
                      }`}>
                        {entry.type === 'character' ? <User size={24} /> : 
                         entry.type === 'location' ? <Map size={24} /> : 
                         <Eye size={24} />}
                      </div>
                      <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase ${
                        entry.classification === 'top-secret' ? 'bg-red-900/80 text-red-100' :
                        entry.classification === 'secret' ? 'bg-orange-900/80 text-orange-100' :
                        entry.classification === 'confidential' ? 'bg-yellow-900/80 text-yellow-100' :
                        'bg-green-900/80 text-green-100'
                      }`}>
                        {entry.classification}
                      </span>
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-gothic font-bold mb-2 text-gothic-silver group-hover:text-white transition-colors">
                      {entry.title}
                    </h3>
                    <p className="text-gothic-steel text-sm leading-relaxed mb-4 line-clamp-3">
                      {entry.summary}
                    </p>

                    {/* City Badge & Updated Date */}
                    <div className="flex justify-between items-center">
                      <span className={`px-2 py-1 text-xs rounded ${
                        entry.city === 'crimson' 
                          ? 'bg-gothic-red/10 text-gothic-crimson' 
                          : 'bg-gothic-silver/10 text-gothic-silver'
                      }`}>
                        {entry.city === 'crimson' ? 'Crimson City' : 'Silver Heights'}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gothic-steel">
                          {new Date(entry.updated_at).toLocaleDateString()}
                        </span>
                        <Eye size={16} className="text-gothic-steel group-hover:text-gothic-silver transition-colors" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}

      </div>

      {/* Dossier Read Modal */}
      {showDossierReadModal && readingDossier && createPortal(
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" 
          style={{ zIndex: 999999 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowDossierReadModal(false);
              setReadingDossier(null);
            }
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`rounded-lg border shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden ${
              readingDossier.city === 'crimson' 
                ? 'bg-gothic-charcoal border-gothic-crimson' 
                : 'bg-gothic-charcoal border-gothic-silver'
            }`}
            style={{ zIndex: 999999 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`flex justify-between items-center p-6 border-b ${
              readingDossier.city === 'crimson' 
                ? 'border-gothic-red/30' 
                : 'border-gothic-steel/30'
            }`}>
              <div className="flex-1">
                <h2 className={`text-2xl font-gothic font-bold mb-2 ${
                  readingDossier.city === 'crimson' 
                    ? 'text-gothic-crimson' 
                    : 'text-gothic-silver'
                }`}>
                  {readingDossier.title}
                </h2>
                <div className="flex items-center space-x-4 text-sm text-gothic-steel">
                  <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                    readingDossier.classification === 'top-secret' ? 'bg-red-900/80 text-red-100' :
                    readingDossier.classification === 'secret' ? 'bg-orange-900/80 text-orange-100' :
                    readingDossier.classification === 'confidential' ? 'bg-yellow-900/80 text-yellow-100' :
                    'bg-green-900/80 text-green-100'
                  }`}>
                    {readingDossier.classification}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    readingDossier.city === 'crimson' ? 'bg-gothic-crimson/20 text-gothic-crimson' :
                    'bg-gothic-silver/20 text-gothic-silver'
                  }`}>
                    {readingDossier.city === 'crimson' ? 'Crimson City' : 'Silver Heights'}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    readingDossier.type === 'character' ? 'bg-blue-900/80 text-blue-100' :
                    readingDossier.type === 'location' ? 'bg-purple-900/80 text-purple-100' :
                    'bg-gray-900/80 text-gray-100'
                  }`}>
                    {readingDossier.type}
                  </span>
                  <span>•</span>
                  <span>{new Date(readingDossier.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowDossierReadModal(false);
                  setReadingDossier(null);
                }}
                className="text-gothic-steel hover:text-gothic-silver text-2xl font-bold ml-4"
                title="Close"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="mb-6">
                <h3 className={`text-lg font-semibold mb-3 ${
                  readingDossier.city === 'crimson' 
                    ? 'text-gothic-crimson' 
                    : 'text-gothic-silver'
                }`}>
                  Summary
                </h3>
                <div className={`p-4 rounded border ${
                  readingDossier.city === 'crimson'
                    ? 'bg-gothic-charcoal/50 border-gothic-red/30'
                    : 'bg-gothic-charcoal/50 border-gothic-steel/30'
                }`}>
                  <p className="text-gothic-steel leading-relaxed">{readingDossier.summary}</p>
                </div>
              </div>
              
              <div>
                <h3 className={`text-lg font-semibold mb-3 ${
                  readingDossier.city === 'crimson' 
                    ? 'text-gothic-crimson' 
                    : 'text-gothic-silver'
                }`}>
                  Detailed Report
                </h3>
                <div className={`p-4 rounded border ${
                  readingDossier.city === 'crimson'
                    ? 'bg-gothic-charcoal/50 border-gothic-red/30'
                    : 'bg-gothic-charcoal/50 border-gothic-steel/30'
                }`}>
                  <div className="prose prose-invert max-w-none">
                    <div className={`leading-relaxed whitespace-pre-wrap text-base ${
                      readingDossier.city === 'crimson' 
                        ? 'text-gothic-silver' 
                        : 'text-gothic-silver'
                    }`}>
                      {readingDossier.content}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className={`flex justify-end items-center p-6 border-t ${
              readingDossier.city === 'crimson' 
                ? 'border-gothic-red/30' 
                : 'border-gothic-steel/30'
            }`}>
              <button
                onClick={() => {
                  setShowDossierReadModal(false);
                  setReadingDossier(null);
                }}
                className={`px-4 py-2 rounded transition-colors ${
                  readingDossier.city === 'crimson'
                    ? 'bg-gothic-crimson text-gothic-charcoal hover:bg-gothic-crimson/80'
                    : 'bg-gothic-silver text-gothic-charcoal hover:bg-gothic-silver/80'
                }`}
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>,
        document.body
      )}
    </div>
  );
}
