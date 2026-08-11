import { useContext } from 'react'
import { AuthContext } from '../context/authContext.js'

function useAuth() {
  const authContext = useContext(AuthContext)

  if (!authContext) {
    throw new Error('useAuth must be used inside an AuthProvider.')
  }

  return authContext
}

export default useAuth
