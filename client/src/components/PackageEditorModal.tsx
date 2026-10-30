import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Calendar,
  DollarSign,
  Compass,
  Check,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
  Sparkles,
  Layers,
  MapPin
} from 'lucide-react';
import type { TourPackage, Destination, TravelType, ItineraryEntry } from '@shared/types';
import { api } from '../services/api';

interface PackageEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (pkg: TourPackage) => void;
  token: string;
  packageToEdit?: TourPackage | null;
  destinations: Destination[];
}

export const PackageEditorModal: React.FC<PackageEditorModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  token,
  packageToEdit,
  destinations,
}) => {
  const isEditing = Boolean(packageToEdit?.id);

  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [destinationId, setDestinationId] = useState('');
  const [linkedDestinationIds, setLinkedDestinationIds] = useState<string[]>([]);
  const [category, setCategory] = useState<TravelType>('LUXURY');
  const [durationDays, setDurationDays] = useState(5);
  const [durationNights, setDurationNights] = useState(4);
  const [priceCents, setPriceCents] = useState(250000); // $2,500
  const [currency, setCurrency] = useState('USD');
  const [pricingBasis, setPricingBasis] = useState('per_person');
  const [isSamplePrice, setIsSamplePrice] = useState(true);
  const [difficulty, setDifficulty] = useState<'EASY' | 'MODERATE' | 'CHALLENGING'>('MODERATE');
  const [maxGroupSize, setMaxGroupSize] = useState(12);
  const [overview, setOverview] = useState('');
  const [heroImage, setHeroImage] = useState('');
  const [galleryText, setGalleryText] = useState('');
  const [includesText, setIncludesText] = useState('');
  const [excludesText, setExcludesText] = useState('');
  const [transport, setTransport] = useState('');
  const [activitiesText, setActivitiesText] = useState('');
  const [cancellationPolicy, setCancellationPolicy] = useState('Free cancellation up to 30 days prior to departure.');
  const [isPublished, setIsPublished] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');

  // Itinerary Builder State
  const [itineraryEntries, setItineraryEntries] = useState<ItineraryEntry[]>([]);

  // UI state
  const [activeTab, setActiveTab] = useState<'details' | 'itinerary' | 'media' | 'seo'>('details');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Populate state on open / edit change
  useEffect(() => {
    if (!isOpen) return;

    if (packageToEdit) {
      setTitle(packageToEdit.title);
      setSlug(packageToEdit.slug);
      setDestinationId(packageToEdit.destinationId);
      setLinkedDestinationIds(
        packageToEdit.packageDestinations?.map((pd) => pd.destinationId) || []
      );
      setCategory(packageToEdit.category);
      setDurationDays(packageToEdit.durationDays);
      setDurationNights(packageToEdit.durationNights);
      setPriceCents(packageToEdit.priceCents || Math.round(packageToEdit.price * 100));
      setCurrency(packageToEdit.currency || 'USD');
      setPricingBasis(packageToEdit.pricingBasis || 'per_person');
      setIsSamplePrice(packageToEdit.isSamplePrice ?? true);
      setDifficulty(packageToEdit.difficulty || 'MODERATE');
      setMaxGroupSize(packageToEdit.maxGroupSize || 12);
      setOverview(packageToEdit.overview || '');
      setHeroImage(packageToEdit.heroImage || '');
      setGalleryText((packageToEdit.gallery || []).join('\n'));
      setIncludesText((packageToEdit.includes || []).join('\n'));
      setExcludesText((packageToEdit.excludes || []).join('\n'));
      setTransport(packageToEdit.transport || '');
      setActivitiesText((packageToEdit.activities || []).join(', '));
      setCancellationPolicy(
        packageToEdit.cancellationPolicy || 'Free cancellation up to 30 days prior to departure.'
      );
      setIsPublished(packageToEdit.isPublished);
      setIsFeatured(packageToEdit.isFeatured);
      setSeoTitle(packageToEdit.seoTitle || '');
      setSeoDescription(packageToEdit.seoDescription || '');

      // Load itinerary entries
      if (packageToEdit.itineraryEntries && packageToEdit.itineraryEntries.length > 0) {
        setItineraryEntries([...packageToEdit.itineraryEntries]);
      } else if (packageToEdit.itinerary && Array.isArray(packageToEdit.itinerary)) {
        setItineraryEntries(
          packageToEdit.itinerary.map((item: any, idx: number) => ({
            dayNumber: item.day || idx + 1,
            title: item.title || `Day ${item.day || idx + 1}`,
            description: item.description || '',
            activities: Array.isArray(item.activities) ? item.activities : [],
            mealsIncluded: item.mealsIncluded || 'Breakfast',
            accommodation: item.accommodation || null,
            orderIndex: item.day || idx + 1,
          }))
        );
      } else {
        setItineraryEntries(getDefaultItinerary(packageToEdit.durationDays || 3));
      }
    } else {
      // New Package Defaults
      setTitle('');
      setSlug('');
      setDestinationId(destinations[0]?.id || '');
      setLinkedDestinationIds([]);
      setCategory('LUXURY');
      setDurationDays(5);
      setDurationNights(4);
      setPriceCents(250000);
      setCurrency('USD');
      setPricingBasis('per_person');
      setIsSamplePrice(true);
      setDifficulty('MODERATE');
      setMaxGroupSize(12);
      setOverview('');
      setHeroImage('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80');
      setGalleryText('');
      setIncludesText('Private luxury transfers\n5-star boutique accommodation\nDaily artisanal breakfast & curated dinners\nEnglish-speaking private guide\nAll national park & monument access');
      setExcludesText('International flights\nDiscretionary staff gratuities\nTravel insurance');
      setTransport('Private chauffeured Mercedes-Benz luxury vehicle throughout the expedition');
      setActivitiesText('Guided walking tours, wine tastings, sunset sailing');
      setCancellationPolicy('Complimentary cancellation up to 30 days prior to departure.');
      setIsPublished(true);
      setIsFeatured(false);
      setSeoTitle('');
      setSeoDescription('');
      setItineraryEntries(getDefaultItinerary(5));
    }

    setErrorMessage(null);
  }, [isOpen, packageToEdit, destinations]);

  function getDefaultItinerary(days: number): ItineraryEntry[] {
    const list: ItineraryEntry[] = [];
    for (let i = 1; i <= days; i++) {
      list.push({
        dayNumber: i,
        title: i === 1 ? 'Arrival & Welcome Reception' : i === days ? 'Farewell Departure' : `Expedition & Exploration Day ${i}`,
        description: `Immersive bespoke experiences and curated local discoveries planned for day ${i}.`,
        activities: ['Guided orientation'],
        mealsIncluded: 'Breakfast',
        accommodation: 'Selected Partner Sanctuary',
        orderIndex: i,
      });
    }
    return list;
  }

  // Handle title change with auto slug generation if new
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEditing || !slug) {
      setSlug(
        val
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
      );
    }
  };

  // Itinerary Reordering and Controls
  const handleMoveDay = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === itineraryEntries.length - 1)
    ) {
      return;
    }

    const newEntries = [...itineraryEntries];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = newEntries[index];
    newEntries[index] = newEntries[targetIndex];
    newEntries[targetIndex] = temp;

    // Renumber days sequentially 1..N to maintain unique day numbers
    const renumbered = newEntries.map((entry, idx) => ({
      ...entry,
      dayNumber: idx + 1,
      orderIndex: idx + 1,
    }));

    setItineraryEntries(renumbered);
  };

  const handleAddDay = () => {
    const nextDayNum = itineraryEntries.length + 1;
    setItineraryEntries([
      ...itineraryEntries,
      {
        dayNumber: nextDayNum,
        title: `Day ${nextDayNum} Excursion`,
        description: 'Bespoke cultural and wildlife exploration.',
        activities: ['Private local guide'],
        mealsIncluded: 'Breakfast',
        accommodation: null,
        orderIndex: nextDayNum,
      },
    ]);
    if (nextDayNum > durationDays) {
      setDurationDays(nextDayNum);
      setDurationNights(nextDayNum - 1);
    }
  };

  const handleDeleteDay = (index: number) => {
    if (itineraryEntries.length <= 1) {
      setErrorMessage('A package itinerary must contain at least one day.');
      return;
    }
    const filtered = itineraryEntries.filter((_, i) => i !== index);
    const renumbered = filtered.map((entry, idx) => ({
      ...entry,
      dayNumber: idx + 1,
      orderIndex: idx + 1,
    }));
    setItineraryEntries(renumbered);
    if (durationDays > renumbered.length) {
      setDurationDays(renumbered.length);
      setDurationNights(Math.max(0, renumbered.length - 1));
    }
  };

  const handleUpdateDay = (index: number, field: keyof ItineraryEntry, value: any) => {
    const updated = [...itineraryEntries];
    updated[index] = { ...updated[index], [field]: value };
    setItineraryEntries(updated);
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);

    try {
      // Validate day counts
      if (itineraryEntries.length === 0) {
        throw new Error('You must provide at least one itinerary day.');
      }

      // Check unique day numbers
      const dayNumbers = itineraryEntries.map((e) => e.dayNumber);
      if (new Set(dayNumbers).size !== dayNumbers.length) {
        throw new Error('Each itinerary entry must have a unique day number.');
      }

      // Check day numbers do not exceed durationDays
      for (const entry of itineraryEntries) {
        if (entry.dayNumber > durationDays) {
          throw new Error(
            `Itinerary day ${entry.dayNumber} exceeds the package duration of ${durationDays} days.`
          );
        }
      }

      const includes = includesText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
      const excludes = excludesText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
      const gallery = galleryText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
      const activities = activitiesText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        title,
        slug: slug.trim(),
        destinationId,
        linkedDestinationIds,
        category,
        durationDays: Number(durationDays),
        durationNights: Number(durationNights),
        priceCents: Number(priceCents),
        currency,
        pricingBasis,
        isSamplePrice,
        difficulty,
        maxGroupSize: Number(maxGroupSize),
        overview,
        heroImage: heroImage.trim(),
        gallery,
        includes,
        excludes,
        transport: transport.trim() || null,
        activities,
        cancellationPolicy,
        isPublished,
        isFeatured,
        seoTitle: seoTitle.trim() || null,
        seoDescription: seoDescription.trim() || null,
        itineraryEntries: itineraryEntries.map((e, idx) => ({
          dayNumber: e.dayNumber,
          title: e.title,
          description: e.description,
          locations: e.locations || [],
          activities: typeof e.activities === 'string' ? [e.activities] : e.activities,
          mealsIncluded: e.mealsIncluded || 'Breakfast',
          accommodation: e.accommodation || null,
          orderIndex: idx + 1,
        })),
      };

      let result;
      if (isEditing && packageToEdit) {
        result = await api.updateTourPackage(token, packageToEdit.id, payload);
      } else {
        result = await api.createTourPackage(token, payload);
      }

      if (result.success && result.data) {
        onSuccess(result.data);
        onClose();
      } else {
        throw new Error(result.message || 'Operation failed');
      }
    } catch (err: any) {
      console.error('Failed to save tour package:', err);
      setErrorMessage(err.message || 'Failed to save expedition package. Please verify all fields.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-luxury border border-ivory-300 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-fadeIn my-auto">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-navy-950 text-white flex items-center justify-between border-b border-navy-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold-500/20 text-gold-400 flex items-center justify-center border border-gold-500/30">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
                {isEditing ? `Edit Expedition: ${packageToEdit?.title}` : 'Create New Expedition Package'}
              </h2>
              <p className="text-xs text-slate-400">
                Configure bespoke journey specs, pricing in minor units, and day-by-day itineraries.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tab Navigation */}
        <div className="flex border-b border-ivory-300 bg-ivory-50 px-6 gap-6 text-xs font-bold overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`py-3.5 border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'details'
                ? 'border-gold-600 text-navy-950 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4 text-teal-600" />
            <span>1. Core Specifications</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('itinerary')}
            className={`py-3.5 border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'itinerary'
                ? 'border-gold-600 text-navy-950 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4 text-gold-600" />
            <span>2. Itinerary Builder ({itineraryEntries.length} Days)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('media')}
            className={`py-3.5 border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'media'
                ? 'border-gold-600 text-navy-950 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ImageIcon className="w-4 h-4 text-teal-600" />
            <span>3. Inclusions & Media</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('seo')}
            className={`py-3.5 border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'seo'
                ? 'border-gold-600 text-navy-950 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-gold-600" />
            <span>4. Publication & SEO</span>
          </button>
        </div>

        {/* Error Feedback */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: CORE SPECIFICATIONS */}
          {activeTab === 'details' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1">
                    Package Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g. 8-Day Kerala Honeymoon Escape"
                    className="w-full px-3 py-2 rounded-xl border border-ivory-300 text-xs focus:ring-2 focus:ring-gold-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1">
                    URL Slug <span className="text-slate-400 font-normal">(Auto-generated or custom)</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="8-day-kerala-honeymoon-escape"
                    className="w-full px-3 py-2 rounded-xl border border-ivory-300 text-xs font-mono bg-ivory-50 focus:ring-2 focus:ring-gold-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1">
                    Primary Destination <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={destinationId}
                    onChange={(e) => setDestinationId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-ivory-300 text-xs bg-white focus:ring-2 focus:ring-gold-500 focus:outline-none"
                  >
                    <option value="">-- Choose Destination --</option>
                    {destinations.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.country})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1">Travel Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as TravelType)}
                    className="w-full px-3 py-2 rounded-xl border border-ivory-300 text-xs bg-white focus:ring-2 focus:ring-gold-500 focus:outline-none"
                  >
                    <option value="LUXURY">LUXURY</option>
                    <option value="HONEYMOON">HONEYMOON</option>
                    <option value="FAMILY">FAMILY</option>
                    <option value="ADVENTURE">ADVENTURE</option>
                    <option value="CULTURAL">CULTURAL</option>
                    <option value="WILDLIFE">WILDLIFE</option>
                    <option value="WELLNESS">WELLNESS</option>
                    <option value="CORPORATE">CORPORATE</option>
                    <option value="GROUP">GROUP</option>
                    <option value="SOLO">SOLO</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1">Difficulty Level</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-ivory-300 text-xs bg-white focus:ring-2 focus:ring-gold-500 focus:outline-none"
                  >
                    <option value="EASY">EASY</option>
                    <option value="MODERATE">MODERATE</option>
                    <option value="CHALLENGING">CHALLENGING</option>
                  </select>
                </div>
              </div>

              {/* Linked Multi-Destinations */}
              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">
                  Multi-Stop Destinations <span className="text-slate-400 font-normal">(Optional multi-city itinerary)</span>
                </label>
                <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-2 border border-ivory-300 rounded-xl bg-ivory-50/50">
                  {destinations.map((d) => {
                    const isSelected = linkedDestinationIds.includes(d.id);
                    return (
                      <button
                        type="button"
                        key={d.id}
                        onClick={() => {
                          if (isSelected) {
                            setLinkedDestinationIds(linkedDestinationIds.filter((id) => id !== d.id));
                          } else {
                            setLinkedDestinationIds([...linkedDestinationIds, d.id]);
                          }
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                          isSelected
                            ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                            : 'bg-white text-navy-800 border-ivory-300 hover:border-teal-400'
                        }`}
                      >
                        {d.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Duration and Financials */}
              <div className="p-4 rounded-xl bg-ivory-50 border border-ivory-200 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1">Duration (Days)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={durationDays}
                    onChange={(e) => {
                      const days = Math.max(1, Number(e.target.value));
                      setDurationDays(days);
                      setDurationNights(Math.max(0, days - 1));
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-ivory-300 text-xs bg-white font-bold text-navy-950"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1">Duration (Nights)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={durationNights}
                    onChange={(e) => setDurationNights(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-ivory-300 text-xs bg-white text-navy-950"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1">Max Guests</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={maxGroupSize}
                    onChange={(e) => setMaxGroupSize(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-ivory-300 text-xs bg-white text-navy-950"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1">Pricing Basis</label>
                  <select
                    value={pricingBasis}
                    onChange={(e) => setPricingBasis(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-ivory-300 text-xs bg-white"
                  >
                    <option value="per_person">per_person</option>
                    <option value="per_suite">per_suite</option>
                    <option value="per_charter">per_charter</option>
                  </select>
                </div>
              </div>

              {/* Minor-Unit Price in Cents */}
              <div className="p-4 rounded-xl bg-teal-50/50 border border-teal-200 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                <div>
                  <label className="block text-xs font-bold text-teal-950 mb-1">
                    Price in Integer Cents <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={priceCents}
                    onChange={(e) => setPriceCents(Number(e.target.value))}
                    placeholder="e.g. 250000"
                    className="w-full px-3 py-2 rounded-xl border border-teal-300 text-xs font-mono font-bold bg-white"
                  />
                  <span className="text-[10px] text-teal-800 font-medium block mt-1">
                    Display: ${((priceCents || 0) / 100).toLocaleString()} {currency}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-teal-950 mb-1">Currency Code</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-teal-300 text-xs bg-white font-bold"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="INR">INR (₹)</option>
                  </select>
                </div>

                <div className="pt-4">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-teal-950">
                    <input
                      type="checkbox"
                      checked={isSamplePrice}
                      onChange={(e) => setIsSamplePrice(e.target.checked)}
                      className="rounded border-teal-400 text-teal-600 focus:ring-teal-500"
                    />
                    <span>Mark as Sample Price</span>
                  </label>
                  <span className="text-[10px] text-slate-500 block ml-5">
                    Renders guide price disclaimer until client quotation is locked.
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">
                  Expedition Overview & Narrative <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={overview}
                  onChange={(e) => setOverview(e.target.value)}
                  placeholder="Comprehensive luxury narrative detailing the unique journey..."
                  className="w-full px-3 py-2 rounded-xl border border-ivory-300 text-xs leading-relaxed focus:ring-2 focus:ring-gold-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* TAB 2: ITINERARY BUILDER */}
          {activeTab === 'itinerary' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-ivory-100/70 p-4 rounded-xl border border-ivory-300">
                <div>
                  <h3 className="font-serif text-base font-bold text-navy-950 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gold-600" />
                    <span>Day-by-Day Expedition Itinerary Builder</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Add, edit, reorder, or delete days. Day numbers are validated against the {durationDays}-day package duration.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddDay}
                  className="px-3.5 py-2 rounded-xl bg-navy-900 hover:bg-navy-850 text-gold-400 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Day Entry</span>
                </button>
              </div>

              <div className="space-y-4">
                {itineraryEntries.map((entry, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl border border-ivory-300 p-4 shadow-sm hover:border-gold-400 transition-all space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2 border-b border-ivory-100 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-navy-900 text-gold-400 flex items-center justify-center font-bold text-xs">
                          {entry.dayNumber}
                        </span>
                        <input
                          type="text"
                          required
                          value={entry.title}
                          onChange={(e) => handleUpdateDay(index, 'title', e.target.value)}
                          placeholder={`Day ${entry.dayNumber} Title`}
                          className="font-bold text-xs sm:text-sm text-navy-950 border-b border-transparent hover:border-ivory-300 focus:border-gold-500 focus:outline-none px-1 py-0.5"
                        />
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleMoveDay(index, 'up')}
                          disabled={index === 0}
                          className="p-1.5 rounded-lg border border-ivory-200 text-slate-500 hover:text-navy-900 disabled:opacity-30"
                          title="Move Day Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveDay(index, 'down')}
                          disabled={index === itineraryEntries.length - 1}
                          className="p-1.5 rounded-lg border border-ivory-200 text-slate-500 hover:text-navy-900 disabled:opacity-30"
                          title="Move Day Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteDay(index)}
                          className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50"
                          title="Delete Day Entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-500 mb-1">
                        Day Description & Itinerary Activities
                      </label>
                      <textarea
                        rows={2}
                        required
                        value={entry.description}
                        onChange={(e) => handleUpdateDay(index, 'description', e.target.value)}
                        placeholder="Detailed schedule, private museum walkthrough, boat charter..."
                        className="w-full px-3 py-1.5 rounded-lg border border-ivory-300 text-xs focus:ring-1 focus:ring-gold-500 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-500 mb-1">
                          Meals Included
                        </label>
                        <input
                          type="text"
                          value={entry.mealsIncluded}
                          onChange={(e) => handleUpdateDay(index, 'mealsIncluded', e.target.value)}
                          placeholder="e.g. Breakfast, Candlelit Vineyard Dinner"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-ivory-300 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-500 mb-1">
                          Accommodation Stay
                        </label>
                        <input
                          type="text"
                          value={entry.accommodation || ''}
                          onChange={(e) => handleUpdateDay(index, 'accommodation', e.target.value)}
                          placeholder="e.g. Four Seasons Luxury Pool Suite"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-ivory-300 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: INCLUSIONS & MEDIA */}
          {activeTab === 'media' && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">
                  Hero Image URL <span className="text-rose-500">*</span>
                </label>
                <input
                  type="url"
                  required
                  value={heroImage}
                  onChange={(e) => setHeroImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-xl border border-ivory-300 text-xs focus:ring-2 focus:ring-gold-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">
                  Gallery Images <span className="text-slate-400 font-normal">(One URL per line)</span>
                </label>
                <textarea
                  rows={3}
                  value={galleryText}
                  onChange={(e) => setGalleryText(e.target.value)}
                  placeholder="https://images.unsplash.com/...&#10;https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-xl border border-ivory-300 text-xs font-mono focus:ring-2 focus:ring-gold-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-teal-900 mb-1">
                    What Is Included <span className="text-slate-400 font-normal">(One per line)</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={includesText}
                    onChange={(e) => setIncludesText(e.target.value)}
                    placeholder="Private chauffeur&#10;5-Star accommodation&#10;Daily breakfast"
                    className="w-full px-3 py-2 rounded-xl border border-teal-200 bg-teal-50/30 text-xs leading-relaxed focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    What Is Excluded <span className="text-slate-400 font-normal">(One per line)</span>
                  </label>
                  <textarea
                    rows={4}
                    value={excludesText}
                    onChange={(e) => setExcludesText(e.target.value)}
                    placeholder="International flights&#10;Personal expenses&#10;Visa fees"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs leading-relaxed focus:ring-2 focus:ring-slate-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">
                  Transport Details
                </label>
                <input
                  type="text"
                  value={transport}
                  onChange={(e) => setTransport(e.target.value)}
                  placeholder="e.g. Private chauffeur with Mercedes van & first-class scenic train tickets"
                  className="w-full px-3 py-2 rounded-xl border border-ivory-300 text-xs focus:ring-2 focus:ring-gold-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">
                  Cancellation Policy
                </label>
                <input
                  type="text"
                  value={cancellationPolicy}
                  onChange={(e) => setCancellationPolicy(e.target.value)}
                  placeholder="e.g. Complimentary cancellation up to 30 days prior to departure."
                  className="w-full px-3 py-2 rounded-xl border border-ivory-300 text-xs focus:ring-2 focus:ring-gold-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* TAB 4: PUBLICATION & SEO */}
          {activeTab === 'seo' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-xl bg-ivory-50 border border-ivory-200 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-navy-900">
                  Publication Status Controls
                </h3>
                <div className="flex flex-col sm:flex-row gap-6">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-navy-950">
                    <input
                      type="checkbox"
                      checked={isPublished}
                      onChange={(e) => setIsPublished(e.target.checked)}
                      className="rounded border-ivory-300 text-teal-600 focus:ring-teal-500"
                    />
                    <span>Published to Public Site</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-navy-950">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="rounded border-ivory-300 text-gold-600 focus:ring-gold-500"
                    />
                    <span>Featured on Home & Directory</span>
                  </label>
                </div>
                <p className="text-[11px] text-slate-500">
                  Unpublished packages are strictly hidden from public discovery and will return a 404 response if directly navigated to.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">SEO Title</label>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder="e.g. Bespoke Kerala Honeymoon & Luxury Backwaters | Wanderlust"
                  className="w-full px-3 py-2 rounded-xl border border-ivory-300 text-xs focus:ring-2 focus:ring-gold-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">SEO Meta Description</label>
                <textarea
                  rows={2}
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  placeholder="Concise search engine description summarizing the package..."
                  className="w-full px-3 py-2 rounded-xl border border-ivory-300 text-xs focus:ring-2 focus:ring-gold-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Modal Footer Controls */}
          <div className="pt-4 border-t border-ivory-200 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2.5 rounded-xl border border-ivory-300 text-xs font-bold text-slate-700 hover:bg-ivory-100 transition-colors"
            >
              Cancel
            </button>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-navy-950 text-xs font-bold shadow-gold-glow flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Persisting Expedition...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>{isEditing ? 'Save Expedition Changes' : 'Create & Persist Package'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
