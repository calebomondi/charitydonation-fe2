import { connectWallet, listenForWalletEvents, checkIfWalletIsConnected } from "../../blockchain-services/useCharityDonation"
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Wallet, Globe, Users } from 'lucide-react';

function Home() {
    const [account, setAccount] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
      //listen for wallet events
      listenForWalletEvents();
      //redirect if or when connected
      const redirecteIfConnected = async () => {
        const connected = await checkIfWalletIsConnected();
        if (connected) {
          navigate('/fundraisers');
        }
      }
      redirecteIfConnected();
    }, [account]);

    const handleConnectWallet = async () => {
        const account = await connectWallet();
        setAccount(account);
    }

    const causes = [
      {
        title: "Clean Water Initiative",
        location: "East Africa",
        raised: "45000",
        goal: "100000",
        image: "/api/placeholder/400/250",
        category: "Infrastructure"
      },
      {
        title: "Education for All",
        location: "South Asia",
        raised: "28000",
        goal: "50000",
        image: "/api/placeholder/400/250",
        category: "Education"
      },
      {
        title: "Medical Supplies Drive",
        location: "Latin America",
        raised: "75000",
        goal: "80000",
        image: "/api/placeholder/400/250",
        category: "Healthcare"
      }
    ];

    const testimonials = [
      {
        name: "Maria Rodriguez",
        location: "Colombia",
        text: "Thanks to the medical supplies provided through this platform, our local clinic can now serve twice as many patients. The transparency of blockchain technology gave us confidence that every donation would reach its intended purpose.",
        image: "/api/placeholder/64/64"
      },
      {
        name: "John Kamau",
        location: "Kenya",
        text: "The Clean Water Initiative has transformed our community. We can track every donation and see exactly how the funds are being used. This transparency has encouraged more people to contribute to our cause.",
        image: "/api/placeholder/64/64"
      },
      {
        name: "Priya Patel",
        location: "India",
        text: "Education for All has helped us build three new classrooms and provide learning materials to over 200 students. The direct connection with donors through the platform has made this possible.",
        image: "/api/placeholder/64/64"
      }
    ];

  return (
    <>
    {/*
    <div>
      {
        account ? (
          <p>Connected account: {account}</p>
        ) : (
          <button className="btn btn-secondary" onClick={handleConnectWallet}>Connect</button>
        )
      }
    </div>
    */}
    <div className="min-h-screen flex flex-col relative">
      {/* Gradient background */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-green-800 via-green-900 to-emerald-900"
        style={{ zIndex: -1 }}
      />

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 text-white">
        <div className="max-w-6xl mx-auto text-center">
          {/* Hero section */}
          <h1 className="text-4xl sm:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-300">
            Empowering Global Change Through Blockchain
          </h1>
          
          <p className="text-xl sm:text-2xl mb-8 text-gray-200">
            Join the revolution in transparent, decentralized charitable giving
          </p>

          {/* Impact section */}
          <div className="text-lg text-gray-300 mb-12">
            <p className="mb-4">
              Every transaction on our platform is transparent, traceable, and makes a real difference.
              Together, we can build a future where giving knows no borders.
            </p>
          </div>

          {/* Features section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="p-6 rounded-lg bg-white/5 backdrop-blur-sm">
              <Heart className="w-8 h-8 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Direct Impact</h3>
              <p className="text-gray-400">100% of your donation reaches those in need with blockchain verification</p>
            </div>
            <div className="p-6 rounded-lg bg-white/5 backdrop-blur-sm">
              <Globe className="w-8 h-8 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Global Reach</h3>
              <p className="text-gray-400">Support causes worldwide without borders or intermediaries</p>
            </div>
            <div className="p-6 rounded-lg bg-white/5 backdrop-blur-sm">
              <Users className="w-8 h-8 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Community Driven</h3>
              <p className="text-gray-400">Join a community of givers making real change happen</p>
            </div>
          </div>

          {/* Stats section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            <div className="p-4">
              <div className="text-3xl font-bold text-green-400">$2M+</div>
              <div className="text-gray-400">Donated</div>
            </div>
            <div className="p-4">
              <div className="text-3xl font-bold text-green-400">50+</div>
              <div className="text-gray-400">Causes</div>
            </div>
            <div className="p-4">
              <div className="text-3xl font-bold text-green-400">10K+</div>
              <div className="text-gray-400">Donors</div>
            </div>
            <div className="p-4">
              <div className="text-3xl font-bold text-green-400">100%</div>
              <div className="text-gray-400">Transparent</div>
            </div>
          </div>

          {/* Featured Causes Section */}
          <h2 className="text-3xl font-bold mb-8">Featured Causes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {causes.map((cause, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm overflow-hidden rounded-lg">
                <img src={cause.image} alt={cause.title} className="w-full h-48 object-cover" />
                <div className="p-6">
                  <span className="text-green-400 text-sm font-semibold">{cause.category}</span>
                  <h3 className="text-xl font-bold mb-2">{cause.title}</h3>
                  <p className="text-gray-400 mb-4">{cause.location}</p>
                  <div className="mb-4">
                    <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                      <div 
                        className="bg-green-400 h-2 rounded-full"
                        style={{ width: `${(parseInt(cause.raised) / parseInt(cause.goal)) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>${parseInt(cause.raised).toLocaleString()} raised</span>
                      <span>Goal: ${parseInt(cause.goal).toLocaleString()}</span>
                    </div>
                  </div>
                  <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-md">
                    Support This Cause
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Testimonials Section */}
          <h2 className="text-3xl font-bold mb-8">Impact Stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="p-6 rounded-lg bg-white/5 backdrop-blur-sm">
                <div className="flex items-center mb-4">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-green-400 text-sm">{testimonial.location}</p>
                  </div>
                </div>
                <p className="text-gray-300 italic">{testimonial.text}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer with connect button */}
      <footer className="py-8 text-center">
        <button
          onClick={handleConnectWallet}
          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-6 rounded-lg text-lg font-semibold shadow-lg transition-all duration-200 flex items-center gap-2 mx-auto"
        >
          <Wallet className="w-6 h-6" />
          Connect to Make a Difference
        </button>
      </footer>
    </div>
    </>
  )
}

export default Home
