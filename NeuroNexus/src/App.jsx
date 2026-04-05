import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './styles/theme.css'
import './App.css'

// Protected Route Components
import AdminProtectedRoute from './components/ProtectedRoute/AdminProtectedRoute'
import LabProtectedRoute from './components/ProtectedRoute/LabProtectedRoute'

// Landing Page
import LandingPage from './pages/Landing/LandingPage'

// Admin Pages
import Login from './pages/admin/Auth/Login'
import AdminForgetPassword from './pages/admin/Auth/ForgetPassword'
import AdminDashboard from './pages/admin/Dashboard/AdminDashboard'
import PendingLabs from './pages/admin/Labs/PendingLabs'
import ApprovedLabs from './pages/admin/Labs/ApprovedLabs'
import LabDetails from './pages/admin/Labs/LabDetails'
import PendingDoctors from './pages/admin/Doctors/PendingDoctors'
import ApprovedDoctors from './pages/admin/Doctors/ApprovedDoctors'
import DoctorDetails from './pages/admin/Doctors/DoctorDetails'
import ManageCategories from './pages/admin/Doctors/ManageCategories'
import AllPatients from './pages/admin/Patients/AllPatients'
import AllBookings from './pages/admin/Bookings/AllBookings'
import AllPayments from './pages/admin/Payments/AllPayments'
import PaymentDetails from './pages/admin/Payments/PaymentDetails'
import ComplaintsList from './pages/admin/Complains/ComplaintsList'
import ComplaintDetails from './pages/admin/Complains/ComplaintDetails'
import Notifications from './pages/admin/Notifications/Notifications'
import Settings from './pages/admin/Profile/Settings'
import AdminProfile from './pages/admin/Profile/AdminProfile'

// Lab Pages
import LabLogin from './pages/Lab/Auth/Login'
import LabSignup from './pages/Lab/Auth/Signup'
import LabForgetPassword from './pages/Lab/Auth/ForgetPassword'
import LabDashboard from './pages/Lab/Dashboard/LabDashboard'
import TestList from './pages/Lab/Test/TestList'
import AddTest from './pages/Lab/Test/AddTest'
import EditTest from './pages/Lab/Test/EditTest'
import LabBookings from './pages/Lab/Bookings/LabBookings'
import LabBookingDetails from './pages/Lab/Bookings/LabBookingDetails'
import LabReports from './pages/Lab/Reports/LabReports'
import LabPayments from './pages/Lab/Payments/LabPayments'
import SubmitComplaint from './pages/Lab/Complaints/SubmitComplaint'
import LabNotifications from './pages/Lab/Notifications/LabNotifications'
import LabProfile from './pages/Lab/Profile/LabProfile'
import LabSettings from './pages/Lab/Profile/LabSettings'

function App() {
  return (
    <Router>
      <Routes>
        {/* Default Route - Landing Page */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Admin Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin/forget-password" element={<AdminForgetPassword />} />
        <Route path="/dashboard" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
        <Route path="/labs/pending" element={<AdminProtectedRoute><PendingLabs /></AdminProtectedRoute>} />
        <Route path="/labs/approved" element={<AdminProtectedRoute><ApprovedLabs /></AdminProtectedRoute>} />
        <Route path="/labs/:id" element={<AdminProtectedRoute><LabDetails /></AdminProtectedRoute>} />
        <Route path="/labs" element={<Navigate to="/labs/pending" replace />} />
        <Route path="/doctors/pending" element={<AdminProtectedRoute><PendingDoctors /></AdminProtectedRoute>} />
        <Route path="/doctors/approved" element={<AdminProtectedRoute><ApprovedDoctors /></AdminProtectedRoute>} />
        <Route path="/doctors/categories" element={<AdminProtectedRoute><ManageCategories /></AdminProtectedRoute>} />
        <Route path="/doctors/:id" element={<AdminProtectedRoute><DoctorDetails /></AdminProtectedRoute>} />
        <Route path="/doctors" element={<Navigate to="/doctors/pending" replace />} />
        <Route path="/patients" element={<AdminProtectedRoute><AllPatients /></AdminProtectedRoute>} />
        <Route path="/bookings" element={<AdminProtectedRoute><AllBookings /></AdminProtectedRoute>} />
        <Route path="/payments" element={<AdminProtectedRoute><AllPayments /></AdminProtectedRoute>} />
        <Route path="/payments/:id" element={<AdminProtectedRoute><PaymentDetails /></AdminProtectedRoute>} />
        <Route path="/complaints" element={<AdminProtectedRoute><ComplaintsList /></AdminProtectedRoute>} />
        <Route path="/complaints/:id" element={<AdminProtectedRoute><ComplaintDetails /></AdminProtectedRoute>} />
        <Route path="/notifications" element={<AdminProtectedRoute><Notifications /></AdminProtectedRoute>} />
        <Route path="/settings" element={<AdminProtectedRoute><Settings /></AdminProtectedRoute>} />
        <Route path="/profile" element={<AdminProtectedRoute><AdminProfile /></AdminProtectedRoute>} />

        {/* Lab Routes */}
        <Route path="/lab/login" element={<LabLogin />} />
        <Route path="/lab/signup" element={<LabSignup />} />
        <Route path="/lab/forget-password" element={<LabForgetPassword />} />
        <Route path="/lab/dashboard" element={<LabProtectedRoute><LabDashboard /></LabProtectedRoute>} />
        <Route path="/lab/tests" element={<LabProtectedRoute><TestList /></LabProtectedRoute>} />
        <Route path="/lab/tests/add" element={<LabProtectedRoute><AddTest /></LabProtectedRoute>} />
        <Route path="/lab/tests/edit/:id" element={<LabProtectedRoute><EditTest /></LabProtectedRoute>} />
        <Route path="/lab/bookings" element={<LabProtectedRoute><LabBookings /></LabProtectedRoute>} />
        <Route path="/lab/bookings/:id" element={<LabProtectedRoute><LabBookingDetails /></LabProtectedRoute>} />
        <Route path="/lab/reports" element={<LabProtectedRoute><LabReports /></LabProtectedRoute>} />
        <Route path="/lab/payments" element={<LabProtectedRoute><LabPayments /></LabProtectedRoute>} />
        <Route path="/lab/complaints" element={<LabProtectedRoute><SubmitComplaint /></LabProtectedRoute>} />
        <Route path="/lab/notifications" element={<LabProtectedRoute><LabNotifications /></LabProtectedRoute>} />
        <Route path="/lab/profile" element={<LabProtectedRoute><LabProfile /></LabProtectedRoute>} />
        <Route path="/lab/settings" element={<LabProtectedRoute><LabSettings /></LabProtectedRoute>} />
      </Routes>
    </Router>
  )
}

export default App
