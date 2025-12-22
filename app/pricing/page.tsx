"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export default function Pricing() {
  const { data: session } = useSession();
  
  // WhatsApp number - replace with your actual number
  const whatsappNumber = "1234567890";
  const whatsappMessage = encodeURIComponent(
    "Hi! I'm interested in subscribing to the PrimeCast service. Please share the available plans."
  );
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  const plans = [
    {
      name: "Monthly",
      price: "$9.99",
      period: "/month",
      features: [
        "Access to 10,000+ channels",
        "HD & 4K quality streams",
        "Watch on 2 devices",
        "24/7 customer support",
        "Cancel anytime",
      ],
      popular: false,
    },
    {
      name: "Quarterly",
      price: "$24.99",
      period: "/3 months",
      features: [
        "Access to 10,000+ channels",
        "HD & 4K quality streams",
        "Watch on 3 devices",
        "24/7 priority support",
        "Save 17%",
      ],
      popular: true,
    },
    {
      name: "Yearly",
      price: "$79.99",
      period: "/year",
      features: [
        "Access to 10,000+ channels",
        "HD & 4K quality streams",
        "Watch on 5 devices",
        "24/7 VIP support",
        "Save 33%",
      ],
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-lg border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="PrimeCast" className="h-10 w-10" />
            <span className="text-2xl font-bold text-white">PrimeCast</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/" className="text-gray-300 hover:text-white transition">
              Home
            </Link>
            {session ? (
              <Link
                href="/"
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition"
              >
                Watch TV
              </Link>
            ) : (
              <Link
                href="/auth/signin"
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition"
              >
                Sign In
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Get unlimited access to thousands of live TV channels from around the world.
            Start with a 1-day free trial!
          </p>
        </div>

        {/* Trial Expired Notice */}
        {session && (
          <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-6 mb-12 text-center">
            <h3 className="text-xl font-semibold text-yellow-300 mb-2">
              🎉 Welcome, {session.user?.name || session.user?.email}!
            </h3>
            <p className="text-yellow-100">
              Contact us on WhatsApp to subscribe and continue enjoying unlimited TV channels.
            </p>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-white/10 backdrop-blur-lg rounded-2xl p-8 border ${
                plan.popular
                  ? "border-purple-500 shadow-lg shadow-purple-500/20"
                  : "border-white/20"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold px-4 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-gray-400 ml-1">{plan.period}</span>
                </div>
              </div>
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-gray-300">
                    <svg
                      className="w-5 h-5 text-green-500 mr-3 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className={`block w-full text-center py-3 px-4 rounded-lg font-semibold transition ${
                  plan.popular
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                    : "bg-white/20 hover:bg-white/30 text-white"
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Contact on WhatsApp
                </span>
              </a>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Frequently Asked Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                How do I subscribe?
              </h3>
              <p className="text-gray-400">
                Simply click the &quot;Contact on WhatsApp&quot; button and send us a message. We&apos;ll guide you through the subscription process.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-400">
                We accept various payment methods. Contact us on WhatsApp for available options in your region.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                How long is the free trial?
              </h3>
              <p className="text-gray-400">
                New users get a 1-day free trial to explore all features. After the trial, you&apos;ll need to subscribe to continue.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Can I cancel anytime?
              </h3>
              <p className="text-gray-400">
                Yes! You can cancel your subscription anytime. Just contact us on WhatsApp to manage your subscription.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Watching?
          </h2>
          <p className="text-gray-300 mb-8">
            Sign up now and get instant access to thousands of channels!
          </p>
          {!session && (
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg transition-all"
            >
              Start Free Trial
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} PrimeCast. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
