import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext.jsx';
import { categoryLabel, formatRupees, originalPriceInRupees, priceInRupees, productImage } from '../services/products.js';

export function ProductImage({ product, className = '' }) {
  const [failed, setFailed] = useState(false);
  const image = productImage(product);
  return image && !failed ? (
    <img className={`product-image ${className}`} src={image} alt={product.title} loading="lazy"
      onError={() => setFailed(true)} />
  ) : (
    <div className={`product-placeholder ${className}`} role="img" aria-label={`${product.title} image unavailable`}>
      <span>{product.category?.slice(0, 1) || 'E'}</span>
      <small>EVERGREEN GOODS</small>
    </div>
  );
}

export default function ProductCard({ product }) {
  const { addToCart, wishlist, toggleWishlist } = useStore();
  const [added, setAdded] = useState(false);
  const wished = wishlist.some((item) => item.id === product.id);

  useEffect(() => {
    if (!added) return undefined;
    const timer = window.setTimeout(() => setAdded(false), 1600);
    return () => window.clearTimeout(timer);
  }, [added]);

  return (
    <article className="product-card">
      <Link to={`/products/${product.id}`} className="product-visual">
        <ProductImage product={product} />
        {product.discountPercentage > 0 && <span className="discount-badge">{Math.round(product.discountPercentage)}% off</span>}
        <span className="rating-badge" aria-label={`Rated ${product.rating} out of 5`}>★ {Number(product.rating).toFixed(1)}</span>
      </Link>
      <button
        className={`wishlist-button${wished ? ' is-active' : ''}`}
        type="button"
        aria-label={`${wished ? 'Remove' : 'Add'} ${product.title} ${wished ? 'from' : 'to'} wishlist`}
        aria-pressed={wished}
        onClick={() => toggleWishlist(product)}
      >{wished ? '♥' : '♡'}</button>
      <div className="product-card-info">
        <div><p className="eyebrow">{categoryLabel(product.category)}</p><Link to={`/products/${product.id}`} className="product-title">{product.title}</Link></div>
      </div>
      <div className="product-card-price">
        <strong className="price">{formatRupees(priceInRupees(product))}</strong>
        {product.discountPercentage > 0 && <span className="original-price">{formatRupees(originalPriceInRupees(product))}</span>}
      </div>
      <p className="sample-stock">Sample stock: {product.availabilityStatus || product.stock}</p>
      <button className="quick-add" disabled={product.stock < 1} onClick={() => { addToCart(product); setAdded(true); }}>
        {product.stock < 1 ? 'Out of stock in sample data' : added ? 'Added to cart ✓' : 'Add to cart +'}
      </button>
    </article>
  );
}
