'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Megaphone, X, AlertTriangle } from 'lucide-react';

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

export default function AnnouncementTicker() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch('/api/announcements');
      if (response.ok) {
        const data = await response.json();
        // Sort by priority (high to low) and then by creation date (newest first)
        const sortedAnnouncements = (data.data || []).sort((a: Announcement, b: Announcement) => {
          if (a.priority !== b.priority) {
            return b.priority - a.priority;
          }
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
        setAnnouncements(sortedAnnouncements);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
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

  // Don't render if no announcements or if dismissed
  if (loading || announcements.length === 0 || !isVisible) {
    return null;
  }

  return (
    <>
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        className="relative bg-gradient-to-r from-gothic-charcoal/95 via-gothic-charcoal/90 to-gothic-charcoal/95 border-b border-gothic-silver/20 backdrop-blur-sm z-50"
      >
        <div className="flex items-center h-12 overflow-hidden">
          {/* Ticker Icon */}
          <div className="flex-shrink-0 px-4 border-r border-gothic-silver/20">
            <div className="flex items-center">
              <Megaphone size={16} className="text-gothic-silver mr-2 animate-pulse" />
              <span className="text-xs font-medium text-gothic-silver hidden sm:inline">
                NEXUS
              </span>
            </div>
          </div>

          {/* Scrolling Content */}
          <div className="flex-1 relative overflow-hidden ticker-container">
            <div className="ticker-content flex items-center whitespace-nowrap">
              <div className="flex items-center space-x-8 text-sm">
                {announcements.map((announcement, index) => (
                  <div
                    key={`${announcement.id}-${index}`}
                    className="flex items-center space-x-2 text-gothic-light"
                  >
                    {announcement.priority > 5 && (
                      <AlertTriangle size={14} className="text-gothic-crimson animate-pulse" />
                    )}
                    <span className={`font-bold text-xs ${getCityColor(announcement.profiles.city_affiliation)}`}>
                      [{announcement.profiles.city_affiliation?.toUpperCase() || 'NEXUS'}]
                    </span>
                    <span className="font-semibold text-gothic-silver">
                      {announcement.title}:
                    </span>
                    <span className="text-gothic-light">
                      {announcement.content}
                    </span>
                    <span className="text-gothic-steel text-xs">
                      - {formatTimeAgo(announcement.created_at)}
                    </span>
                  </div>
                ))}
                {/* Separator and duplicate content for seamless loop */}
                <span className="text-gothic-steel px-8">•</span>
                {announcements.map((announcement, index) => (
                  <div
                    key={`${announcement.id}-duplicate-${index}`}
                    className="flex items-center space-x-2 text-gothic-light"
                  >
                    {announcement.priority > 5 && (
                      <AlertTriangle size={14} className="text-gothic-crimson animate-pulse" />
                    )}
                    <span className={`font-bold text-xs ${getCityColor(announcement.profiles.city_affiliation)}`}>
                      [{announcement.profiles.city_affiliation?.toUpperCase() || 'NEXUS'}]
                    </span>
                    <span className="font-semibold text-gothic-silver">
                      {announcement.title}:
                    </span>
                    <span className="text-gothic-light">
                      {announcement.content}
                    </span>
                    <span className="text-gothic-steel text-xs">
                      - {formatTimeAgo(announcement.created_at)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Close Button */}
          <div className="flex-shrink-0 px-2 border-l border-gothic-silver/20">
            <button
              onClick={() => setIsVisible(false)}
              className="p-1 text-gothic-steel hover:text-gothic-silver transition-colors"
              aria-label="Dismiss announcements"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Gradient fade effects */}
        <div className="absolute left-20 top-0 bottom-0 w-8 bg-gradient-to-r from-gothic-charcoal/90 to-transparent pointer-events-none" />
        <div className="absolute right-12 top-0 bottom-0 w-8 bg-gradient-to-l from-gothic-charcoal/90 to-transparent pointer-events-none" />
      </motion.div>
    </>
  );
}
