import React from 'react'
import { Routes, Route, Navigate, useParams } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import Businesses from './pages/Businesses'
import Feed from './pages/Feed'
import Settings from './pages/Settings'
import CommitteeMembers from './pages/CommitteeMembers'
import Roles from './pages/Roles'
import ContentPage from './pages/ContentPage'
import MasterPage from './pages/MasterPage'
import News from './pages/News'

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
          <Route index element={<Dashboard />} />
          <Route path="committee" element={<CommitteeMembers />} />
          <Route path="roles" element={<Roles />} />
          <Route path="users" element={<Users />} />
          <Route path="festivals" element={<ContentPage type="festivals" />} />
          <Route path="events" element={<ContentPage type="events" />} />
          <Route path="gallery" element={<ContentPage type="gallery" />} />
          <Route path="banners" element={<ContentPage type="banners" />} />
          <Route path="businesses" element={<Businesses />} />
          <Route path="posts" element={<Feed />} />
          <Route path="news" element={<News />} />

          <Route path="contact-inquiries" element={<ContentPage type="inquiries" />} />
          <Route path="masters/:type" element={<MasterRoute />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}

function MasterRoute() {
  const { type } = useParams()
  return <MasterPage type={type} />
}
