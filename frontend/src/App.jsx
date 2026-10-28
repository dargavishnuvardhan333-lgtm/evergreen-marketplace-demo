import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import RequireAuth from './components/RequireAuth.jsx';
import Account from './pages/Account.jsx';
import Admin from './pages/Admin.jsx';
import Auth from './pages/Auth.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import Home from './pages/Home.jsx';
import { OrderDetail, OrderHistory } from './pages/Orders.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import Shop from './pages/Shop.jsx';
import Wishlist from './pages/Wishlist.jsx';

function NotFound() {
  return <section className="page-container empty-state"><p className="eyebrow">A WRONG TURN, MAYBE</p><h1>This page took <em>a detour.</em></h1><a className="button button-dark" href="/">Back to the good things</a></section>;
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="shop" element={<Shop />} />
        <Route path="products/:id" element={<ProductDetail />} />
        <Route path="cart" element={<Cart />} />
        <Route path="wishlist" element={<Wishlist />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="login" element={<Auth />} />
        <Route path="register" element={<Auth register />} />
        <Route element={<RequireAuth />}>
          <Route path="account" element={<Account />} />
          <Route path="orders" element={<OrderHistory />} />
          <Route path="orders/:id" element={<OrderDetail />} />
        </Route>
        <Route element={<RequireAuth admin />}>
          <Route path="admin" element={<Admin />} />
        </Route>
        <Route path="not-found" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/not-found" replace />} />
      </Route>
    </Routes>
  );
}
