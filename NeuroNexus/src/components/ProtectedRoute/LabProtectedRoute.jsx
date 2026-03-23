import { Navigate } from 'react-router-dom'
import { useFirebase } from '../../context/Firebase'

const LabProtectedRoute = ({ children }) => {
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

  // If not authenticated or not a lab, redirect to lab login
  if (!currentUser || userRole !== 'lab') {
    return <Navigate to="/lab/login" replace />
  }

  // If authenticated and is lab, render the protected component
  return children
}

export default LabProtectedRoute
