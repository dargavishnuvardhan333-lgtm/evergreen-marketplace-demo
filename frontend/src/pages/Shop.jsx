import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard.jsx';
import { useStore } from '../context/StoreContext.jsx';
import { categoryLabel } from '../services/products.js';

const PAGE_SIZE = 24;

export default function Shop() {
  const { products, productsLoading, productsError, reloadProducts } = useStore();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [sort, setSort] = useState('featured');
  const [discountOnly, setDiscountOnly] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const categories = [...new Set(products.map((product) => product.category))].sort();

  useEffect(() => {
    setQuery(searchParams.get('q') || '');
    setCategory(searchParams.get('category') || '');
    setVisibleCount(PAGE_SIZE);
  }, [searchParams]);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    const filtered = products.filter((product) => {
      const matchesQuery = !normalizedQuery || `${product.title} ${product.description} ${product.brand || ''} ${product.category}`.toLocaleLowerCase().includes(normalizedQuery);
      return matchesQuery && (!category || product.category === category) && (!discountOnly || product.discountPercentage > 0);
    });
    if (sort === 'price-asc') filtered.sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') filtered.sort((a, b) => b.price - a.price);
    if (sort === 'rating') filtered.sort((a, b) => b.rating - a.rating);
    return filtered;
  }, [products, query, category, discountOnly, sort]);

  function clearFilters() {
    setQuery('');
    setCategory('');
    setDiscountOnly(false);
    setSort('featured');
    setVisibleCount(PAGE_SIZE);
  }

  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [query, category, discountOnly, sort]);

  return (
    <section className="page-container shop-page">
      <div className="shop-heading"><div><p className="eyebrow">THE EVERGREEN MARKETPLACE</p><h1>Find your <em>everyday.</em></h1><p className="muted">Browse the full sample catalogue across categories.</p></div><span className="result-count">{productsLoading ? 'Loading…' : `${filteredProducts.length} products`}</span></div>
      <div className="filter-bar marketplace-filters">
        <label className="search-field"><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search names and descriptions" aria-label="Search products by name or description" /></label>
        <label className="select-label"><span className="sr-only">Category</span><select value={category} onChange={(event) => setCategory(event.target.value)}><option value="">All categories</option>{categories.map((value) => <option value={value} key={value}>{categoryLabel(value)}</option>)}</select></label>
        <label className="select-label"><span className="sr-only">Sort products</span><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="featured">Featured</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option><option value="rating">Best rated</option></select></label>
        <label className="discount-filter"><input type="checkbox" checked={discountOnly} onChange={(event) => setDiscountOnly(event.target.checked)} /> On discount</label>
        <button className="clear-filters" onClick={clearFilters} type="button">Clear filters</button>
      </div>
      {productsError ? <div className="catalogue-error" role="alert"><span>{productsError}</span><button className="button button-dark" onClick={reloadProducts}>Retry</button></div>
        : productsLoading ? <div className="product-grid shop-grid" aria-label="Loading products">{Array.from({ length: 8 }, (_, index) => <div className="skeleton-card" key={index}><div /><span /><i /></div>)}</div>
          : filteredProducts.length ? <>
            <p className="sample-data-note">DummyJSON sample catalogue · Ratings, discounts, stock and prices are sample data, not live retailer offers.</p>
            <div className="product-grid shop-grid">{filteredProducts.slice(0, visibleCount).map((product) => <ProductCard key={product.id} product={product} />)}</div>
            {visibleCount < filteredProducts.length && <div className="load-more-wrap"><button className="button button-outline" onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}>Load more products ({filteredProducts.length - visibleCount} remaining)</button></div>}
          </> : <div className="empty-state"><h2>No matching products</h2><p>Try another search or clear your filters.</p><button className="button button-outline" onClick={clearFilters}>Clear filters</button></div>}
    </section>
  );
}
