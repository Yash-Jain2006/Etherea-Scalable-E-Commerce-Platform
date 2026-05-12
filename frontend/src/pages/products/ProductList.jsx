import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { productApi, cartApi } from '../../api/api';
import { Search, Filter, ShoppingCart, Loader2, ChevronLeft, ChevronRight, Heart, SlidersHorizontal } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { motion, AnimatePresence } from 'framer-motion';
import { wishlistApi } from '../../api/api';
import toast from 'react-hot-toast';

const ProductList = () => {
  const [filters, setFilters] = useState({
    page: 1,
    category: '',
    search: '',
    sort: 'newest'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const setCart = useCartStore((state) => state.setCart);

  // Fetch Categories
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: productApi.getCategories
  });

  // Fetch Products
  const { data: productsData, isLoading, isError } = useQuery({
    queryKey: ['products', filters],
    queryFn: () => productApi.getProducts(filters),
    keepPreviousData: true
  });

  // Debounced Search
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchTerm, page: 1 }));
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleAddToCart = async (productId) => {
    try {
      const response = await cartApi.addItem({ product_id: productId, quantity: 1 });
      // Refresh cart state
      const cartRes = await cartApi.getCart();
      setCart(cartRes.data);
      toast.success('Added to cart');
    } catch (err) {
      console.error('Failed to add to cart', err);
      toast.error('Failed to add to cart. Please log in.');
    }
  };

  const handleWishlist = async (productId) => {
    try {
      await wishlistApi.addItem(productId);
      toast.success('Added to Wishlist!');
    } catch (err) {
      if (err.response?.status === 400) {
        toast.error('Already in Wishlist');
      } else {
        toast.error('Please login to save items');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">Explore <span className="text-gradient">Collections</span></h1>
          <p className="text-gray-400">Discover premium tech and lifestyle essentials</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder="Search products..."
              className="input-field pl-12 w-full md:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select 
            className="input-field w-auto min-w-[140px] appearance-none"
            value={filters.sort}
            onChange={(e) => setFilters({ ...filters, sort: e.target.value, page: 1 })}
          >
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 space-y-8">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4 flex items-center gap-2">
              <Filter size={14} /> Categories
            </h3>
            <div className="space-y-2">
              <button 
                onClick={() => setFilters({ ...filters, category: '', page: 1 })}
                className={`w-full text-left px-4 py-2 rounded-xl transition-all ${!filters.category ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-white/5 text-gray-400'}`}
              >
                All Categories
              </button>
              {categoriesData?.data?.categories.map((cat) => (
                <button 
                  key={cat.id}
                  onClick={() => setFilters({ ...filters, category: cat.slug, page: 1 })}
                  className={`w-full text-left px-4 py-2 rounded-xl transition-all ${filters.category === cat.slug ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-white/5 text-gray-400'}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4 flex items-center gap-2">
              <SlidersHorizontal size={14} /> Filters
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-widest block mb-2">Price Range</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    placeholder="Min" 
                    className="input-field w-full px-3 py-2 text-sm"
                    onChange={(e) => setFilters({ ...filters, min_price: e.target.value, page: 1 })}
                  />
                  <span className="text-gray-500">-</span>
                  <input 
                    type="number" 
                    placeholder="Max" 
                    className="input-field w-full px-3 py-2 text-sm"
                    onChange={(e) => setFilters({ ...filters, max_price: e.target.value, page: 1 })}
                  />
                </div>
              </div>
              <div>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      className="sr-only"
                      onChange={(e) => setFilters({ ...filters, in_stock: e.target.checked ? 'true' : '', page: 1 })}
                    />
                    <div className="block w-10 h-6 bg-white/10 rounded-full group-hover:bg-white/20 transition-colors"></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${filters.in_stock === 'true' ? 'translate-x-4 bg-primary' : ''}`}></div>
                  </div>
                  <span className="text-sm text-gray-400 group-hover:text-white transition-colors">In Stock Only</span>
                </label>
              </div>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-grow">
          {isLoading ? (
            <div className="h-96 flex items-center justify-center">
              <Loader2 className="animate-spin text-primary" size={40} />
            </div>
          ) : isError ? (
            <div className="glass-card p-12 text-center text-red-400">
              Failed to load products. Please check your connection.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {productsData?.data?.products.map((product) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      key={product.id}
                      className="glass-card group overflow-hidden"
                    >
                      <div className="aspect-square relative overflow-hidden bg-white/5">
                        <img 
                          src={product.image_url} 
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute top-4 right-4 flex flex-col gap-2 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                          <button 
                            onClick={(e) => { e.preventDefault(); handleWishlist(product.id); }}
                            className="p-3 bg-white/10 backdrop-blur-md text-white rounded-xl shadow-xl hover:bg-red-500/80 hover:text-white transition-all"
                          >
                            <Heart size={20} />
                          </button>
                        </div>
                        <button 
                          onClick={() => handleAddToCart(product.id)}
                          className="absolute bottom-4 right-4 p-3 bg-primary text-white rounded-xl shadow-xl translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300"
                        >
                          <ShoppingCart size={20} />
                        </button>
                      </div>
                      <div className="p-6">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2 block">
                          {product.category_name}
                        </span>
                        <h3 className="font-bold text-lg mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                          {product.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xl font-black">₹{product.price.toLocaleString()}</span>
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${product.stock_quantity > 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                            {product.stock_quantity > 0 ? 'IN STOCK' : 'OUT OF STOCK'}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Pagination */}
              {productsData?.data?.pagination.pages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-4">
                  <button 
                    disabled={filters.page === 1}
                    onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                    className="p-3 glass-card hover:bg-white/10 disabled:opacity-30 transition-all"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <span className="text-sm font-medium">
                    Page {filters.page} of {productsData.data.pagination.pages}
                  </span>
                  <button 
                    disabled={filters.page === productsData.data.pagination.pages}
                    onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                    className="p-3 glass-card hover:bg-white/10 disabled:opacity-30 transition-all"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductList;
