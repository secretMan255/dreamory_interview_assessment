import { createBrowserRouter, Navigate } from 'react-router-dom';
import LoginPage from '../page/login/login';
import RegisterPage from '../page/login/register'
import AdminLayout from '../layout/admin.layout';
import AdminEventListPage from '../page/admin/adminEventList';
import UserEventListPage from '../page/user/userEventList';
import UserEventDetailPage from '../page/user/userEventDetail';
import { RequireAuth } from '../auth/require.auth';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to='/admin' replace />
  },
  {
    element: <RequireAuth />,
    children: [
      {
        path: '/admin',
        element: <AdminLayout />,
        children: [
          { index: true, element: <AdminEventListPage /> }
        ],
      },
    ],
  },
  {
    path: '/user',
    // element: <AdminLayout />,
    children: [
      { index: true, element: <UserEventListPage /> },
      { path: 'events/:id', element: <UserEventDetailPage /> }
    ]
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />
  }
])