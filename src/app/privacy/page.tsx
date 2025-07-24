'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Shield, Eye, Database, Lock } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gothic-black via-gothic-dark-gray to-gothic-black">
      <div className="absolute inset-0 bg-[url('/circuit-pattern.svg')] opacity-5"></div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 max-w-4xl mx-auto px-4 py-12"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-12"
        >
          <Link
            href="/"
            className="inline-flex items-center text-gothic-crimson hover:text-gothic-silver transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Return to the Nexus
          </Link>
          
          <h1 className="text-4xl md:text-6xl font-gothic font-bold text-gothic-silver glow-text mb-4">
            Shadow Accord
          </h1>
          <p className="text-xl text-gothic-steel font-noir italic">
            Privacy Policy - Protecting your digital essence in the dark realms
          </p>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="bg-gothic-dark-gray/30 border border-gothic-red/30 rounded-lg backdrop-blur-sm p-8 space-y-8"
        >
          <div className="text-gothic-steel text-sm mb-6">
            <p className="font-semibold">Last Updated: January 21, 2025</p>
            <p>Effective Date: January 21, 2025</p>
          </div>

          {/* Introduction */}
          <section>
            <div className="flex items-center mb-4">
              <Shield className="w-6 h-6 text-gothic-crimson mr-3" />
              <h2 className="text-2xl font-gothic text-gothic-silver">Introduction</h2>
            </div>
            <p className="text-gothic-steel leading-relaxed mb-4">
              Welcome to Lament and Quill, a Dark Neo-Gothic Tech Noir experience where &ldquo;Two cities. Two Ghosts. One reckoning.&rdquo; 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information when you visit 
              our website and use our services.
            </p>
            <p className="text-gothic-steel leading-relaxed">
              By using our services, you agree to the collection and use of information in accordance with this policy. 
              We will not use or share your information except as described in this Privacy Policy.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <div className="flex items-center mb-4">
              <Database className="w-6 h-6 text-gothic-crimson mr-3" />
              <h2 className="text-2xl font-gothic text-gothic-silver">Information We Collect</h2>
            </div>
            
            <h3 className="text-lg font-semibold text-gothic-silver mb-3">Personal Information</h3>
            <ul className="text-gothic-steel leading-relaxed mb-4 space-y-2 list-disc list-inside">
              <li>Username and display name</li>
              <li>Email address</li>
              <li>First and last name</li>
              <li>Phone number</li>
              <li>Shipping and billing addresses</li>
              <li>Profile information and bio</li>
              <li>Payment information (processed securely through third-party providers)</li>
            </ul>

            <h3 className="text-lg font-semibold text-gothic-silver mb-3">Usage Information</h3>
            <ul className="text-gothic-steel leading-relaxed mb-4 space-y-2 list-disc list-inside">
              <li>Forum posts, comments, and submissions</li>
              <li>Orders and purchase history</li>
              <li>Website interaction data</li>
              <li>Device information and browser type</li>
              <li>IP address and location data</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </section>

          {/* How We Use Your Information */}
          <section>
            <div className="flex items-center mb-4">
              <Eye className="w-6 h-6 text-gothic-crimson mr-3" />
              <h2 className="text-2xl font-gothic text-gothic-silver">How We Use Your Information</h2>
            </div>
            <ul className="text-gothic-steel leading-relaxed space-y-2 list-disc list-inside">
              <li>Provide and maintain our services</li>
              <li>Process transactions and fulfill orders</li>
              <li>Communicate with you about your account and orders</li>
              <li>Improve our website and user experience</li>
              <li>Prevent fraud and ensure security</li>
              <li>Comply with legal obligations</li>
              <li>Send promotional materials (with your consent)</li>
              <li>Analyze usage patterns and website performance</li>
            </ul>
          </section>

          {/* Information Sharing */}
          <section>
            <h2 className="text-2xl font-gothic text-gothic-silver mb-4">Information Sharing and Disclosure</h2>
            <p className="text-gothic-steel leading-relaxed mb-4">
              We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
            </p>
            <ul className="text-gothic-steel leading-relaxed space-y-2 list-disc list-inside">
              <li><strong>Service Providers:</strong> With trusted third-party providers who assist us in operating our website and services</li>
              <li><strong>Legal Compliance:</strong> When required by law or to protect our rights and safety</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
              <li><strong>With Consent:</strong> When you explicitly consent to sharing your information</li>
            </ul>
          </section>

          {/* Data Security */}
          <section>
            <div className="flex items-center mb-4">
              <Lock className="w-6 h-6 text-gothic-crimson mr-3" />
              <h2 className="text-2xl font-gothic text-gothic-silver">Data Security</h2>
            </div>
            <p className="text-gothic-steel leading-relaxed mb-4">
              We implement appropriate technical and organizational security measures to protect your personal information against 
              unauthorized access, alteration, disclosure, or destruction. This includes:
            </p>
            <ul className="text-gothic-steel leading-relaxed space-y-2 list-disc list-inside">
              <li>Encryption of sensitive data in transit and at rest</li>
              <li>Regular security audits and updates</li>
              <li>Access controls and authentication measures</li>
              <li>Secure payment processing through certified providers</li>
              <li>Regular backups and disaster recovery procedures</li>
            </ul>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-gothic text-gothic-silver mb-4">Your Rights and Choices</h2>
            <p className="text-gothic-steel leading-relaxed mb-4">
              You have the following rights regarding your personal information:
            </p>
            <ul className="text-gothic-steel leading-relaxed space-y-2 list-disc list-inside">
              <li><strong>Access:</strong> Request access to your personal information</li>
              <li><strong>Correction:</strong> Request correction of inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your personal information</li>
              <li><strong>Portability:</strong> Request a copy of your data in a portable format</li>
              <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
              <li><strong>Account Management:</strong> Update your profile and preferences</li>
            </ul>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-2xl font-gothic text-gothic-silver mb-4">Cookies and Tracking</h2>
            <p className="text-gothic-steel leading-relaxed mb-4">
              We use cookies and similar technologies to enhance your experience, analyze usage, and provide personalized content. 
              Types of cookies we use include:
            </p>
            <ul className="text-gothic-steel leading-relaxed space-y-2 list-disc list-inside">
              <li><strong>Essential Cookies:</strong> Required for basic website functionality</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how users interact with our site</li>
              <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
              <li><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements (with consent)</li>
            </ul>
            <p className="text-gothic-steel leading-relaxed mt-4">
              You can control cookie preferences through your browser settings, but disabling certain cookies may affect website functionality.
            </p>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-gothic text-gothic-silver mb-4">Children&apos;s Privacy</h2>
            <p className="text-gothic-steel leading-relaxed">
              Our services are not directed to individuals under 18 years of age. We do not knowingly collect personal information 
              from children under 18. If we become aware that we have collected personal information from a child under 18, 
              we will take steps to remove that information from our servers immediately.
            </p>
          </section>

          {/* International Users */}
          <section>
            <h2 className="text-2xl font-gothic text-gothic-silver mb-4">International Users</h2>
            <p className="text-gothic-steel leading-relaxed">
              If you are accessing our services from outside the United States, please be aware that your information may be 
              transferred to, stored, and processed in the United States where our servers are located and our central database 
              is operated. By using our services, you consent to such transfer.
            </p>
          </section>

          {/* Changes to Privacy Policy */}
          <section>
            <h2 className="text-2xl font-gothic text-gothic-silver mb-4">Changes to This Privacy Policy</h2>
            <p className="text-gothic-steel leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy 
              on this page with an updated effective date. You are advised to review this Privacy Policy periodically for any changes. 
              Changes to this Privacy Policy are effective when they are posted on this page.
            </p>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-2xl font-gothic text-gothic-silver mb-4">Contact Us</h2>
            <p className="text-gothic-steel leading-relaxed">
              If you have any questions about this Privacy Policy or our privacy practices, please contact us at:
            </p>
            <div className="text-gothic-steel mt-4 p-4 bg-gothic-black/30 rounded border border-gothic-red/20">
              <p><strong>Lament and Quill</strong></p>
              <p>Email: privacy@lamentandquill.com</p>
              <p>Subject Line: Privacy Policy Inquiry</p>
            </div>
          </section>
        </motion.div>
      </motion.div>
    </div>
  );
}
