import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

import HomeView from '../views/public/HomeView.vue'
import LoginView from '../views/auth/LoginView.vue'
import RegisterView from '../views/auth/RegisterView.vue'
import MainLayout from '../layouts/MainLayout.vue'

import DashboardView from '../views/dashboard/DashboardView.vue'
import BookListView from '../views/books/BookListView.vue'
import BorrowListView from '../views/borrows/BorrowListView.vue'
import BorrowCreateView from '../views/borrows/BorrowCreateView.vue'
import ReaderListView from '../views/readers/ReaderListView.vue'
import FineListView from '../views/borrows/FineListView.vue'
import OverdueListView from '../views/borrows/OverdueListView.vue'

import MyBorrowHistoryView from '../views/reader/MyBorrowHistoryView.vue'
import MyLibraryCardView from '../views/reader/MyLibraryCardView.vue'

const routes = [
  {
    path: '/',
    component: HomeView
  },
  {
    path: '/login',
    component: LoginView
  },
  {
    path: '/register',
    component: RegisterView
  },
  {
    path: '/app',
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/app/books'
      },
      {
        path: 'dashboard',
        component: DashboardView,
        meta: { roles: ['Admin', 'Librarian'] }
      },
      {
        path: 'books',
        component: BookListView,
        meta: { roles: ['Admin', 'Librarian', 'Reader'] }
      },
      {
        path: 'readers',
        component: ReaderListView,
        meta: { roles: ['Admin', 'Librarian'] }
      },
      {
        path: 'borrows',
        component: BorrowListView,
        meta: { roles: ['Admin', 'Librarian'] }
      },
      {
        path: 'borrow-create',
        component: BorrowCreateView,
        meta: { roles: ['Admin', 'Librarian'] }
      },
      {
        path: 'overdue',
        component: OverdueListView,
        meta: { roles: ['Admin', 'Librarian'] }
      },
      {
        path: 'fines',
        component: FineListView,
        meta: { roles: ['Admin', 'Librarian'] }
      },
      {
        path: 'my-borrows',
        component: MyBorrowHistoryView,
        meta: { roles: ['Reader'] }
      },
      {
        path: 'my-card',
        component: MyLibraryCardView,
        meta: { roles: ['Reader'] }
      }
    ]
  },

  // redirect đường dẫn cũ nếu trước đó bạn đã dùng
  {
    path: '/dashboard',
    redirect: '/app/dashboard'
  },
  {
    path: '/books',
    redirect: '/app/books'
  },
  {
    path: '/readers',
    redirect: '/app/readers'
  },
  {
    path: '/borrows',
    redirect: '/app/borrows'
  },
  {
    path: '/borrow-create',
    redirect: '/app/borrow-create'
  },
  {
    path: '/overdue',
    redirect: '/app/overdue'
  },
  {
    path: '/fines',
    redirect: '/app/fines'
  },
  {
    path: '/my-borrows',
    redirect: '/app/my-borrows'
  },
  {
    path: '/my-card',
    redirect: '/app/my-card'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return '/login'
  }

  const matchedAuthRoute = to.matched.find(route => route.meta.requiresAuth)

  if (matchedAuthRoute && !auth.isLoggedIn) {
    return '/login'
  }

  if ((to.path === '/login' || to.path === '/register') && auth.isLoggedIn) {
    if (['Admin', 'Librarian'].includes(auth.role)) {
      return '/app/dashboard'
    }

    return '/app/books'
  }

  if (to.meta.roles && !to.meta.roles.includes(auth.role)) {
    return '/app/books'
  }
})

export default router