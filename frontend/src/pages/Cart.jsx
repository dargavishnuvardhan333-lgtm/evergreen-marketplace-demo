import { Link } from 'react-router-dom';
import ProductCard, { ProductImage } from '../components/ProductCard.jsx';
import { useStore } from '../context/StoreContext.jsx';
import { formatRupees, priceInRupees } from '../services/products.js';

export default function Cart() {
  const { cart, products, subtotal, updateQuantity } = useStore();
  const recommendations = products.filter((product) => !cart.some((line) => line.product.id === product.id)).slice(0, 4);
  return (
    <section className="page-container cart-page">
      <p className="eyebrow">YOUR LITTLE COLLECTION</p><h1>Your <em>bag.</em></h1>
      {!cart.length ? <div className="empty-state"><h2>A little space for something good.</h2><p>Your cart is waiting to be filled.</p><Link className="button button-dark" to="/shop">Explore the shop</Link></div> : (
        <div className="cart-layout">
          <div className="cart-lines">{cart.map(({ product, quantity }) => (
            <article className="cart-line" key={product.id}>
              <Link to={`/products/${product.id}`} className="cart-line-image"><ProductImage product={product} /></Link>
              <div className="cart-line-details"><p className="eyebrow">{product.category}</p><Link className="product-title" to={`/products/${product.id}`}>{product.title}</Link><p className="muted">{formatRupees(priceInRupees(product))}</p>
                <div className="cart-quantity"><span>Quantity</span><button aria-label={`Decrease ${product.title} quantity`} disabled={quantity <= 1} onClick={() => updateQuantity(product.id, quantity - 1)}>−</button><span>{quantity}</span><button aria-label={`Increase ${product.title} quantity`} disabled={quantity >= product.stock} onClick={() => updateQuantity(product.id, quantity + 1)}>+</button></div>
              </div>
              <strong>{formatRupees(priceInRupees(product) * quantity)}</strong>
              <button className="remove-button" aria-label={`Remove ${product.title}`} onClick={() => updateQuantity(product.id, 0)}>Remove</button>
            </article>
          ))}</div>
          <aside className="summary-card"><p className="eyebrow">CART SUMMARY</p><div className="summary-row"><span>{cart.reduce((count, line) => count + line.quantity, 0)} items</span><strong>{formatRupees(subtotal)}</strong></div><div className="summary-row muted"><span>Shipping</span><span>Demo only</span></div><p className="demo-note">Prices shown in INR are converted from sample USD prices. No payment details are collected.</p><Link to="/checkout" className="button button-dark button-full">Continue to demo checkout <span>→</span></Link><Link to="/shop" className="underlined-link back-link">Keep exploring</Link></aside>
        </div>
      )}
      {cart.length > 0 && recommendations.length > 0 && <section className="related-section"><div className="market-section-heading"><div><p className="eyebrow">KEEP BROWSING</p><h2>More to discover</h2></div><Link className="underlined-link" to="/shop">Shop all <span>→</span></Link></div><div className="product-grid cart-recommendations">{recommendations.map((product) => <ProductCard key={product.id} product={product} />)}</div></section>}
    </section>
  );
}
