import { Routes, Route } from "react-router-dom";
import Signup from "./components/auth/Signup";
import Login from "./components/auth/Login";
import Layout from "./components/utils/Layout";
import DashboardContent from "./components/dashboard/DashboardContent";
import BusesPage from "./pages/BusesPage";
import AdminRegistrationPage from "./pages/AdminRegistrationPage";
import BusRoutes from "./pages/BusRoutes";
import Companies from "./pages/Companies";
import PaymentPage from "./pages/PaymentPage";
import ProtectedRoute from "./components/utils/ProtectedRoute";
import AddBusFormPage from "./pages/AddBusFormPage";
import DriverMap from "./components/gps/MapView";
import ScannerPage from "./pages/ScannerPage";
import BookingPage from "./pages/BookingPage";
import UserTablePage from "./pages/UserTablePage";
import DriverRegistrationPage from "./pages/DriverRegistrationPage";
import RouteFormPage from "./pages/RouteFormPage";
import NotFoundPage from "./pages/NotFoundPage";
import VehiclesPage from "./pages/VehiclesPages";
import VehiclesFormPage from "./pages/VehiclesFormPage";
import DriversPage from "./pages/DriversPage";
import DriverMapNavigation from "./components/gps/DriverMapNavigation";
import DriverNavigationPage from "./pages/DriverNavigationPage";
import NavigationBusesList from "./components/gps/NavigationBusesList";
import DriversAssignedBuses from "./components/dashboard/DriversAssignedBuses";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute allowedRoles={["admin", "superadmin", "driver"]}>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* HERE THIS ONE COMPONENT */}
          <Route index element={<DashboardContent />}></Route>
          <Route path="/companies" element={<Companies />}></Route>
          <Route path="/buses" element={<BusesPage />}></Route>
          <Route path="/newadmin" element={<AdminRegistrationPage />}></Route>
          <Route
            path="/add-driver"
            element={<DriverRegistrationPage />}
          ></Route>
          <Route
            path="/add-driver/:id"
            element={<DriverRegistrationPage />}
          ></Route>
          <Route path="/drivers" element={<DriversPage />}></Route>
          <Route path="/regusers" element={<UserTablePage />}></Route>
          <Route path="/routes" element={<BusRoutes />}></Route>
          <Route path="/payments" element={<PaymentPage />}></Route>
          <Route path="/vehicles" element={<VehiclesPage />}></Route>
          <Route path="/add-bus" element={<AddBusFormPage />}></Route>
          <Route path="/edit-bus/:id" element={<AddBusFormPage />}></Route>
          <Route path="/map" element={<DriverMap />}></Route>
          <Route
            path="/driver/map/:busId"
            element={<DriverNavigationPage />}
          ></Route>
          <Route path="/scanner" element={<DriversAssignedBuses />}></Route>
          <Route path="/scanner/:id" element={<ScannerPage />}></Route>
          <Route path="/add-vehicle" element={<VehiclesFormPage />}></Route>
          <Route path="/add-vehicle/:id" element={<VehiclesFormPage />}></Route>
          <Route path="/add-route" element={<RouteFormPage />}></Route>
          <Route path="/add-route/:id" element={<RouteFormPage />}></Route>
          <Route path="/navigation" element={<NavigationBusesList />}></Route>
          <Route path="*" element={<NotFoundPage />} />
          <Route
            path="/user/bookings/:userId/:busId"
            element={<BookingPage />}
          ></Route>
        </Route>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </div>
  );
}

export default App;
