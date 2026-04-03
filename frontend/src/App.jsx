import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ProtectedRoute from './routes/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import Inventory from './pages/admin/Inventory'; // <-- Import the new page
import MedicineDetail from './pages/admin/MedicineDetail';
import Restock from './pages/admin/Restock';
import ScrollToTop from './components/ScrollToTop';
import UserManagement from './pages/admin/UserManagement';

function App() {
  return (
    <Router>
      <div className="font-sans text-gray-900">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Inventory /> {/* <-- Replace the placeholder here */}
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/medicine/:id" 
            element={<ProtectedRoute><DashboardLayout><MedicineDetail /></DashboardLayout></ProtectedRoute>} 
          />
          
          <Route path="/orders" element={<ProtectedRoute><DashboardLayout><div>Orders Page</div></DashboardLayout></ProtectedRoute>} />

          <Route path="/history" element={<ProtectedRoute><DashboardLayout><div>History Page</div></DashboardLayout></ProtectedRoute>} />


          <Route path="/restock" element={<ProtectedRoute><DashboardLayout><Restock /></DashboardLayout></ProtectedRoute>} />

        <Route path="/users" element={<ProtectedRoute><DashboardLayout><UserManagement /></DashboardLayout></ProtectedRoute>} />
        </Routes>

        <ScrollToTop />
      </div>
    </Router>
  );
}

export default App;