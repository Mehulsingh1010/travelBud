import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MapPin, Users, Navigation, Compass, ArrowRight, Star, Camera, Mountain, Plane } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img
          src="/stunning-mountain-landscape-with-travelers-hiking-.jpg"
          alt="Adventure travel background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/60 to-white/90" />
      </div>

      {/* Header */}
      <header className="relative z-10 p-6 bg-white/90 backdrop-blur-md border-b border-cyan-200/50">
        <nav className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-[#40E0D0] rounded-2xl flex items-center justify-center shadow-xl rotate-3 hover:rotate-0 transition-transform duration-300">
              <Compass className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-bold text-gray-900 tracking-tight">TravelBuddy</span>
          </div>
          <div className="space-x-3">
            <Link href="/login">
              <Button variant="ghost" className="text-gray-600 hover:text-gray-900 hover:bg-teal-50">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-[#40E0D0] hover:bg-[#20f0e8] text-white shadow-lg hover:shadow-xl transition-all duration-300">
                Get Started
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 px-6 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 px-4 py-2 rounded-full text-sm font-medium mb-8 border border-teal-200">
              <Plane className="w-4 h-4" />
              Join 50,000+ adventurers worldwide
            </div>

            <h1 className="text-6xl md:text-8xl font-bold text-gray-900 mb-8 leading-tight text-balance">
              Travel Together,
              <span className="text-[#40E0D0] block mt-2">Stay Connected</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed text-pretty">
              Share live locations, discover amazing places, and coordinate seamlessly with your travel companions on
              unforgettable adventures.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="bg-[#40E0D0] hover:bg-[#20f0e8] text-white shadow-2xl px-10 py-6 text-xl rounded-2xl hover:scale-105 transition-all duration-300"
                >
                  Start Your Journey
                  <ArrowRight className="w-6 h-6 ml-3" />
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-teal-300 bg-white/80 backdrop-blur-sm text-gray-900 hover:bg-teal-50 px-10 py-6 text-xl rounded-2xl hover:scale-105 transition-all duration-300"
                >
                  <Camera className="w-6 h-6 mr-3" />
                  Join Existing Trip
                </Button>
              </Link>
            </div>

            <div className="flex items-center justify-center gap-3 text-gray-600 bg-white/60 backdrop-blur-sm rounded-full px-6 py-3 border border-teal-200 inline-flex">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="font-medium">4.9/5 from 10,000+ travelers</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-24">
            <div className="group bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-teal-200 hover:shadow-2xl hover:scale-105 transition-all duration-500 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
                <img
                  src="/gps-location-pin-icon-on-map--travel-navigation.jpg"
                  alt="Location sharing"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div className="w-16 h-16 bg-[#00FFFF] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Live Location Sharing</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                Share your real-time location with travel buddies. Never lose track of each other during adventures in
                bustling cities or remote trails.
              </p>
            </div>

            <div className="group bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-teal-200 hover:shadow-2xl hover:scale-105 transition-all duration-500 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
                <img
                  src="/group-of-friends-traveling-together--team-coordina.jpg"
                  alt="Group coordination"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div className="w-16 h-16 bg-[#20f0e8] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Group Coordination</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                Create trips, invite friends with simple links, and coordinate your group activities effortlessly across
                multiple time zones.
              </p>
            </div>

            <div className="group bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-teal-200 hover:shadow-2xl hover:scale-105 transition-all duration-500 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
                <img
                  src="/compass-and-map-for-discovering-new-places--explor.jpg"
                  alt="Discover places"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div className="w-16 h-16 bg-[#00FFFF] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Navigation className="w-8 h-8 text-gray-900" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Discover Places</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                Find nearby restaurants, attractions, restrooms, and hidden gems wherever your journey takes you around
                the globe.
              </p>
            </div>
          </div>

          <div className="mb-24">
            <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">Loved by Travelers Worldwide</h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                {
                  name: "Sarah Chen",
                  location: "Backpacking through Europe",
                  quote: "TravelBuddy saved our group trip! We never lost each other in crowded cities.",
                  image: "/young-woman-traveler-with-backpack-smiling.jpg",
                },
                {
                  name: "Marcus Rodriguez",
                  location: "Safari in Kenya",
                  quote: "The location sharing feature was perfect for our safari adventure. Highly recommend!",
                  image: "/man-with-camera-on-safari-adventure.jpg",
                },
                {
                  name: "Emma Thompson",
                  location: "Island hopping in Greece",
                  quote: "Coordinating ferry schedules with friends has never been easier. Love this app!",
                  image: "/woman-on-greek-island-vacation-by-the-sea.jpg",
                },
              ].map((testimonial, i) => (
                <div key={i} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-teal-200">
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={testimonial.image || "/placeholder.svg"}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                      <p className="text-sm text-gray-600">{testimonial.location}</p>
                    </div>
                  </div>
                  <p className="text-gray-600 italic">"{testimonial.quote}"</p>
                  <div className="flex mt-3">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative bg-[#00FFFF] rounded-3xl p-16 text-center text-white overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <img
                src="/mountain-peaks-at-golden-hour--adventure-travel-in.jpg"
                alt="Mountain adventure"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="relative z-10">
              <Mountain className="w-16 h-16 mx-auto mb-6 opacity-80" />
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance">Ready to explore together?</h2>
              <p className="text-white/90 mb-10 text-xl max-w-2xl mx-auto text-pretty">
                Join thousands of travelers who trust TravelBuddy for their adventures. Start planning your next journey
                today.
              </p>
              <Link href="/signup">
                <Button
                  size="lg"
                  className="bg-white text-[#00FFFF] hover:bg-gray-50 shadow-2xl px-12 py-6 text-xl rounded-2xl font-bold hover:scale-105 transition-all duration-300"
                >
                  Get Started Free
                  <ArrowRight className="w-6 h-6 ml-3" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}