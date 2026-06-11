import { useState } from 'react';
import {
  LayoutDashboard,
  Boxes,
  Settings,
  Search,
  Edit3,
  AlertTriangle,
  Package,
  TrendingDown,
  X,
  Check,
  LogOut,
  Trash2,
  Plus,
  Lock,
  User as UserIcon,
  LogIn
} from 'lucide-react';
import { Analytics } from '@vercel/analytics/react';

const INITIAL_PRODUCTS = [
  {
    id: "PRD-001",
    nama: "Beras Premium 5kg",
    kategori: "Sembako",
    stok: 120,
    status: "Aman",
    rak: "A-01"
  },
  {
    id: "PRD-002",
    nama: "Minyak Goreng 2L",
    kategori: "Sembako",
    stok: 25,
    status: "Menipis",
    rak: "A-03"
  },
  {
    id: "PRD-003",
    nama: "Gula Pasir 1kg",
    kategori: "Sembako",
    stok: 5,
    status: "Kritis",
    rak: "B-02"
  }
];

export default function App() {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  
  // Login State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // CRUD Product Form Modal State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({ nama: '', kategori: '', stok: 0, rak: '' });
  
  // Delete Confirmation Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  // Notification Toast State
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  <Analytics />
  // Login handler
  const handleLogin = (e) => {
    e.preventDefault();
    if (loginUsername === 'admin' && loginPassword === 'admin123') {
      setIsLoggedIn(true);
      setLoginError('');
      showToast("Selamat datang kembali, Admin!", "success");
    } else {
      setLoginError("Username atau Password salah!");
    }
  };

  // Logout handler
  const handleLogout = () => {
    setIsLoggedIn(false);
    setLoginUsername('');
    setLoginPassword('');
    showToast("Berhasil keluar dari sistem", "success");
  };

  // Helper to calculate status based on stock
  const calculateStatus = (stok) => {
    if (stok > 50) return "Aman";
    if (stok >= 10) return "Menipis";
    return "Kritis";
  };

  // Badge styling helper
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Aman":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Menipis":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Kritis":
        return "bg-rose-50 text-rose-700 border-rose-200 animate-pulse";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  // Open Form Modal for Create
  const handleCreateClick = () => {
    setModalMode('create');
    setFormData({ nama: '', kategori: '', stok: 0, rak: '' });
    setIsFormModalOpen(true);
  };

  // Open Form Modal for Edit
  const handleEditClick = (product) => {
    setModalMode('edit');
    setEditingProduct(product);
    setFormData({
      nama: product.nama,
      kategori: product.kategori,
      stok: product.stok,
      rak: product.rak
    });
    setIsFormModalOpen(true);
  };

  // Save Product (Create or Edit)
  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (!formData.nama.trim() || formData.stok < 0 || !formData.rak.trim()) {
      showToast("Mohon isi semua data dengan benar", "error");
      return;
    }

    if (modalMode === 'create') {
      // Auto-increment ID based on existing max digit
      const nextIdNum = Math.max(...products.map(p => {
        const match = p.id.match(/\d+/);
        return match ? parseInt(match[0], 10) : 0;
      }), 0) + 1;
      const newId = `PRD-${String(nextIdNum).padStart(3, '0')}`;
      
      const newProduct = {
        id: newId,
        nama: formData.nama,
        kategori: formData.kategori,
        stok: parseInt(formData.stok, 10),
        rak: formData.rak,
        status: calculateStatus(parseInt(formData.stok, 10))
      };
      
      setProducts([...products, newProduct]);
      showToast(`Produk "${formData.nama}" berhasil ditambahkan!`);
    } else {
      const updatedProducts = products.map((prod) => {
        if (prod.id === editingProduct.id) {
          const updatedStok = parseInt(formData.stok, 10);
          return {
            ...prod,
            nama: formData.nama,
            kategori: formData.kategori,
            stok: updatedStok,
            rak: formData.rak,
            status: calculateStatus(updatedStok)
          };
        }
        return prod;
      });
      setProducts(updatedProducts);
      showToast(`Produk "${formData.nama}" berhasil diperbarui!`);
    }

    setIsFormModalOpen(false);
  };

  // Open Delete Confirmation Modal
  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  // Execute Delete
  const handleConfirmDelete = () => {
    if (productToDelete) {
      const updatedProducts = products.filter(p => p.id !== productToDelete.id);
      setProducts(updatedProducts);
      showToast(`Produk "${productToDelete.nama}" berhasil dihapus!`);
    }
    setIsDeleteModalOpen(false);
    setProductToDelete(null);
  };

  // Calculate stats
  const totalBarang = products.length;
  const totalUnit = products.reduce((acc, curr) => acc + curr.stok, 0);
  const barangKritisCount = products.filter(p => p.stok < 10).length;
  const barangKeluarDummy = 48; // Dummy data dari panduan/spec

  // Filter products by search query and quick filter status
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.rak.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'Semua' || product.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Render Login page if not logged in
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12 relative overflow-hidden font-sans">
        {/* Background visual decorations */}
        <div className="absolute top-0 -left-4 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-2xl opacity-10" />
        <div className="absolute top-0 -right-4 w-72 h-72 bg-violet-300 rounded-full mix-blend-multiply filter blur-2xl opacity-10" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-emerald-300 rounded-full mix-blend-multiply filter blur-2xl opacity-10" />
        
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-slate-100/50 z-10">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-100">
              <Boxes size={28} className="stroke-[2.5]" />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-slate-900 tracking-tight">SentraMart</h2>
            <p className="mt-2 text-sm text-slate-500">
              Sistem Manajemen Inventaris Ritel Minimalis
            </p>
          </div>

          <form onSubmit={handleLogin} className="mt-8 space-y-5">
            {loginError && (
              <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-xs font-semibold flex items-center gap-2 animate-shake">
                <AlertTriangle size={15} />
                <span>{loginError}</span>
              </div>
            )}
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Username</label>
                <div className="relative">
                  <UserIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400 font-medium"
                    placeholder="Masukkan username"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400 font-medium"
                    placeholder="Masukkan password"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white text-sm font-bold shadow-md shadow-indigo-100 hover:shadow-indigo-200 transition-all duration-200"
            >
              <LogIn size={16} />
              <span>Masuk Ke Dashboard</span>
            </button>
          </form>

          <div className="text-center pt-2">
            <span className="text-[11px] text-slate-400 block bg-slate-50/80 p-2.5 rounded-xl border border-dashed border-slate-200 leading-relaxed">
              Gunakan Username: <strong className="text-slate-600 font-bold font-mono">admin</strong> dan Password: <strong className="text-slate-600 font-bold font-mono">admin123</strong> untuk masuk.
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Render Table content rows
  const renderTableRows = () => {
    if (filteredProducts.length === 0) {
      return (
        <tr>
          <td colSpan={6} className="p-12 text-center text-slate-400">
            <div className="flex flex-col items-center justify-center gap-2">
              <Package size={36} className="stroke-[1.5] text-slate-300" />
              <span className="text-sm font-medium">Tidak ada produk ditemukan</span>
              <span className="text-xs opacity-75">Coba gunakan kata kunci pencarian yang berbeda</span>
            </div>
          </td>
        </tr>
      );
    }

    return filteredProducts.map((product) => (
      <tr key={product.id} className="hover:bg-slate-50/50 transition-all duration-200 ease-in-out border-b border-slate-100 last:border-none">
        {/* Product Info */}
        <td className="p-4 px-6">
          <div className="font-semibold text-slate-900 transition-colors duration-150 group-hover:text-indigo-600">{product.nama}</div>
          <span className="text-[10px] text-slate-400 font-mono tracking-wider block mt-0.5">
            {product.id}
          </span>
        </td>

        {/* Category */}
        <td className="p-4 px-6 text-sm text-slate-600 font-medium">
          {product.kategori}
        </td>

        {/* Rack Location */}
        <td className="p-4 px-6">
          <span className="inline-block bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs font-mono font-bold">
            {product.rak}
          </span>
        </td>

        {/* Stock Level */}
        <td className="p-4 px-6">
          <span className="font-bold text-slate-900 text-sm">{product.stok}</span>
          <span className="text-slate-400 text-xs ml-1">Unit</span>
        </td>

        {/* Status Badge */}
        <td className="p-4 px-6">
          <span className={`inline-flex items-center border px-2.5 py-1 rounded-full text-xs font-bold leading-none ${getStatusBadgeClass(product.status)}`}>
            {product.status}
          </span>
        </td>

        {/* Actions (Edit and Delete) */}
        <td className="p-4 px-6 text-right">
          <div className="inline-flex items-center gap-2">
            <button
              onClick={() => handleEditClick(product)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 active:scale-95 px-3 py-1.5 rounded-xl transition-all duration-200"
            >
              <Edit3 size={13} />
              <span>Edit</span>
            </button>
            <button
              onClick={() => handleDeleteClick(product)}
              className="inline-flex items-center justify-center p-1.5 text-rose-600 hover:text-rose-700 bg-rose-50 border border-rose-100 hover:bg-rose-100 active:scale-95 rounded-xl transition-all duration-200"
              title="Hapus Barang"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </td>
      </tr>
    ));
  };

  return (
    <div className="flex h-screen w-screen bg-slate-50 text-slate-800 antialiased font-sans overflow-hidden">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between h-full z-10 flex-shrink-0">
        <div>
          {/* Logo Brand */}
          <div className="p-6 border-b border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-100">
              <Boxes size={22} className="stroke-[2.5]" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-lg tracking-tight block">SentraMart</span>
              <span className="text-xs text-indigo-600 font-semibold uppercase tracking-wider">Inventory</span>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="p-4 space-y-1.5">
            <button
              onClick={() => {
                setActiveTab('dashboard');
                // Reset filter query inside tabs switching to prevent confusion
                setSearchQuery('');
                setStatusFilter('Semua');
              }}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ease-in-out hover:scale-[1.01] ${
                activeTab === 'dashboard'
                  ? 'bg-indigo-50/70 text-indigo-600 shadow-sm shadow-indigo-50/20'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard size={18} className={activeTab === 'dashboard' ? 'stroke-[2.2]' : 'stroke-[1.8]'} />
              <span>Dashboard</span>
              {activeTab === 'dashboard' && <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 ml-auto" />}
            </button>

            <button
              onClick={() => {
                setActiveTab('stok');
                setSearchQuery('');
                setStatusFilter('Semua');
              }}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ease-in-out hover:scale-[1.01] ${
                activeTab === 'stok'
                  ? 'bg-indigo-50/70 text-indigo-600 shadow-sm shadow-indigo-50/20'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Boxes size={18} className={activeTab === 'stok' ? 'stroke-[2.2]' : 'stroke-[1.8]'} />
              <span>Stok Barang</span>
              {activeTab === 'stok' && <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 ml-auto" />}
            </button>

            <button
              onClick={() => setActiveTab('pengaturan')}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ease-in-out hover:scale-[1.01] ${
                activeTab === 'pengaturan'
                  ? 'bg-indigo-50/70 text-indigo-600 shadow-sm shadow-indigo-50/20'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Settings size={18} className={activeTab === 'pengaturan' ? 'stroke-[2.2]' : 'stroke-[1.8]'} />
              <span>Pengaturan</span>
              {activeTab === 'pengaturan' && <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 ml-auto" />}
            </button>
          </nav>
        </div>

        {/* Profile Card Footer */}
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50/80">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-sm shadow-inner">
              GS
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-semibold text-slate-800 text-xs block truncate">Gibran Saputra</span>
              <span className="text-[10px] text-slate-500 block truncate">Operator Gudang</span>
            </div>
            <button 
              onClick={handleLogout}
              className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg transition-colors duration-200"
              title="Keluar"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Sticky Top Header */}
        <header className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between flex-shrink-0 z-10">
          <div>
            <h1 className="text-2xl font-bold text-slate-950 tracking-tight">
              {activeTab === 'dashboard' && 'Ringkasan Inventaris'}
              {activeTab === 'stok' && 'Manajemen Stok Barang'}
              {activeTab === 'pengaturan' && 'Pengaturan Sistem'}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {activeTab === 'dashboard' && 'Pantau metrik utama ritel dan status stok secara real-time.'}
              {activeTab === 'stok' && 'Kelola daftar inventaris produk ritel di seluruh lokasi rak.'}
              {activeTab === 'pengaturan' && 'Konfigurasi batasan stok minimum dan parameter sistem.'}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-3 py-1.5 bg-slate-100 rounded-full text-slate-600 font-mono">
              Terakhir Diperbarui: Hari Ini, 19:51 WIB
            </span>
          </div>
        </header>

        {/* View Switcher */}
        
        {/* 1. Dashboard Tab (Layout dengan scroll rapi dan pb-16 agar tidak terpotong) */}
        {activeTab === 'dashboard' && (
          <div className="flex-1 overflow-y-auto p-8 pb-16 space-y-6">
            
            {/* Summary Cards Row */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-shrink-0">
              
              {/* Card 1: Total Barang */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100/50 hover:shadow-md hover:scale-[1.01] transition-all duration-200 flex items-start gap-4">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Package size={24} className="stroke-[2]" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Total Barang</span>
                  <span className="text-3xl font-extrabold text-slate-900 mt-1 block">
                    {totalBarang} <span className="text-sm font-semibold text-slate-400">Kategori</span>
                  </span>
                  <span className="text-xs text-slate-500 mt-1 block font-medium">
                    Akumulasi {totalUnit} unit stok di rak
                  </span>
                </div>
              </div>

              {/* Card 2: Barang Keluar */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100/50 hover:shadow-md hover:scale-[1.01] transition-all duration-200 flex items-start gap-4">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                  <TrendingDown size={24} className="stroke-[2]" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Barang Keluar</span>
                  <span className="text-3xl font-extrabold text-slate-900 mt-1 block">
                    {barangKeluarDummy} <span className="text-sm font-semibold text-slate-400">Unit</span>
                  </span>
                  <span className="text-xs text-slate-500 mt-1 block font-medium">
                    Estimasi transaksi hari ini
                  </span>
                </div>
              </div>

              {/* Card 3: Barang Kritis (Standout) */}
              <div className={`p-6 rounded-2xl shadow-sm border hover:scale-[1.01] transition-all duration-200 flex items-start gap-4 ${
                barangKritisCount > 0 
                  ? 'bg-rose-50/50 border-rose-200 hover:shadow-rose-100/40 shadow-sm' 
                  : 'bg-white border-slate-100/50'
              }`}>
                <div className={`p-3 rounded-xl ${
                  barangKritisCount > 0 ? 'bg-rose-100 text-rose-600 animate-pulse' : 'bg-slate-50 text-slate-400'
                }`}>
                  <AlertTriangle size={24} className="stroke-[2]" />
                </div>
                <div>
                  <span className={`text-xs font-semibold uppercase tracking-wider block ${
                    barangKritisCount > 0 ? 'text-rose-500' : 'text-slate-400'
                  }`}>
                    Barang Kritis
                  </span>
                  <span className={`text-3xl font-extrabold mt-1 block ${
                    barangKritisCount > 0 ? 'text-rose-700' : 'text-slate-900'
                  }`}>
                    {barangKritisCount} <span className="text-sm font-semibold opacity-70">Produk</span>
                  </span>
                  <span className={`text-xs mt-1 block font-medium ${
                    barangKritisCount > 0 ? 'text-rose-600' : 'text-slate-500'
                  }`}>
                    {barangKritisCount > 0 ? 'Segera lakukan restock ulang!' : 'Semua stok dalam batas aman'}
                  </span>
                </div>
              </div>

            </section>

            {/* Quick Overview Table Section */}
            <section className="bg-white rounded-2xl shadow-sm border border-slate-100/70 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Overview Inventaris Cepat</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Ringkasan daftar stok barang aktif saat ini.</p>
                </div>
                <button
                  onClick={() => setActiveTab('stok')}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
                >
                  Kelola Selengkapnya →
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th className="p-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Produk</th>
                      <th className="p-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Kategori</th>
                      <th className="p-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Lokasi Rak</th>
                      <th className="p-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Stok</th>
                      <th className="p-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.slice(0, 5).map((product) => (
                      <tr key={product.id} className="border-b border-slate-100 last:border-none hover:bg-slate-50/40 transition-colors">
                        <td className="p-4 px-6">
                          <div className="font-semibold text-slate-900">{product.nama}</div>
                          <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{product.id}</span>
                        </td>
                        <td className="p-4 px-6 text-sm text-slate-600 font-medium">{product.kategori}</td>
                        <td className="p-4 px-6">
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs font-mono font-bold">
                            {product.rak}
                          </span>
                        </td>
                        <td className="p-4 px-6">
                          <span className="font-bold text-slate-900 text-sm">{product.stok}</span>
                          <span className="text-slate-400 text-xs ml-1 font-normal">Unit</span>
                        </td>
                        <td className="p-4 px-6">
                          <span className={`inline-flex items-center border px-2.5 py-1 rounded-full text-xs font-bold leading-none ${getStatusBadgeClass(product.status)}`}>
                            {product.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

          </div>
        )}

        {/* 2. Stok Barang Tab (Layout Terpisah: Search Bar Statis di Atas & Tabel Independen Scroll) */}
        {activeTab === 'stok' && (
          <div className="flex-1 flex flex-col overflow-hidden p-8 space-y-6">
            
            {/* Search, Filter, and Action controls as a STATIC top header box */}
            <div className="flex-shrink-0 bg-white p-5 rounded-2xl border border-slate-100/70 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
              
              {/* Search input bar */}
              <div className="relative w-full md:w-80">
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari nama produk, ID, atau rak..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                />
              </div>

              {/* Filters & Add Button */}
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
                {/* Status selector tabs */}
                <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl">
                  {['Semua', 'Aman', 'Menipis', 'Kritis'].map((status) => {
                    const isActive = statusFilter === status;
                    return (
                      <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`text-xs font-semibold px-3.5 py-1.5 rounded-lg transition-all ${
                          isActive
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {status}
                      </button>
                    );
                  })}
                </div>

                {/* Add product button */}
                <button
                  onClick={handleCreateClick}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.02] text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-100 hover:shadow-indigo-200 transition-all duration-200"
                >
                  <Plus size={14} className="stroke-[3]" />
                  <span>Tambah Barang</span>
                </button>
              </div>

            </div>

            {/* Independent scrollable table box */}
            <div className="flex-1 overflow-y-auto bg-white rounded-2xl shadow-sm border border-slate-100/70 flex flex-col">
              <div className="flex-1">
                <table className="w-full text-left border-collapse table-fixed md:table-auto">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-100 sticky top-0 z-10">
                      <th className="p-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/90 backdrop-blur-sm">Produk</th>
                      <th className="p-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/90 backdrop-blur-sm">Kategori</th>
                      <th className="p-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/90 backdrop-blur-sm">Lokasi Rak</th>
                      <th className="p-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/90 backdrop-blur-sm">Stok</th>
                      <th className="p-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/90 backdrop-blur-sm">Status</th>
                      <th className="p-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right bg-slate-50/90 backdrop-blur-sm">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {renderTableRows()}
                  </tbody>
                </table>
              </div>

              {/* Sticky bottom information footer inside table box */}
              <div className="p-4 px-6 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-400 flex items-center justify-between flex-shrink-0">
                <span>Menampilkan {filteredProducts.length} dari {products.length} produk terdaftar</span>
                <span>Modul Manajemen Stok</span>
              </div>
            </div>

          </div>
        )}

        {/* 3. Pengaturan Tab */}
        {activeTab === 'pengaturan' && (
          <div className="flex-1 overflow-y-auto p-8 pb-16">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100/50 flex flex-col items-center justify-center text-center py-20">
              <Settings size={48} className="text-slate-300 mb-4 stroke-[1.5]" />
              <h2 className="text-xl font-bold text-slate-800">Pengaturan Sistem</h2>
              <p className="text-slate-500 text-sm max-w-md mt-2">
                Konfigurasi batas stok kritis (default: 10 unit) dan stok menipis (default: 50 unit) serta otentikasi operator gudang.
              </p>
              <button 
                onClick={() => setActiveTab('dashboard')} 
                className="mt-6 text-sm font-semibold bg-slate-900 text-white px-5 py-2.5 rounded-xl hover:bg-slate-800 transition-colors"
              >
                Kembali ke Dashboard
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Pop-up Form Modal (Untuk Tambah & Edit Produk) */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          
          {/* Backdrop Overlay */}
          <div 
            onClick={() => setIsFormModalOpen(false)}
            className="absolute inset-0 bg-black/45 backdrop-blur-[4px]" 
          />

          {/* Modal Content */}
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 z-10 overflow-hidden transform scale-100 transition-all duration-300 relative">
            
            {/* Header Modal */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">
                  {modalMode === 'create' ? 'Tambah Produk Baru' : 'Perbarui Data Barang'}
                </h3>
                <span className="text-xs text-slate-400 font-mono block mt-0.5">
                  {modalMode === 'create' ? 'Mendaftarkan item baru ke rak' : editingProduct?.id}
                </span>
              </div>
              <button 
                onClick={() => setIsFormModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form Modal */}
            <form onSubmit={handleSaveProduct} className="p-6 space-y-4">
              
              {/* Product Name Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Nama Produk</label>
                <input
                  type="text"
                  required
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  placeholder="Contoh: Susu UHT Cokelat 1L"
                />
              </div>

              {/* Category & Rak Inputs */}
              <div className="grid grid-cols-2 gap-4">
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Kategori</label>
                  <input
                    type="text"
                    required
                    value={formData.kategori}
                    onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    placeholder="Minuman"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Lokasi Rak</label>
                  <input
                    type="text"
                    required
                    value={formData.rak}
                    onChange={(e) => setFormData({ ...formData, rak: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    placeholder="C-02"
                  />
                </div>

              </div>

              {/* Stock Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Jumlah Stok</label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.stok}
                    onChange={(e) => setFormData({ ...formData, stok: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl pl-3.5 pr-12 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    placeholder="0"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">Unit</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-100 hover:shadow-indigo-200 transition-all"
                >
                  {modalMode === 'create' ? 'Tambah Barang' : 'Simpan Perubahan'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          
          {/* Backdrop Overlay */}
          <div 
            onClick={() => setIsDeleteModalOpen(false)}
            className="absolute inset-0 bg-black/45 backdrop-blur-[4px]" 
          />

          {/* Modal Content */}
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-slate-100 z-10 overflow-hidden transform scale-100 transition-all duration-300 relative p-6 space-y-4">
            
            {/* Warning Icon & Title */}
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                <Trash2 size={20} />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">Hapus Barang?</h3>
            </div>

            {/* Description */}
            <p className="text-sm text-slate-500 leading-relaxed">
              Apakah Anda yakin ingin menghapus produk <strong className="text-slate-800 font-bold">{productToDelete?.nama}</strong> dari daftar inventaris? Tindakan ini tidak dapat dibatalkan.
            </p>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold shadow-md shadow-rose-100 hover:shadow-rose-200 transition-all"
              >
                Ya, Hapus
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Floating Success/Error Toast notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border bg-white border-slate-100 animate-slide-up">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            toast.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
          }`}>
            {toast.type === 'success' ? <Check size={16} className="stroke-[2.5]" /> : <X size={16} className="stroke-[2.5]" />}
          </div>
          <span className="text-xs font-bold text-slate-800 pr-1">{toast.message}</span>
        </div>
      )}

    </div>
  );
}