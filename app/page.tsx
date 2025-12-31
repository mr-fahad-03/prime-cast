"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Hls from "hls.js";

// Types based on API documentation
interface Country {
  name: string;
  code: string;
  languages: string[];
  flag: string;
}

interface Channel {
  id: string;
  name: string;
  alt_names: string[];
  network: string | null;
  owners: string[];
  country: string;
  categories: string[];
  is_nsfw: boolean;
  launched: string | null;
  closed: string | null;
  replaced_by: string | null;
  website: string | null;
}

interface Stream {
  channel: string | null;
  feed: string | null;
  title: string;
  url: string;
  referrer: string | null;
  user_agent: string | null;
  quality: string | null;
}

interface Logo {
  channel: string;
  feed: string | null;
  tags: string[];
  width: number;
  height: number;
  format: string | null;
  url: string;
}

type ViewState = "home" | "countries" | "channels" | "player";

export default function Home() {
  const [view, setView] = useState<ViewState>("home");
  const [countries, setCountries] = useState<Country[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [streams, setStreams] = useState<Stream[]>([]);
  const [logos, setLogos] = useState<Logo[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [selectedStream, setSelectedStream] = useState<Stream | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [streamLoading, setStreamLoading] = useState(false);
  const [currentStreamIndex, setCurrentStreamIndex] = useState(0);
  const [checkingStreams, setCheckingStreams] = useState(false);
  const [checkProgress, setCheckProgress] = useState({ checked: 0, total: 0, online: 0 });
  const [onlineChannelIds, setOnlineChannelIds] = useState<Set<string>>(new Set());
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const retryCountRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Fetch countries
  const fetchCountries = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("https://iptv-org.github.io/api/countries.json");
      const data: Country[] = await response.json();
      setCountries(data.sort((a, b) => a.name.localeCompare(b.name)));
      setView("countries");
    } catch {
      setError("Failed to load countries. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Check if a stream URL is accessible
  const checkStreamOnline = async (url: string, signal: AbortSignal): Promise<boolean> => {
    try {
      const response = await fetch(url, {
        method: 'HEAD',
        mode: 'no-cors',
        signal,
      });
      // With no-cors, we can't read status but if fetch succeeds, stream is likely online
      return true;
    } catch {
      return false;
    }
  };

  // Check multiple streams for a channel and return if at least one is online
  const checkChannelOnline = async (
    channelId: string,
    streamsData: Stream[],
    signal: AbortSignal
  ): Promise<boolean> => {
    const channelStreams = streamsData.filter((s) => s.channel === channelId);
    
    // Check streams in parallel, return true if any is online
    const results = await Promise.all(
      channelStreams.slice(0, 3).map((stream) => // Check first 3 streams max
        checkStreamOnline(stream.url, signal).catch(() => false)
      )
    );
    
    return results.some((isOnline) => isOnline);
  };

  // Fetch all data needed for channels view
  const fetchChannelsData = async (countryCode: string) => {
    setLoading(true);
    setError(null);
    setOnlineChannelIds(new Set());
    
    // Abort any previous stream checking
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    try {
      const [channelsRes, streamsRes, logosRes] = await Promise.all([
        fetch("https://iptv-org.github.io/api/channels.json"),
        fetch("https://iptv-org.github.io/api/streams.json"),
        fetch("https://iptv-org.github.io/api/logos.json"),
      ]);

      const channelsData: Channel[] = await channelsRes.json();
      const streamsData: Stream[] = await streamsRes.json();
      const logosData: Logo[] = await logosRes.json();

      // Filter channels by country and exclude closed/NSFW channels
      const countryChannels = channelsData.filter(
        (ch) => ch.country === countryCode && !ch.closed && !ch.is_nsfw
      );

      // Get channel IDs that have streams
      const channelIdsWithStreams = new Set(
        streamsData.filter((s) => s.channel).map((s) => s.channel)
      );

      // Only show channels that have available streams
      const availableChannels = countryChannels.filter((ch) =>
        channelIdsWithStreams.has(ch.id)
      );

      setChannels(availableChannels.sort((a, b) => a.name.localeCompare(b.name)));
      setStreams(streamsData);
      setLogos(logosData);
      setLoading(false);
      setView("channels");
      
      // Start checking streams in background
      setCheckingStreams(true);
      setCheckProgress({ checked: 0, total: availableChannels.length, online: 0 });
      
      const abortController = new AbortController();
      abortControllerRef.current = abortController;
      
      const onlineIds = new Set<string>();
      const batchSize = 5; // Check 5 channels at a time
      
      for (let i = 0; i < availableChannels.length; i += batchSize) {
        if (abortController.signal.aborted) break;
        
        const batch = availableChannels.slice(i, i + batchSize);
        
        const results = await Promise.all(
          batch.map(async (channel) => {
            const isOnline = await checkChannelOnline(
              channel.id,
              streamsData,
              abortController.signal
            );
            return { id: channel.id, isOnline };
          })
        );
        
        results.forEach(({ id, isOnline }) => {
          if (isOnline) {
            onlineIds.add(id);
          }
        });
        
        // Update progress and online channels
        setOnlineChannelIds(new Set(onlineIds));
        setCheckProgress({
          checked: Math.min(i + batchSize, availableChannels.length),
          total: availableChannels.length,
          online: onlineIds.size,
        });
      }
      
      setCheckingStreams(false);
    } catch {
      setError("Failed to load channels. Please try again.");
      setLoading(false);
      setCheckingStreams(false);
    }
  };

  // Get logo for a channel
  const getChannelLogo = (channelId: string): string | null => {
    const logo = logos.find((l) => l.channel === channelId);
    return logo?.url || null;
  };

  // Get streams for a channel
  const getChannelStreams = (channelId: string): Stream[] => {
    return streams.filter((s) => s.channel === channelId);
  };

  // Handle country selection
  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setSearchTerm("");
    fetchChannelsData(country.code);
  };

  // Handle channel selection
  const handleChannelSelect = (channel: Channel) => {
    const channelStreams = getChannelStreams(channel.id);
    if (channelStreams.length > 0) {
      setSelectedChannel(channel);
      setCurrentStreamIndex(0);
      retryCountRef.current = 0;
      setSelectedStream(channelStreams[0]);
      setStreamLoading(true);
      setView("player");
    }
  };

  // Try next available stream when current one fails
  const tryNextStream = () => {
    if (!selectedChannel) return;
    
    const channelStreams = getChannelStreams(selectedChannel.id);
    const nextIndex = currentStreamIndex + 1;
    
    if (nextIndex < channelStreams.length) {
      setCurrentStreamIndex(nextIndex);
      setSelectedStream(channelStreams[nextIndex]);
      setError(null);
      retryCountRef.current = 0;
    } else {
      setError("All streams failed. Try another channel.");
      setStreamLoading(false);
    }
  };

  // Initialize video player
  useEffect(() => {
    if (view === "player" && selectedStream && videoRef.current) {
      const video = videoRef.current;
      setStreamLoading(true);
      setError(null);

      // Cleanup previous HLS instance
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      // Set a timeout for stream loading (important for Android)
      const loadTimeout = setTimeout(() => {
        if (streamLoading) {
          console.log("Stream load timeout, trying next...");
          tryNextStream();
        }
      }, 15000);

      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: false, // Disable worker for better Android compatibility
          lowLatencyMode: false,
          fragLoadingMaxRetry: 3,
          manifestLoadingMaxRetry: 2,
          levelLoadingMaxRetry: 2,
          manifestLoadingTimeOut: 10000,
          fragLoadingTimeOut: 20000,
          levelLoadingTimeOut: 10000,
          startLevel: -1,
          capLevelToPlayerSize: true,
          maxBufferLength: 30,
          maxMaxBufferLength: 60,
          xhrSetup: (xhr) => {
            // Some streams need specific headers
            xhr.withCredentials = false;
          },
        });
        hlsRef.current = hls;
        
        hls.loadSource(selectedStream.url);
        hls.attachMedia(video);
        
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          clearTimeout(loadTimeout);
          setStreamLoading(false);
          video.play().catch(() => {
            // Autoplay might be blocked on mobile - this is ok
          });
        });
        
        hls.on(Hls.Events.FRAG_LOADED, () => {
          setStreamLoading(false);
        });
        
        hls.on(Hls.Events.ERROR, (_, data) => {
          console.log("HLS Error:", data.type, data.details);
          if (data.fatal) {
            clearTimeout(loadTimeout);
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                if (retryCountRef.current < 2) {
                  retryCountRef.current++;
                  hls.startLoad();
                } else {
                  tryNextStream();
                }
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                hls.recoverMediaError();
                break;
              default:
                tryNextStream();
                break;
            }
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        // Native HLS support (Safari/iOS)
        video.src = selectedStream.url;
        
        const handleCanPlay = () => {
          clearTimeout(loadTimeout);
          setStreamLoading(false);
          video.play().catch(() => {});
        };
        
        const handleError = () => {
          clearTimeout(loadTimeout);
          tryNextStream();
        };
        
        video.addEventListener("canplay", handleCanPlay);
        video.addEventListener("error", handleError);
        video.load();
        
        return () => {
          clearTimeout(loadTimeout);
          video.removeEventListener("canplay", handleCanPlay);
          video.removeEventListener("error", handleError);
        };
      } else {
        // Fallback for browsers without HLS support
        clearTimeout(loadTimeout);
        setStreamLoading(false);
        setError("Your browser doesn't support HLS streaming. Try using Chrome or Firefox.");
      }

      return () => {
        clearTimeout(loadTimeout);
      };
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [view, selectedStream]);

  // Filter countries based on search
  const filteredCountries = countries.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter channels based on search
  const filteredChannels = channels.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.alt_names.some((n) => n.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Stop stream checking
  const stopStreamChecking = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setCheckingStreams(false);
  };

  // Go back handler
  const goBack = () => {
    setSearchTerm("");
    setError(null);
    stopStreamChecking();
    if (view === "countries") {
      setView("home");
    } else if (view === "channels") {
      setView("countries");
      setSelectedCountry(null);
      setOnlineChannelIds(new Set());
    } else if (view === "player") {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      setView("channels");
      setSelectedChannel(null);
      setSelectedStream(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-black/30 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-shrink-0">
            {view !== "home" && (
              <button
                onClick={goBack}
                className="p-1.5 sm:p-2 rounded-full hover:bg-white/10 transition-colors flex-shrink-0"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 sm:h-6 sm:w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            )}
            <Link href="/" className="text-base sm:text-2xl font-bold text-white flex items-center gap-1.5 sm:gap-2 hover:opacity-90 transition-opacity">
              <img src="/logo.png" alt="PrimeCast" className="h-8 sm:h-10" />
              <span>PrimeCast</span>
            </Link>
          </div>
          <div className="flex items-center gap-2 sm:gap-6 min-w-0 flex-1 justify-end">
            {selectedCountry && view !== "home" && (
              <div className="text-white/80 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 truncate">
                <img
                  src={`https://flagcdn.com/w40/${selectedCountry.code.toLowerCase()}.png`}
                  alt={selectedCountry.name}
                  className="w-5 h-3.5 sm:w-6 sm:h-4 object-cover rounded flex-shrink-0"
                />
                <span className="truncate">
                  <span className="hidden sm:inline">{selectedCountry.name}</span>
                  <span className="sm:hidden">{selectedCountry.code}</span>
                  {selectedChannel && (
                    <>
                      <span className="mx-1">→</span>
                      <span className="hidden sm:inline">{selectedChannel.name}</span>
                      <span className="sm:hidden">{selectedChannel.name.slice(0, 8)}{selectedChannel.name.length > 8 ? '...' : ''}</span>
                    </>
                  )}
                </span>
              </div>
            )}
            <nav className="hidden md:flex items-center gap-6 flex-shrink-0">
              <Link href="/" className="text-white font-semibold">Home</Link>
              <Link href="/about" className="text-white/70 hover:text-white transition-colors">About</Link>
              <Link href="/contact" className="text-white/70 hover:text-white transition-colors">Contact</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-center">
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-4 underline hover:no-underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-white/80">Loading...</p>
          </div>
        )}

        {/* Home View */}
        {!loading && view === "home" && (
          <div className="space-y-24">
            {/* Hero Section */}
            <section className="flex flex-col items-center justify-center min-h-[80vh] text-center relative">
              {/* Animated background elements */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl"></div>
              </div>

              <div className="relative z-10">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-8">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  <span className="text-white/80 text-sm font-medium">10,000+ Live Channels Available</span>
                </div>

                <h2 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                  Watch <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">Live TV</span>
                  <br />From Around the World
                </h2>
                
                <p className="text-xl md:text-2xl text-white/70 max-w-3xl mx-auto mb-10 leading-relaxed">
                  Stream thousands of free TV channels from 200+ countries. News, sports, entertainment, movies & more — all in one place, completely free.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                  <button
                    onClick={fetchCountries}
                    className="group relative px-10 py-5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl text-white text-xl font-bold shadow-2xl shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 hover:scale-105"
                  >
                    <span className="flex items-center gap-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Start Watching Now
                    </span>
                  </button>
                  <a href="#how-it-works" className="px-8 py-5 text-white/80 hover:text-white font-semibold transition-colors flex items-center gap-2">
                    Learn More
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </a>
                </div>

                {/* Trust badges */}
                <div className="flex flex-wrap items-center justify-center gap-8 text-white/50 text-sm">
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    100% Free
                  </div>
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    10,000+ Channels
                  </div>
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    No Downloads
                  </div>
                </div>
              </div>
            </section>

            {/* Stats Section */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { number: "200+", label: "Countries", icon: "🌍" },
                { number: "10K+", label: "TV Channels", icon: "📺" },
                { number: "24/7", label: "Live Streaming", icon: "🔴" },
                { number: "Free", label: "Forever", icon: "🎁" },
              ].map((stat, index) => (
                <div key={index} className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 text-center hover:bg-white/10 transition-colors">
                  <div className="text-4xl mb-3">{stat.icon}</div>
                  <div className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.number}</div>
                  <div className="text-white/60">{stat.label}</div>
                </div>
              ))}
            </section>

            {/* Features Section */}
            <section className="py-8">
              <div className="text-center mb-16">
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">Why Choose PrimeCast?</h3>
                <p className="text-white/60 text-lg max-w-2xl mx-auto">Experience the best TV channel directory with features designed for you</p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  { icon: "🌐", title: "Global Coverage", description: "Access TV channels from over 200 countries worldwide. Watch international news, sports, and entertainment from anywhere." },
                  { icon: "⚡", title: "Instant Streaming", description: "No buffering, no waiting. Our optimized streaming technology delivers smooth playback on any device." },
                  { icon: "📱", title: "Any Device", description: "Watch on your computer, tablet, or phone. Our responsive design works perfectly on all screen sizes." },
                  { icon: "🔒", title: "Safe & Secure", description: "We prioritize your privacy and security. No registration required to start watching." },
                  { icon: "🎯", title: "Easy to Use", description: "Simple and intuitive interface. Find and watch your favorite channels in just a few clicks." },
                  { icon: "🎁", title: "Completely Free", description: "100% free access to all channels. No hidden fees, no subscriptions, no credit card required." },
                ].map((feature, index) => (
                  <div key={index} className="p-8 bg-gradient-to-br from-white/5 to-white/0 rounded-2xl border border-white/10 hover:border-purple-500/50 transition-all duration-300 group hover:-translate-y-1">
                    <div className="text-5xl mb-5 group-hover:scale-110 transition-transform">{feature.icon}</div>
                    <h4 className="text-xl font-bold text-white mb-3">{feature.title}</h4>
                    <p className="text-white/60 leading-relaxed">{feature.description}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* How it Works Section */}
            <section id="how-it-works" className="py-8">
              <div className="text-center mb-16">
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">How It Works</h3>
                <p className="text-white/60 text-lg max-w-2xl mx-auto">Start watching your favorite TV channels in 3 simple steps</p>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  { step: "1", title: "Choose Country", description: "Select from 200+ countries to browse TV channels from that region", icon: "🗺️" },
                  { step: "2", title: "Pick a Channel", description: "Browse through available channels and select the one you want to watch", icon: "📺" },
                  { step: "3", title: "Start Watching", description: "Enjoy instant streaming with our high-quality video player", icon: "▶️" },
                ].map((item, index) => (
                  <div key={index} className="relative p-8 bg-white/5 rounded-2xl border border-white/10 text-center">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {item.step}
                    </div>
                    <div className="text-5xl mt-4 mb-5">{item.icon}</div>
                    <h4 className="text-xl font-bold text-white mb-3">{item.title}</h4>
                    <p className="text-white/60">{item.description}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Popular Countries */}
            <section className="py-8">
              <div className="text-center mb-12">
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">Popular Countries</h3>
                <p className="text-white/60 text-lg">Explore TV channels from the most popular destinations</p>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                {[
                  { code: "us", name: "USA" },
                  { code: "gb", name: "UK" },
                  { code: "in", name: "India" },
                  { code: "de", name: "Germany" },
                  { code: "fr", name: "France" },
                  { code: "es", name: "Spain" },
                  { code: "it", name: "Italy" },
                  { code: "br", name: "Brazil" },
                  { code: "ca", name: "Canada" },
                  { code: "au", name: "Australia" },
                  { code: "jp", name: "Japan" },
                  { code: "kr", name: "Korea" },
                  { code: "mx", name: "Mexico" },
                  { code: "ru", name: "Russia" },
                  { code: "ae", name: "UAE" },
                  { code: "sa", name: "Saudi" },
                ].map((country) => (
                  <button
                    key={country.code}
                    onClick={fetchCountries}
                    className="p-4 bg-white/5 hover:bg-white/15 border border-white/10 rounded-xl transition-all duration-200 hover:scale-105 hover:border-purple-500/50 group"
                  >
                    <div className="w-12 h-8 mx-auto mb-2 overflow-hidden rounded shadow-md">
                      <img src={`https://flagcdn.com/w80/${country.code}.png`} alt={country.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="text-white/80 text-xs font-medium group-hover:text-white">{country.name}</div>
                  </button>
                ))}
              </div>
              <div className="text-center mt-8">
                <button onClick={fetchCountries} className="px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white font-semibold transition-all">
                  View All 200+ Countries →
                </button>
              </div>
            </section>

            {/* FAQ Section */}
            <section className="py-8">
              <div className="text-center mb-12">
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">Frequently Asked Questions</h3>
                <p className="text-white/60 text-lg">Got questions? We have answers</p>
              </div>
              <div className="max-w-3xl mx-auto space-y-4">
                {[
                  { q: "Is PrimeCast really free?", a: "Yes! PrimeCast is 100% free to use. No registration, no subscription, no hidden fees. Just click and start watching." },
                  { q: "What devices can I use?", a: "PrimeCast works on any device with a modern web browser - computers, laptops, tablets, and smartphones. No app download needed." },
                  { q: "How many channels are available?", a: "We provide access to over 10,000 TV channels from 200+ countries worldwide, including news, sports, entertainment, and more." },
                  { q: "Why are some channels not working?", a: "Some streams may occasionally be temporarily unavailable. If a channel isn't working, try an alternative stream or check back later." },
                  { q: "Do I need to create an account?", a: "No! You can start watching immediately without any registration or login required." },
                ].map((faq, index) => (
                  <details key={index} className="group p-6 bg-white/5 rounded-xl border border-white/10 cursor-pointer">
                    <summary className="flex items-center justify-between text-white font-semibold text-lg list-none">
                      {faq.q}
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white/50 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <p className="mt-4 text-white/60 leading-relaxed">{faq.a}</p>
                  </details>
                ))}
              </div>
            </section>

            {/* CTA Section */}
            <section className="py-12 text-center">
              <div className="p-12 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-3xl border border-purple-500/30 backdrop-blur-sm">
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Start Watching?</h3>
                <p className="text-white/70 text-lg mb-8 max-w-2xl mx-auto">Jump in and explore 10,000+ channels from around the world. No signup required!</p>
                <button
                  onClick={fetchCountries}
                  className="px-12 py-5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl text-white text-xl font-bold shadow-2xl shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 hover:scale-105"
                >
                  🚀 Start Watching Now
                </button>
              </div>
            </section>
          </div>
        )}

        {/* Countries View */}
        {!loading && view === "countries" && (
          <div>
            <h2 className="text-3xl font-bold text-white mb-6">
              Select a Country
            </h2>
            {/* Search */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="Search countries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full max-w-md px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            {/* Countries Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filteredCountries.map((country) => (
                <button
                  key={country.code}
                  onClick={() => handleCountrySelect(country)}
                  className="p-4 bg-white/5 hover:bg-white/15 border border-white/10 rounded-xl transition-all duration-200 hover:scale-105 hover:border-purple-500/50"
                >
                  <div className="w-12 h-8 mb-2 mx-auto overflow-hidden rounded shadow-md">
                    <img
                      src={`https://flagcdn.com/w80/${country.code.toLowerCase()}.png`}
                      alt={`${country.name} flag`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://flagcdn.com/w80/${country.code.toLowerCase()}.png`;
                      }}
                    />
                  </div>
                  <div className="text-white font-medium text-sm truncate">
                    {country.name}
                  </div>
                  <div className="text-white/50 text-xs">{country.code}</div>
                </button>
              ))}
            </div>
            {filteredCountries.length === 0 && (
              <p className="text-center text-white/60 py-10">
                No countries found matching &quot;{searchTerm}&quot;
              </p>
            )}
          </div>
        )}

        {/* Channels View */}
        {!loading && view === "channels" && (
          <div>
            <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              {selectedCountry && (
                <img
                  src={`https://flagcdn.com/w80/${selectedCountry.code.toLowerCase()}.png`}
                  alt={selectedCountry.name}
                  className="w-10 h-7 object-cover rounded shadow"
                />
              )}
              {selectedCountry?.name} Channels
            </h2>
            
            {/* Stream Checking Progress */}
            {checkingStreams ? (
              <div className="mb-6">
                <div className="flex items-center flex-wrap gap-3 text-white/80 mb-2">
                  <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                  <span>Checking streams... {checkProgress.checked}/{checkProgress.total}</span>
                  <span className="text-green-400">({checkProgress.online} online)</span>
                  <button
                    onClick={stopStreamChecking}
                    className="ml-2 px-3 py-1 text-xs bg-white/10 hover:bg-white/20 rounded-full text-white/70 hover:text-white transition-colors"
                  >
                    Skip checking
                  </button>
                </div>
                <div className="w-full max-w-md h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                    style={{ width: `${(checkProgress.checked / checkProgress.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            ) : (
              <p className="text-white/60 mb-6">
                {onlineChannelIds.size > 0 
                  ? `${onlineChannelIds.size} online channels (${channels.length - onlineChannelIds.size} offline hidden)`
                  : `${channels.length} channels available`
                }
              </p>
            )}
            
            {/* Search */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="Search channels..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full max-w-md px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            {/* Channels Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredChannels
                .filter((channel) => {
                  // While checking, show all channels
                  // After checking, only show online channels
                  if (checkingStreams || onlineChannelIds.size === 0) {
                    return true;
                  }
                  return onlineChannelIds.has(channel.id);
                })
                .map((channel) => {
                const logo = getChannelLogo(channel.id);
                const streamCount = getChannelStreams(channel.id).length;
                const isOnline = onlineChannelIds.has(channel.id);
                const isChecked = !checkingStreams || onlineChannelIds.size === 0 || checkProgress.checked > 0;
                
                return (
                  <button
                    key={channel.id}
                    onClick={() => handleChannelSelect(channel)}
                    className={`p-4 bg-white/5 hover:bg-white/15 border border-white/10 rounded-xl transition-all duration-200 hover:scale-[1.02] hover:border-purple-500/50 text-left ${
                      checkingStreams && !isOnline ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-white/10 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0 relative">
                        {/* Online indicator */}
                        {isChecked && isOnline && (
                          <div className="absolute top-1 right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900 z-10"></div>
                        )}
                        {logo ? (
                          <img
                            src={logo}
                            alt={channel.name}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <span className="text-2xl">📺</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold truncate">
                          {channel.name}
                        </h3>
                        {channel.network && (
                          <p className="text-white/50 text-sm truncate">
                            {channel.network}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          {channel.categories.slice(0, 2).map((cat) => (
                            <span
                              key={cat}
                              className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded-full"
                            >
                              {cat}
                            </span>
                          ))}
                          <span className={`text-xs ${isOnline ? 'text-green-400' : 'text-white/40'}`}>
                            {isOnline ? '● Online' : `${streamCount} stream${streamCount !== 1 ? "s" : ""}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            {filteredChannels.filter((ch) => checkingStreams || onlineChannelIds.size === 0 || onlineChannelIds.has(ch.id)).length === 0 && (
              <div className="text-center py-10">
                <p className="text-white/60">
                  {searchTerm
                    ? `No online channels found matching "${searchTerm}"`
                    : "No online channels found for this country"}
                </p>
                <button
                  onClick={goBack}
                  className="mt-4 px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors"
                >
                  Choose Another Country
                </button>
              </div>
            )}
          </div>
        )}

        {/* Player View */}
        {!loading && view === "player" && selectedChannel && selectedStream && (
          <div>
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-white mb-2">
                {selectedChannel.name}
              </h2>
              <p className="text-white/60">{selectedStream.title}</p>
            </div>

            {/* Video Player */}
            <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl">
              {/* Loading Overlay */}
              {streamLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10">
                  <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="mt-4 text-white/80 text-sm">Loading stream...</p>
                  <p className="mt-1 text-white/50 text-xs">
                    Stream {currentStreamIndex + 1} of {getChannelStreams(selectedChannel.id).length}
                  </p>
                </div>
              )}
              <video
                ref={videoRef}
                className="w-full aspect-video"
                controls
                autoPlay
                playsInline
                muted={false}
                webkit-playsinline="true"
                x-webkit-airplay="allow"
                preload="metadata"
              />
            </div>

            {/* Stream Quality */}
            {selectedStream.quality && (
              <div className="mt-4 inline-block px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                Quality: {selectedStream.quality}
              </div>
            )}

            {/* Other Streams */}
            {getChannelStreams(selectedChannel.id).length > 1 && (
              <div className="mt-8">
                <h3 className="text-xl font-semibold text-white mb-4">
                  Alternative Streams ({getChannelStreams(selectedChannel.id).length} available)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {getChannelStreams(selectedChannel.id).map((stream, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setCurrentStreamIndex(index);
                        retryCountRef.current = 0;
                        setStreamLoading(true);
                        setError(null);
                        setSelectedStream(stream);
                      }}
                      disabled={streamLoading}
                      className={`p-3 rounded-lg text-left transition-all ${
                        selectedStream.url === stream.url
                          ? "bg-purple-600 text-white"
                          : "bg-white/5 hover:bg-white/15 text-white/80"
                      } ${streamLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <div className="font-medium truncate text-sm">
                        {stream.title || `Stream ${index + 1}`}
                      </div>
                      {stream.quality && (
                        <div className="text-xs opacity-70 mt-1">
                          {stream.quality}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Channel Info */}
            <div className="mt-8 p-6 bg-white/5 rounded-xl border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-4">
                Channel Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                {selectedChannel.network && (
                  <div>
                    <span className="text-white/50">Network:</span>{" "}
                    <span className="text-white">{selectedChannel.network}</span>
                  </div>
                )}
                {selectedChannel.categories.length > 0 && (
                  <div>
                    <span className="text-white/50">Categories:</span>{" "}
                    <span className="text-white">
                      {selectedChannel.categories.join(", ")}
                    </span>
                  </div>
                )}
                {selectedChannel.launched && (
                  <div>
                    <span className="text-white/50">Launched:</span>{" "}
                    <span className="text-white">{selectedChannel.launched}</span>
                  </div>
                )}
                {selectedChannel.website && (
                  <div>
                    <span className="text-white/50">Website:</span>{" "}
                    <a
                      href={selectedChannel.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:underline"
                    >
                      Visit
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src="/logo.png" alt="PrimeCast" className="h-10" />
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
              <p className="text-white/50 text-sm mb-3">Have questions or feedback?</p>
              <Link href="/contact" className="text-purple-400 hover:text-purple-300 transition-colors">
                Contact Us →
              </Link>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/40 text-sm">© {new Date().getFullYear()} PrimeCast. All rights reserved.</p>
            <p className="text-white/40 text-sm">
              Made with ❤️ by{" "}
              <a
                href="https://www.instagram.com/mr_fahad_03/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:underline"
              >
                Mr ~FZ
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
