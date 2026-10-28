import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { api } from '../services/api.js';

function OrderCard({ order }) {
  const owner = order.user && typeof order.user === 'object' ? order.user.name : null;
  return (
    <article className="order-card">
      <div className="order-top"><div><p className="eyebrow">ORDER {order._id.slice(-8).toUpperCase()}</p><p className="muted">{new Date(order.createdAt).toLocaleDateString()}</p>{owner && <p className="muted">Placed by {owner}</p>}</div><span className={`status-pill status-${order.status}`}>{order.status}</span></div>
      <div className="order-items">{order.items.map((item, index) => <div className="summary-row" key={`${item.product}-${index}`}><span>{item.name} × {item.quantity}</span><span>${(item.price * item.quantity).toFixed(2)}</span></div>)}</div>
      <div className="summary-row summary-total"><strong>Total</strong><strong>${order.total.toFixed(2)}</strong></div>
      <p className="muted shipping-preview">{order.shippingAddress.city}, {order.shippingAddress.country}</p>
    </article>
  );
}

export function OrderHistory({ admin = false }) {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const endpoint = admin ? '/orders' : '/orders/my-orders';
  function reload() {
    setLoading(true);
    api(endpoint).then(({ orders: list }) => setOrders(list)).catch((requestError) => setError(requestError.message)).finally(() => setLoading(false));
  }
  useEffect(() => { reload(); }, [endpoint]);

  async function changeStatus(id, status) {
    setError('');
    try {
      await api(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
      reload();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <section className="page-container orders-page">
      <p className="eyebrow">{admin ? 'STORE OPERATIONS' : 'YOUR GOOD THINGS'}</p><h1>{admin ? <>Order <em>desk.</em></> : <>Your <em>orders.</em></>}</h1>
      {error && <div className="notice notice-error">{error}</div>}
      {loading ? <div className="loading">Gathering your orders…</div> : orders.length ? <div className="orders-list">{orders.map((order) => <div key={order._id}><OrderCard order={order} />{admin && <label className="status-editor">Update status<select value={order.status} onChange={(event) => changeStatus(order._id, event.target.value)}><option>pending</option><option>processing</option><option>shipped</option><option>delivered</option><option>cancelled</option></select></label>}</div>)}</div> : <div className="empty-state"><h2>Nothing on the doorstep yet.</h2><p>When you find something you love, it will be here.</p>{!admin && <Link className="button button-dark" to="/shop">Browse the shop</Link>}</div>}
    </section>
  );
}

export function OrderDetail() {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { api(`/orders/${id}`).then(({ order: result }) => setOrder(result)).catch((requestError) => setError(requestError.message)); }, [id]);
  return <section className="page-container order-detail-page"><p className="eyebrow">ORDER PLACED</p><h1>{location.state?.placed ? <>It's <em>on its way.</em></> : <>Order <em>details.</em></>}</h1>{error && <div className="notice notice-error">{error}</div>}{order ? <><OrderCard order={order} /><Link className="underlined-link" to="/orders">Back to your orders →</Link></> : !error && <div className="loading">Loading your order…</div>}</section>;
}
