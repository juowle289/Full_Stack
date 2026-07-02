import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/authStore";

import HomeView from "../views/public/HomeView.vue";
import CatalogView from "../views/public/CatalogView.vue";
import GuideView from "../views/public/GuideView.vue";
import AboutView from "../views/public/AboutView.vue";
import ContactView from "../views/public/ContactView.vue";
import LoginView from "../views/auth/LoginView.vue";
import RegisterView from "../views/auth/RegisterView.vue";
import MainLayout from "../layouts/MainLayout.vue";


import DashboardView from "../views/dashboard/DashboardView.vue";
import BookListView from "../views/books/BookListView.vue";
import BorrowListView from "../views/borrows/BorrowListView.vue";
import BorrowCreateView from "../views/borrows/BorrowCreateView.vue";
import ReaderListView from "../views/readers/ReaderListView.vue";
import FineListView from "../views/borrows/FineListView.vue";
import OverdueListView from "../views/borrows/OverdueListView.vue";
import AccountSettingsView from "../views/shared/AccountSettingsView.vue";
import HelpCenterView from "../views/shared/HelpCenterView.vue";
import AccountsView from "../views/admin/AccountsView.vue";
import ReportsView from "../views/admin/ReportsView.vue";
import SettingsView from "../views/admin/SettingsView.vue";
import MyBorrowHistoryView from "../views/reader/MyBorrowHistoryView.vue";
import MyLibraryCardView from "../views/reader/MyLibraryCardView.vue";
import MyFinesView from "../views/reader/MyFinesView.vue";
import MyCartView from "../views/reader/MyCartView.vue";
import ReaderBrowseView from "../views/reader/ReaderBrowseView.vue";
const routes = [
  {
    path: "/",
    component: HomeView,
  },
  {
    path: "/login",
    component: LoginView,
  },
  {
    path: "/register",
    component: RegisterView,
  },
  {
    path: "/catalog",
    component: CatalogView,
  },
  {
    path: "/guide",
    component: GuideView,
  },
  {
    path: "/about",
    component: AboutView,
  },
  {
    path: "/contact",
    component: ContactView,
  },
  {
    path: "/app",

    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: "",
        redirect: "/app/books",
      },
      {
        path: "dashboard",
        component: DashboardView,
        meta: { roles: ["Admin", "Librarian"] },
      },
      {
        path: "books",
        component: BookListView,
        meta: { roles: ["Admin", "Librarian", "Reader"] },
      },
      {
        path: "readers",
        component: ReaderListView,
        meta: { roles: ["Admin", "Librarian"] },
      },
      {
        path: "borrows",
        component: BorrowListView,
        meta: { roles: ["Admin", "Librarian"] },
      },
      {
        path: "circulation",
        component: BorrowCreateView,
        meta: { roles: ["Admin", "Librarian"] },
      },
      {
        path: "borrow-create",
        redirect: "/app/circulation",
        meta: { roles: ["Admin", "Librarian"] },
      },
      {
        path: "overdue",
        component: OverdueListView,
        meta: { roles: ["Admin", "Librarian"] },
      },
      {
        path: "fines",
        component: FineListView,
        meta: { roles: ["Admin", "Librarian"] },
      },
      {
        path: "accounts",
        component: AccountsView,
        meta: { roles: ["Admin", "Librarian"] },
      },
      {
        path: "reports",
        component: ReportsView,
        meta: { roles: ["Admin", "Librarian"] },
      },
      {
        path: "settings",
        component: SettingsView,
        meta: { roles: ["Admin", "Librarian"] },
      },
      {
        path: "account-settings",
        component: AccountSettingsView,
        meta: { roles: ["Admin", "Librarian", "Reader"] },
      },
      {
        path: "help",
        component: HelpCenterView,
        meta: { roles: ["Admin", "Librarian", "Reader"] },
      },
      {
        path: "browse",
        component: ReaderBrowseView,
        meta: { roles: ["Reader"] },
      },
      {
        path: "my-cart",
        component: MyCartView,
        meta: { roles: ["Reader"] },
      },
      {
        path: "my-borrows",
        component: MyBorrowHistoryView,
        meta: { roles: ["Reader"] },
      },
      {
        path: "my-card",
        component: MyLibraryCardView,
        meta: { roles: ["Reader"] },
      },
      {
        path: "my-fines",
        component: MyFinesView,
        meta: { roles: ["Reader"] },
      },
    ],
  },

  // redirect đường dẫn cũ nếu trước đó bạn đã dùng
  {
    path: "/dashboard",
    redirect: "/app/dashboard",
  },
  {
    path: "/books",
    redirect: "/app/books",
  },
  {
    path: "/readers",
    redirect: "/app/readers",
  },
  {
    path: "/borrows",
    redirect: "/app/borrows",
  },
  {
    path: "/borrow-create",
    redirect: "/app/circulation",
  },
  {
    path: "/overdue",
    redirect: "/app/overdue",
  },
  {
    path: "/fines",
    redirect: "/app/fines",
  },
  {
    path: "/my-borrows",
    redirect: "/app/my-borrows",
  },
  {
    path: "/my-card",
    redirect: "/app/my-card",
  },
  {
    path: "/my-fines",
    redirect: "/app/my-fines",
  },
  {
    path: "/my-cart",
    redirect: "/app/my-cart",
  },
  // catch-all (tránh điều hướng trang trống khi route public không khớp)
  {
    path: "/:pathMatch(.*)*",
    redirect: "/",
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const auth = useAuthStore();

  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return "/login";
  }

  const matchedAuthRoute = to.matched.find((route) => route.meta.requiresAuth);

  if (matchedAuthRoute && !auth.isLoggedIn) {
    return "/login";
  }

  if ((to.path === "/login" || to.path === "/register") && auth.isLoggedIn) {
    if (["Admin", "Librarian"].includes(auth.role)) {
      return "/app/dashboard";
    }

    return "/app/browse";
  }

  if (to.meta.roles && !to.meta.roles.includes(auth.role)) {
    if (["Admin", "Librarian"].includes(auth.role)) {
      return "/app/dashboard";
    }
    if (auth.role === "Reader") {
      return "/app/browse";
    }
    return "/";
  }
});

export default router;
