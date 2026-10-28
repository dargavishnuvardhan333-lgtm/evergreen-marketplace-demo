import { Link } from 'react-router-dom';
import ProductCard, { ProductImage } from '../components/ProductCard.jsx';
import { useStore } from '../context/StoreContext.jsx';

function ProductSection({ id, eyebrow, title, products, viewAll = true }) {
  if (!products.length) return null;
  return (
    <section className="market-section" id={id}>
      <div className="market-section-heading">
        <div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div>
        {viewAll && <Link className="underlined-link" to="/shop">View all <span>→</span></Link>}
      </div>
      <div className="product-grid">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div>
    </section>
  );
}

export default function Home() {
  const { products, productsLoading, productsError, reloadProducts } = useStore();
  const featured = products.slice(0, 8);
  const bestRated = [...products].sort((a, b) => b.rating - a.rating).slice(0, 8);
  const deals = [...products].filter((product) => product.discountPercentage >= 10)
    .sort((a, b) => b.discountPercentage - a.discountPercentage).slice(0, 8);
  const categories = [
    { label: 'Electronics', matches: ['smartphone', 'laptop', 'tablet', 'mobile-accessories'] },
    { label: 'Fashion', matches: ['mens-', 'womens-', 'tops', 'shirts', 'shoes', 'sunglasses'] },
    { label: 'Beauty', matches: ['beauty', 'skin-care', 'fragrances'] },
    { label: 'Home & Living', matches: ['home-', 'furniture', 'kitchen'] },
    { label: 'Sports & Outdoors', matches: ['sports-', 'sunglasses'] },
    { label: 'Groceries', matches: ['groceries'] },
  ];
  const sections = categories.map(({ label, matches }) => ({
    label,
    products: products.filter((product) => matches.some((match) => product.category.includes(match))).slice(0, 4),
  })).filter((section) => section.products.length);
  const heroProduct = products.find((product) => product.thumbnail);

  return (
    <>
      <section className="market-hero">
        <div className="market-hero-copy">
          <p className="eyebrow">EVERYDAY FINDS, ALL IN ONE PLACE</p>
          <h1>A better way to<br /><em>find your favorites.</em></h1>
          <p>Explore a wide-ranging sample catalogue of tech, fashion, beauty, home, and more.</p>
          <Link to="/shop" className="button button-dark">Explore all products <span>→</span></Link>
          <small>Sample product data from DummyJSON. Prices are converted to INR.</small>
        </div>
        <div className="market-hero-visual">
          {heroProduct && <Link to={`/products/${heroProduct.id}`} className="hero-product-image" aria-label={`Discover ${heroProduct.title}`}>
            <ProductImage product={heroProduct} />
          </Link>}
          <div className="hero-promo-card"><span>THE EVERYDAY EDIT</span><strong>Find something<br />good for today.</strong><Link to="/shop">Shop the edit →</Link></div>
        </div>
      </section>

      <section className="market-benefits" aria-label="Marketplace highlights">
        <div><span>01</span><p><strong>Plenty to explore</strong><br />One sample catalogue, many categories</p></div>
        <div><span>02</span><p><strong>Find your fit</strong><br />Search, sort and filter your way</p></div>
        <div><span>03</span><p><strong>Wishlist for later</strong><br />Keep favorites saved in this browser</p></div>
      </section>

      <section className="market-home-content" id="deals">
        <div className="catalogue-disclaimer"><strong>About these listings</strong> Products, ratings, discounts, and stock are sample API data, not live retailer prices or inventory. USD prices are converted using a configurable rate.</div>
        {productsError ? <div className="catalogue-error" role="alert"><span>{productsError}</span><button className="button button-dark" onClick={reloadProducts}>Retry loading products</button></div>
          : productsLoading ? <div className="loading product-loading">Loading the product catalogue…</div>
            : products.length ? <>
              <ProductSection id="trending" eyebrow="THE CROWD FAVORITES" title="Trending products" products={featured} />
              <ProductSection id="best-rated" eyebrow="TOP RATED SAMPLE PICKS" title="Best rated" products={bestRated} />
              <ProductSection id="featured-deals" eyebrow="SAMPLE DISCOUNTS" title="Deals to discover" products={deals} />
              {sections.map((section) => <ProductSection key={section.label} id={section.label.toLowerCase().replaceAll(' ', '-').replaceAll('&', 'and')} eyebrow="EXPLORE A CATEGORY" title={section.label} products={section.products} />)}
            </> : <div className="empty-state"><h2>No products found</h2><p>The catalogue is currently empty.</p></div>}
      </section>
    </>
  );
}
