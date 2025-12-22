import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "PrimeCast Terms of Service - Read our terms and conditions for using our TV channel directory service.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-black/30 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="PrimeCast" className="h-10 w-10" />
            <span className="text-2xl font-bold text-white">PrimeCast</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-white/70 hover:text-white transition-colors">Home</Link>
            <Link href="/about" className="text-white/70 hover:text-white transition-colors">About</Link>
            <Link href="/contact" className="text-white/70 hover:text-white transition-colors">Contact</Link>
            <Link href="/privacy" className="text-white/70 hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="text-white font-semibold">Terms</Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Terms of Service</h1>
          <p className="text-white/60">Last updated: December 21, 2025</p>
        </div>

        {/* Content */}
        <div className="prose prose-invert max-w-none">
          <div className="space-y-8">
            {/* Agreement */}
            <section className="p-8 bg-white/5 rounded-2xl border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-4">1. Agreement to Terms</h2>
              <p className="text-white/70 leading-relaxed">
                By accessing or using PrimeCast (&quot;the Service&quot;), you agree to be bound by these Terms of Service 
                (&quot;Terms&quot;). If you disagree with any part of these terms, you may not access the Service.
              </p>
              <p className="text-white/70 leading-relaxed mt-4">
                These Terms apply to all visitors, users, and others who access or use the Service.
              </p>
            </section>

            {/* Description of Service */}
            <section className="p-8 bg-white/5 rounded-2xl border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-4">2. Description of Service</h2>
              <p className="text-white/70 leading-relaxed">
                PrimeCast is a free online platform that provides access to publicly available television broadcasts from 
                around the world. We provide a user-friendly interface to discover and watch TV channels.
              </p>
              <p className="text-white/70 leading-relaxed mt-4">
                The Service is provided &quot;as is&quot; and &quot;as available&quot; without any warranties of any kind.
              </p>
            </section>

            {/* User Responsibilities */}
            <section className="p-8 bg-white/5 rounded-2xl border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-4">3. User Responsibilities</h2>
              <p className="text-white/70 leading-relaxed mb-4">
                By using the Service, you agree to:
              </p>
              <ul className="list-disc list-inside text-white/70 space-y-2 ml-4">
                <li>Use the Service only for lawful purposes</li>
                <li>Comply with all applicable local, state, national, and international laws</li>
                <li>Not attempt to bypass any security measures</li>
                <li>Not interfere with or disrupt the Service</li>
                <li>Not use automated systems to access the Service</li>
                <li>Not redistribute or commercially exploit the Service</li>
              </ul>
            </section>

            {/* Content */}
            <section className="p-8 bg-white/5 rounded-2xl border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-4">4. Third-Party Content</h2>
              <p className="text-white/70 leading-relaxed">
                IPTV Viewer provides access to third-party broadcast content. The content remains the 
                property of its respective owners and broadcasters.
              </p>
              <p className="text-white/70 leading-relaxed mt-4">
                Please note:
              </p>
              <ul className="list-disc list-inside text-white/70 space-y-2 ml-4 mt-2">
                <li>Stream availability may vary</li>
                <li>Content quality depends on the source broadcaster</li>
                <li>We continuously work to improve stream reliability</li>
              </ul>
            </section>

            {/* Intellectual Property */}
            <section className="p-8 bg-white/5 rounded-2xl border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-4">5. Intellectual Property</h2>
              <p className="text-white/70 leading-relaxed">
                The Service, including its original content (excluding content provided by users or third parties), 
                features, and functionality, is and will remain the exclusive property of PrimeCast and its licensors.
              </p>
              <p className="text-white/70 leading-relaxed mt-4">
                Our website design, logos, and trademarks may not be used without our prior written consent.
              </p>
            </section>

            {/* Contact for Concerns */}
            <section className="p-8 bg-white/5 rounded-2xl border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-4">6. Content Concerns</h2>
              <p className="text-white/70 leading-relaxed">
                We are committed to providing quality content. If you have any concerns about 
                content available through our Service, please contact us and we will review your inquiry promptly.
              </p>
            </section>

            {/* Limitation of Liability */}
            <section className="p-8 bg-white/5 rounded-2xl border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-4">7. Limitation of Liability</h2>
              <p className="text-white/70 leading-relaxed">
                In no event shall PrimeCast, its directors, employees, partners, agents, suppliers, or affiliates 
                be liable for any indirect, incidental, special, consequential, or punitive damages, including 
                without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:
              </p>
              <ul className="list-disc list-inside text-white/70 space-y-2 ml-4 mt-4">
                <li>Your access to or use of (or inability to access or use) the Service</li>
                <li>Any conduct or content of any third party on the Service</li>
                <li>Any content obtained from the Service</li>
                <li>Unauthorized access, use, or alteration of your transmissions or content</li>
              </ul>
            </section>

            {/* Disclaimer */}
            <section className="p-8 bg-white/5 rounded-2xl border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-4">8. Disclaimer of Warranties</h2>
              <p className="text-white/70 leading-relaxed">
                THE SERVICE IS PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; BASIS. PRIMECAST EXPRESSLY DISCLAIMS 
                ALL WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE IMPLIED 
                WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
              </p>
              <p className="text-white/70 leading-relaxed mt-4">
                We do not warrant that the Service will be uninterrupted, timely, secure, or error-free, or that 
                any streams will be available or functional at any time.
              </p>
            </section>

            {/* Governing Law */}
            <section className="p-8 bg-white/5 rounded-2xl border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-4">9. Governing Law</h2>
              <p className="text-white/70 leading-relaxed">
                These Terms shall be governed and construed in accordance with the laws applicable to your 
                jurisdiction, without regard to its conflict of law provisions.
              </p>
              <p className="text-white/70 leading-relaxed mt-4">
                Our failure to enforce any right or provision of these Terms will not be considered a waiver 
                of those rights.
              </p>
            </section>

            {/* Changes */}
            <section className="p-8 bg-white/5 rounded-2xl border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-4">10. Changes to Terms</h2>
              <p className="text-white/70 leading-relaxed">
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. 
                If a revision is material, we will try to provide at least 30 days&apos; notice prior to any new 
                terms taking effect.
              </p>
              <p className="text-white/70 leading-relaxed mt-4">
                By continuing to access or use our Service after those revisions become effective, you agree 
                to be bound by the revised terms.
              </p>
            </section>

            {/* Termination */}
            <section className="p-8 bg-white/5 rounded-2xl border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-4">11. Termination</h2>
              <p className="text-white/70 leading-relaxed">
                We may terminate or suspend access to our Service immediately, without prior notice or liability, 
                for any reason whatsoever, including without limitation if you breach the Terms.
              </p>
            </section>

            {/* Contact */}
            <section className="p-8 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl border border-purple-500/30">
              <h2 className="text-2xl font-bold text-white mb-4">Contact Us</h2>
              <p className="text-white/70 leading-relaxed mb-4">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <Link
                href="/contact"
                className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-semibold hover:scale-105 transition-transform"
              >
                Contact Us →
              </Link>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src="/logo.png" alt="PrimeCast" className="h-8 w-8" />
                <span className="text-xl font-bold text-white">PrimeCast</span>
              </div>
              <p className="text-white/50 text-sm">
                Live TV channels from around the world.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-white/50">
                <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
                <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-white/50">
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Connect</h4>
              <Link href="/contact" className="text-purple-400 hover:text-purple-300 transition-colors">
                Contact Us →
              </Link>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center text-white/40 text-sm">
            <p>© {new Date().getFullYear()} PrimeCast. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
