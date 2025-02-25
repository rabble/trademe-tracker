import { useState } from 'react'

// Mock user data
const mockUser = {
  id: 'mock-user-id',
  email: 'user@example.com'
}

export function useAuth() {
  // Always return a mock user and not loading
  const [user] = useState(mockUser)
  const [loading] = useState(false)

  return { user, loading }
}
