import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "PrimeCast Privacy Policy - Learn how we protect your privacy and handle your data when you use our TV channel directory service.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-black/30 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/BOB_character.png" alt="PrimeCast" className="h-10 w-10" />
            <span className="text-2xl font-bold text-white">PrimeCast</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-white/70 hover:text-white transition-colors">Home</Link>
            <Link href="/about" className="text-white/70 hover:text-white transition-colors">About</Link>
            <Link href="/contact" className="text-white/70 hover:text-white transition-colors">Contact</Link>
            <Link href="/privacy" className="text-white font-semibold">Privacy</Link>
            <Link href="/terms" className="text-white/70 hover:text-white transition-colors">Terms</Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Privacy Policy</h1>
          <p className="text-white/60">Last updated: December 21, 2025</p>
        </div>

        {/* Content */}
        <div className="prose prose-invert max-w-none">
          <div className="space-y-8">
            {/* Introduction */}
            <section className="p-8 bg-white/5 rounded-2xl border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-4">Introduction</h2>
              <p className="text-white/70 leading-relaxed">
                Welcome to PrimeCast (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to protecting your privacy and ensuring 
                you have a positive experience on our website. This Privacy Policy explains how we collect, use, disclose, 
                and safeguard your information when you visit our website.
              </p>
              <p className="text-white/70 leading-relaxed mt-4">
                Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, 
                please do not access the site.
              </p>
            </section>

            {/* Information We Collect */}
            <section className="p-8 bg-white/5 rounded-2xl border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-4">Information We Collect</h2>
              
              <h3 className="text-xl font-semibold text-white mt-6 mb-3">Information Automatically Collected</h3>
              <p className="text-white/70 leading-relaxed mb-4">
                When you visit our website, we may automatically collect certain information about your device, including:
              </p>
              <ul className="list-disc list-inside text-white/70 space-y-2 ml-4">
                <li>Browser type and version</li>
                <li>Operating system</li>
                <li>IP address (anonymized)</li>
                <li>Pages visited and time spent</li>
                <li>Referring website</li>
                <li>Date and time of visit</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">Information You Provide</h3>
              <p className="text-white/70 leading-relaxed">
                PrimeCast does not require registration or account creation. We do not collect personal information 
                such as your name, email address, or phone number unless you voluntarily provide it through our 
                contact form.
              </p>
            </section>

            {/* How We Use Your Information */}
            <section className="p-8 bg-white/5 rounded-2xl border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-4">How We Use Your Information</h2>
              <p className="text-white/70 leading-relaxed mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside text-white/70 space-y-2 ml-4">
                <li>Provide, operate, and maintain our website</li>
                <li>Improve, personalize, and expand our website</li>
                <li>Understand and analyze how you use our website</li>
                <li>Develop new products, services, features, and functionality</li>
                <li>Monitor and analyze usage patterns and trends</li>
                <li>Detect and prevent technical issues</li>
              </ul>
            </section>

            {/* Cookies and Tracking */}
            <section className="p-8 bg-white/5 rounded-2xl border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-4">Cookies and Tracking Technologies</h2>
              <p className="text-white/70 leading-relaxed mb-4">
                We may use cookies and similar tracking technologies to track activity on our website and store 
                certain information. Cookies are files with a small amount of data that may include an anonymous 
                unique identifier.
              </p>
              <p className="text-white/70 leading-relaxed mb-4">
                Types of cookies we may use:
              </p>
              <ul className="list-disc list-inside text-white/70 space-y-2 ml-4">
                <li><strong className="text-white">Essential Cookies:</strong> Required for the website to function properly</li>
                <li><strong className="text-white">Analytics Cookies:</strong> Help us understand how visitors interact with our website</li>
                <li><strong className="text-white">Preference Cookies:</strong> Remember your settings and preferences</li>
              </ul>
              <p className="text-white/70 leading-relaxed mt-4">
                You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. 
                However, some parts of our website may not function properly without cookies.
              </p>
            </section>

            {/* Third-Party Services */}
            <section className="p-8 bg-white/5 rounded-2xl border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-4">Third-Party Services</h2>
              <p className="text-white/70 leading-relaxed mb-4">
                We may employ third-party companies and individuals for the following purposes:
              </p>
              <ul className="list-disc list-inside text-white/70 space-y-2 ml-4">
                <li>To facilitate our service</li>
                <li>To provide the service on our behalf</li>
                <li>To perform service-related services</li>
                <li>To assist us in analyzing how our service is used</li>
              </ul>
              <p className="text-white/70 leading-relaxed mt-4">
                These third parties have access to your information only to perform these tasks on our behalf 
                and are obligated not to disclose or use it for any other purpose.
              </p>
              
              <h3 className="text-xl font-semibold text-white mt-6 mb-3">Google AdSense</h3>
              <p className="text-white/70 leading-relaxed">
                We may use Google AdSense to display advertisements. Google AdSense may use cookies and web beacons 
                to collect information (not including your name, address, email address, or telephone number) about 
                your visits to this and other websites to provide advertisements about goods and services of interest 
                to you. You can opt out of personalized advertising by visiting Google&apos;s Ads Settings.
              </p>
            </section>

            {/* Data Security */}
            <section className="p-8 bg-white/5 rounded-2xl border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-4">Data Security</h2>
              <p className="text-white/70 leading-relaxed">
                We use administrative, technical, and physical security measures to protect your personal information. 
                While we have taken reasonable steps to secure the information you provide to us, please be aware 
                that no security measures are perfect or impenetrable. No method of transmission over the Internet 
                or method of electronic storage is 100% secure.
              </p>
            </section>

            {/* Your Rights */}
            <section className="p-8 bg-white/5 rounded-2xl border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-4">Your Privacy Rights</h2>
              <p className="text-white/70 leading-relaxed mb-4">
                Depending on your location, you may have certain rights regarding your personal information:
              </p>
              <ul className="list-disc list-inside text-white/70 space-y-2 ml-4">
                <li><strong className="text-white">Right to Access:</strong> Request copies of your personal data</li>
                <li><strong className="text-white">Right to Rectification:</strong> Request correction of inaccurate data</li>
                <li><strong className="text-white">Right to Erasure:</strong> Request deletion of your personal data</li>
                <li><strong className="text-white">Right to Restrict Processing:</strong> Request limitation of processing</li>
                <li><strong className="text-white">Right to Data Portability:</strong> Request transfer of your data</li>
                <li><strong className="text-white">Right to Object:</strong> Object to processing of your data</li>
              </ul>
            </section>

            {/* Children's Privacy */}
            <section className="p-8 bg-white/5 rounded-2xl border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-4">Children&apos;s Privacy</h2>
              <p className="text-white/70 leading-relaxed">
                Our service is not directed to anyone under the age of 13. We do not knowingly collect personally 
                identifiable information from children under 13. If you are a parent or guardian and you are aware 
                that your child has provided us with personal data, please contact us so that we can take necessary 
                action.
              </p>
            </section>

            {/* Changes to Policy */}
            <section className="p-8 bg-white/5 rounded-2xl border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-4">Changes to This Privacy Policy</h2>
              <p className="text-white/70 leading-relaxed">
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting 
                the new Privacy Policy on this page and updating the &quot;Last updated&quot; date. You are advised to review 
                this Privacy Policy periodically for any changes.
              </p>
            </section>

            {/* Contact */}
            <section className="p-8 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl border border-purple-500/30">
              <h2 className="text-2xl font-bold text-white mb-4">Contact Us</h2>
              <p className="text-white/70 leading-relaxed mb-4">
                If you have any questions about this Privacy Policy, please contact us:
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
                <img src="/BOB_character.png" alt="PrimeCast" className="h-8 w-8" />
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
