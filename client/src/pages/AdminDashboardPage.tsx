import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  Users,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Search,
  Filter,
  FileSpreadsheet,
  AlertCircle,
  RotateCcw,
  LogOut,
  MapPin,
  Mail,
  Phone,
  Save,
  X,
  ExternalLink,
  Shield,
  Loader2,
  Trash2,
  Copy,
  Building2,
  Bed,
  Car,
  DollarSign,
  Send,
  Eye,
  EyeOff,
  Edit,
  Plus,
  Star,
  Sliders
} from 'lucide-react';
import type {
  InquiryRecord,
  DashboardStats,
  EmailLogRecord,
  Destination,
  TourPackage,
  Hotel,
  RoomType,
  BookingAccommodationAllocation,
  BookingTransportAllocation
} from '@shared/types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { SEO } from '../components/SEO';
import { PackageEditorModal } from '../components/PackageEditorModal';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { admin, token, logout, isAuthenticated, isLoading } = useAuth();

  // Tab State
  const [activeTab, setActiveTab] = useState<'inquiries' | 'hotels' | 'destinations' | 'packages' | 'emailLogs'>('inquiries');

  // Dashboard Data
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [inquiries, setInquiries] = useState<InquiryRecord[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [packages, setPackages] = useState<TourPackage[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLogRecord[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Inquiry Filter & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Package Management State
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<TourPackage | null>(null);
  const [pkgSearch, setPkgSearch] = useState('');
  const [pkgStatusFilter, setPkgStatusFilter] = useState<'ALL' | 'PUBLISHED' | 'UNPUBLISHED' | 'FEATURED' | 'ARCHIVED'>('ALL');
  const [pkgCategoryFilter, setPkgCategoryFilter] = useState('ALL');
  const [pkgSort, setPkgSort] = useState('createdAt_desc');
  const [loadingPackages, setLoadingPackages] = useState(false);

  // Selected Booking / Inquiry Drawer
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryRecord | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Allocation Form State
  const [selectedHotelId, setSelectedHotelId] = useState<string>('');
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState<string>('');
  const [allocCheckIn, setAllocCheckIn] = useState<string>('');
  const [allocCheckOut, setAllocCheckOut] = useState<string>('');
  const [allocNights, setAllocNights] = useState<number>(1);
  const [allocRoomCount, setAllocRoomCount] = useState<number>(1);
  const [allocOccupancy, setAllocOccupancy] = useState<number>(2);
  const [allocMealPlan, setAllocMealPlan] = useState<string>('BED_AND_BREAKFAST');
  const [allocSpecialRequests, setAllocSpecialRequests] = useState<string>('');
  const [allocStatus, setAllocStatus] = useState<'PENDING' | 'CONFIRMED'>('CONFIRMED');
  const [allocSupplierRef, setAllocSupplierRef] = useState<string>('');

  // Transport Form State
  const [transType, setTransType] = useState<string>('AIRPORT_TRANSFER');
  const [transPickup, setTransPickup] = useState<string>('');
  const [transPickupTime, setTransPickupTime] = useState<string>('');
  const [transDropoff, setTransDropoff] = useState<string>('');
  const [transFlight, setTransFlight] = useState<string>('');
  const [transProvider, setTransProvider] = useState<string>('');
  const [transInstructions, setTransInstructions] = useState<string>('');

  // Confirmation Form State
  const [confirmPriceCents, setConfirmPriceCents] = useState<number>(0);
  const [confirmCurrency, setConfirmCurrency] = useState<string>('USD');
  const [confirmPaidCents, setConfirmPaidCents] = useState<number>(0);
  const [confirmPayStatus, setConfirmPayStatus] = useState<string>('PENDING');
  const [confirmDueDate, setConfirmDueDate] = useState<string>('');
  const [confirmInstructions, setConfirmInstructions] = useState<string>('');

  // Email Inspection Modal
  const [inspectedLog, setInspectedLog] = useState<EmailLogRecord | null>(null);

  // Authentication check
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/admin/login', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  const loadAdminPackages = async () => {
    if (!token) return;
    setLoadingPackages(true);
    try {
      const res = await api.getAdminPackages(token, {
        status: pkgStatusFilter !== 'ALL' ? pkgStatusFilter : undefined,
        category: pkgCategoryFilter !== 'ALL' ? pkgCategoryFilter : undefined,
        search: pkgSearch.trim() || undefined,
        sort: pkgSort,
      });
      if (res.success) {
        setPackages(res.data);
      }
    } catch (err) {
      console.error('Failed to load admin packages:', err);
    } finally {
      setLoadingPackages(false);
    }
  };

  const loadDashboardData = async () => {
    if (!token) return;
    setLoadingData(true);
    try {
      const [statsRes, inqRes, destRes, pkgRes, hotelsRes, logsRes] = await Promise.all([
        api.getAdminStats(token),
        api.getAdminInquiries(token, {
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
          search: searchQuery.trim() || undefined,
        }),
        api.getDestinations({ includeArchived: true }),
        api.getAdminPackages(token, {
          status: pkgStatusFilter !== 'ALL' ? pkgStatusFilter : undefined,
          category: pkgCategoryFilter !== 'ALL' ? pkgCategoryFilter : undefined,
          search: pkgSearch.trim() || undefined,
          sort: pkgSort,
        }),
        api.getHotels(),
        api.getEmailLogs(token),
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (inqRes.success) setInquiries(inqRes.data);
      if (destRes.success) setDestinations(destRes.data);
      if (pkgRes.success) setPackages(pkgRes.data);
      if (hotelsRes.success) setHotels(hotelsRes.data);
      if (logsRes.success) setEmailLogs(logsRes.data);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadDashboardData();
    }
  }, [token, statusFilter]);

  useEffect(() => {
    if (token) {
      loadAdminPackages();
    }
  }, [token, pkgStatusFilter, pkgCategoryFilter, pkgSort]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (token) {
      loadDashboardData();
    }
  };

  const handlePkgSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (token) {
      loadAdminPackages();
    }
  };

  const openInquiryDrawer = (inquiry: InquiryRecord) => {
    setSelectedInquiry(inquiry);
    setActionFeedback(null);
    setAllocCheckIn(inquiry.departureDate || '');
    setAllocCheckOut(inquiry.returnDate || '');
    setConfirmPriceCents(inquiry.totalPriceCents || (inquiry.package?.priceCents ? inquiry.package.priceCents * inquiry.adults : 250000));
    setConfirmPaidCents(inquiry.amountPaidCents || 0);
    setConfirmPayStatus(inquiry.paymentStatus || 'PENDING');
    setConfirmDueDate(inquiry.paymentDueDate || '');
    setConfirmInstructions(inquiry.customerInstructions || '');
  };

  const handleQuickStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>, inquiryId: string) => {
    e.stopPropagation();
    const newStatus = e.target.value;
    if (!token || !newStatus) return;
    try {
      const res = await api.updateInquiryStatus(token, inquiryId, { status: newStatus });
      if (res.success) {
        loadDashboardData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update inquiry status');
    }
  };

  const handleAssignAccommodation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedInquiry) return;
    setIsUpdating(true);
    setActionFeedback(null);

    try {
      const res = await api.assignAccommodation(token, selectedInquiry.id, {
        hotelId: selectedHotelId,
        roomTypeId: selectedRoomTypeId,
        checkInDate: allocCheckIn,
        checkOutDate: allocCheckOut,
        nights: allocNights,
        roomCount: allocRoomCount,
        occupancyPerRoom: allocOccupancy,
        mealPlan: allocMealPlan,
        specialRequests: allocSpecialRequests || null,
        status: allocStatus,
        supplierConfirmationRef: allocSupplierRef || null,
        priceCents: 0,
      });

      if (res.success) {
        setActionFeedback({ type: 'success', message: 'Accommodation segment assigned successfully.' });
        // Refresh inquiry
        const updatedInqRes = await api.getAdminInquiries(token, { search: selectedInquiry.reference });
        if (updatedInqRes.data[0]) {
          setSelectedInquiry(updatedInqRes.data[0]);
        }
        loadDashboardData();
      }
    } catch (err: any) {
      setActionFeedback({ type: 'error', message: err.message || 'Failed to assign accommodation' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAssignTransport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedInquiry) return;
    setIsUpdating(true);
    setActionFeedback(null);

    try {
      const res = await api.assignTransport(token, selectedInquiry.id, {
        transportType: transType,
        pickupLocation: transPickup,
        pickupDateTime: transPickupTime,
        dropoffLocation: transDropoff,
        flightNumber: transFlight || null,
        provider: transProvider || null,
        meetingInstructions: transInstructions || null,
        status: 'CONFIRMED',
      });

      if (res.success) {
        setActionFeedback({ type: 'success', message: 'Transport allocation recorded successfully.' });
        const updatedInqRes = await api.getAdminInquiries(token, { search: selectedInquiry.reference });
        if (updatedInqRes.data[0]) {
          setSelectedInquiry(updatedInqRes.data[0]);
        }
        loadDashboardData();
      }
    } catch (err: any) {
      setActionFeedback({ type: 'error', message: err.message || 'Failed to assign transport' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConfirmBooking = async () => {
    if (!token || !selectedInquiry) return;
    setIsUpdating(true);
    setActionFeedback(null);

    try {
      const res = await api.confirmBooking(token, selectedInquiry.id, {
        totalPriceCents: confirmPriceCents,
        currency: confirmCurrency,
        amountPaidCents: confirmPaidCents,
        paymentStatus: confirmPayStatus,
        paymentDueDate: confirmDueDate || null,
        customerInstructions: confirmInstructions || null,
      });

      if (res.success) {
        setActionFeedback({ type: 'success', message: 'Booking confirmed! Confirmation email enqueued with hotel and transport segments.' });
        setSelectedInquiry(res.data);
        loadDashboardData();
      }
    } catch (err: any) {
      setActionFeedback({ type: 'error', message: err.message || 'Failed to confirm booking' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!token || !selectedInquiry) return;
    setIsUpdating(true);
    try {
      const res = await api.updateInquiryStatus(token, selectedInquiry.id, {
        status: newStatus,
      });
      if (res.success) {
        setSelectedInquiry(res.data);
        loadDashboardData();
      }
    } catch (err: any) {
      setActionFeedback({ type: 'error', message: err.message });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSendReminder = async (type: 'PAYMENT_DUE' | 'PRE_TRIP') => {
    if (!token || !selectedInquiry) return;
    setIsUpdating(true);
    try {
      const res = await api.sendBookingReminder(token, selectedInquiry.id, type);
      if (res.success) {
        setActionFeedback({ type: 'success', message: res.message });
        loadDashboardData();
      }
    } catch (err: any) {
      setActionFeedback({ type: 'error', message: err.message });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCreatePackage = () => {
    setEditingPackage(null);
    setIsPackageModalOpen(true);
  };

  const handleEditPackage = async (pkg: TourPackage) => {
    if (!token) return;
    try {
      const res = await api.getAdminPackageById(token, pkg.id);
      if (res.success && res.data) {
        setEditingPackage(res.data);
      } else {
        setEditingPackage(pkg);
      }
    } catch {
      setEditingPackage(pkg);
    }
    setIsPackageModalOpen(true);
  };

  const handleTogglePublishPackage = async (packageId: string, currentPublished: boolean) => {
    if (!token) return;
    try {
      const res = await api.togglePublishPackage(token, packageId, !currentPublished);
      if (res.success) {
        loadAdminPackages();
      }
    } catch (err: any) {
      alert(`Error toggling publication: ${err.message}`);
    }
  };

  const handleToggleFeaturePackage = async (packageId: string, currentFeatured: boolean) => {
    if (!token) return;
    try {
      const res = await api.toggleFeaturePackage(token, packageId, !currentFeatured);
      if (res.success) {
        loadAdminPackages();
      }
    } catch (err: any) {
      alert(`Error toggling feature: ${err.message}`);
    }
  };

  const handleDuplicatePackage = async (packageId: string) => {
    if (!token) return;
    try {
      const res = await api.duplicateTourPackage(token, packageId);
      if (res.success) {
        alert(`Package successfully duplicated: ${res.data.title}`);
        loadAdminPackages();
      }
    } catch (err: any) {
      alert(`Error duplicating package: ${err.message}`);
    }
  };

  const handleArchivePackage = async (packageId: string) => {
    if (!token || !window.confirm('Archive this package? (Existing bookings referencing it will remain intact)')) return;
    try {
      const res = await api.archiveTourPackage(token, packageId);
      alert(res.message);
      loadAdminPackages();
    } catch (err: any) {
      alert(`Error archiving package: ${err.message}`);
    }
  };

  const handleRetryEmail = async (logId: string) => {
    if (!token) return;
    try {
      const res = await api.retryNotification(token, logId);
      if (res.success) {
        alert('Notification retry initiated successfully.');
        loadDashboardData();
      }
    } catch (err: any) {
      alert(`Retry failed: ${err.message}`);
    }
  };

  const formatPrice = (cents?: number | null, curr = 'USD') => {
    if (cents === null || cents === undefined) return 'N/A';
    return `${curr} ${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">CONFIRMED</span>;
      case 'AWAITING_PAYMENT':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">AWAITING PAYMENT</span>;
      case 'QUOTATION_SENT':
      case 'QUOTED':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">QUOTATION SENT</span>;
      case 'CANCELLED':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">CANCELLED</span>;
      case 'IN_PROGRESS':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-300">IN PROGRESS</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-300">NEW INQUIRY</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      <SEO title="Concierge Command Dashboard | Wanderlust Luxury Travel" description="Secure travel booking, catalog management, hotel allocations, and transactional email reliability engine." />

      {/* Top Navigation */}
      <header className="bg-[#0A192F] text-white shadow-xl sticky top-0 z-40 border-b border-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="font-serif text-2xl font-bold tracking-widest text-gold-400">WANDERLUST</span>
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded text-xs font-mono uppercase bg-navy-800 text-teal-400 border border-teal-500/30">
              Admin Portal
            </span>
          </div>

          <div className="flex items-center space-x-6">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-white">{admin?.name}</p>
              <p className="text-xs text-slate-400">{admin?.email}</p>
            </div>
            <button
              onClick={logout}
              className="inline-flex items-center space-x-2 text-sm text-slate-300 hover:text-white px-3 py-2 rounded-lg hover:bg-navy-800 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800 flex space-x-1 sm:space-x-8 overflow-x-auto bg-[#0A192F]">
          <button
            onClick={() => setActiveTab('inquiries')}
            className={`py-3 px-2 border-b-2 font-medium text-sm flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'inquiries' ? 'border-[#D97706] text-[#D97706] font-bold' : 'border-transparent text-slate-300 hover:text-white'
            }`}
          >
            <Compass className="w-4 h-4" />
            Bookings & Inquiries
          </button>
          <button
            onClick={() => setActiveTab('hotels')}
            className={`py-3 px-2 border-b-2 font-medium text-sm flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'hotels' ? 'border-[#D97706] text-[#D97706] font-bold' : 'border-transparent text-slate-300 hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Hotels & Room Inventory ({hotels.length})
          </button>
          <button
            onClick={() => setActiveTab('destinations')}
            className={`py-3 px-2 border-b-2 font-medium text-sm flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'destinations' ? 'border-[#D97706] text-[#D97706] font-bold' : 'border-transparent text-slate-300 hover:text-white'
            }`}
          >
            <MapPin className="w-4 h-4" />
            Destinations ({destinations.length})
          </button>
          <button
            onClick={() => setActiveTab('packages')}
            className={`py-3 px-2 border-b-2 font-medium text-sm flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'packages' ? 'border-[#D97706] text-[#D97706] font-bold' : 'border-transparent text-slate-300 hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Packages ({packages.length})
          </button>
          <button
            onClick={() => setActiveTab('emailLogs')}
            className={`py-3 px-2 border-b-2 font-medium text-sm flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'emailLogs' ? 'border-[#D97706] text-[#D97706] font-bold' : 'border-transparent text-slate-300 hover:text-white'
            }`}
          >
            <Mail className="w-4 h-4" />
            Email Outbox Audit ({emailLogs.length})
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* KPI Summary Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div
              onClick={() => setActiveTab('inquiries')}
              className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-400 transition-all cursor-pointer group"
              title="Click to view inquiries"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Active Inquiries</p>
                  <p className="text-3xl font-serif font-bold text-[#0A192F] mt-1 group-hover:text-blue-700">{stats.totalInquiries}</p>
                </div>
                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100">
                  <Compass className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div
              onClick={() => { setActiveTab('inquiries'); setStatusFilter('CONFIRMED'); }}
              className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-400 transition-all cursor-pointer group"
              title="Click to view confirmed bookings"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Confirmed Bookings</p>
                  <p className="text-3xl font-serif font-bold text-emerald-600 mt-1">{stats.confirmedInquiries}</p>
                </div>
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-100">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div
              onClick={() => setActiveTab('hotels')}
              className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-teal-400 transition-all cursor-pointer group"
              title="Click to manage verified hotels"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Verified Hotels</p>
                  <p className="text-3xl font-serif font-bold text-[#0D9488] mt-1 group-hover:text-teal-700">{stats.totalHotels || hotels.length}</p>
                </div>
                <div className="p-3 bg-teal-50 text-teal-600 rounded-lg group-hover:bg-teal-100">
                  <Building2 className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div
              onClick={() => setActiveTab('packages')}
              className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-400 transition-all cursor-pointer group"
              title="Click to manage tour packages"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Total Catalog</p>
                  <p className="text-3xl font-serif font-bold text-[#0A192F] mt-1 group-hover:text-amber-700">
                    {stats.totalDestinations} Dest / {stats.totalPackages} Pkg
                  </p>
                </div>
                <div className="p-3 bg-amber-50 text-amber-600 rounded-lg group-hover:bg-amber-100">
                  <MapPin className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: INQUIRIES & BOOKING WORKFLOW */}
        {activeTab === 'inquiries' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-serif font-bold text-luxury-navy">Guest Inquiries & Confirmed Voyages</h2>
                <p className="text-sm text-slate-500">Manage traveler requirements, assign hotels and rooms, lock transport, and confirm bookings.</p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => api.exportInquiriesCsv(token!)}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="p-6 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row gap-4">
              <form onSubmit={handleSearchSubmit} className="flex-1 relative">
                <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by reference (e.g. WND-2026), guest name, email, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-luxury-teal"
                />
              </form>

              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-500" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2.5 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-luxury-teal"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="NEW_INQUIRY">New Inquiry</option>
                  <option value="AWAITING_REVIEW">Awaiting Review</option>
                  <option value="QUOTATION_SENT">Quotation Sent</option>
                  <option value="AWAITING_PAYMENT">Awaiting Payment</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Inquiries Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                    <th className="py-3.5 px-6">Reference & Guest</th>
                    <th className="py-3.5 px-6">Destination & Package</th>
                    <th className="py-3.5 px-6">Travel Dates</th>
                    <th className="py-3.5 px-6">Party & Allocations</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-sm">
                  {loadingData ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-luxury-teal" />
                        Loading inquiries...
                      </td>
                    </tr>
                  ) : inquiries.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500">
                        No inquiries found matching your query.
                      </td>
                    </tr>
                  ) : (
                    inquiries.map((inq) => {
                      const accCount = inq.accommodationAllocations?.length || 0;
                      return (
                        <tr
                          key={inq.id}
                          onClick={() => openInquiryDrawer(inq)}
                          className="hover:bg-slate-100/80 transition-colors cursor-pointer group"
                        >
                          <td className="py-4 px-6">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openInquiryDrawer(inq);
                              }}
                              className="font-mono text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 px-2.5 py-0.5 rounded border border-teal-300 transition-colors inline-flex items-center gap-1 cursor-pointer"
                              title="Click to open voyage drawer"
                            >
                              {inq.reference}
                            </button>
                            <div className="font-semibold text-slate-900 mt-1 group-hover:text-teal-900">{inq.customerName}</div>
                            <div className="text-xs text-slate-500">{inq.email}</div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="font-medium text-slate-800">
                              {inq.destination?.name ? `${inq.destination.name}, ${inq.destination.country}` : 'Custom'}
                            </div>
                            <div className="text-xs text-slate-500 truncate max-w-xs">{inq.package?.title || 'Bespoke Private Itinerary'}</div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="text-slate-800">{inq.departureDate}</div>
                            <div className="text-xs text-slate-500">to {inq.returnDate}</div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="text-slate-800">{inq.adults} Adults{inq.children > 0 ? `, ${inq.children} Ch.` : ''}</div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              {accCount > 0 ? (
                                <span className="text-emerald-700 font-medium">🏨 {accCount} segment(s) assigned</span>
                              ) : (
                                <span className="text-amber-700">⚠️ No hotels assigned</span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-6" onClick={(e) => e.stopPropagation()}>
                            <div className="flex flex-col gap-1.5 items-start">
                              {getStatusBadge(inq.status)}
                              <select
                                value={inq.status}
                                onChange={(e) => handleQuickStatusChange(e, inq.id)}
                                className="text-[11px] py-1 px-2 border border-slate-300 rounded bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer shadow-sm"
                                title="Change voyage status immediately"
                              >
                                <option value="NEW_INQUIRY">Set: New</option>
                                <option value="REVIEWING">Set: Reviewing</option>
                                <option value="QUOTATION_SENT">Set: Quoted</option>
                                <option value="AWAITING_PAYMENT">Set: Awaiting Pay</option>
                                <option value="CONFIRMED">Set: Confirmed</option>
                                <option value="CANCELLED">Set: Cancelled</option>
                              </select>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => openInquiryDrawer(inq)}
                              style={{ backgroundColor: '#0A192F', color: '#ffffff' }}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#0A192F] hover:bg-[#152E52] text-white text-xs font-bold rounded-lg shadow-sm border border-navy-700 transition-all cursor-pointer"
                              title="Open inquiry drawer to assign hotels, rooms, transport, and confirm"
                            >
                              <Sliders className="w-3.5 h-3.5 text-gold-400" />
                              <span>Manage Voyage</span>
                              <span className="text-gold-400 font-bold">&rarr;</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: HOTELS & ROOMS */}
        {activeTab === 'hotels' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <h2 className="text-xl font-serif font-bold text-luxury-navy">First-Class Hotel & Room Registry</h2>
                <p className="text-sm text-slate-500">Manage verified luxury hotels, real star classes, and multi-room inventory per property.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {hotels.map((hotel) => (
                <div key={hotel.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                  {hotel.photos && hotel.photos[0] && (
                    <img src={hotel.photos[0]} alt={hotel.name} className="h-48 w-full object-cover" />
                  )}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-luxury-teal">
                          {hotel.destination?.name || 'Destination'}
                        </span>
                        {hotel.verifiedStarClass && (
                          <span className="inline-flex items-center text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            ★ {hotel.verifiedStarClass}-Star Verified
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-luxury-navy mt-1">{hotel.name}</h3>
                      <p className="text-xs text-slate-500 mt-1">{hotel.address}</p>
                      <p className="text-sm text-slate-600 mt-3 line-clamp-2">{hotel.description}</p>

                      <div className="mt-4 pt-4 border-t border-slate-100">
                        <h4 className="text-xs font-semibold uppercase text-slate-500 mb-2">Room Types & Rates:</h4>
                        <div className="space-y-2">
                          {hotel.roomTypes && hotel.roomTypes.length > 0 ? (
                            hotel.roomTypes.map((rt) => (
                              <div key={rt.id} className="p-2.5 bg-slate-50 rounded border border-slate-200 text-xs flex justify-between items-center">
                                <div>
                                  <span className="font-semibold text-slate-800">{rt.name}</span>
                                  <span className="text-slate-500 ml-2">({rt.bedConfiguration}, max {rt.maxOccupancy})</span>
                                </div>
                                <div className="text-right">
                                  <span className="font-bold text-luxury-teal">{formatPrice(rt.priceCents, rt.currency)}</span>
                                  <span className="text-slate-400 block text-[10px]">Inventory: {rt.inventoryCount}</span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-slate-400 italic">No room types configured.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: DESTINATIONS */}
        {activeTab === 'destinations' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-xl font-serif font-bold text-luxury-navy mb-4">Structured Destinations Catalog ({destinations.length})</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {destinations.map((d) => (
                <div key={d.id} className="border border-slate-200 rounded-lg overflow-hidden flex flex-col justify-between">
                  <img src={d.heroImage} alt={d.name} className="h-40 w-full object-cover" />
                  <div className="p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-luxury-teal uppercase">{d.country} ({d.continent})</span>
                      <span className="text-xs font-mono font-bold">{formatPrice(d.startingPriceCents || d.startingPrice * 100)}</span>
                    </div>
                    <h3 className="font-bold text-slate-900 mt-1">{d.name}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">{d.tagline}</p>
                    <div className="mt-3 text-[11px] text-slate-400">
                      Region: {d.region || 'Standard'} | Duration: {d.recommendedDuration}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: PACKAGES */}
        {activeTab === 'packages' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <h2 className="text-xl font-serif font-bold text-luxury-navy">
                  Tour Packages Catalog ({packages.length})
                </h2>
                <p className="text-sm text-slate-500">
                  Create, configure, publish, feature, reorder day-by-day itineraries, and duplicate travel packages.
                </p>
              </div>

              <button
                onClick={handleCreatePackage}
                style={{ backgroundColor: '#D97706', color: '#0A192F' }}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#D97706] hover:bg-[#B45309] text-[#0A192F] hover:text-white font-bold text-sm rounded-lg shadow-md transition-all cursor-pointer border border-amber-600"
              >
                <Plus className="w-4 h-4" />
                <span>+ Create New Expedition Package</span>
              </button>
            </div>

            {/* Filter Toolbar */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
              <form onSubmit={handlePkgSearchSubmit} className="flex-1 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search packages by title, overview, or destination..."
                  value={pkgSearch}
                  onChange={(e) => setPkgSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-luxury-teal"
                />
              </form>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-slate-500" />
                  <select
                    value={pkgStatusFilter}
                    onChange={(e) => setPkgStatusFilter(e.target.value as any)}
                    className="px-2.5 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-luxury-teal"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="PUBLISHED">Published Only</option>
                    <option value="UNPUBLISHED">Drafts / Unpublished</option>
                    <option value="FEATURED">Featured Only</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>

                <select
                  value={pkgCategoryFilter}
                  onChange={(e) => setPkgCategoryFilter(e.target.value)}
                  className="px-2.5 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-luxury-teal"
                >
                  <option value="ALL">All Categories</option>
                  <option value="LUXURY">Luxury</option>
                  <option value="HONEYMOON">Honeymoon</option>
                  <option value="ADVENTURE">Adventure</option>
                  <option value="CULTURAL">Cultural</option>
                  <option value="WILDLIFE">Wildlife</option>
                  <option value="CRUISE">Cruise</option>
                  <option value="FAMILY">Family</option>
                  <option value="WELLNESS">Wellness</option>
                </select>

                <select
                  value={pkgSort}
                  onChange={(e) => setPkgSort(e.target.value)}
                  className="px-2.5 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-luxury-teal"
                >
                  <option value="createdAt_desc">Newest First</option>
                  <option value="title_asc">Title (A-Z)</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="duration_desc">Duration: Long to Short</option>
                </select>
              </div>
            </div>

            {/* Packages Grid */}
            {loadingPackages ? (
              <div className="py-16 text-center text-slate-500">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-luxury-teal" />
                <p className="text-sm">Loading package catalog...</p>
              </div>
            ) : packages.length === 0 ? (
              <div className="py-16 text-center text-slate-500 border border-dashed border-slate-300 rounded-xl">
                <Calendar className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <h3 className="font-serif text-lg font-bold text-slate-800">No Packages Found</h3>
                <p className="text-xs text-slate-500 mt-1 mb-4">No expedition packages match the selected filters.</p>
                <button
                  onClick={handleCreatePackage}
                  className="px-4 py-2 bg-luxury-teal text-white rounded-lg text-xs font-bold hover:bg-luxury-teal-dark transition-colors"
                >
                  + Create First Package
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {packages.map((pkg) => {
                  const dayCount = pkg.itineraryEntries?.length || pkg.itinerary?.length || 0;
                  const priceFormatted = formatPrice(pkg.priceCents || pkg.price * 100, pkg.currency || 'USD');

                  return (
                    <div
                      key={pkg.id}
                      className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      {/* Image Banner & Overlays */}
                      <div className="relative h-44 bg-slate-900 overflow-hidden">
                        {pkg.heroImage ? (
                          <img
                            src={pkg.heroImage}
                            alt={pkg.title}
                            className="w-full h-full object-cover opacity-85"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-500 text-xs">
                            No image provided
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md text-white border border-white/20">
                            {pkg.category} • {pkg.durationDays}D / {pkg.durationNights}N
                          </span>
                          {pkg.isFeatured && (
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-400 text-slate-950 flex items-center gap-1">
                              <Star className="w-3 h-3 fill-slate-950" />
                              Featured
                            </span>
                          )}
                        </div>

                        {/* Publication Status Badge */}
                        <div className="absolute top-3 right-3">
                          {pkg.isArchived ? (
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-600 text-white shadow">
                              ARCHIVED
                            </span>
                          ) : pkg.isPublished ? (
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-600 text-white shadow">
                              PUBLISHED
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500 text-slate-950 shadow">
                              DRAFT
                            </span>
                          )}
                        </div>

                        {/* Bottom Overlay Title & Slug */}
                        <div className="absolute bottom-3 left-3 right-3 text-white">
                          <h3 className="font-serif text-lg font-bold truncate">
                            {pkg.title}
                          </h3>
                          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-300">
                            <span>/{pkg.slug}</span>
                            {pkg.isPublished && !pkg.isArchived && (
                              <a
                                href={`/packages/${pkg.slug}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-luxury-gold hover:text-white inline-flex items-center gap-0.5"
                                title="View public page"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <p className="text-xs text-slate-600 line-clamp-2">
                            {pkg.overview}
                          </p>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                            <span className="inline-flex items-center gap-1 font-medium text-slate-800">
                              <MapPin className="w-3.5 h-3.5 text-luxury-teal" />
                              {pkg.destination?.name || 'Custom Destination'}
                            </span>
                            {pkg.packageDestinations && pkg.packageDestinations.length > 0 && (
                              <span className="text-[11px] text-luxury-teal bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                                +{pkg.packageDestinations.length} Linked
                              </span>
                            )}
                            <span className="inline-flex items-center gap-1 text-slate-600">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              {dayCount} Itinerary {dayCount === 1 ? 'Day' : 'Days'}
                            </span>
                          </div>
                        </div>

                        {/* Price & Status Details */}
                        <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between">
                          <div>
                            <span className="text-base font-bold font-serif text-luxury-navy">
                              {priceFormatted}
                            </span>
                            <span className="text-[11px] text-slate-500 ml-1">
                              / {pkg.pricingBasis ? pkg.pricingBasis.replace('_', ' ') : 'traveler'}
                            </span>
                            {pkg.isSamplePrice && (
                              <span className="ml-2 text-[10px] uppercase font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                Sample Price
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400">
                            Max {pkg.maxGroupSize} Guests
                          </span>
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleTogglePublishPackage(pkg.id, pkg.isPublished)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded transition-colors ${
                              pkg.isPublished
                                ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            }`}
                            title={pkg.isPublished ? 'Unpublish package (hides from public)' : 'Publish package to live catalog'}
                          >
                            {pkg.isPublished ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            <span>{pkg.isPublished ? 'Unpublish' : 'Publish'}</span>
                          </button>

                          <button
                            onClick={() => handleToggleFeaturePackage(pkg.id, pkg.isFeatured)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded transition-colors ${
                              pkg.isFeatured
                                ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                            }`}
                            title={pkg.isFeatured ? 'Remove featured status' : 'Feature on homepage and highlights'}
                          >
                            <Star className={`w-3.5 h-3.5 ${pkg.isFeatured ? 'fill-amber-600 text-amber-600' : ''}`} />
                            <span>{pkg.isFeatured ? 'Featured' : 'Feature'}</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleEditPackage(pkg)}
                            style={{ backgroundColor: '#0A192F', color: '#ffffff' }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0A192F] hover:bg-[#152E52] text-white text-xs font-bold rounded shadow-sm border border-navy-700 transition-colors cursor-pointer"
                            title="Edit package details and day-by-day itinerary"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>

                          <button
                            onClick={() => handleDuplicatePackage(pkg.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-slate-200 hover:bg-slate-300 text-slate-800 rounded transition-colors"
                            title="Duplicate package with all itinerary days"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </button>

                          <button
                            onClick={() => handleArchivePackage(pkg.id)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100 rounded transition-colors"
                            title="Archive package (protects existing booking history)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: EMAIL OUTBOX AUDIT */}
        {activeTab === 'emailLogs' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-serif font-bold text-luxury-navy">Transactional Email Outbox & Reliability Log</h2>
              <p className="text-sm text-slate-500">Every transactional email has delivery tracking, idempotency enforcement, and manual retry controls.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                    <th className="py-3.5 px-6">Timestamp</th>
                    <th className="py-3.5 px-6">Booking Ref</th>
                    <th className="py-3.5 px-6">Recipient & Type</th>
                    <th className="py-3.5 px-6">Notification Type</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-sm">
                  {emailLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-6 text-xs text-slate-500 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-6 font-mono text-xs font-bold text-luxury-teal">
                        {log.bookingReference || 'N/A'}
                      </td>
                      <td className="py-3.5 px-6 text-xs">
                        <div className="font-medium text-slate-800">{log.recipientEmail}</div>
                        <div className="text-slate-400">{log.recipientType}</div>
                      </td>
                      <td className="py-3.5 px-6 text-xs font-mono">
                        {log.notificationType || log.templateName}
                      </td>
                      <td className="py-3.5 px-6">
                        <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                          log.status === 'SENT' || log.status === 'ACCEPTED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : log.status === 'FAILED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-right space-x-2">
                        {log.htmlContent && (
                          <button
                            onClick={() => setInspectedLog(log)}
                            className="px-2.5 py-1 text-xs bg-slate-100 text-slate-700 hover:bg-slate-200 rounded"
                          >
                            <Eye className="w-3.5 h-3.5 inline mr-1" />
                            View
                          </button>
                        )}
                        <button
                          onClick={() => handleRetryEmail(log.id)}
                          className="px-2.5 py-1 text-xs bg-luxury-teal text-white hover:bg-luxury-teal-dark rounded"
                        >
                          <RotateCcw className="w-3.5 h-3.5 inline mr-1" />
                          Retry
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* BOOKING WORKFLOW DRAWER / MODAL */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex justify-end">
          <div className="bg-white w-full max-w-3xl min-h-screen p-8 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-base font-bold text-luxury-teal bg-teal-50 px-2.5 py-0.5 rounded border border-teal-200">
                      {selectedInquiry.reference}
                    </span>
                    {getStatusBadge(selectedInquiry.status)}
                  </div>
                  <h2 className="text-2xl font-serif font-bold text-luxury-navy mt-2">
                    {selectedInquiry.customerName}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {selectedInquiry.email} • {selectedInquiry.phone} • Preferred: {selectedInquiry.preferredContact}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedInquiry(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {actionFeedback && (
                <div className={`mt-4 p-3 rounded-lg text-sm flex items-center gap-2 ${
                  actionFeedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}>
                  <AlertCircle className="w-4 h-4" />
                  <span>{actionFeedback.message}</span>
                </div>
              )}

              {/* SECTION: ASSIGNED ACCOMMODATIONS */}
              <div className="mt-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-luxury-navy flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-luxury-teal" />
                  Assigned Accommodations ({selectedInquiry.accommodationAllocations?.length || 0})
                </h3>

                <div className="mt-3 space-y-3">
                  {selectedInquiry.accommodationAllocations && selectedInquiry.accommodationAllocations.length > 0 ? (
                    selectedInquiry.accommodationAllocations.map((acc, index) => (
                      <div key={acc.id} className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                        <div className="flex justify-between font-bold text-slate-800">
                          <span>Segment {index + 1}: {acc.hotel?.name}</span>
                          <span className={`px-2 py-0.5 rounded ${acc.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                            {acc.status}
                          </span>
                        </div>
                        <div className="text-slate-600">Room: {acc.roomType?.name} ({acc.roomCount} room(s), {acc.occupancyPerRoom} guests/room)</div>
                        <div className="text-slate-500">Dates: {acc.checkInDate} to {acc.checkOutDate} ({acc.nights} nights) | Plan: {acc.mealPlan}</div>
                        {acc.supplierConfirmationRef && (
                          <div className="font-mono text-luxury-teal">Supplier Ref: {acc.supplierConfirmationRef}</div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                      ⚠️ No accommodation segments assigned yet. You must assign and confirm at least one accommodation segment before confirming this voyage.
                    </div>
                  )}
                </div>

                {/* Form to Assign Hotel & Room */}
                <form onSubmit={handleAssignAccommodation} className="mt-4 p-4 bg-slate-100/70 border border-slate-200 rounded-lg text-xs space-y-3">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5 text-luxury-teal" />
                    Assign Hotel & Room Segment
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">Select Hotel</label>
                      <select
                        value={selectedHotelId}
                        onChange={(e) => {
                          setSelectedHotelId(e.target.value);
                          const h = hotels.find(h => h.id === e.target.value);
                          if (h && h.roomTypes && h.roomTypes[0]) {
                            setSelectedRoomTypeId(h.roomTypes[0].id);
                          }
                        }}
                        className="w-full p-2 rounded border border-slate-300 text-xs bg-white"
                        required
                      >
                        <option value="">-- Choose Hotel --</option>
                        {hotels.map(h => (
                          <option key={h.id} value={h.id}>{h.name} ({h.destination?.name})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">Select Room Type</label>
                      <select
                        value={selectedRoomTypeId}
                        onChange={(e) => setSelectedRoomTypeId(e.target.value)}
                        className="w-full p-2 rounded border border-slate-300 text-xs bg-white"
                        required
                      >
                        <option value="">-- Choose Room Type --</option>
                        {hotels.find(h => h.id === selectedHotelId)?.roomTypes?.map(r => (
                          <option key={r.id} value={r.id}>
                            {r.name} ({formatPrice(r.priceCents, r.currency)}/nt, max {r.maxOccupancy})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">Check-In</label>
                      <input
                        type="date"
                        value={allocCheckIn}
                        onChange={(e) => setAllocCheckIn(e.target.value)}
                        className="w-full p-2 rounded border border-slate-300 text-xs"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">Check-Out</label>
                      <input
                        type="date"
                        value={allocCheckOut}
                        onChange={(e) => setAllocCheckOut(e.target.value)}
                        className="w-full p-2 rounded border border-slate-300 text-xs"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">Rooms Count</label>
                      <input
                        type="number"
                        min="1"
                        value={allocRoomCount}
                        onChange={(e) => setAllocRoomCount(Number(e.target.value))}
                        className="w-full p-2 rounded border border-slate-300 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">Status</label>
                      <select
                        value={allocStatus}
                        onChange={(e) => setAllocStatus(e.target.value as any)}
                        className="w-full p-2 rounded border border-slate-300 text-xs bg-white font-bold text-emerald-800"
                      >
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="PENDING">PENDING</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">Supplier Ref (e.g. OBR-892)</label>
                      <input
                        type="text"
                        placeholder="Supplier confirmation number..."
                        value={allocSupplierRef}
                        onChange={(e) => setAllocSupplierRef(e.target.value)}
                        className="w-full p-2 rounded border border-slate-300 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">Special Requests</label>
                      <input
                        type="text"
                        placeholder="e.g. High floor, quiet wing..."
                        value={allocSpecialRequests}
                        onChange={(e) => setAllocSpecialRequests(e.target.value)}
                        className="w-full p-2 rounded border border-slate-300 text-xs"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isUpdating}
                    style={{ backgroundColor: '#0D9488', color: '#ffffff' }}
                    className="w-full py-2.5 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded font-bold transition-colors shadow-sm cursor-pointer"
                  >
                    + Add Accommodation Segment
                  </button>
                </form>
              </div>

              {/* SECTION: TRANSPORT ALLOCATIONS */}
              <div className="mt-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-luxury-navy flex items-center gap-2">
                  <Car className="w-4 h-4 text-luxury-teal" />
                  Transfers & Transport ({selectedInquiry.transportAllocations?.length || 0})
                </h3>

                <div className="mt-3 space-y-2">
                  {selectedInquiry.transportAllocations?.map((t, idx) => (
                    <div key={t.id} className="p-3 bg-slate-50 border border-slate-200 rounded text-xs">
                      <strong>Transfer {idx + 1} ({t.transportType}):</strong> {t.pickupLocation} &rarr; {t.dropoffLocation} at {t.pickupDateTime}
                      {t.flightNumber && <span className="ml-2 font-mono font-bold text-luxury-teal">Flight: {t.flightNumber}</span>}
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAssignTransport} className="mt-3 p-4 bg-slate-100/70 border border-slate-200 rounded-lg text-xs space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">Pickup Location</label>
                      <input
                        type="text"
                        placeholder="e.g. Cochin Airport (COK)"
                        value={transPickup}
                        onChange={(e) => setTransPickup(e.target.value)}
                        className="w-full p-2 rounded border border-slate-300 text-xs"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">Drop-off Location</label>
                      <input
                        type="text"
                        placeholder="e.g. Kumarakom Lake Resort"
                        value={transDropoff}
                        onChange={(e) => setTransDropoff(e.target.value)}
                        className="w-full p-2 rounded border border-slate-300 text-xs"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">Date & Time</label>
                      <input
                        type="text"
                        placeholder="e.g. 2026-11-10 14:00"
                        value={transPickupTime}
                        onChange={(e) => setTransPickupTime(e.target.value)}
                        className="w-full p-2 rounded border border-slate-300 text-xs"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">Flight Number (If recorded)</label>
                      <input
                        type="text"
                        placeholder="e.g. EK 532 (leave blank if none)"
                        value={transFlight}
                        onChange={(e) => setTransFlight(e.target.value)}
                        className="w-full p-2 rounded border border-slate-300 text-xs"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="w-full py-2 bg-slate-800 text-white rounded font-bold hover:bg-slate-900 transition-colors"
                  >
                    + Add Transport Transfer
                  </button>
                </form>
              </div>

              {/* SECTION: FINAL PRICE & CONFIRMATION */}
              <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  Agreed Pricing & Formal Confirmation
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Agreed Total Price (Cents)</label>
                    <input
                      type="number"
                      value={confirmPriceCents}
                      onChange={(e) => setConfirmPriceCents(Number(e.target.value))}
                      className="w-full p-2 rounded border border-slate-300 text-xs font-mono font-bold"
                    />
                    <span className="text-[10px] text-slate-500">={formatPrice(confirmPriceCents, confirmCurrency)}</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Amount Paid (Cents)</label>
                    <input
                      type="number"
                      value={confirmPaidCents}
                      onChange={(e) => setConfirmPaidCents(Number(e.target.value))}
                      className="w-full p-2 rounded border border-slate-300 text-xs font-mono"
                    />
                    <span className="text-[10px] text-slate-500">={formatPrice(confirmPaidCents, confirmCurrency)}</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Payment Status</label>
                    <select
                      value={confirmPayStatus}
                      onChange={(e) => setConfirmPayStatus(e.target.value)}
                      className="w-full p-2 rounded border border-slate-300 text-xs bg-white font-bold"
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="PARTIAL">PARTIAL</option>
                      <option value="PAID">PAID</option>
                    </select>
                  </div>
                </div>

                <div className="mt-3">
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Customer Instructions / Notes</label>
                  <textarea
                    rows={2}
                    value={confirmInstructions}
                    onChange={(e) => setConfirmInstructions(e.target.value)}
                    placeholder="Instructions rendered in confirmation email (e.g. Chauffeur will hold name board at gate)..."
                    className="w-full p-2 rounded border border-slate-300 text-xs"
                  />
                </div>

                <div className="mt-4 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleConfirmBooking}
                    disabled={isUpdating || selectedInquiry.status === 'CONFIRMED'}
                    className={`flex-1 py-3 px-4 rounded-lg font-bold text-sm shadow transition-all ${
                      selectedInquiry.status === 'CONFIRMED'
                        ? 'bg-slate-300 text-slate-600 cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    {selectedInquiry.status === 'CONFIRMED' ? '✓ Booking Already Confirmed' : '🌟 Atomic Confirmation & Send Customer Email'}
                  </button>
                </div>
              </div>

              {/* REMINDERS & CANCELLATION */}
              <div className="mt-6 pt-4 border-t border-slate-200 flex flex-wrap gap-3 items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Status Transition:</span>
                  <select
                    value={selectedInquiry.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white"
                  >
                    <option value="NEW_INQUIRY">NEW_INQUIRY</option>
                    <option value="AWAITING_REVIEW">AWAITING_REVIEW</option>
                    <option value="QUOTATION_SENT">QUOTATION_SENT</option>
                    <option value="AWAITING_PAYMENT">AWAITING_PAYMENT</option>
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSendReminder('PAYMENT_DUE')}
                    className="px-3 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded text-xs font-medium"
                  >
                    Send Payment Reminder
                  </button>
                  <button
                    onClick={() => handleSendReminder('PRE_TRIP')}
                    className="px-3 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded text-xs font-medium"
                  >
                    Send Pre-Trip Reminder
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* INSPECT EMAIL PAYLOAD MODAL */}
      {inspectedLog && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            <div className="p-4 bg-luxury-navy text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm">Inspecting Notification: {inspectedLog.templateName}</h3>
                <p className="text-xs text-slate-400">To: {inspectedLog.recipientEmail} | Status: {inspectedLog.status}</p>
              </div>
              <button onClick={() => setInspectedLog(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1 text-xs">
              <h4 className="font-bold text-slate-700 mb-1">Plain Text Alternative:</h4>
              <pre className="p-3 bg-slate-100 rounded text-slate-800 whitespace-pre-wrap font-mono text-[11px] mb-4">
                {inspectedLog.textContent || 'No plain text recorded'}
              </pre>

              <h4 className="font-bold text-slate-700 mb-1">Rendered HTML Output:</h4>
              <div
                className="border border-slate-200 rounded p-4 bg-white"
                dangerouslySetInnerHTML={{ __html: inspectedLog.htmlContent || '<p>No HTML</p>' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* PACKAGE & ITINERARY EDITOR MODAL */}
      <PackageEditorModal
        isOpen={isPackageModalOpen}
        onClose={() => setIsPackageModalOpen(false)}
        onSuccess={() => {
          setIsPackageModalOpen(false);
          loadAdminPackages();
        }}
        token={token || ''}
        packageToEdit={editingPackage}
        destinations={destinations}
      />
    </div>
  );
};
