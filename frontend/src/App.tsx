import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ThemeProvider } from './context/ThemeContext';
import { TravelSettingsProvider } from './context/TravelSettingsContext';
import { TravellersProvider } from './context/TravellersContext';
import { TripBuilderProvider } from './context/TripBuilderContext';
import { AppRouter } from './routes/AppRouter';
import { AIAssistantWidget } from './components/AI/AIAssistantWidget';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <TravelSettingsProvider>
          <TravellersProvider>
            <CartProvider>
              <WishlistProvider>
                <TripBuilderProvider>
                  <BrowserRouter>
                    <AppRouter />
                    <AIAssistantWidget />
                  </BrowserRouter>
                </TripBuilderProvider>
              </WishlistProvider>
            </CartProvider>
          </TravellersProvider>
        </TravelSettingsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
