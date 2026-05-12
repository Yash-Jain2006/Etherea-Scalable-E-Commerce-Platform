import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Shield, Globe, ShoppingCart } from 'lucide-react';

const HomePage = () => {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-primary text-xs font-bold tracking-widest uppercase mb-6">
              <Zap size={14} /> New Season Drops Are Live
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8">
              SHOP AT THE <br />
              <span className="text-gradient">SPEED OF LIGHT</span>
            </h1>
            <p className="text-xl text-gray-400 mb-10 max-w-lg leading-relaxed">
              Experience the world's most advanced cloud-native marketplace. Premium tech, curated fashion, and ultra-fast delivery.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/products" className="btn-primary py-4 px-10 text-lg flex items-center gap-2 group">
                Explore Collection <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/register" className="btn-secondary py-4 px-10 text-lg">
                Join Community
              </Link>
            </div>
            
            <div className="mt-12 flex items-center gap-8 text-gray-500">
              <div className="flex flex-col">
                <span className="text-white font-bold text-2xl">12k+</span>
                <span className="text-xs uppercase tracking-widest">Active Users</span>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div className="flex flex-col">
                <span className="text-white font-bold text-2xl">99.9%</span>
                <span className="text-xs uppercase tracking-widest">Uptime Rate</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="relative"
          >
            <div className="glass-card aspect-square relative z-10 overflow-hidden group">
               <img 
                src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=1000" 
                alt="Featured Product" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-8">
                <span className="text-primary font-bold text-xs tracking-widest uppercase mb-2">Featured Drop</span>
                <h3 className="text-3xl font-black mb-4">Cloud Minimalist Watch</h3>
                <Link to="/products" className="text-sm font-bold flex items-center gap-2 hover:text-primary transition-colors">
                  Shop Now <ArrowRight size={16} />
                </Link>
              </div>
            </div>
            
            {/* Floating Decorative Elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/30 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-secondary/30 rounded-full blur-3xl animate-pulse-slow" />
          </motion.div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-20 bg-white/5 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { icon: Globe, title: 'Global Infrastructure', desc: 'Deployed across multiple AWS regions for zero-latency shopping.' },
            { icon: Shield, title: 'Secure Transactions', desc: 'Atomic checkout and SSL encryption to keep your data private.' },
            { icon: ShoppingCart, title: 'One-Click Checkout', desc: 'Seamless integration from cart to delivery in seconds.' }
          ].map((feature, i) => (
            <div key={i} className="flex gap-6">
              <div className="p-4 bg-primary/10 text-primary rounded-2xl h-fit"><feature.icon size={28} /></div>
              <div>
                <h4 className="text-xl font-bold mb-2">{feature.title}</h4>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
