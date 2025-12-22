import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about PrimeCast - Your free gateway to live TV channels from around the world. Our mission, values, and commitment to free entertainment.",
};

export default function AboutPage() {
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
            <Link href="/about" className="text-white font-semibold">About</Link>
            <Link href="/contact" className="text-white/70 hover:text-white transition-colors">Contact</Link>
            <Link href="/privacy" className="text-white/70 hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="text-white/70 hover:text-white transition-colors">Terms</Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">About PrimeCast</h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Your free gateway to live television from around the world
          </p>
        </div>

        {/* Mission Section */}
        <section className="mb-16">
          <div className="p-8 bg-white/5 rounded-2xl border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="text-3xl">🎯</span> Our Mission
            </h2>
            <p className="text-white/70 leading-relaxed text-lg">
              At PrimeCast, we believe that access to information and entertainment should be free and available to everyone, 
              regardless of geographical location or financial status. Our mission is to provide a seamless, user-friendly 
              platform that connects viewers with live TV channels from around the globe, completely free of charge.
            </p>
          </div>
        </section>

        {/* Story Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="text-3xl">📖</span> Our Story
          </h2>
          <div className="space-y-4 text-white/70 leading-relaxed">
            <p>
              PrimeCast was born from a simple idea: making global television accessible to everyone. In a world where 
              entertainment is fragmented across many platforms, we saw an opportunity to create something different.
            </p>
            <p>
              We provide a directory of publicly available TV broadcasts from around the world in a clean, modern interface 
              that works on any device. Whether you want to watch news from another country, catch a sports event, or simply 
              explore international entertainment, PrimeCast makes it possible with just a few clicks.
            </p>
            <p>
              Today, we serve millions of viewers worldwide, offering access to over 10,000 TV channels from more than 
              200 countries. And we&apos;re just getting started.
            </p>
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
            <span className="text-3xl">💡</span> Our Values
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: "🆓",
                title: "Free Forever",
                description: "We&apos;re committed to keeping our service 100% free. No subscriptions, no hidden fees, no premium tiers.",
              },
              {
                icon: "🌍",
                title: "Global Access",
                description: "Entertainment knows no borders. We provide access to content from every corner of the world.",
              },
              {
                icon: "🔒",
                title: "Privacy First",
                description: "We respect your privacy. No account required, no personal data collected, no tracking.",
              },
              {
                icon: "⚡",
                title: "Simplicity",
                description: "Technology should be simple. Our platform is designed to be intuitive and easy to use for everyone.",
              },
            ].map((value, index) => (
              <div key={index} className="p-6 bg-white/5 rounded-xl border border-white/10">
                <div className="text-4xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{value.title}</h3>
                <p className="text-white/60">{value.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Stats Section */}
        <section className="mb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { number: "200+", label: "Countries" },
              { number: "10,000+", label: "Channels" },
              { number: "1M+", label: "Monthly Viewers" },
              { number: "24/7", label: "Availability" },
            ].map((stat, index) => (
              <div key={index} className="p-6 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-xl border border-purple-500/30 text-center">
                <div className="text-3xl font-bold text-white mb-1">{stat.number}</div>
                <div className="text-white/60 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Technology Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="text-3xl">⚙️</span> Our Technology
          </h2>
          <div className="text-white/70 leading-relaxed space-y-4">
            <p>
              PrimeCast is built using cutting-edge web technologies to ensure the best possible experience for our users:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Next.js for lightning-fast page loads and SEO optimization</li>
              <li>HLS.js for smooth, adaptive video streaming</li>
              <li>Responsive design that works on all devices</li>
              <li>CDN-powered delivery for global performance</li>
              <li>Real-time stream availability checking</li>
            </ul>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <div className="p-10 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl border border-purple-500/30">
            <h2 className="text-2xl font-bold text-white mb-4">Ready to Explore?</h2>
            <p className="text-white/70 mb-6">Start watching thousands of free TV channels right now</p>
            <Link
              href="/"
              className="inline-block px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-bold hover:scale-105 transition-transform"
            >
              Start Watching Free →
            </Link>
          </div>
        </section>
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
                Live TV channels from around the world. Watch news, sports, entertainment & more.
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
              <p className="text-white/50 text-sm">
                Have questions or feedback? We&apos;d love to hear from you.
              </p>
              <Link href="/contact" className="inline-block mt-3 text-purple-400 hover:text-purple-300 transition-colors">
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
