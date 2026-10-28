import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard.jsx';
import { useStore } from '../context/StoreContext.jsx';

export default function Wishlist() {
  const { wishlist } = useStore();
  return (
    <section className="page-container wishlist-page">
      <p className="eyebrow">SAVED FOR LATER</p>
      <h1>Your <em>wishlist.</em></h1>
      {wishlist.length
        ? <><p className="muted wishlist-intro">{wishlist.length} {wishlist.length === 1 ? 'product' : 'products'} saved on this device.</p><div className="product-grid shop-grid">{wishlist.map((product) => <ProductCard key={product.id} product={product} />)}</div></>
        : <div className="empty-state"><h2>Keep the things you love close.</h2><p>Tap the heart on a product to save it here.</p><Link className="button button-dark" to="/shop">Explore products</Link></div>}
    </section>
  );
}
