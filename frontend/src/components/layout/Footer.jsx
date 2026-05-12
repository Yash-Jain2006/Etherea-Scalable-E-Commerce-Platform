import React from 'react';
import { Link } from 'react-router-dom';
import { X, Camera, Code2, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="mt-20 border-t border-white/5 bg-black/20 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="text-2xl font-bold tracking-tighter flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white italic shadow-lg shadow-primary/20">E</div>
              <span className="text-gradient">Etherea</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              Experience the next generation of e-commerce. Premium products, seamless checkout, and cloud-native performance.
            </p>
            <div className="flex items-center gap-4 mt-8">
              <a href="#" className="p-2 bg-white/5 rounded-lg hover:bg-primary/20 hover:text-primary transition-all"><X size={18} /></a>
              <a href="#" className="p-2 bg-white/5 rounded-lg hover:bg-primary/20 hover:text-primary transition-all"><Camera size={18} /></a>
              <a href="#" className="p-2 bg-white/5 rounded-lg hover:bg-primary/20 hover:text-primary transition-all"><Code2 size={18} /></a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold mb-6">Shop</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><Link to="/products" className="hover:text-primary transition-colors">All Products</Link></li>
              <li><Link to="/products?category=electronics" className="hover:text-primary transition-colors">Electronics</Link></li>
              <li><Link to="/products?category=fashion" className="hover:text-primary transition-colors">Fashion</Link></li>
              <li><Link to="/products?category=fitness" className="hover:text-primary transition-colors">Fitness</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6">Support</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><a href="#" className="hover:text-primary transition-colors">Shipping Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Returns & Refunds</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-bold mb-6">Join the Cloud</h4>
            <p className="text-sm text-gray-400 mb-4">Subscribe for exclusive drops and tech updates.</p>
            <div className="relative">
              <input 
                type="email" 
                placeholder="email@example.com"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary/50 transition-all text-sm"
              />
              <button className="absolute right-2 top-2 p-1.5 bg-primary rounded-lg text-white">
                <Mail size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <p>© 2026 Etherea Cloud Platform. All rights reserved.</p>
          <div className="flex gap-8">
            <span className="flex items-center gap-1"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> AWS Global Infrastructure</span>
            <span>Built by Yash jain</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
