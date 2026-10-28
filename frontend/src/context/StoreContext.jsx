import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api.js';
import { PRODUCTS_API, priceInRupees } from '../services/products.js';

const StoreContext = createContext(null);
const CART_KEY = 'evergreen-marketplace-cart';
const WISHLIST_KEY = 'evergreen-marketplace-wishlist';

function readCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
    return Array.isArray(saved) ? saved.filter((item) => item?.product?.id
      && Number.isInteger(item.product.stock)
      && item.product.stock > 0
      && Number.isInteger(item.quantity)
      && item.quantity > 0).map((item) => ({
      ...item,
      quantity: Math.min(item.quantity, item.product.stock),
    })) : [];
  } catch {
    return [];
  }
}

function readWishlist() {
  try {
    const saved = JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]');
    return Array.isArray(saved) ? saved.filter((product) => Number.isInteger(product?.id)) : [];
  } catch {
    return [];
  }
}

export function StoreProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(Boolean(sessionStorage.getItem('commers-token')));
  const [cart, setCart] = useState(readCart);
  const [wishlist, setWishlist] = useState(readWishlist);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState('');
  const [productsReload, setProductsReload] = useState(0);

  const loadProducts = useCallback(async (signal) => {
    setProductsLoading(true);
    setProductsError('');
    try {
      const response = await fetch(PRODUCTS_API, { signal });
      if (!response.ok) throw new Error(`Product catalogue request failed (${response.status}).`);
      const data = await response.json();
      if (!Array.isArray(data.products)) throw new Error('The product catalogue returned an invalid response.');
      setProducts(data.products);
    } catch (error) {
      if (error.name !== 'AbortError') setProductsError(error.message || 'Could not load the product catalogue.');
    } finally {
      if (!signal.aborted) setProductsLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadProducts(controller.signal);
    return () => controller.abort();
  }, [loadProducts, productsReload]);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    if (!sessionStorage.getItem('commers-token')) return;
    api('/auth/me')
      .then(({ user: currentUser }) => setUser(currentUser))
      .catch(() => sessionStorage.removeItem('commers-token'))
      .finally(() => setAuthLoading(false));
  }, []);

  async function authenticate(path, values) {
    const data = await api(path, { method: 'POST', body: JSON.stringify(values) });
    sessionStorage.setItem('commers-token', data.token);
    setUser(data.user);
    return data.user;
  }

  function signOut() {
    sessionStorage.removeItem('commers-token');
    setUser(null);
  }

  function addToCart(product, quantity = 1) {
    if (!Number.isInteger(product.stock) || product.stock < 1) return;
    setCart((current) => {
      const found = current.find((line) => line.product.id === product.id);
      if (found) return current.map((line) => line.product.id === product.id
        ? { ...line, product, quantity: Math.min(product.stock, line.quantity + quantity) }
        : line);
      return [...current, { product, quantity: Math.min(product.stock, quantity) }];
    });
  }

  function updateQuantity(id, quantity) {
    setCart((current) => quantity < 1
      ? current.filter((line) => line.product.id !== id)
      : current.map((line) => line.product.id === id
        ? { ...line, quantity: Math.min(line.product.stock, quantity) }
        : line));
  }

  function toggleWishlist(product) {
    setWishlist((current) => current.some((item) => item.id === product.id)
      ? current.filter((item) => item.id !== product.id)
      : [...current, product]);
  }

  const value = useMemo(() => ({
    user, authLoading, cart, wishlist, products, productsLoading, productsError,
    reloadProducts: () => setProductsReload((value) => value + 1),
    cartCount: cart.reduce((sum, line) => sum + line.quantity, 0),
    subtotal: cart.reduce((sum, line) => sum + priceInRupees(line.product) * line.quantity, 0),
    wishlistCount: wishlist.length,
    authenticate, signOut, addToCart, updateQuantity, toggleWishlist, clearCart: () => setCart([]),
  }), [user, authLoading, cart, wishlist, products, productsLoading, productsError]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const value = useContext(StoreContext);
  if (!value) throw new Error('useStore must be used within StoreProvider.');
  return value;
}
