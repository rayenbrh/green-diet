import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import AdminShell from './components/AdminShell'
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext'
import AnalyticsPage from './pages/AnalyticsPage'
import CategoriesPage from './pages/CategoriesPage'
import CustomerDetailPage from './pages/CustomerDetailPage'
import CustomersPage from './pages/CustomersPage'
import DashboardPage from './pages/DashboardPage'
import LoginPage from './pages/LoginPage'
import OrderDetailPage from './pages/OrderDetailPage'
import OrdersPage from './pages/OrdersPage'
import ProductFormPage from './pages/ProductFormPage'
import ProductsPage from './pages/ProductsPage'

function Guard({ children }) {
  const { loading, isAuthenticated } = useAdminAuth()
  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#f4f6f3]">
        <div className="h-10 w-10 animate-pulse rounded-full bg-[rgba(74,124,89,0.2)]" />
      </div>
    )
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

function AdminRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <Guard>
            <AdminShell />
          </Guard>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="orders/:id" element={<OrderDetailPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/new" element={<ProductFormPage />} />
        <Route path="products/:id" element={<ProductFormPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="customers/:id" element={<CustomerDetailPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AdminAuthProvider>
      <BrowserRouter basename="/admin">
        <Toaster position="top-right" toastOptions={{ className: 'font-sans text-sm' }} />
        <AdminRoutes />
      </BrowserRouter>
    </AdminAuthProvider>
  )
}
