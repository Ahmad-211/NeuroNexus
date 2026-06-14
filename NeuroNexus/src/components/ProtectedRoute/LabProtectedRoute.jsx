import { Navigate, useLocation } from 'react-router-dom'
import { useFirebase } from '../../context/Firebase'

const LabProtectedRoute = ({ children }) => {
  const { currentUser, userRole, labStatus, loading } = useFirebase()
  const location = useLocation()

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

  if (!currentUser || userRole !== 'lab') {
    return <Navigate to="/lab/login" replace />
  }

  if (labStatus === 'deactivated' && location.pathname !== '/lab/suspended') {
    return <Navigate to="/lab/suspended" replace />
  }

  if (labStatus === 'rejected' && location.pathname !== '/lab/fix-registration') {
    return <Navigate to="/lab/fix-registration" replace />
  }

  return children
}

export default LabProtectedRoute
