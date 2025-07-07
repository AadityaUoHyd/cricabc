import { Facebook, Twitter, Youtube, Instagram } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 md:gap-8 mb-12">

          {/* 1. CricLive Info */}
          <div className="space-y-4 text-center md:text-left"> {/* Added text-center for mobile */}
            <div className="flex items-center justify-center md:justify-start space-x-3"> {/* Centered for mobile */}
              <a href="/"><img src="/cl.png" alt="CricLive Logo" className="w-12 h-12" /></a>
              <span className="text-purple-500 text-2xl font-semibold"><a href="/">CricLive</a></span>
            </div>
            <p className="text-gray-400">Your ultimate cricket companion.</p>
            <p className="text-gray-400">
              By
              <a
                href="https://www.linkedin.com/in/aaditya-bachchu-chatterjee-0485933b/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-yellow-400 hover:text-yellow-600 ml-1"
              >
                Aaditya B Chatterjee
              </a>
              .
            </p>
          </div>

          {/* 2. Mobile Site & Apps */}
          <div className="text-center md:text-left"> {/* Added text-center for mobile */}
            <h3 className="text-purple-500 font-semibold mb-4">Aware of these?</h3>
            <ul className="space-y-2">
              <li><a href="/quiz" className="hover:text-purple-400">CricLive Cricket Quiz</a></li>
              <li><a href="/about" className="hover:text-purple-400">About Us</a></li>
              <li><a href="/advertise" className="hover:text-purple-400">Privacy Policy</a></li>
              <li><a href="/terms" className="hover:text-purple-400">Terms of Use</a></li>
            </ul>
          </div>

          {/* 3. Company Info */}
          <div className="text-center md:text-left"> {/* Added text-center for mobile */}
            <h3 className="text-purple-500 font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><a href="/careers" className="hover:text-purple-400">Careers</a></li>
              <li><a href="/contact" className="hover:text-purple-400">Contact Us</a></li>
              <li><a href="/advertise" className="hover:text-purple-400">Advertise</a></li>
              <li><a href="/criclive-team" className="hover:text-purple-400">CricLive Team</a></li>
            </ul>
          </div>

          {/* 4. Quick Links */}
          <div className="text-center md:text-left"> {/* Added text-center for mobile */}
            <h3 className="text-purple-500 font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="/" className="hover:text-purple-400">Live Scores</a></li>
              <li><a href="/schedules" className="hover:text-purple-400">Schedules</a></li>
              <li><a href="/news" className="hover:text-purple-400">News</a></li>
              <li><a href="/rankings" className="hover:text-purple-400">Rankings</a></li>
            </ul>
          </div>

          {/* 5. Social Media */}
          <div className="text-center md:text-left"> {/* Added text-center for mobile */}
            <h3 className="text-purple-500 font-semibold mb-4">Follow Us On</h3>
            <ul className="space-y-2">
              <li className="flex items-center justify-center md:justify-start gap-2"> {/* Centered for mobile */}
                <Facebook size={18} className="text-purple-400" />
                <a href="#" className="hover:text-purple-400">Facebook</a>
              </li>
              <li className="flex items-center justify-center md:justify-start gap-2"> {/* Centered for mobile */}
                <Twitter size={18} className="text-purple-400" />
                <a href="#" className="hover:text-purple-400">Twitter</a>
              </li>
              <li className="flex items-center justify-center md:justify-start gap-2"> {/* Centered for mobile */}
                <Youtube size={18} className="text-purple-400" />
                <a href="#" className="hover:text-purple-400">YouTube</a>
              </li>
              <li className="flex items-center justify-center md:justify-start gap-2"> {/* Centered for mobile */}
                <Instagram size={18} className="text-purple-400" />
                <a href="#" className="hover:text-purple-400">Instagram</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 pt-6 text-center text-xs text-gray-500">
          <p>© 2025 CricLive Limited. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}