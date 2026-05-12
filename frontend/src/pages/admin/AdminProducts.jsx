import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productApi } from '../../api/api';
import { Plus, Edit, Trash2, Loader2, Package, Search } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminProducts = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => productApi.getProducts({ per_page: 100 })
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => productApi.deleteProduct(id),
    onSuccess: () => queryClient.invalidateQueries(['admin-products'])
  });

  if (isLoading) return <div className="h-96 flex items-center justify-center"><Loader2 className="animate-spin text-primary" size={40} /></div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-3xl font-bold mb-2">Inventory <span className="text-gradient">Management</span></h1>
          <p className="text-gray-400">Add, edit, or remove products from the catalog.</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus size={20} /> Add Product
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between gap-4">
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder="Filter inventory..."
              className="input-field pl-12 py-2"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
            {productsData?.data?.products.length} Items Total
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs font-bold text-gray-500 uppercase border-b border-white/5 bg-white/5">
                <th className="p-6">Product</th>
                <th className="p-6">Category</th>
                <th className="p-6">Price</th>
                <th className="p-6">Stock</th>
                <th className="p-6">Status</th>
                <th className="p-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {productsData?.data?.products.map((product) => (
                <tr key={product.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <img src={product.image_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      <span className="font-bold">{product.name}</span>
                    </div>
                  </td>
                  <td className="p-6 text-gray-400">{product.category_name}</td>
                  <td className="p-6 font-black">₹{product.price.toLocaleString()}</td>
                  <td className="p-6">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${product.stock_quantity < 10 ? 'bg-red-500' : 'bg-green-500'}`} />
                      {product.stock_quantity}
                    </div>
                  </td>
                  <td className="p-6">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${product.is_active ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                      {product.is_active ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 hover:bg-primary/20 hover:text-primary rounded-lg transition-all"><Edit size={16} /></button>
                      <button 
                        onClick={() => { if(confirm('Deactivate this product?')) deleteMutation.mutate(product.id) }}
                        className="p-2 hover:bg-red-500/20 hover:text-red-500 rounded-lg transition-all"
                      ><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;
