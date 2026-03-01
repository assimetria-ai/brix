import { Route } from 'react-router-dom'
import { ErrorTrackingPage } from '../../pages/app/@custom/ErrorTrackingPage'
import { CollaboratorsPage } from '../../pages/app/@custom/CollaboratorsPage'
import { BrandSettingsPage } from '../../pages/app/@custom/BrandSettingsPage'
import { ChatbasePage } from '../../pages/app/@custom/ChatbasePage'
import { EmailTrackingPage } from '../../pages/app/@custom/EmailTrackingPage'
import { EmailPreviewPage } from '../../pages/app/@custom/EmailPreviewPage'
import { PageEditorPage } from '../../pages/app/@custom/PageEditorPage'
import { PagesListPage } from '../../pages/app/@custom/PagesListPage'
import { ProductCatalogPage } from '../../pages/app/@custom/ProductCatalogPage'
import { OrdersPage } from '../../pages/app/@custom/OrdersPage'
import { DiscountsPage } from '../../pages/app/@custom/DiscountsPage'
import { PrivateRoute } from '@/app/components/@system/PrivateRoute/PrivateRoute'

// @custom — add your product-specific routes here.
// Wrap with <PrivateRoute> for authenticated pages.
export const customRoutes: React.ReactElement[] = [
  // Brix commerce features
  <Route
    key="product-catalog"
    path="/app/catalog"
    element={
      <PrivateRoute>
        <ProductCatalogPage />
      </PrivateRoute>
    }
  />,
  <Route
    key="orders"
    path="/app/orders"
    element={
      <PrivateRoute>
        <OrdersPage />
      </PrivateRoute>
    }
  />,
  <Route
    key="discounts"
    path="/app/discounts"
    element={
      <PrivateRoute>
        <DiscountsPage />
      </PrivateRoute>
    }
  />,
  // Brix page builder routes (CORE FEATURE)
  <Route
    key="pages-list"
    path="/app/pages"
    element={
      <PrivateRoute>
        <PagesListPage />
      </PrivateRoute>
    }
  />,
  <Route
    key="page-editor"
    path="/app/pages/:id/edit"
    element={
      <PrivateRoute>
        <PageEditorPage />
      </PrivateRoute>
    }
  />,
  <Route
    key="error-tracking"
    path="/app/errors"
    element={
      <PrivateRoute>
        <ErrorTrackingPage />
      </PrivateRoute>
    }
  />,
  <Route
    key="collaborators"
    path="/app/collaborators"
    element={
      <PrivateRoute>
        <CollaboratorsPage />
      </PrivateRoute>
    }
  />,
  <Route
    key="brand-settings"
    path="/app/brand"
    element={
      <PrivateRoute>
        <BrandSettingsPage />
      </PrivateRoute>
    }
  />,
  <Route
    key="chatbase"
    path="/app/chatbase"
    element={
      <PrivateRoute>
        <ChatbasePage />
      </PrivateRoute>
    }
  />,
  <Route
    key="email-tracking"
    path="/app/emails"
    element={
      <PrivateRoute role="admin">
        <EmailTrackingPage />
      </PrivateRoute>
    }
  />,
  <Route
    key="email-preview"
    path="/app/emails/preview"
    element={
      <PrivateRoute role="admin">
        <EmailPreviewPage />
      </PrivateRoute>
    }
  />,
]
