import { Navigate } from 'react-router-dom'
import { useFirebase } from '../../context/Firebase'

const AdminProtectedRoute = ({ children }) => {
  const { currentUser, userRole, loading } = useFirebase()

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Loading...
      </div>
    )
  }

  // If not authenticated or not an admin, redirect to admin login
  if (!currentUser || userRole !== 'admin') {
    return <Navigate to="/login" replace />
  }

  // If authenticated and is admin, render the protected component
  return children
}

export default AdminProtectedRoute
