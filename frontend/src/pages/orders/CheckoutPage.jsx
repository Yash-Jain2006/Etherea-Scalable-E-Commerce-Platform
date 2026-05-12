import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, CreditCard, ChevronRight, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { orderApi } from '../../api/api';
import { useCartStore } from '../../store/useCartStore';
import { motion, AnimatePresence } from 'framer-motion';

const CheckoutPage = () => {
  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment
  const [formData, setFormData] = useState({
    shipping_address: {
      full_name: '',
      address_line: '',
      city: '',
      state: '',
      zip_code: ''
    },
    payment_method: 'card'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { total, clearCart } = useCartStore();
  const navigate = useNavigate();

  const handleNext = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const handlePlaceOrder = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await orderApi.checkout(formData);
      clearCart();
      navigate(`/order-success/${response.data.order.id}`);
    } catch (err) {
      setError(err.message || 'Payment failed. Please try again.');
      setStep(2);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Progress Stepper */}
      <div className="flex items-center justify-center gap-4 mb-12">
        <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary' : 'text-gray-500'}`}>
          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold ${step >= 1 ? 'border-primary bg-primary/10' : 'border-gray-700'}`}>1</div>
          <span className="text-sm font-bold">Shipping</span>
        </div>
        <div className="w-12 h-px bg-gray-700" />
        <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary' : 'text-gray-500'}`}>
          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold ${step >= 2 ? 'border-primary bg-primary/10' : 'border-gray-700'}`}>2</div>
          <span className="text-sm font-bold">Payment</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Form Area */}
        <div className="md:col-span-2">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.form 
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleNext}
                className="space-y-6"
              >
                <div className="glass-card p-8">
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <MapPin className="text-primary" size={20} /> Shipping Details
                  </h2>
                  <div className="space-y-4">
                    <input
                      required
                      placeholder="Receiver Name"
                      className="input-field"
                      value={formData.shipping_address.full_name}
                      onChange={(e) => setFormData({...formData, shipping_address: {...formData.shipping_address, full_name: e.target.value}})}
                    />
                    <input
                      required
                      placeholder="Street Address"
                      className="input-field"
                      value={formData.shipping_address.address_line}
                      onChange={(e) => setFormData({...formData, shipping_address: {...formData.shipping_address, address_line: e.target.value}})}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        required
                        placeholder="City"
                        className="input-field"
                        value={formData.shipping_address.city}
                        onChange={(e) => setFormData({...formData, shipping_address: {...formData.shipping_address, city: e.target.value}})}
                      />
                      <input
                        required
                        placeholder="State"
                        className="input-field"
                        value={formData.shipping_address.state}
                        onChange={(e) => setFormData({...formData, shipping_address: {...formData.shipping_address, state: e.target.value}})}
                      />
                    </div>
                    <input
                      required
                      placeholder="ZIP / Postal Code"
                      className="input-field"
                      value={formData.shipping_address.zip_code}
                      onChange={(e) => setFormData({...formData, shipping_address: {...formData.shipping_address, zip_code: e.target.value}})}
                    />
                  </div>
                </div>
                <button type="submit" className="btn-primary w-full py-4 flex items-center justify-center gap-2">
                  Continue to Payment <ChevronRight size={20} />
                </button>
              </motion.form>
            ) : (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="glass-card p-8">
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <CreditCard className="text-primary" size={20} /> Payment Method
                  </h2>
                  
                  {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 flex items-center gap-3">
                      <AlertCircle size={20} />
                      <span className="text-sm">{error}</span>
                    </div>
                  )}

                  <div className="space-y-3">
                    {['card', 'upi', 'cod'].map((method) => (
                      <label 
                        key={method}
                        className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.payment_method === method ? 'border-primary bg-primary/5' : 'border-white/5 hover:border-white/20'}`}
                      >
                        <div className="flex items-center gap-3">
                          <input 
                            type="radio" 
                            className="w-4 h-4 text-primary"
                            checked={formData.payment_method === method}
                            onChange={() => setFormData({...formData, payment_method: method})}
                          />
                          <span className="font-medium uppercase">{method}</span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {method === 'card' ? 'Visa/Mastercard' : method === 'upi' ? 'PhonePe/GPay' : 'Pay at doorstep'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setStep(1)} className="btn-secondary flex-1 py-4">Back</button>
                  <button 
                    onClick={handlePlaceOrder}
                    disabled={isLoading}
                    className="btn-primary flex-[2] py-4 flex items-center justify-center gap-2"
                  >
                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : `Pay ₹${total.toLocaleString()}`}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar Summary */}
        <div className="md:col-span-1">
          <div className="glass-card p-6">
            <h3 className="font-bold mb-4">Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-400">
                <span>Items total</span>
                <span className="text-white">₹{total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Shipping</span>
                <span className="text-green-500">FREE</span>
              </div>
              <div className="h-px bg-white/5 my-4" />
              <div className="flex justify-between text-lg font-bold">
                <span>To Pay</span>
                <span className="text-primary">₹{total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
