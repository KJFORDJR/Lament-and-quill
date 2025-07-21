'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Megaphone, X, Clock, User, ChevronRight } from 'lucide-react';
import { createPortal } from 'react-dom';

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: number;
  created_at: string;
  profiles: {
    username: string;
    city_affiliation: string;
    user_role: string;
  };
}

export default function AnnouncementsSection() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch('/api/announcements');
      if (response.ok) {
        const data = await response.json();
        setAnnouncements(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const openAnnouncement = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedAnnouncement(null);
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - past.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const getCityColor = (city: string) => {
    switch(city?.toLowerCase()) {
      case 'crimson': return 'text-gothic-crimson';
      case 'silver': return 'text-gothic-silver';
      default: return 'text-gothic-steel';
    }
  };

  if (loading) {
    return (
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gothic-silver mx-auto"></div>
            <p className="text-gothic-steel mt-4">Loading announcements...</p>
          </div>
        </div>
      </section>
    );
  }

  if (announcements.length === 0) {
    return null; // Don't show the section if no announcements
  }

  return (
    <section className="py-16 px-4 bg-gothic-charcoal/20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-4">
            <Megaphone size={40} className="text-gothic-silver mr-3 animate-pulse-slow" />
            <h2 className="text-4xl md:text-5xl font-gothic font-bold text-gothic-silver glow-text">
              Nexus Announcements
            </h2>
          </div>
          <p className="text-xl text-gothic-steel max-w-3xl mx-auto">
            Official communications from the convergence administrators. 
            Stay informed about system updates, events, and important notices.
          </p>
        </motion.div>

        {/* Announcements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {announcements.map((announcement, index) => (
            <motion.div
              key={announcement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="group cursor-pointer"
              onClick={() => openAnnouncement(announcement)}
            >
              <div className="bg-gothic-dark-gray/40 hover:bg-gothic-dark-gray/60 p-6 rounded-lg border border-gothic-dark-gray/50 hover:border-gothic-silver/30 transition-all duration-300">
                {/* Priority indicator */}
                {announcement.priority > 5 && (
                  <div className="flex items-center mb-3">
                    <div className="bg-gothic-red/20 text-gothic-crimson px-2 py-1 rounded text-xs font-bold">
                      HIGH PRIORITY
                    </div>
                  </div>
                )}

                {/* Title */}
                <h3 className="text-xl font-gothic font-bold text-gothic-silver group-hover:text-white transition-colors mb-3 line-clamp-2">
                  {announcement.title}
                </h3>

                {/* Content preview */}
                <p className="text-gothic-steel text-sm mb-4 leading-relaxed line-clamp-3">
                  {announcement.content.length > 120 
                    ? `${announcement.content.substring(0, 120)}...`
                    : announcement.content
                  }
                </p>

                {/* Meta info */}
                <div className="flex items-center justify-between text-xs text-gothic-steel">
                  <div className="flex items-center">
                    <User size={12} className="mr-1" />
                    <span className={`font-medium ${getCityColor(announcement.profiles.city_affiliation)}`}>
                      {announcement.profiles.username}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Clock size={12} className="mr-1" />
                    {formatTimeAgo(announcement.created_at)}
                  </div>
                </div>

                {/* Read more indicator */}
                <div className="flex items-center justify-end mt-4 text-gothic-silver group-hover:text-white transition-colors">
                  <span className="text-sm mr-1">Read More</span>
                  <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Announcement Modal */}
        <AnimatePresence>
          {showModal && selectedAnnouncement && typeof document !== 'undefined' && createPortal(
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
              onClick={closeModal}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-gothic-charcoal border border-gothic-dark-gray rounded-lg w-full max-w-2xl max-h-[80vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="p-6 border-b border-gothic-dark-gray">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      {selectedAnnouncement.priority > 5 && (
                        <div className="bg-gothic-red/20 text-gothic-crimson px-2 py-1 rounded text-xs font-bold mb-2 inline-block">
                          HIGH PRIORITY
                        </div>
                      )}
                      <h2 className="text-2xl font-gothic text-gothic-silver mb-2">
                        {selectedAnnouncement.title}
                      </h2>
                      <div className="flex items-center gap-4 text-sm text-gothic-steel">
                        <div className="flex items-center">
                          <User size={14} className="mr-1" />
                          <span className={`font-medium ${getCityColor(selectedAnnouncement.profiles.city_affiliation)}`}>
                            {selectedAnnouncement.profiles.username}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Clock size={14} className="mr-1" />
                          {formatTimeAgo(selectedAnnouncement.created_at)}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={closeModal}
                      className="text-gothic-steel hover:text-white transition-colors ml-4"
                    >
                      <X size={24} />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                  <div className="prose prose-invert max-w-none">
                    <p className="text-gothic-light leading-relaxed whitespace-pre-wrap">
                      {selectedAnnouncement.content}
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>,
            document.body
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
