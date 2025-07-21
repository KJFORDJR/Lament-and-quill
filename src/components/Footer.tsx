export function Footer() {
  return (
    <footer className="relative z-10 bg-gothic-black/90 border-t border-gothic-red/30 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-gothic font-bold text-gothic-silver glow-text">
              Lament and Quill
            </h3>
            <p className="text-gothic-steel text-lg font-noir italic">
              Two cities. Two Ghosts. One reckoning.
            </p>
            <p className="text-gothic-steel text-sm">
              A Dark Neo-Gothic Tech Noir experience where fate intertwines the destinies of two cities.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-gothic text-gothic-crimson">Quick Access</h4>
            <nav className="flex flex-col space-y-2">
              <a href="/dossier" className="text-gothic-steel hover:text-gothic-silver transition-colors">
                Character & Map Dossiers
              </a>
              <a href="/forum" className="text-gothic-steel hover:text-gothic-silver transition-colors">
                The Ledger and the Lament
              </a>
              <a href="/merchandise" className="text-gothic-steel hover:text-gothic-silver transition-colors">
                Black Ledger Goods
              </a>
            </nav>
          </div>

          {/* Legal & Contact */}
          <div className="space-y-4">
            <h4 className="text-lg font-gothic text-gothic-silver">Contact</h4>
            <div className="text-gothic-steel text-sm space-y-1">
              <p>&copy; 2025 Lament and Quill</p>
              <p>All rights reserved</p>
              <div className="pt-2">
                <a href="/privacy" className="hover:text-gothic-silver transition-colors">
                  Privacy Policy
                </a>
                {' | '}
                <a href="/terms" className="hover:text-gothic-silver transition-colors">
                  Terms of Service
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gothic-red/20 text-center text-gothic-steel text-sm">
          <p>Built with dark technologies and Gothic sensibilities</p>
        </div>
      </div>
    </footer>
  );
}
