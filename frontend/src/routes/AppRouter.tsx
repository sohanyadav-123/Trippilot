import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from '../components/Layout/Layout';
import { Home } from '../pages/Home';
import { FlightResults } from '../pages/FlightResults';
import { HotelResults } from '../pages/HotelResults';
import { DestinationPage } from '../pages/DestinationPage';
import { DestinationsList } from '../pages/DestinationsList';
import { ActivitiesList } from '../pages/ActivitiesList';
import { HiddenGems } from '../pages/HiddenGems';
import { RestaurantsList } from '../pages/RestaurantsList';
import { AgencyPortal } from '../pages/Agency/AgencyPortal';
import { Wishlist } from '../pages/Wishlist';
import { AIPlanner } from '../pages/AIPlanner';
import { ItineraryPage } from '../pages/ItineraryPage';
import { BudgetTracker } from '../pages/BudgetTracker';
import { Cart } from '../pages/Cart';
import { Payment } from '../pages/Payment';
import { BookingConfirmation } from '../pages/BookingConfirmation';
import { MyBookings } from '../pages/MyBookings';
import { Login } from '../pages/Login';
import { Register } from '../pages/Register';
import { Profile } from '../pages/Profile';
import { AdminDashboard } from '../pages/Admin/AdminDashboard';
import { AdminDestinations } from '../pages/Admin/AdminDestinations';
import { AdminFlights } from '../pages/Admin/AdminFlights';
import { AdminHotels } from '../pages/Admin/AdminHotels';
import { AdminBookings } from '../pages/Admin/AdminBookings';
import { NotFound } from '../pages/NotFound';
import { ProtectedRoute } from './ProtectedRoute';
import { TripBuilderPage } from '../pages/TripBuilder/TripBuilderPage';
import { FlexibleDestinationPage } from '../pages/FlexibleDestinationPage';
import { CheapestDestinationPage } from '../pages/CheapestDestinationPage';
import { CompareTripsPage } from '../pages/CompareTripsPage';
import { NearbyDiscoveryPage } from '../pages/NearbyDiscoveryPage';
import { RestaurantPlannerPage } from '../pages/RestaurantPlannerPage';
import { PackingAssistantPage } from '../pages/PackingAssistantPage';
import { DocumentChecklistPage } from '../pages/DocumentChecklistPage';
import { SharedTripsPage } from '../pages/SharedTripsPage';
import { ExpenseSplitterPage } from '../pages/ExpenseSplitterPage';
import { EmergencyHelpPage } from '../pages/EmergencyHelpPage';
import { TravelInspirationPage } from '../pages/TravelInspirationPage';
import { BeforeYouGoPage } from '../pages/BeforeYouGoPage';
import { NotificationCenterPage } from '../pages/NotificationCenterPage';
import { NotificationSettingsPage } from '../pages/NotificationSettingsPage';
import { TravelPreferencesPage } from '../pages/TravelPreferencesPage';
import { SavedTravellersPage } from '../pages/SavedTravellersPage';
import { ResetPasswordPage } from '../pages/ResetPasswordPage';
import { WeatherPage } from '../pages/WeatherPage';

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Public Routes */}
        <Route index element={<Home />} />
        <Route path="plan" element={<TripBuilderPage />} />
        <Route path="trip-builder" element={<TripBuilderPage />} />
        <Route path="weather" element={<WeatherPage />} />
        <Route path="plan/weather" element={<WeatherPage />} />
        <Route path="before-you-go" element={<BeforeYouGoPage />} />
        <Route path="preparation" element={<BeforeYouGoPage />} />
        <Route path="flexible-destinations" element={<FlexibleDestinationPage />} />
        <Route path="cheapest-destinations" element={<CheapestDestinationPage />} />
        <Route path="compare-trips" element={<CompareTripsPage />} />
        <Route path="nearby" element={<NearbyDiscoveryPage />} />
        <Route path="restaurant-planner" element={<RestaurantPlannerPage />} />
        <Route path="packing-assistant" element={<PackingAssistantPage />} />
        <Route path="documents-checklist" element={<DocumentChecklistPage />} />
        <Route path="shared-trips" element={<SharedTripsPage />} />
        <Route path="expense-splitter" element={<ExpenseSplitterPage />} />
        <Route path="travel-help" element={<EmergencyHelpPage />} />
        <Route path="inspiration" element={<TravelInspirationPage />} />
        <Route path="travel-inspiration" element={<TravelInspirationPage />} />
        <Route path="flights" element={<FlightResults />} />
        <Route path="hotels" element={<HotelResults />} />
        <Route path="destinations" element={<DestinationsList />} />
        <Route path="destinations/:id" element={<DestinationPage />} />
        <Route path="activities" element={<ActivitiesList />} />
        <Route path="hidden-gems" element={<HiddenGems />} />
        <Route path="restaurants" element={<RestaurantsList />} />
        <Route path="agency" element={<AgencyPortal />} />
        <Route path="wishlist" element={<Wishlist />} />
        <Route path="ai-planner" element={<AIPlanner />} />
        <Route path="itinerary" element={<ItineraryPage />} />
        <Route path="budget" element={<BudgetTracker />} />
        <Route path="cart" element={<Cart />} />
        <Route path="payment" element={<Payment />} />
        <Route path="booking-confirmation/:id" element={<BookingConfirmation />} />
        <Route path="booking/confirmation/:id" element={<BookingConfirmation />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />
        <Route path="forgot-password" element={<Login />} />

        <Route path="notifications" element={<NotificationCenterPage />} />
        <Route path="notification-settings" element={<NotificationSettingsPage />} />
        <Route path="travel-preferences" element={<TravelPreferencesPage />} />
        <Route path="saved-travellers" element={<SavedTravellersPage />} />
        <Route path="my-trips" element={<MyBookings />} />

        {/* User Protected Routes */}
        <Route
          path="my-bookings"
          element={
            <ProtectedRoute>
              <MyBookings />
            </ProtectedRoute>
          }
        />
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Admin Protected Routes */}
        <Route
          path="admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/destinations"
          element={
            <ProtectedRoute adminOnly>
              <AdminDestinations />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/flights"
          element={
            <ProtectedRoute adminOnly>
              <AdminFlights />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/hotels"
          element={
            <ProtectedRoute adminOnly>
              <AdminHotels />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/bookings"
          element={
            <ProtectedRoute adminOnly>
              <AdminBookings />
            </ProtectedRoute>
          }
        />

        {/* 404 Fallback */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};
