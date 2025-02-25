interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  // Always return children, bypassing authentication
  return <>{children}</>
}
