import React, { useEffect, useState } from 'react';
import { Search, Compass, SlidersHorizontal, RefreshCw } from 'lucide-react';
import type { Destination } from '@shared/types';
import { api } from '../services/api';
import { DestinationCard } from '../components/DestinationCard';
import { SEO } from '../components/SEO';

export const DestinationsPage: React.FC = () => {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [continent, setContinent] = useState('ALL');
  const [sort, setSort] = useState('rating');

  const continents = ['ALL', 'India', 'Asia', 'Middle East', 'Europe'];

  const loadDestinations = () => {
    setLoading(true);
    let continentParam: string | undefined = undefined;
    let regionParam: string | undefined = undefined;

    if (continent === 'India') {
      regionParam = 'India';
    } else if (continent !== 'ALL') {
      continentParam = continent;
    }

    api.getDestinations({
      continent: continentParam,
      region: regionParam,
      search: search.trim() || undefined,
      sort,
    })
      .then((res) => {
        if (res.success) setDestinations(res.data);
      })
      .catch((err) => console.error('Failed to load destinations:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDestinations();
  }, [continent, sort]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadDestinations();
  };

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <SEO
        title="Luxury Destinations & Secluded Sanctuaries"
        description="Browse our curated portfolio of private islands, alpine chalets, African reserves, and ancient cultural sanctuaries."
      />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs uppercase tracking-widest text-gold-600 font-bold block">
          Global Sanctuaries
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-navy-950">
          Curated Luxury Destinations
        </h1>
        <p className="text-sm sm:text-base text-navy-700 leading-relaxed">
          From sun-washed Aegean cliffs to remote Serengeti savannahs and alpine Matterhorn ridges, discover hand-picked sanctuaries where privacy and elegance reign.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-6 rounded-2xl shadow-luxury border border-ivory-300 space-y-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Continent Filter Chips */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            {continents.map((c) => (
              <button
                key={c}
                onClick={() => setContinent(c)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  continent === c
                    ? 'bg-navy-900 text-gold-400 shadow-md font-bold'
                    : 'bg-ivory-100 text-navy-800 hover:bg-ivory-200 border border-ivory-300'
                }`}
              >
                {c === 'ALL' ? 'All Continents' : c}
              </button>
            ))}
          </div>

          {/* Search & Sort Controls */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            {/* Search input */}
            <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-64">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search country or name..."
                className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-ivory-300 bg-ivory-50 text-xs text-navy-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gold-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </form>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <SlidersHorizontal className="w-4 h-4 text-navy-600 flex-shrink-0" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full sm:w-auto px-3.5 py-2 rounded-xl border border-ivory-300 bg-ivory-50 text-xs font-medium text-navy-900 focus:outline-none focus:ring-2 focus:ring-gold-500"
              >
                <option value="rating">Top Rated</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name">Alphabetical</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Destinations Grid */}
      {loading ? (
        <div className="text-center py-20">
          <RefreshCw className="w-8 h-8 text-gold-500 animate-spin mx-auto mb-3" />
          <p className="text-xs text-navy-700 font-medium">Loading curated destinations...</p>
        </div>
      ) : destinations.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-ivory-300 p-8 max-w-lg mx-auto">
          <Compass className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="font-serif text-lg font-bold text-navy-950 mb-1">No destinations match your criteria</h3>
          <p className="text-xs text-slate-500 mb-6">
            Try adjusting your search terms or clearing continent filters.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setContinent('ALL');
              setSort('rating');
            }}
            className="px-4 py-2 rounded-xl bg-navy-900 text-gold-400 text-xs font-semibold"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {destinations.map((dest) => (
            <DestinationCard key={dest.id} destination={dest} />
          ))}
        </div>
      )}
    </div>
  );
};
