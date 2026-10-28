import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ProductCard, { ProductImage } from '../components/ProductCard.jsx';
import { useStore } from '../context/StoreContext.jsx';
import { categoryLabel, formatRupees, originalPriceInRupees, priceInRupees } from '../services/products.js';

export default function ProductDetail() {
  const { id } = useParams();
  const { products, productsLoading, productsError, reloadProducts, addToCart, wishlist, toggleWishlist } = useStore();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState('');
  const [added, setAdded] = useState(false);
  const product = products.find((item) => String(item.id) === id);

  useEffect(() => {
    setQuantity(1);
    setAdded(false);
    setSelectedImage('');
  }, [id]);

  if (productsLoading) return <div className="page-container loading">Loading product details…</div>;
  if (productsError) return <section className="page-container"><div className="notice notice-error" role="alert">{productsError}</div><button className="button button-dark" onClick={reloadProducts}>Retry</button></section>;
  if (!product) return <section className="page-container empty-state"><h1>Product not found</h1><p>It may no longer be in this sample catalogue.</p><Link className="button button-dark" to="/shop">Back to products</Link></section>;

  const images = [...new Set([product.thumbnail, ...(product.images || [])].filter(Boolean))];
  const reviews = Array.isArray(product.reviews) ? product.reviews : [];
  const related = products.filter((item) => item.category === product.category && item.id !== product.id).slice(0, 4);
  const wished = wishlist.some((item) => item.id === product.id);

  return (
    <section className="page-container detail-page">
      <div className="breadcrumbs"><Link to="/shop">Shop</Link><span>/</span><Link to={`/shop?category=${encodeURIComponent(product.category)}`}>{categoryLabel(product.category)}</Link><span>/</span><span>{product.title}</span></div>
      <div className="detail-layout">
        <div className="detail-gallery">
          <div className="detail-visual">
            {selectedImage ? <img className="product-image" src={selectedImage} alt={product.title} onError={() => setSelectedImage('')} /> : <ProductImage product={product} />}
          </div>
          {images.length > 1 && <div className="gallery-thumbnails" aria-label="Product images">{images.map((image, index) => <button className={selectedImage === image || (!selectedImage && index === 0) ? 'selected' : ''} type="button" key={image} onClick={() => setSelectedImage(image)} aria-label={`View product image ${index + 1}`}><img src={image} alt="" loading="lazy" /></button>)}</div>}
        </div>
        <div className="detail-copy">
          <p className="eyebrow">{categoryLabel(product.category)}{product.brand ? ` · ${product.brand}` : ''}</p>
          <h1>{product.title}</h1>
          <div className="detail-rating"><span>★ {Number(product.rating).toFixed(1)} / 5</span><span>{reviews.length} sample reviews</span></div>
          <div className="detail-price-row"><strong>{formatRupees(priceInRupees(product))}</strong>{product.discountPercentage > 0 && <><del>{formatRupees(originalPriceInRupees(product))}</del><span>{Math.round(product.discountPercentage)}% off</span></>}</div>
          <p className="detail-description">{product.description}</p>
          <p className="sample-data-note">Sample price converted from USD. Product details, rating, discount and stock are DummyJSON sample data.</p>
          <p className="stock-note">Sample stock: {product.availabilityStatus || product.stock}</p>
          <div className="detail-actions">
            <label className="quantity-control">Qty<input type="number" min="1" max={Math.max(1, product.stock)} value={quantity} disabled={product.stock < 1} onChange={(event) => setQuantity(Math.min(product.stock, Math.max(1, Number(event.target.value) || 1)))} /></label>
            <button className="button button-dark" disabled={product.stock < 1} onClick={() => { addToCart(product, quantity); setAdded(true); }}>{added ? 'Added to cart ✓' : product.stock < 1 ? 'Out of stock in sample data' : 'Add to cart'}</button>
          </div>
          <button className={`detail-wishlist${wished ? ' is-active' : ''}`} onClick={() => toggleWishlist(product)} aria-pressed={wished}>{wished ? '♥ Remove from wishlist' : '♡ Add to wishlist'}</button>
        </div>
      </div>
      {related.length > 0 && <div className="related-section"><div className="market-section-heading"><div><p className="eyebrow">MORE FROM {categoryLabel(product.category).toUpperCase()}</p><h2>You may also like</h2></div></div><div className="product-grid">{related.map((item) => <ProductCard key={item.id} product={item} />)}</div></div>}
    </section>
  );
}
