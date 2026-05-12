import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Loader2 } from 'lucide-react';
import { cartApi } from '../../api/api';
import { useCartStore } from '../../store/useCartStore';
import { motion, AnimatePresence } from 'framer-motion';

const CartPage = () => {
  const { items, subtotal, shippingFee, total, setCart } = useCartStore();
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await cartApi.getCart();
      setCart(response.data);
    } catch (err) {
      console.error('Failed to fetch cart', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateQuantity = async (productId, newQty) => {
    if (newQty < 1) return;
    try {
      await cartApi.updateItem(productId, newQty);
      fetchCart();
    } catch (err) {
      alert(err.message || 'Failed to update quantity');
    }
  };

  const handleRemove = async (productId) => {
    try {
      await cartApi.removeItem(productId);
      fetchCart();
    } catch (err) {
      console.error('Failed to remove item', err);
    }
  };

  if (isLoading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <ShoppingBag size={80} className="mx-auto text-gray-700 mb-6" />
          <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
          <p className="text-gray-400 mb-10 max-w-md mx-auto">
            Looks like you haven't added anything to your cart yet. Explore our latest drops and find something you love.
          </p>
          <Link to="/products" className="btn-primary py-4 px-10 inline-flex items-center gap-2">
            Start Shopping <ArrowRight size={20} />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-extrabold mb-12">Shopping <span className="text-gradient">Cart</span></h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="popLayout">
            {items.map((item) => (
              <motion.div
                key={item.product_id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="glass-card p-6 flex flex-col sm:flex-row items-center gap-6"
              >
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-white/5 flex-shrink-0">
                  <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                </div>

                <div className="flex-grow text-center sm:text-left">
                  <h3 className="font-bold text-lg mb-1">{item.name}</h3>
                  <p className="text-primary font-black text-sm mb-4">₹{item.price.toLocaleString()}</p>
                  
                  <div className="flex items-center justify-center sm:justify-start gap-4">
                    <div className="flex items-center bg-white/5 rounded-lg border border-white/10">
                      <button 
                        onClick={() => handleUpdateQuantity(item.product_id, item.quantity - 1)}
                        className="p-2 hover:text-primary transition-colors"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-8 text-center font-bold">{item.quantity}</span>
                      <button 
                        onClick={() => handleUpdateQuantity(item.product_id, item.quantity + 1)}
                        className="p-2 hover:text-primary transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <button 
                      onClick={() => handleRemove(item.product_id)}
                      className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="text-right hidden sm:block">
                  <p className="text-sm text-gray-500 mb-1">Subtotal</p>
                  <p className="font-bold text-xl">₹{item.subtotal.toLocaleString()}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="glass-card p-8 sticky top-32">
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal</span>
                <span className="text-foreground">₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Shipping Fee</span>
                <span className="text-foreground">₹{shippingFee.toLocaleString()}</span>
              </div>
              <div className="h-px bg-white/10 my-2" />
              <div className="flex justify-between text-xl font-bold">
                <span>Total</span>
                <span className="text-primary">₹{total.toLocaleString()}</span>
              </div>
            </div>

            <button 
              onClick={() => navigate('/checkout')}
              className="btn-primary w-full py-4 flex items-center justify-center gap-2"
            >
              Checkout Now <ArrowRight size={20} />
            </button>

            <div className="mt-6 flex items-center gap-3 justify-center text-[10px] text-gray-500 font-bold uppercase tracking-widest">
              <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-primary rounded-full" /> Secure SSL</span>
              <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-primary rounded-full" /> Fast Delivery</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
