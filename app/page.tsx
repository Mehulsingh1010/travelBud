'use client'
import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  ArrowRight, 
  MapPin, 
  Users, 
  Navigation, 
  Star, 
  Camera,
  Mountain,
  Sun,
  TreePine
} from 'lucide-react';
import Link from 'next/link';



const TravelBuddyLanding = () => {
  
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const BackgroundLandscape = () => (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-50" />
      
      {/* Mountain Layers */}
      <svg className="absolute bottom-0 w-full h-96" viewBox="0 0 1200 400" xmlns="http://www.w3.org/2000/svg">
        {/* Back mountains */}
        <path 
          d="M0,400 L0,200 L200,120 L400,160 L600,100 L800,140 L1000,80 L1200,120 L1200,400 Z" 
          fill="rgba(0, 0, 0, 0.08)" 
          style={{ transform: `translateY(${scrollY * 0.1}px)` }}
        />
        {/* Middle mountains */}
        <path 
          d="M0,400 L0,250 L150,180 L350,220 L550,160 L750,200 L950,140 L1200,180 L1200,400 Z" 
          fill="rgba(0, 226, 183, 0.15)" 
          style={{ transform: `translateY(${scrollY * 0.15}px)` }}
        />
        {/* Front mountains */}
        <path 
          d="M0,400 L0,300 L100,240 L300,280 L500,220 L700,260 L900,200 L1200,240 L1200,400 Z" 
          fill="rgba(0, 226, 183, 0.2)" 
          style={{ transform: `translateY(${scrollY * 0.2}px)` }}
        />
      </svg>

      {/* Sun */}
      <div className="absolute top-20 right-20 w-16 h-16 rounded-full bg-gradient-to-br from-yellow-200 to-orange-200 opacity-30" />

      {/* Clouds */}
      <div className="cloud-1 absolute top-32 left-1/4 w-20 h-12 bg-white opacity-40 rounded-full"></div>
      <div className="cloud-2 absolute top-24 right-1/3 w-16 h-8 bg-white opacity-30 rounded-full"></div>
      <div className="cloud-3 absolute top-40 left-2/3 w-24 h-10 bg-white opacity-35 rounded-full"></div>
      <div className="cloud-4 absolute top-16 left-1/2 w-12 h-6 bg-white opacity-25 rounded-full"></div>

      {/* Trees */}
      <div className="absolute bottom-20 left-10 opacity-20">
        <TreePine className="w-8 h-8" style={{ color: '#00e2b7' }} />
      </div>
      <div className="absolute bottom-32 right-32 opacity-15">
        <TreePine className="w-6 h-6" style={{ color: '#00e2b7' }} />
      </div>
      <div className="absolute bottom-16 right-1/4 opacity-25">
        <TreePine className="w-10 h-10" style={{ color: '#00e2b7' }} />
      </div>

      <style jsx>{`
        .cloud-1 {
          animation: float-cloud 12s ease-in-out infinite;
        }
        .cloud-2 {
          animation: float-cloud 16s ease-in-out infinite 2s;
        }
        .cloud-3 {
          animation: float-cloud 14s ease-in-out infinite 4s;
        }
        .cloud-4 {
          animation: float-cloud 18s ease-in-out infinite 6s;
        }
        
        @keyframes float-cloud {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </div>
  );

  const Header = () => (
    <header className="relative z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #00e2b7 0%, #00b894 100%)' }}>
              <Compass className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-black">TravelBuddy</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link href='/dashboard'>
            <button className="px-4 py-2 text-gray-600 hover:text-black transition-colors">
              Sign In
            </button>
            <button className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-all duration-200 hover:scale-105">
              Get Started
            </button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );

  const Hero = () => (
    <section className="relative z-10 pt-20 pb-32 px-6">
      <div className="container mx-auto text-center max-w-4xl">
        {/* Trust Badge */}
        <div className="inline-flex items-center space-x-2 bg-gray-100 rounded-full px-4 py-2 mb-8">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#00e2b7' }}></div>
          <span className="text-sm text-gray-700 font-medium">50,000+ travelers trust TravelBuddy</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-5xl md:text-7xl font-bold mb-6">
          <span className="text-black">Travel together.</span>
          <br />
          <span className="text-gray-600 font-light">Stay connected.</span>
        </h1>

        {/* Subheading */}
        <p className="text-xl text-gray-600 font-light leading-relaxed max-w-2xl mx-auto mb-10">
          Coordinate seamlessly with your travel companions. Share locations, plan activities, and create unforgettable memories together.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-12">
          <Link href='/dashboard'>
          <button className="group px-8 py-4 bg-black text-white rounded-lg font-medium flex items-center space-x-2 hover:bg-gray-800 transition-all duration-200 hover:scale-105 hover:shadow-lg">
            
            <span>Start Your Journey</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="group px-8 py-4 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium flex items-center space-x-2 hover:border-gray-300 transition-all duration-200 hover:scale-105 hover:shadow-lg">
            <Camera className="w-5 h-5" />
            <span>Join Existing Trip</span>
          </button>
          </Link>
        </div>

        {/* Social Proof */}
        <div className="flex items-center justify-center space-x-2">
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star, index) => (
              <Star 
                key={star} 
                className="w-5 h-5 text-yellow-400 fill-current" 
                style={{ animationDelay: `${index * 0.1}s` }}
              />
            ))}
          </div>
          <span className="text-gray-600 font-medium ml-2">4.9/5 • 10,000+ reviews</span>
        </div>
      </div>
    </section>
  );

  const Features = () => {
    const features = [
      {
        icon: MapPin,
        title: "Live Location Sharing",
        description: "Keep track of everyone in your group with real-time location updates and safety features.",
        bgColor: "bg-gray-50",
        iconColor: "text-gray-600"
      },
      {
        icon: Users,
        title: "Group Coordination",
        description: "Seamlessly plan activities, share itineraries, and coordinate with all trip members.",
        bgColor: "bg-gray-50",
        iconColor: "text-gray-600"
      },
      {
        icon: Navigation,
        title: "Discover Places",
        description: "Find hidden gems, local favorites, and must-visit spots recommended by fellow travelers.",
        bgColor: "bg-gray-50",
        iconColor: "text-gray-600"
      }
    ];

    return (
      <section className="relative z-10 py-24 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300"
              >
                <div className={`w-12 h-12 ${feature.bgColor} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
                </div>
                <h3 className="text-xl font-bold text-black mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  const Testimonials = () => {
    const testimonials = [
      {
        name: "Sarah Chen",
        initials: "SC",
        text: "TravelBuddy made coordinating our 12-person trip to Japan effortless. Everyone stayed connected and we never lost anyone!",
        rating: 5
      },
      {
        name: "Mike Rodriguez",
        initials: "MR",
        text: "The live location sharing gave our families peace of mind while we explored remote areas in Iceland. Highly recommend!",
        rating: 5
      },
      {
        name: "Emma Thompson",
        initials: "ET",
        text: "Perfect for our backpacking adventure. The group coordination features kept us organized across 8 countries.",
        rating: 5
      }
    ];

    return (
      <section className="relative z-10 py-24 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4" style={{ background: 'linear-gradient(135deg, #000 0%, #00e2b7 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Loved by Travelers Worldwide
            </h2>
            <p className="text-gray-600 text-lg">See what our community has to say about their adventures</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="bg-white/30 backdrop-blur-xl rounded-2xl p-6 border border-white/30 hover:bg-white/40 transition-all duration-300"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #00e2b7 0%, #00b894 100%)' }}
                  >
                    <span className="text-white font-bold">{testimonial.initials}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-black">{testimonial.name}</div>
                    <div className="flex space-x-1">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star 
                          key={i} 
                          className="w-4 h-4 text-yellow-400 fill-current"
                          style={{ animationDelay: `${i * 0.1}s` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed">{testimonial.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  const MapVisualization = () => {
    const travelers = [
      { id: 1, name: "Alex", x: 25, y: 35, color: "#00e2b7" },
      { id: 2, name: "Maria", x: 65, y: 45, color: "#00b894" },
      { id: 3, name: "Jake", x: 40, y: 60, color: "#00e2b7" },
      { id: 4, name: "Sophie", x: 75, y: 25, color: "#00b894" }
    ];

    return (
      <div className="relative w-full h-80 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden">
        {/* Grid pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#00e2b7" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Map landmarks */}
        <div className="absolute top-8 left-8 flex items-center space-x-2 bg-white/80 rounded-lg px-3 py-2">
          <Mountain className="w-4 h-4" style={{ color: '#00e2b7' }} />
          <span className="text-sm font-medium text-black">Mount Adventure</span>
        </div>
        <div className="absolute bottom-8 right-8 flex items-center space-x-2 bg-white/80 rounded-lg px-3 py-2">
          <TreePine className="w-4 h-4" style={{ color: '#00e2b7' }} />
          <span className="text-sm font-medium text-black">Forest Trail</span>
        </div>

        {/* Traveler markers */}
        {travelers.map((traveler, index) => (
          <div
            key={traveler.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 animate-pulse"
            style={{ 
              left: `${traveler.x}%`, 
              top: `${traveler.y}%`,
              animationDelay: `${index * 0.5}s`
            }}
          >
            <div 
              className="w-8 h-8 rounded-full border-3 border-white shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
              style={{ backgroundColor: traveler.color }}
            >
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-white rounded-lg px-2 py-1 shadow-md whitespace-nowrap">
              <span className="text-xs font-medium text-black">{traveler.name}</span>
            </div>
          </div>
        ))}

        {/* Connection lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00e2b7" stopOpacity="0.3"/>
              <stop offset="100%" stopColor="#00b894" stopOpacity="0.3"/>
            </linearGradient>
          </defs>
          <path
            d={`M ${25}% ${35}% Q ${45}% ${25}% ${65}% ${45}%`}
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="2"
            strokeDasharray="5,5"
            className="animate-pulse"
          />
          <path
            d={`M ${40}% ${60}% Q ${60}% ${55}% ${75}% ${25}%`}
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="2"
            strokeDasharray="5,5"
            className="animate-pulse"
            style={{ animationDelay: '1s' }}
          />
        </svg>
      </div>
    );
  };

  const CTA = () => (
    <section className="relative z-10 py-24 px-6 overflow-hidden">
      <div className="rounded-3xl relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #00e2b7 0%, #00b894 100%)' }}>
        {/* Decorative Elements */}
        <div className="absolute inset-0 opacity-10">
          <Mountain className="absolute top-10 right-20 w-16 h-16 text-white" />
          <Sun className="absolute top-6 left-20 w-12 h-12 text-white" />
          <TreePine className="absolute bottom-10 left-10 w-14 h-14 text-white" />
          <TreePine className="absolute bottom-6 right-32 w-8 h-8 text-white" />
        </div>

        <div className="container mx-auto max-w-6xl py-20 px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Text content */}
            <div className="text-left">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Ready to explore together?
              </h2>
              <p className="text-xl text-white/90 mb-10 max-w-xl">
                Join thousands of travelers who trust TravelBuddy to keep their adventures connected and coordinated.
              </p>
              <Link href='/dashboard'>
              <button className="group px-8 py-4 bg-white text-black rounded-lg font-bold flex items-center space-x-2 hover:bg-gray-50 transition-all duration-200 hover:scale-105 hover:shadow-xl">
                <span>Start Your Adventure</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              </Link>
            </div>

            {/* Right side - Map visualization */}
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-center space-x-2 mb-4">
                  <MapPin className="w-5 h-5 text-white" />
                  <span className="text-white font-medium">Live Group Tracking</span>
                </div>
                <MapVisualization />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
  const Footer = () => (
    <footer className="relative z-10 bg-transparent border-gray-200">
      <div className="container mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
                <Compass className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-black">TravelBuddy</span>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              Connecting travelers worldwide with seamless coordination and real-time location sharing.
            </p>
            <div className="flex space-x-3">
              <a href="#" className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-black hover:text-white transition-colors">
                <span className="text-xs font-bold">T</span>
              </a>
              <a href="#" className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-black hover:text-white transition-colors">
                <span className="text-xs font-bold">G</span>
              </a>
              <a href="#" className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-black hover:text-white transition-colors">
                <span className="text-xs font-bold">L</span>
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-semibold text-black mb-4">Product</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-600 hover:text-black transition-colors text-sm">Features</a></li>
              <li><a href="#" className="text-gray-600 hover:text-black transition-colors text-sm">Pricing</a></li>
              <li><a href="#" className="text-gray-600 hover:text-black transition-colors text-sm">Mobile App</a></li>
              <li><a href="#" className="text-gray-600 hover:text-black transition-colors text-sm">API</a></li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold text-black mb-4">Company</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-600 hover:text-black transition-colors text-sm">About</a></li>
              <li><a href="#" className="text-gray-600 hover:text-black transition-colors text-sm">Blog</a></li>
              <li><a href="#" className="text-gray-600 hover:text-black transition-colors text-sm">Careers</a></li>
              <li><a href="#" className="text-gray-600 hover:text-black transition-colors text-sm">Press</a></li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-semibold text-black mb-4">Support</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-600 hover:text-black transition-colors text-sm">Help Center</a></li>
              <li><a href="#" className="text-gray-600 hover:text-black transition-colors text-sm">Contact</a></li>
              <li><a href="#" className="text-gray-600 hover:text-black transition-colors text-sm">Privacy</a></li>
              <li><a href="#" className="text-gray-600 hover:text-black transition-colors text-sm">Terms</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 text-sm">
            © 2024 TravelBuddy. All rights reserved.
          </p>
          <p className="text-gray-600 text-sm mt-2 md:mt-0">
            Made with ❤️ for travelers worldwide
          </p>
        </div>
      </div>
    </footer>
  );
  return (
    <div className="min-h-screen relative overflow-hidden">
      <BackgroundLandscape />
      <Header />
      <Hero />
      <Features />
      <Testimonials />
      <CTA />
      <Footer/>
      
      <style jsx global>{`
        @keyframes float-cloud {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        .cloud-1 {
          animation: float-cloud 12s ease-in-out infinite;
        }
        .cloud-2 {
          animation: float-cloud 16s ease-in-out infinite 2s;
        }
        .cloud-3 {
          animation: float-cloud 14s ease-in-out infinite 4s;
        }
        .cloud-4 {
          animation: float-cloud 18s ease-in-out infinite 6s;
        }
        
        html {
          scroll-behavior: smooth;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        }
      `}</style>
    </div>
  );
};

export default TravelBuddyLanding;