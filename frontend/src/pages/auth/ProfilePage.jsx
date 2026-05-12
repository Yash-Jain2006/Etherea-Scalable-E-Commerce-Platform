import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { orderApi, authApi } from '../../api/api';
import api from '../../api/axios';
import { Loader2, Package, Star, Bell } from 'lucide-react';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

const ProfilePage = () => {
  const [reviewModal, setReviewModal] = useState({ isOpen: false, productId: null, productName: '' });
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const queryClient = useQueryClient();

  // Fetch Orders
  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['myOrders'],
    queryFn: () => orderApi.getOrders()
  });

  // WebSocket for Real-Time Tracking
  useEffect(() => {
    const socket = io('/', { path: '/api/v1/socket.io' });
    
    const setupSocket = async () => {
      try {
        const userRes = await authApi.getMe();
        const userId = userRes.data.user.id;
        
        socket.emit('join', { user_id: userId });
        
        socket.on('order_status_update', (data) => {
          console.log('Real-time update received:', data);
          toast.success(`Order #${data.order_id} is now ${data.status.toUpperCase()}`, {
            icon: <Bell className="text-primary" />,
            duration: 5000
          });
          // Invalidate and refetch orders
          queryClient.invalidateQueries(['myOrders']);
        });
      } catch (err) {
        console.error('WebSocket setup failed:', err);
      }
    };

    setupSocket();

    return () => {
      socket.disconnect();
    };
  }, [queryClient]);

  const submitReview = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/products/${reviewModal.productId}/reviews`, { rating, comment });
      toast.success('Review submitted successfully!');
      setReviewModal({ isOpen: false, productId: null, productName: '' });
      setRating(5);
      setComment('');
    } catch (err) {
      toast.error('Failed to submit review');
    }
  };

  if (isLoading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-primary" size={40} /></div>;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-4xl font-extrabold mb-8">Order <span className="text-gradient">History</span></h1>
      
      <div className="space-y-6">
        {ordersData?.data?.orders?.length === 0 ? (
          <p className="text-gray-400">You haven't placed any orders yet.</p>
        ) : (
          ordersData?.data?.orders?.map(order => (
            <div key={order.id} className="glass-card p-6 border border-white/10">
              <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-4">
                <div>
                  <p className="text-sm text-gray-500">Order #{order.id}</p>
                  <p className="text-xs text-gray-600">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary">₹{order.total}</p>
                  <span className="text-xs px-2 py-1 bg-green-500/20 text-green-500 rounded-full uppercase">{order.status}</span>
                </div>
              </div>
              
              <div className="space-y-4">
                {order.items?.map(item => (
                  <div key={item.id} className="flex justify-between items-center bg-white/5 p-4 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded bg-black/50 overflow-hidden flex items-center justify-center">
                        <Package size={20} className="text-primary" />
                      </div>
                      <div>
                        <p className="font-bold">{item.product_name}</p>
                        <p className="text-xs text-gray-400">Qty: {item.quantity} | ₹{item.unit_price}</p>
                      </div>
                    </div>
                    {order.status === 'delivered' || order.status === 'confirmed' ? (
                      <button 
                        onClick={() => setReviewModal({ isOpen: true, productId: item.product_id, productName: item.product_name })}
                        className="text-xs btn-secondary py-2 px-4"
                      >
                        Leave a Review
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Review Modal */}
      {reviewModal.isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="glass-card p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-2">Review Product</h2>
            <p className="text-gray-400 text-sm mb-6">How was your experience with {reviewModal.productName}?</p>
            
            <form onSubmit={submitReview}>
              <div className="mb-6 flex gap-2 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button type="button" key={star} onClick={() => setRating(star)}>
                    <Star size={32} className={`transition-colors ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} />
                  </button>
                ))}
              </div>
              
              <textarea 
                className="input-field w-full h-32 mb-6 resize-none"
                placeholder="Write your review here..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
              />
              
              <div className="flex gap-4">
                <button type="button" className="btn-secondary flex-1 py-3" onClick={() => setReviewModal({ isOpen: false })}>Cancel</button>
                <button type="submit" className="btn-primary flex-1 py-3">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
