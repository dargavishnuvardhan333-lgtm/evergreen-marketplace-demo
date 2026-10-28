import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext.jsx';
import { formatRupees, priceInRupees } from '../services/products.js';

export default function Checkout() {
  const { cart, subtotal, clearCart } = useStore();
  const [form, setForm] = useState({ fullName: '', line1: '', line2: '', city: '', postalCode: '', country: '' });
  const [error, setError] = useState('');
  const [placed, setPlaced] = useState(false);

  function submit(event) {
    event.preventDefault();
    if (!cart.length) return setError('Your cart is empty.');
    setError('');
    clearCart();
    setPlaced(true);
  }

  function change(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  if (placed) return <section className="page-container empty-state checkout-success" role="status">
    <p className="eyebrow">DEMO CHECKOUT COMPLETE</p>
    <h1>Thanks, {form.fullName.split(' ')[0]}.</h1>
    <p>This is a frontend demo. No order was sent, saved, or charged.</p>
    <Link className="button button-dark" to="/shop">Continue browsing</Link>
  </section>;

  if (!cart.length) return <section className="page-container empty-state"><h1>Your cart is empty.</h1><Link className="button button-dark" to="/shop">Back to the shop</Link></section>;

  return (
    <section className="page-container checkout-page">
      <p className="eyebrow">DEMO CHECKOUT</p><h1>Shipping <em>details.</em></h1>
      <div className="checkout-layout">
        <form className="form-card" onSubmit={submit}>
          <h2>Demo delivery details</h2>
          {error && <div className="notice notice-error" role="alert">{error}</div>}
          <div className="field-grid">
            <label className="form-field full-field">Full name<input required maxLength="120" name="fullName" autoComplete="name" value={form.fullName} onChange={change} /></label>
            <label className="form-field full-field">Address line 1<input required maxLength="120" name="line1" autoComplete="address-line1" value={form.line1} onChange={change} /></label>
            <label className="form-field full-field">Address line 2 <span className="muted">(optional)</span><input maxLength="120" name="line2" autoComplete="address-line2" value={form.line2} onChange={change} /></label>
            <label className="form-field">City<input required maxLength="120" name="city" autoComplete="address-level2" value={form.city} onChange={change} /></label>
            <label className="form-field">Postal code<input required maxLength="120" name="postalCode" autoComplete="postal-code" value={form.postalCode} onChange={change} /></label>
            <label className="form-field full-field">Country<input required maxLength="120" name="country" autoComplete="country-name" value={form.country} onChange={change} /></label>
          </div>
          <button className="button button-dark button-full">Complete demo checkout</button>
          <p className="demo-note">Demo only. No payment is collected, and these details are not sent or saved.</p>
        </form>
        <aside className="summary-card"><p className="eyebrow">CART SUMMARY</p>{cart.map(({ product, quantity }) => <div className="summary-row" key={product.id}><span>{product.title} × {quantity}</span><span>{formatRupees(priceInRupees(product) * quantity)}</span></div>)}<div className="summary-row summary-total"><strong>Total</strong><strong>{formatRupees(subtotal)}</strong></div></aside>
      </div>
    </section>
  );
}
