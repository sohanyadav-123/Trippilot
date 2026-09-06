import React, { createContext, useContext, useState, useEffect } from 'react';
import { Flight, Hotel, SelectedItem } from '../types';

export interface CartFlightItem {
  type: 'flight';
  item: Flight;
  passengers: number;
  subtotal: number;
}

export interface CartHotelItem {
  type: 'hotel';
  item: Hotel;
  nights: number;
  rooms: number;
  subtotal: number;
}

export type CartItemUnion = CartFlightItem | CartHotelItem;

interface CartContextType {
  items: CartItemUnion[];
  addFlight: (flight: Flight, passengers?: number) => void;
  addHotel: (hotel: Hotel, nights?: number, rooms?: number) => void;
  removeItem: (index: number) => void;
  clearCart: () => void;
  totalAmount: number;
  itemCount: number;
  toSelectedItems: () => SelectedItem[];
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItemUnion[]>(() => {
    const saved = localStorage.getItem('trippilot_cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('trippilot_cart', JSON.stringify(items));
  }, [items]);

  const addFlight = (flight: Flight, passengers = 1) => {
    const newItem: CartFlightItem = {
      type: 'flight',
      item: flight,
      passengers,
      subtotal: flight.price * passengers,
    };
    setItems((prev) => [...prev.filter((i) => !(i.type === 'flight' && i.item.id === flight.id)), newItem]);
  };

  const addHotel = (hotel: Hotel, nights = 1, rooms = 1) => {
    const newItem: CartHotelItem = {
      type: 'hotel',
      item: hotel,
      nights,
      rooms,
      subtotal: hotel.price_per_night * nights * rooms,
    };
    setItems((prev) => [...prev.filter((i) => !(i.type === 'hotel' && i.item.id === hotel.id)), newItem]);
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem('trippilot_cart');
  };

  const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);
  const itemCount = items.length;

  const toSelectedItems = (): SelectedItem[] => {
    return items.map((cartItem) => {
      if (cartItem.type === 'flight') {
        return {
          type: 'flight',
          id: cartItem.item.id,
          quantity: cartItem.passengers,
        };
      } else {
        return {
          type: 'hotel',
          id: cartItem.item.id,
          nights: cartItem.nights,
          rooms: cartItem.rooms,
          quantity: cartItem.nights * cartItem.rooms,
        };
      }
    });
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addFlight,
        addHotel,
        removeItem,
        clearCart,
        totalAmount,
        itemCount,
        toSelectedItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
