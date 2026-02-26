import { Route } from 'react-router-dom'
import { ErrorTrackingPage } from '../../pages/app/@custom/ErrorTrackingPage'

export const customRoutes: React.ReactElement[] = [
  <Route key="error-tracking" path="/app/errors" element={<ErrorTrackingPage />} />,
]
