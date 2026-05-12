import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { wishlistApi, cartApi } from '../../api/api';
import { ShoppingCart, Trash2, Loader2, Heart, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../../store/useCartStore';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const WishlistPage = () => {
  const queryClient = useQueryClient();
  const setCart = useCartStore((state) => state.setCart);

  const { data: wishlistData, isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: wishlistApi.getWishlist
  });

  const handleRemove = async (productId) => {
    try {
      await wishlistApi.removeItem(productId);
      toast.success('Removed from wishlist');
      queryClient.invalidateQueries(['wishlist']);
    } catch (err) {
      toast.error('Failed to remove item');
    }
  };

  const handleMoveToCart = async (productId) => {
    try {
      await cartApi.addItem({ product_id: productId, quantity: 1 });
      await wishlistApi.removeItem(productId);
      
      // Refresh both
      const cartRes = await cartApi.getCart();
      setCart(cartRes.data);
      queryClient.invalidateQueries(['wishlist']);
      
      toast.success('Moved to cart!');
    } catch (err) {
      toast.error('Failed to move to cart');
    }
  };

  if (isLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" size={40} /></div>;

  const items = wishlistData?.data?.wishlist || [];

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">My <span className="text-gradient">Wishlist</span></h1>
        <p className="text-gray-400">Save your favorite items for later</p>
      </div>

      {items.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart size={40} className="text-gray-600" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Your wishlist is empty</h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">Explore our collections and tap the heart icon to save items you love.</p>
          <Link to="/products" className="btn-primary py-3 px-8 inline-flex items-center gap-2">
            Browse Products <ArrowRight size={18} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {items.map((item) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                key={item.id}
                className="glass-card group overflow-hidden border border-white/5 hover:border-primary/30 transition-all"
              >
                <div className="aspect-video relative overflow-hidden bg-white/5">
                  <img 
                    src={item.product_image} 
                    alt={item.product_name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <button 
                      onClick={() => handleMoveToCart(item.product_id)}
                      className="p-3 bg-primary text-white rounded-xl shadow-xl hover:scale-110 transition-transform"
                      title="Move to Cart"
                    >
                      <ShoppingCart size={20} />
                    </button>
                    <button 
                      onClick={() => handleRemove(item.product_id)}
                      className="p-3 bg-red-500 text-white rounded-xl shadow-xl hover:scale-110 transition-transform"
                      title="Remove"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-lg mb-2">{item.product_name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-black text-primary">₹{item.product_price?.toLocaleString()}</span>
                    <button 
                      onClick={() => handleMoveToCart(item.product_id)}
                      className="text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                    >
                      Add to Cart <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
