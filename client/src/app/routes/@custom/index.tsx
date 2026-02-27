import { Route } from 'react-router-dom'
import { BrixDashboardPage } from '../../pages/app/@custom/BrixDashboardPage'
import { PageEditorPage } from '../../pages/app/@custom/PageEditorPage'
import { PricingPlansPage } from '../../pages/app/@custom/PricingPlansPage'
import { PricingPage } from '../../pages/static/@custom/PricingPage'

export const customRoutes: React.ReactElement[] = [
  <Route key="brix-dashboard" path="/app/pages" element={<BrixDashboardPage />} />,
  <Route key="page-editor" path="/app/pages/:id/edit" element={<PageEditorPage />} />,
  <Route key="admin-pricing" path="/app/admin/pricing" element={<PricingPlansPage />} />,
  <Route key="pricing" path="/pricing" element={<PricingPage />} />,
]
