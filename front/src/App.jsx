import React, { useContext } from 'react'
import { Routes, Route, Navigate, useParams } from 'react-router-dom'
import { AuthContext, AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import Businesses from './pages/Businesses'
import Students from './pages/Students'
import Donations from './pages/Donations'
import Posts from './pages/posts'
import Settings from './pages/Settings'
import CommitteeMembers from './pages/CommitteeMembers'
import Roles from './pages/Roles'
import ContentPage from './pages/ContentPage'
import MasterPage from './pages/MasterPage'
import News from './pages/News'
import { hasPermission } from './lib/permissions'
import Posts from './pages/Post'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<PermissionRoute permission="dashboard.view"><Dashboard /></PermissionRoute>} />
          <Route path="committee" element={<PermissionRoute permission="committee.list"><CommitteeMembers /></PermissionRoute>} />
          <Route path="roles" element={<PermissionRoute permission="roles.list"><Roles /></PermissionRoute>} />
          <Route path="users" element={<PermissionRoute permission="members.list"><Users /></PermissionRoute>} />
          <Route path="festivals" element={<PermissionRoute permission="festivals.list"><ContentPage type="festivals" /></PermissionRoute>} />
          <Route path="events" element={<PermissionRoute permission="events.list"><ContentPage type="events" /></PermissionRoute>} />
          <Route path="gallery" element={<PermissionRoute permission="gallery.list"><ContentPage type="gallery" /></PermissionRoute>} />
          <Route path="banners" element={<PermissionRoute permission="banners.list"><ContentPage type="banners" /></PermissionRoute>} />
          <Route path="businesses" element={<PermissionRoute permission="businesses.list"><Businesses /></PermissionRoute>} />
          <Route path="students" element={<PermissionRoute permission="students.list"><Students /></PermissionRoute>} />
          <Route path="donations" element={<PermissionRoute permission="donations.list"><Donations /></PermissionRoute>} />
          <Route path="posts" element={<PermissionRoute permission="posts.list"><Posts /></PermissionRoute>} />
          <Route path="news" element={<PermissionRoute permission="news.list"><News /></PermissionRoute>} />

          <Route path="contact-inquiries" element={<PermissionRoute permission="contact-inquiries.list"><ContentPage type="inquiries" /></PermissionRoute>} />
          <Route path="masters/:type" element={<MasterRoute />} />
          <Route path="settings" element={<PermissionRoute permission="settings.edit"><Settings /></PermissionRoute>} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}

function MasterRoute() {
  const { type } = useParams()
  const permission = `${type === 'business' ? 'businesses' : type}.list`
  return <PermissionRoute permission={permission}><MasterPage type={type} /></PermissionRoute>
}

function PermissionRoute({ permission, children }) {
  const { user } = useContext(AuthContext)

  if (!hasPermission(user, permission)) {
    return (
      <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-6 text-sm text-rose-200">
        You do not have permission to access this page.
      </div>
    )
  }

  return children
}
