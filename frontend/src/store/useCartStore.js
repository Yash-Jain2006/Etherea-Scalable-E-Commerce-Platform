import { create } from 'zustand';

export const useCartStore = create((set) => ({
  items: [],
  subtotal: 0,
  shippingFee: 0,
  total: 0,
  itemCount: 0,

  setCart: (data) => set({
    items: data.items,
    subtotal: data.subtotal,
    shippingFee: data.shipping_fee,
    total: data.total,
    itemCount: data.items.reduce((acc, item) => acc + item.quantity, 0)
  }),

  clearCart: () => set({
    items: [],
    subtotal: 0,
    shippingFee: 0,
    total: 0,
    itemCount: 0
  })
}));
