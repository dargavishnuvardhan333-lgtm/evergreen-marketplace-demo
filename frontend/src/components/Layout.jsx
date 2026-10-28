import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '../context/StoreContext.jsx';
import { categoryLabel } from '../services/products.js';
import { API_ENABLED } from '../services/api.js';

export default function Layout() {
  const { user, cartCount, wishlistCount, products, signOut } = useStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const categories = [...new Set(products.map((product) => product.category))].sort();

  useEffect(() => {
    setQuery(searchParams.get('q') || '');
  }, [searchParams]);

  function logout() {
    signOut();
    navigate('/');
  }

  function search(event) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    const queryString = params.toString();
    navigate(`/shop${queryString ? `?${queryString}` : ''}`);
  }

  return (
    <div className="site-shell">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <div className="announcement"><span className="announcement-mark" aria-hidden="true">✳</span> Discover everyday favorites <span className="announcement-divider">·</span> Sample products from DummyJSON</div>
      <header className="site-header">
        <Link className="brand" to="/" aria-label="Evergreen home">evergreen<span>.</span><small>EVERYDAY, ELEVATED</small></Link>
        <nav className="main-nav" aria-label="Main navigation">
          <NavLink to="/shop">Shop</NavLink>
          <Link to="/#featured-deals">Deals</Link>
          {user && <NavLink to="/orders">My orders</NavLink>}
          {user?.role === 'admin' && <NavLink to="/admin">Admin</NavLink>}
        </nav>
        <form className="header-search" role="search" onSubmit={search}>
          <label className="sr-only" htmlFor="site-search">Search products</label>
          <input id="site-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products, brands and more" />
          <button type="submit" aria-label="Search">⌕</button>
        </form>
        <div className="header-actions">
          {user ? (
            <>
              <Link className="account-link" to="/account">{user.name.split(' ')[0]}</Link>
              <button className="text-button" onClick={logout}>Sign out</button>
            </>
          ) : API_ENABLED && <Link className="account-link" to="/login">Sign in</Link>}
          <Link className="header-icon-link" to="/wishlist" aria-label={`Wishlist, ${wishlistCount} items`}>
            <span aria-hidden="true">♡</span><span className="header-icon-label">Wishlist</span><span className="header-count">{wishlistCount}</span>
          </Link>
          <Link className="header-icon-link" to="/cart" aria-label={`Shopping cart, ${cartCount} items`}>
            <span aria-hidden="true">🛒</span><span className="header-icon-label">Cart</span><span className="header-count">{cartCount}</span>
          </Link>
        </div>
      </header>
      <nav className="category-nav" aria-label="Shop by category">
        <Link to="/shop">All products</Link>
        {categories.map((category) => (
          <Link key={category} to={`/shop?category=${encodeURIComponent(category)}`}>{categoryLabel(category)}</Link>
        ))}
      </nav>
      <main id="main-content"><Outlet /></main>
      <footer className="site-footer">
        <div className="footer-about"><Link className="brand footer-brand" to="/">evergreen<span>.</span></Link><p>Considered essentials for a life well lived.</p></div>
        <nav className="footer-links" aria-label="Footer navigation"><Link to="/shop">Shop all</Link>{API_ENABLED && <Link to="/account">Your account</Link>}<Link to="/cart">Your bag</Link></nav>
        <span className="footer-copyright">© {new Date().getFullYear()} Evergreen. Made for the everyday.</span>
      </footer>
    </div>
  );
}
