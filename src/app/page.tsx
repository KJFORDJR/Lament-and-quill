'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Eye, BookOpen, MessageCircle, Users, ShoppingBag, Map } from 'lucide-react';
import AnnouncementsSection from '@/components/AnnouncementsSection';

export default function Home() {
  const features = [
    {
      icon: Map,
      title: 'Dossier',
      description: 'Character and map dossiers with advanced search and filtering capabilities.',
      href: '/dossier',
      theme: 'default'
    },
    {
      icon: BookOpen,
      title: 'Crimson Ledger',
      description: 'Official journal entries from the Crimson city, curated by administrators.',
      href: '/crimson-ledger',
      theme: 'crimson'
    },
    {
      icon: Eye,
      title: 'Fragments of Lament',
      description: 'Lament city\'s official chronicles, maintained by the silver administration.',
      href: '/fragments-of-lament',
      theme: 'silver'
    },
    {
      icon: Users,
      title: 'The Ledger and the Lament',
      description: 'Community forum where both cities converge in discourse.',
      href: '/forum',
      theme: 'default'
    },
    {
      icon: ShoppingBag,
      title: 'Black Ledger Goods',
      description: 'Exclusive merchandise and services from the shadow markets.',
      href: '/merchandise',
      theme: 'default'
    }
  ];

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-gothic-red/20 via-gothic-black to-gothic-charcoal" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="relative z-10 text-center max-w-4xl mx-auto px-4"
        >
          <motion.div 
            className="flex items-center justify-center gap-6 mb-8"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            <motion.div
              className="relative"
              initial={{ rotate: -10, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 1 }}
            >
              <Image
                src="/LandQsymbol.jpg"
                alt="Lament and Quill Symbol"
                width={96}
                height={96}
                className="w-16 h-16 md:w-24 md:h-24 object-contain rounded-lg border-2 border-gothic-silver/30 hover:border-gothic-silver/60 transition-all duration-300"
              />
            </motion.div>
            <motion.h1 
              className="text-6xl md:text-8xl font-gothic font-bold text-gothic-silver glow-text"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 1.2, ease: "easeOut" }}
            >
              Lament and Quill
            </motion.h1>
            <motion.div
              className="relative"
              initial={{ rotate: 10, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
            >
              <Image
                src="/Main Symbol.jpg"
                alt="Main Symbol"
                width={96}
                height={96}
                className="w-16 h-16 md:w-24 md:h-24 object-contain rounded-lg border-2 border-gothic-crimson/30 hover:border-gothic-crimson/60 transition-all duration-300"
              />
            </motion.div>
          </motion.div>
          
          <motion.p 
            className="text-2xl md:text-3xl font-noir italic text-gothic-crimson mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            Two cities. Two Ghosts. One reckoning.
          </motion.p>
          
          <motion.div 
            className="text-lg md:text-xl text-gothic-steel max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
          >
          <p className="mb-6">
            This isn&apos;t just a blog.
            It&apos;s a living story, written in ink, blood, and choice.
          </p>

          <p className="mb-6">
            Each entry is a page from a book that never ends, unfolding one act of justice at a time.
            You don&apos;t just read it—you witness it.
            And sometimes… you help write it.
          </p>

          <p>
            Leave questions. Suggest threads.
            Whispers in the margins might become tomorrow&apos;s headline.
            Because every vigilante needs a city to listen.
            Every story needs eyes brave enough to follow.
          </p>
          </motion.div>
        </motion.div>
      </section>

      {/* Announcements Section */}
      <AnnouncementsSection />

      {/* Features Grid */}
      <section className="relative py-20 px-4 bg-gothic-charcoal/50">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-gothic font-bold text-gothic-silver mb-6">
              Enter the Nexus
            </h2>
            <p className="text-xl text-gothic-steel max-w-2xl mx-auto">
              Navigate between realms, uncover hidden truths, and shape the narrative 
              that binds these twin cities together.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  <Link href={feature.href}>
                    <div className={`h-full p-6 rounded-lg tech-border transition-all duration-300 hover:scale-105 ${
                      feature.theme === 'crimson' 
                        ? 'crimson-theme hover:shadow-lg hover:shadow-gothic-red/20' 
                        : feature.theme === 'silver'
                        ? 'silver-theme hover:shadow-lg hover:shadow-gothic-silver/20'
                        : 'bg-gothic-dark-gray/50 hover:bg-gothic-dark-gray/70 hover:shadow-lg hover:shadow-gothic-silver/10'
                    }`}>
                      <div className={`w-12 h-12 mb-4 rounded-full flex items-center justify-center ${
                        feature.theme === 'crimson' 
                          ? 'bg-gothic-red/20 text-gothic-crimson' 
                          : feature.theme === 'silver'
                          ? 'bg-gothic-silver/20 text-gothic-silver'
                          : 'bg-gothic-silver/10 text-gothic-silver'
                      }`}>
                        <Icon size={24} />
                      </div>
                      <h3 className="text-xl font-gothic font-bold mb-3 text-gothic-silver">
                        {feature.title}
                      </h3>
                      <p className="text-gothic-steel leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="relative py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-gothic font-bold text-gothic-silver mb-8">
              Choose Your Path
            </h2>
            <p className="text-xl text-gothic-steel mb-12 max-w-2xl mx-auto">
              The chronicles await your voice. The cities hunger for new stories. 
              Will you write in crimson ink or silver stylus?
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/register" className="cyber-button text-lg px-8 py-4">
                Begin Your Chronicle
              </Link>
              <Link href="/login" className="cyber-button text-lg px-8 py-4">
                Continue Your Journey
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
