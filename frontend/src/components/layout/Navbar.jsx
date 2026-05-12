import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, LogOut, ChevronDown, Heart } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useCartStore } from '../../store/useCartStore';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuthStore();
  const { itemCount } = useCartStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-4 pointer-events-none">
      <div className="max-w-7xl mx-auto pointer-events-auto">
        <div className="glass-card px-6 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold tracking-tighter flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white italic shadow-lg shadow-primary/20">E</div>
            <span className="text-gradient">Etherea</span>
          </Link>

          {/* Desktop Nav - Centered Links */}
          <div className="hidden md:flex items-center gap-10 absolute left-1/2 -translate-x-1/2">
            <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">Home</Link>
            <Link to="/products" className="text-sm font-medium hover:text-primary transition-colors">Collections</Link>
            {isAuthenticated && (
              <Link to="/wishlist" className="text-sm font-medium hover:text-primary transition-colors">Wishlist</Link>
            )}
            {user?.role === 'admin' && (
              <Link to="/admin" className="text-sm font-medium text-accent hover:opacity-80">Admin</Link>
            )}
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2 border-r border-white/10 pr-4 mr-2">
              <Link to="/cart" className="relative p-2 hover:bg-white/5 rounded-full transition-colors group">
                <ShoppingCart size={20} className="group-hover:text-primary transition-colors" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                    {itemCount}
                  </span>
                )}
              </Link>
            </div>

            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <Link to="/profile" className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                  <User size={16} className="text-primary" />
                  <span className="text-sm font-medium">{user.full_name.split(' ')[0]}</span>
                </Link>
                <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-400 transition-colors">
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-sm font-medium hover:text-primary transition-colors">Sign In</Link>
                <Link to="/register" className="btn-primary py-2 px-5 text-sm">Join</Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden p-2 hover:bg-white/5 rounded-lg transition-colors" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="md:hidden mt-2 glass-card p-6 flex flex-col gap-4 pointer-events-auto overflow-hidden origin-top"
            >
              <Link to="/" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium hover:text-primary transition-colors">Home</Link>
              <Link to="/products" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium hover:text-primary transition-colors">Collections</Link>
              <Link to="/wishlist" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium flex items-center justify-between hover:text-primary transition-colors">
                Wishlist <Heart size={18} className="text-red-400" />
              </Link>
              <Link to="/cart" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium flex items-center justify-between hover:text-primary transition-colors">
                Cart <span className="bg-primary/20 text-primary px-2 py-0.5 rounded-full text-sm">{itemCount}</span>
              </Link>
              <div className="h-px bg-white/10 my-2" />
              {isAuthenticated ? (
                <>
                  <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="text-lg flex items-center gap-2">
                    <User size={18} /> My Profile
                  </Link>
                  {user?.role === 'admin' && <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="text-lg text-accent">Admin Dashboard</Link>}
                  <button onClick={handleLogout} className="text-left text-lg text-red-400 flex items-center gap-2">
                    <LogOut size={18} /> Logout
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-3 pt-2">
                  <Link to="/login" onClick={() => setIsMenuOpen(false)} className="btn-secondary text-center">Sign In</Link>
                  <Link to="/register" onClick={() => setIsMenuOpen(false)} className="btn-primary text-center">Create Account</Link>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;
