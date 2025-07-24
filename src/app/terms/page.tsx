'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, FileText, AlertTriangle, Scale, Users } from 'lucide-react';

export default function Terms() {
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
            Terms of the Chronicle
          </h1>
          <p className="text-xl text-gothic-steel font-noir italic">
            Terms of Service - The binding contract of our digital realm
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
              <FileText className="w-6 h-6 text-gothic-crimson mr-3" />
              <h2 className="text-2xl font-gothic text-gothic-silver">Agreement to Terms</h2>
            </div>
            <p className="text-gothic-steel leading-relaxed mb-4">
              Welcome to Lament and Quill (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;). These Terms of Service (&ldquo;Terms&rdquo;) govern your use of our website 
              and services located at lamentandquill.com (the &ldquo;Service&rdquo;) operated by Lament and Quill.
            </p>
            <p className="text-gothic-steel leading-relaxed mb-4">
              By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any part of these terms, 
              then you may not access the Service.
            </p>
            <div className="bg-gothic-crimson/10 border border-gothic-crimson/30 rounded p-4 mt-4">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-gothic-crimson mr-2" />
                <p className="text-gothic-steel font-semibold">
                  You must be at least 18 years old to use this service.
                </p>
              </div>
            </div>
          </section>

          {/* Account Terms */}
          <section>
            <div className="flex items-center mb-4">
              <Users className="w-6 h-6 text-gothic-crimson mr-3" />
              <h2 className="text-2xl font-gothic text-gothic-silver">Account Terms</h2>
            </div>
            
            <h3 className="text-lg font-semibold text-gothic-silver mb-3">Account Creation</h3>
            <ul className="text-gothic-steel leading-relaxed mb-4 space-y-2 list-disc list-inside">
              <li>You must provide accurate, complete, and current information during registration</li>
              <li>You are responsible for maintaining the security of your account and password</li>
              <li>You must immediately notify us of any unauthorized use of your account</li>
              <li>You may not use another person&apos;s account without permission</li>
              <li>You may not create multiple accounts to evade bans or restrictions</li>
            </ul>

            <h3 className="text-lg font-semibold text-gothic-silver mb-3">Account Responsibilities</h3>
            <ul className="text-gothic-steel leading-relaxed mb-4 space-y-2 list-disc list-inside">
              <li>You are solely responsible for all activity that occurs under your account</li>
              <li>You must keep your contact information up to date</li>
              <li>You must comply with all applicable laws and regulations</li>
              <li>You must respect the rights and privacy of other users</li>
            </ul>
          </section>

          {/* Acceptable Use */}
          <section>
            <h2 className="text-2xl font-gothic text-gothic-silver mb-4">Acceptable Use Policy</h2>
            
            <h3 className="text-lg font-semibold text-gothic-silver mb-3">Permitted Uses</h3>
            <p className="text-gothic-steel leading-relaxed mb-4">
              You may use our Service for lawful purposes only, including:
            </p>
            <ul className="text-gothic-steel leading-relaxed mb-4 space-y-2 list-disc list-inside">
              <li>Accessing and participating in forums and discussions</li>
              <li>Purchasing merchandise and services</li>
              <li>Submitting content and confessions</li>
              <li>Interacting with other users respectfully</li>
              <li>Using features as intended</li>
            </ul>

            <h3 className="text-lg font-semibold text-gothic-silver mb-3">Prohibited Activities</h3>
            <p className="text-gothic-steel leading-relaxed mb-4">
              You agree not to engage in any of the following prohibited activities:
            </p>
            <ul className="text-gothic-steel leading-relaxed mb-4 space-y-2 list-disc list-inside">
              <li>Harassment, abuse, or threats against other users</li>
              <li>Posting illegal, harmful, or offensive content</li>
              <li>Spamming or sending unsolicited communications</li>
              <li>Attempting to gain unauthorized access to accounts or systems</li>
              <li>Distributing malware, viruses, or other harmful code</li>
              <li>Violating intellectual property rights</li>
              <li>Impersonating others or providing false information</li>
              <li>Interfering with the proper functioning of the Service</li>
              <li>Using automated tools to access or interact with the Service</li>
              <li>Engaging in any form of data scraping or mining</li>
            </ul>
          </section>

          {/* User-Generated Content */}
          <section>
            <h2 className="text-2xl font-gothic text-gothic-silver mb-4">User-Generated Content</h2>
            
            <h3 className="text-lg font-semibold text-gothic-silver mb-3">Content Ownership</h3>
            <p className="text-gothic-steel leading-relaxed mb-4">
              You retain ownership of any content you submit, post, or display on the Service (&ldquo;User Content&rdquo;). 
              However, by submitting User Content, you grant us a worldwide, non-exclusive, royalty-free license to use, 
              reproduce, modify, adapt, publish, translate, and distribute such content.
            </p>

            <h3 className="text-lg font-semibold text-gothic-silver mb-3">Content Standards</h3>
            <p className="text-gothic-steel leading-relaxed mb-4">
              All User Content must comply with our community guidelines:
            </p>
            <ul className="text-gothic-steel leading-relaxed mb-4 space-y-2 list-disc list-inside">
              <li>Be respectful and constructive</li>
              <li>Not contain hate speech, discrimination, or harassment</li>
              <li>Not infringe on others&apos; intellectual property rights</li>
              <li>Not contain explicit sexual content or nudity</li>
              <li>Not promote violence or illegal activities</li>
              <li>Not contain personal information of others without consent</li>
            </ul>

            <h3 className="text-lg font-semibold text-gothic-silver mb-3">Content Moderation</h3>
            <p className="text-gothic-steel leading-relaxed">
              We reserve the right to remove, edit, or disable any User Content that violates these Terms or our community guidelines. 
              We may also suspend or terminate accounts that repeatedly violate our policies.
            </p>
          </section>

          {/* Purchases and Payments */}
          <section>
            <h2 className="text-2xl font-gothic text-gothic-silver mb-4">Purchases and Payments</h2>
            
            <h3 className="text-lg font-semibold text-gothic-silver mb-3">Orders and Pricing</h3>
            <ul className="text-gothic-steel leading-relaxed mb-4 space-y-2 list-disc list-inside">
              <li>All prices are subject to change without notice</li>
              <li>We reserve the right to refuse or cancel any order</li>
              <li>Payment is due at the time of purchase</li>
              <li>All sales are final unless otherwise specified</li>
              <li>Shipping costs and delivery times may vary</li>
            </ul>

            <h3 className="text-lg font-semibold text-gothic-silver mb-3">Payment Processing</h3>
            <p className="text-gothic-steel leading-relaxed mb-4">
              We use secure third-party payment processors to handle transactions. By making a purchase, you agree to their terms and conditions. 
              We do not store your payment information on our servers.
            </p>

            <h3 className="text-lg font-semibold text-gothic-silver mb-3">Refunds and Returns</h3>
            <p className="text-gothic-steel leading-relaxed">
              Refund and return policies vary by product and service. Please review our specific refund policy for each item before purchase. 
              Digital products and services are generally non-refundable.
            </p>
          </section>

          {/* Intellectual Property */}
          <section>
            <div className="flex items-center mb-4">
              <Scale className="w-6 h-6 text-gothic-crimson mr-3" />
              <h2 className="text-2xl font-gothic text-gothic-silver">Intellectual Property Rights</h2>
            </div>
            
            <h3 className="text-lg font-semibold text-gothic-silver mb-3">Our Content</h3>
            <p className="text-gothic-steel leading-relaxed mb-4">
              The Service and its original content, features, and functionality are and will remain the exclusive property of 
              Lament and Quill and its licensors. The Service is protected by copyright, trademark, and other laws. 
              Our trademarks and trade dress may not be used without our prior written consent.
            </p>

            <h3 className="text-lg font-semibold text-gothic-silver mb-3">DMCA Compliance</h3>
            <p className="text-gothic-steel leading-relaxed">
              We respect intellectual property rights and respond to valid DMCA takedown notices. If you believe your copyrighted 
              work has been copied in a way that constitutes copyright infringement, please contact us with detailed information 
              including the allegedly infringing content and your ownership claim.
            </p>
          </section>

          {/* Privacy and Data */}
          <section>
            <h2 className="text-2xl font-gothic text-gothic-silver mb-4">Privacy and Data Protection</h2>
            <p className="text-gothic-steel leading-relaxed mb-4">
              Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, 
              to understand our practices regarding the collection, use, and disclosure of your personal information.
            </p>
            <p className="text-gothic-steel leading-relaxed">
              By using our Service, you acknowledge that you have read and understood our Privacy Policy and consent to our 
              data practices as described therein.
            </p>
          </section>

          {/* Service Availability */}
          <section>
            <h2 className="text-2xl font-gothic text-gothic-silver mb-4">Service Availability</h2>
            <ul className="text-gothic-steel leading-relaxed space-y-2 list-disc list-inside">
              <li>We strive to maintain high availability but cannot guarantee uninterrupted service</li>
              <li>We may perform maintenance that temporarily affects service availability</li>
              <li>We reserve the right to modify, suspend, or discontinue the Service at any time</li>
              <li>We are not liable for any loss or damage resulting from service interruptions</li>
            </ul>
          </section>

          {/* Disclaimers and Limitations */}
          <section>
            <h2 className="text-2xl font-gothic text-gothic-silver mb-4">Disclaimers and Limitation of Liability</h2>
            
            <h3 className="text-lg font-semibold text-gothic-silver mb-3">Service Disclaimer</h3>
            <p className="text-gothic-steel leading-relaxed mb-4">
              THE SERVICE IS PROVIDED ON AN &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; BASIS. WE MAKE NO REPRESENTATIONS OR WARRANTIES OF ANY KIND, 
              EXPRESS OR IMPLIED, AS TO THE OPERATION OF THE SERVICE OR THE INFORMATION, CONTENT, MATERIALS, OR PRODUCTS INCLUDED THEREIN.
            </p>

            <h3 className="text-lg font-semibold text-gothic-silver mb-3">Limitation of Liability</h3>
            <p className="text-gothic-steel leading-relaxed">
              IN NO EVENT SHALL LAMENT AND QUILL, ITS DIRECTORS, EMPLOYEES, PARTNERS, AGENTS, SUPPLIERS, OR AFFILIATES BE LIABLE 
              FOR ANY INDIRECT, INCIDENTAL, PUNITIVE, CONSEQUENTIAL, OR SPECIAL DAMAGES ARISING OUT OF OR RELATED TO YOUR USE OF THE SERVICE.
            </p>
          </section>

          {/* Indemnification */}
          <section>
            <h2 className="text-2xl font-gothic text-gothic-silver mb-4">Indemnification</h2>
            <p className="text-gothic-steel leading-relaxed">
              You agree to defend, indemnify, and hold harmless Lament and Quill and its licensors, partners, affiliates, 
              contractors, officers, directors, employees, and agents from and against any and all claims, damages, obligations, 
              losses, liabilities, costs, or debt arising from your use of and access to the Service or your violation of these Terms.
            </p>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-2xl font-gothic text-gothic-silver mb-4">Termination</h2>
            <p className="text-gothic-steel leading-relaxed mb-4">
              We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, 
              under our sole discretion, for any reason whatsoever, including but not limited to a breach of the Terms.
            </p>
            <p className="text-gothic-steel leading-relaxed">
              You may terminate your account at any time by contacting us. Upon termination, your right to use the Service will 
              cease immediately, but your obligations under these Terms will survive termination.
            </p>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-2xl font-gothic text-gothic-silver mb-4">Governing Law</h2>
            <p className="text-gothic-steel leading-relaxed">
              These Terms shall be interpreted and governed by the laws of the United States, without regard to its conflict of law provisions. 
              Any legal action or proceeding arising under these Terms will be brought exclusively in the federal or state courts 
              of the United States.
            </p>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-2xl font-gothic text-gothic-silver mb-4">Changes to Terms</h2>
            <p className="text-gothic-steel leading-relaxed">
              We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 
              30 days notice prior to any new terms taking effect. By continuing to access or use our Service after any revisions 
              become effective, you agree to be bound by the revised terms.
            </p>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-2xl font-gothic text-gothic-silver mb-4">Contact Information</h2>
            <p className="text-gothic-steel leading-relaxed">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="text-gothic-steel mt-4 p-4 bg-gothic-black/30 rounded border border-gothic-red/20">
              <p><strong>Lament and Quill</strong></p>
              <p>Email: legal@lamentandquill.com</p>
              <p>Subject Line: Terms of Service Inquiry</p>
            </div>
          </section>

          {/* Acknowledgment */}
          <section className="bg-gothic-crimson/10 border border-gothic-crimson/30 rounded p-6">
            <h2 className="text-2xl font-gothic text-gothic-silver mb-4">Acknowledgment</h2>
            <p className="text-gothic-steel leading-relaxed">
              BY USING THIS SERVICE, YOU ACKNOWLEDGE THAT YOU HAVE READ THESE TERMS OF SERVICE AND AGREE TO BE BOUND BY THEM. 
              IF YOU DO NOT AGREE TO THESE TERMS, YOU MUST NOT USE THE SERVICE.
            </p>
          </section>
        </motion.div>
      </motion.div>
    </div>
  );
}
