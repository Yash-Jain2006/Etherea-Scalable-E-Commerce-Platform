import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, Package, ArrowRight, Home } from 'lucide-react';
import { motion } from 'framer-motion';

const OrderSuccessPage = () => {
  const { orderId } = useParams();

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        {/* Animated Icon Container */}
        <div className="relative mb-8">
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 15, stiffness: 200 }}
            className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto"
          >
            <CheckCircle2 size={48} className="text-green-500" />
          </motion.div>
          
          {/* Confetti-like bits */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, x: 0, y: 0 }}
              animate={{ 
                scale: [0, 1, 0], 
                x: [0, (i % 2 ? 40 : -40) * (i + 1)],
                y: [0, (i < 3 ? -40 : 40) * (i + 1)] 
              }}
              transition={{ duration: 1, repeat: Infinity, repeatDelay: 1, delay: i * 0.1 }}
              className="absolute top-1/2 left-1/2 w-2 h-2 bg-primary rounded-full"
            />
          ))}
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className="text-4xl font-extrabold mb-4">Order <span className="text-gradient">Confirmed!</span></h1>
          <p className="text-gray-400 mb-2">Thank you for your purchase.</p>
          <p className="text-sm font-mono text-primary mb-10">Order ID: #{orderId}</p>

          <div className="glass-card p-6 mb-10 text-left">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Package size={18} className="text-primary" /> Next Steps
            </h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5" />
                You will receive a confirmation email shortly.
              </li>
              <li className="flex gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5" />
                Your order is being processed for shipping.
              </li>
              <li className="flex gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5" />
                Track your package from your profile dashboard.
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <Link to="/profile" className="btn-primary py-4 flex items-center justify-center gap-2">
              View My Orders <ArrowRight size={20} />
            </Link>
            <Link to="/" className="btn-secondary py-4 flex items-center justify-center gap-2">
              <Home size={20} /> Back to Home
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
