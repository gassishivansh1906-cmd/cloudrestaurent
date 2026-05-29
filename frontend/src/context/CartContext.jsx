import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    const stored = localStorage.getItem('cr_cart');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem('cr_cart', JSON.stringify(items));
  }, [items]);

  function add(item) {
    setItems((prev) => {
      const existing = prev.find((i) => i.Id === item.Id);
      if (existing) {
        return prev.map((i) => (i.Id === item.Id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  }

  function remove(id) {
    setItems((prev) => prev.filter((i) => i.Id !== id));
  }

  function setQuantity(id, quantity) {
    if (quantity <= 0) return remove(id);
    setItems((prev) => prev.map((i) => (i.Id === id ? { ...i, quantity } : i)));
  }

  function clear() {
    setItems([]);
  }

  const total = items.reduce((sum, i) => sum + i.Price * i.quantity, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, add, remove, setQuantity, clear, total, count }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
