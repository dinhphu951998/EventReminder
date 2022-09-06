import { useAuth0 } from '@auth0/auth0-react'
import { Button } from 'react-bootstrap'

export const LogIn = () => {
  const { loginWithRedirect } = useAuth0()

  return (
    <div>
      <h1>Please log in</h1>

      <Button onClick={loginWithRedirect} color="olive">
        Log in
      </Button>
    </div>
  )
}
