import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Compass, SlidersHorizontal, RefreshCw } from 'lucide-react';
import type { TourPackage } from '@shared/types';
import { api } from '../services/api';
import { PackageCard } from '../components/PackageCard';
import { SEO } from '../components/SEO';

export const PackagesPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [packages, setPackages] = useState<TourPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'ALL');
  const [sort, setSort] = useState('rating');
  const [maxPrice, setMaxPrice] = useState<number>(20000);

  const categories = [
    { label: 'All Expeditions', value: 'ALL' },
    { label: 'Ultra-Luxury', value: 'LUXURY' },
    { label: 'Honeymoon', value: 'HONEYMOON' },
    { label: 'Family Journeys', value: 'FAMILY' },
    { label: 'Safari & Adventure', value: 'ADVENTURE' },
    { label: 'Wildlife Safaris', value: 'WILDLIFE' },
    { label: 'Cultural Heritage', value: 'CULTURAL' },
    { label: 'Ayurveda & Wellness', value: 'WELLNESS' },
    { label: 'Corporate Summits', value: 'CORPORATE' },
  ];

  const loadPackages = () => {
    setLoading(true);
    api.getPackages({
      category: category !== 'ALL' ? category : undefined,
      search: search.trim() || undefined,
      sort,
      maxPriceCents: maxPrice * 100,
    })
      .then((res) => {
        if (res.success) setPackages(res.data);
      })
      .catch((err) => console.error('Failed to load packages:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPackages();
  }, [category, sort, maxPrice]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadPackages();
  };

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <SEO
        title="Signature Luxury Tour Packages"
        description="Explore our hand-crafted, fully guided private travel packages. Seamless transfers, private villas, and personalized concierge itineraries."
      />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs uppercase tracking-widest text-gold-600 font-bold block">
          Bespoke Curations
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-navy-950">
          Signature Tour Expeditions
        </h1>
        <p className="text-sm sm:text-base text-navy-700 leading-relaxed">
          Every journey is tailored with precision. Private helicopters, Michelin-starred private chefs, and dedicated local scholars ensure your voyage is nothing short of transcendent.
        </p>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white p-6 rounded-2xl shadow-luxury border border-ivory-300 space-y-6">
        {/* Category Filter Chips */}
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                category === cat.value
                  ? 'bg-navy-900 text-gold-400 shadow-md font-bold'
                  : 'bg-ivory-100 text-navy-800 hover:bg-ivory-200 border border-ivory-300'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search, Price & Sort Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-ivory-200">
          {/* Search input */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-navy-600 mb-1">
              Search Itineraries
            </label>
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="e.g. Catamaran, Safari, Ryokan..."
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-ivory-300 bg-ivory-50 text-xs text-navy-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gold-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </form>

          {/* Max Price Slider */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="price-slider" className="text-[10px] font-bold uppercase tracking-wider text-navy-600">
                Max Budget / Guest
              </label>
              <span className="text-xs font-bold text-navy-950 font-mono">
                ${maxPrice.toLocaleString()}
              </span>
            </div>
            <input
              id="price-slider"
              type="range"
              min="4000"
              max="20000"
              step="500"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-gold-500 cursor-pointer"
            />
          </div>

          {/* Sort Dropdown */}
          <div>
            <label htmlFor="package-sort" className="block text-[10px] font-bold uppercase tracking-wider text-navy-600 mb-1">
              Sort Order
            </label>
            <div className="relative flex items-center">
              <SlidersHorizontal className="w-4 h-4 text-navy-600 absolute left-3 pointer-events-none" />
              <select
                id="package-sort"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-ivory-300 bg-ivory-50 text-xs font-medium text-navy-900 focus:outline-none focus:ring-2 focus:ring-gold-500 cursor-pointer"
              >
                <option value="rating">Top Rated</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="duration">Shortest Duration</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Packages Grid */}
      {loading ? (
        <div className="text-center py-20">
          <RefreshCw className="w-8 h-8 text-gold-500 animate-spin mx-auto mb-3" />
          <p className="text-xs text-navy-700 font-medium">Loading tour packages...</p>
        </div>
      ) : packages.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-ivory-300 p-8 max-w-lg mx-auto">
          <Compass className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="font-serif text-lg font-bold text-navy-950 mb-1">No packages found</h3>
          <p className="text-xs text-slate-500 mb-6">
            Try adjusting your price ceiling or selecting a different category.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setCategory('ALL');
              setMaxPrice(20000);
              setSort('rating');
            }}
            className="px-4 py-2 rounded-xl bg-navy-900 text-gold-400 text-xs font-semibold"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {packages.map((pkg) => (
            <PackageCard key={pkg.id} pkg={pkg} />
          ))}
        </div>
      )}
    </div>
  );
};
