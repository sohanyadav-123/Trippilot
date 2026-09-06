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
import { Toaster } from 'react-hot-toast';

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
                    <Toaster
                      position="top-right"
                      toastOptions={{
                        duration: 2800,
                        style: {
                          background: '#0B1220',
                          color: '#FFFFFF',
                          fontSize: '13px',
                          fontWeight: '600',
                          borderRadius: '16px',
                          padding: '12px 18px',
                          boxShadow: '0 16px 36px -4px rgba(0, 0, 0, 0.3)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                        },
                        success: {
                          iconTheme: {
                            primary: '#34D399',
                            secondary: '#0B1220',
                          },
                        },
                        error: {
                          iconTheme: {
                            primary: '#FB7185',
                            secondary: '#0B1220',
                          },
                        },
                      }}
                    />
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
