'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, User, LogIn, LogOut, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function Navigation() {
  const { user, isAdmin, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: 'L&Q', href: '/', theme: 'logo' },
    { name: 'Dossier', href: '/dossier', theme: 'dossier' },
    { name: 'Crimson Ledger', href: '/crimson-ledger', theme: 'crimson' },
    { name: 'Crimson Confessions', href: '/crimson-confessions', theme: 'crimson' },
    { name: 'Fragments of Lament', href: '/fragments-of-lament', theme: 'green' },
    { name: 'Lament Submissions', href: '/lament-submissions', theme: 'green' },
    { name: 'The Ledger and the Lament', href: '/forum' },
    { name: 'Black Ledger Goods', href: '/merchandise' }
  ];

  return (
    <nav className="relative z-50 bg-gothic-black/90 backdrop-blur-lg border-b border-gothic-red/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Desktop Navigation - L&Q is now part of nav items */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`px-3 py-2 text-sm font-medium transition-all hover:text-white ${
                  item.theme === 'logo'
                    ? 'text-2xl font-gothic font-bold text-gothic-silver glow-text px-4'
                  : item.theme === 'crimson' 
                    ? 'text-gothic-crimson hover:bg-gothic-red/20' 
                  : item.theme === 'green'
                    ? 'text-gothic-green hover:bg-gothic-forest/20 nav-green'
                  : item.theme === 'dossier'
                    ? 'text-yellow-400 hover:bg-yellow-400/20 font-semibold nav-dossier'
                    : 'text-gothic-silver hover:bg-gothic-dark-gray/50'
                } rounded-md`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link href="/profile" className="cyber-button-secondary flex items-center space-x-2">
                  <User size={16} />
                  <span>{user.user_metadata?.username || user.email}</span>
                </Link>
                {isAdmin && (
                  <Link href="/admin" className="cyber-button flex items-center space-x-2 bg-gothic-crimson/20 hover:bg-gothic-crimson/30 text-gothic-crimson border-gothic-crimson/30">
                    <Shield size={16} />
                    <span>Admin</span>
                  </Link>
                )}
                <button 
                  onClick={signOut}
                  className="cyber-button flex items-center space-x-2"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <>
                <Link href="/login" className="cyber-button flex items-center space-x-2">
                  <LogIn size={16} />
                  <span>Login</span>
                </Link>
                <Link href="/register" className="cyber-button flex items-center space-x-2">
                  <User size={16} />
                  <span>Register</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gothic-silver hover:text-white p-2"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-gothic-charcoal border-t border-gothic-red/30">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`block px-3 py-2 text-base font-medium transition-all ${
                  item.theme === 'logo'
                    ? 'text-xl font-gothic font-bold text-gothic-silver glow-text'
                  : item.theme === 'crimson' 
                    ? 'text-gothic-crimson hover:bg-gothic-red/20' 
                  : item.theme === 'green'
                    ? 'text-gothic-green hover:bg-gothic-forest/20 nav-green'
                  : item.theme === 'dossier'
                    ? 'text-yellow-400 hover:bg-yellow-400/20 font-semibold nav-dossier'
                    : 'text-gothic-silver hover:bg-gothic-dark-gray/50'
                } rounded-md`}
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-4 pb-2 border-t border-gothic-red/30 flex space-x-4">
              {user ? (
                <div className="flex flex-col space-y-2 w-full">
                  <Link href="/profile" className="cyber-button-secondary flex items-center space-x-2">
                    <User size={16} />
                    <span>{user.user_metadata?.username || user.email}</span>
                  </Link>
                  {isAdmin && (
                    <Link href="/admin" className="cyber-button flex items-center space-x-2 bg-gothic-crimson/20 hover:bg-gothic-crimson/30 text-gothic-crimson">
                      <Shield size={16} />
                      <span>Admin</span>
                    </Link>
                  )}
                  <button 
                    onClick={signOut}
                    className="cyber-button flex items-center space-x-2"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <>
                  <Link href="/login" className="cyber-button flex items-center space-x-2">
                    <LogIn size={16} />
                    <span>Login</span>
                  </Link>
                  <Link href="/register" className="cyber-button flex items-center space-x-2">
                    <User size={16} />
                    <span>Register</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
