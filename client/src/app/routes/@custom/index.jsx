import { Route } from 'react-router-dom'
import { BrixDashboardPage } from '../../pages/app/@custom/BrixDashboardPage'
import { PageEditorPage } from '../../pages/app/@custom/PageEditorPage'
import { TemplatesPage } from '../../pages/app/@custom/TemplatesPage'
import { AnalyticsPage } from '../../pages/app/@custom/AnalyticsPage'

export const customRoutes = [
  <Route key="brix-dashboard" path="/app/pages" element={<BrixDashboardPage />} />,
  <Route key="brix-editor" path="/app/editor/:pageId" element={<PageEditorPage />} />,
  <Route key="brix-editor-new" path="/app/editor/new" element={<PageEditorPage />} />,
  <Route key="brix-templates" path="/app/templates" element={<TemplatesPage />} />,
  <Route key="brix-analytics" path="/app/analytics" element={<AnalyticsPage />} />,
]
