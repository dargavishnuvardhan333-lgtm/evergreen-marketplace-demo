import { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { OrderHistory } from './Orders.jsx';

const emptyForm = { name: '', description: '', price: '', category: '', imageUrl: '', stock: '' };

export default function Admin() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);

  async function loadProducts() {
    setLoading(true);
    try {
      const { products: items } = await api('/products?limit=50&sort=newest');
      setProducts(items);
      setError('');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadProducts(); }, []);

  function edit(product) {
    setEditingId(product._id);
    setForm({
      name: product.name, description: product.description, price: String(product.price),
      category: product.category, imageUrl: product.imageUrl || '', stock: String(product.stock),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function save(event) {
    event.preventDefault();
    setError('');
    setNotice('');
    const values = { ...form, price: Number(form.price), stock: Number(form.stock) };
    try {
      await api(editingId ? `/products/${editingId}` : '/products', {
        method: editingId ? 'PUT' : 'POST',
        body: JSON.stringify(values),
      });
      setForm(emptyForm);
      setEditingId('');
      setNotice(editingId ? 'Product updated.' : 'Product added to the collection.');
      await loadProducts();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function remove(id) {
    if (!window.confirm('Remove this product from the collection?')) return;
    setError('');
    try {
      await api(`/products/${id}`, { method: 'DELETE' });
      setNotice('Product removed.');
      await loadProducts();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <>
      <section className="page-container admin-page">
        <p className="eyebrow">A LITTLE BEHIND THE SCENES</p><h1>Store <em>studio.</em></h1>
        <div className="admin-stats"><div><span>PRODUCTS</span><strong>{products.length}</strong></div><div><span>IN STOCK</span><strong>{products.filter((product) => product.stock > 0).length}</strong></div><div><span>ROLE</span><strong>Admin</strong></div></div>
        <div className="admin-content">
          <form className="form-card admin-form" onSubmit={save}>
            <p className="eyebrow">{editingId ? 'REFINE A FAVORITE' : 'BRING SOMETHING GOOD IN'}</p><h2>{editingId ? 'Edit product' : 'Add a product'}</h2>
            {error && <div className="notice notice-error" role="alert">{error}</div>}{notice && <div className="notice notice-success" role="status">{notice}</div>}
            <label className="form-field">Product name<input required maxLength="120" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
            <label className="form-field">Description<textarea required maxLength="2000" rows="4" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
            <div className="field-grid"><label className="form-field">Price (USD)<input required type="number" min="0" step="0.01" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} /></label><label className="form-field">Stock quantity<input required type="number" min="0" step="1" value={form.stock} onChange={(event) => setForm({ ...form, stock: event.target.value })} /></label></div>
            <label className="form-field">Category<input required maxLength="80" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} /></label>
            <label className="form-field">Image URL <span className="muted">(optional)</span><input type="url" placeholder="https://…" value={form.imageUrl} onChange={(event) => setForm({ ...form, imageUrl: event.target.value })} /></label>
            <div className="form-actions"><button className="button button-dark" type="submit">{editingId ? 'Save changes' : 'Add product'}</button>{editingId && <button className="button button-outline" type="button" onClick={() => { setEditingId(''); setForm(emptyForm); }}>Cancel</button>}</div>
          </form>
          <div className="admin-inventory"><div className="section-heading"><div><p className="eyebrow">THE CURRENT LINEUP</p><h2>Products <em>({products.length})</em></h2></div></div>
            {loading ? <div className="loading">Loading products…</div> : products.length ? products.map((product) => <article className="inventory-row" key={product._id}><div><strong>{product.name}</strong><p className="muted">{product.category} · ${Number(product.price).toFixed(2)} · {product.stock} in stock</p></div><div className="inventory-actions"><button className="text-button" onClick={() => edit(product)}>Edit</button><button className="text-button danger-text" onClick={() => remove(product._id)}>Remove</button></div></article>) : <p className="muted">Your collection is ready for its first product.</p>}
          </div>
        </div>
      </section>
      <OrderHistory admin />
    </>
  );
}
