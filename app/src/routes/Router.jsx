import { Suspense, lazy } from "react";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import ProtectedRoute from "../guards/protected-routes";
import Loader from "../components/loader";
import AddEditEvent from "../pages/Events/form";

// Lazy loaded components
const Layout = lazy(() => import("../components/Layout")); // MiniDrawer
const Home = lazy(() => import("../pages/Home"));
const Login = lazy(() => import("../pages/Login"));
const Activity = lazy(() => import("../pages/Activity"));
const Users = lazy(() => import("../pages/Users"));
const Accounts = lazy(() => import("../pages/Accounts"));
const Events = lazy(() => import("../pages/Events"));
const Birthday = lazy(() => import("../pages/Birthday"));

const router = createBrowserRouter([
  {
    path: "/", element: ( <ProtectedRoute> <Layout /> </ProtectedRoute> ),
    errorElement: <div>404! Page not found</div>,
    children: [
      { index: true, element: <Navigate to="/birthday" replace />, },
      // { path: "/", element: <Home />, },
      { path: "birthday", element: <Birthday />, },
      { path: "events", children: [
        { index: true, element: <Events />, },
        { path: "form", element: <AddEditEvent />, },

      ]},


      { path: "activity", element: <Activity />, },
      { path: "users", element: <Users />, },
      { path: "accounts", element: <Accounts />, },


    ],
  },
  { path: "/login", element: <Login />, },
]);

const Router = () => {
  return (
    <Suspense fallback={<Loader />}>
      <RouterProvider router={router} />
    </Suspense>
  );
};

export default Router;
