import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getMedicines, deleteMedicine, reset } from '../../features/medicines/medicineSlice';
import { 
  AlertCircle, Plus, Pill, Edit, Trash2, PackageOpen, 
  Eye, ShoppingCart, CheckCircle2, Search, Filter, Box, Calendar, Printer
} from 'lucide-react';
import { format } from 'date-fns';
import AddMedicineModal from '../../components/medicine/AddMedicineModal';
import EditMedicineModal from '../../components/medicine/EditMedicineModal';

// Helper function to estimate how many strips to order for the remaining days of the month
const calculateStripsToOrder = (rate, freq, packSize, stockLeft, daysLeft) => {
  if (!rate || !freq || !packSize) return null;
  
  const packMatch = packSize.toString().match(/\d+/);
  const unitsPerPack = packMatch ? parseInt(packMatch[0], 10) : 10; 
  
  const unitsPerDose = parseFloat(rate) || 1;
  
  let dosesPerDay = 1;
  const f = freq.toLowerCase();
  if (f.includes('twice') || f.includes('2')) dosesPerDay = 2;
  else if (f.includes('thrice') || f.includes('3')) dosesPerDay = 3;
  else if (f.includes('four') || f.includes('4')) dosesPerDay = 4;
  else if (f.includes('weekly')) dosesPerDay = 1 / 7;
  
  const totalUnitsNeeded = unitsPerDose * dosesPerDay * daysLeft;
  const currentStock = parseInt(stockLeft, 10) || 0;
  const deficit = totalUnitsNeeded - currentStock;
  
  if (deficit <= 0) return 'Stocked';
  
  const strips = Math.ceil(deficit / unitsPerPack);
  return `${strips} strip${strips > 1 ? 's' : ''}`;
};

const Inventory = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState('all'); 
  
  const dispatch = useDispatch();
  const { medicines, isLoading, isError, message } = useSelector((state) => state.medicines);

  const today = new Date();
  const daysInCurrentMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const daysLeftInMonth = daysInCurrentMonth - today.getDate() + 1;

  useEffect(() => {
    if (isError) {
      console.error(message);
    }
    dispatch(getMedicines());

    return () => {
      dispatch(reset());
    };
  }, [isError, message, dispatch]);

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this medicine? This action cannot be undone.')) {
      dispatch(deleteMedicine(id));
    }
  };

  const handleEditClick = (medicine) => {
    setSelectedMedicine(medicine);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedMedicine(null); 
  };

  const handlePrint = () => {
    window.print();
  };

  const stats = useMemo(() => {
    const total = medicines.length;
    const lowStock = medicines.filter(m => m.stockInfo?.needsRestock).length;
    const healthy = total - lowStock;
    return { total, lowStock, healthy };
  }, [medicines]);

  const filteredMedicines = useMemo(() => {
    return medicines.filter((med) => {
      const matchesSearch = med.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = stockFilter === 'low' ? med.stockInfo?.needsRestock : true;
      return matchesSearch && matchesFilter;
    });
  }, [medicines, searchTerm, stockFilter]);

  if (isLoading && medicines.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-500 print:hidden">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
        <p className="font-medium animate-pulse">Loading inventory...</p>
      </div>
    );
  }

  return (
    <>
      {/* ========================================== */}
      {/* 💻 SCREEN VIEW (Hidden during PDF Print)   */}
      {/* ========================================== */}
      <div className="max-w-7xl mx-auto pb-12 w-full px-2 sm:px-0 print:hidden">
        {/* 1. Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Medicine Inventory</h1>
            <p className="mt-1 sm:mt-2 text-sm text-gray-500 max-w-2xl">
              Manage your mother's current medication, track usage, and monitor stock levels.
            </p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button 
              onClick={handlePrint}
              disabled={filteredMedicines.length === 0}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-200 px-4 py-2.5 rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-all shadow-sm active:scale-95 text-sm font-semibold whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              title="Download as PDF or Print"
            >
              <Printer className="h-5 w-5" />
              <span className="hidden sm:inline">Export PDF</span>
            </button>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 transition-all shadow-sm active:scale-95 text-sm font-semibold whitespace-nowrap"
            >
              <Plus className="h-5 w-5" />
              Add Medicine
            </button>
          </div>
        </div>

        {/* 2. Dashboard Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-8">
          <div className="col-span-2 lg:col-span-1 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl shrink-0">
              <Box className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-500">Total Medicines</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 bg-red-50 text-red-600 rounded-xl shrink-0">
              <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-500">Low Stock</p>
              <p className="text-lg sm:text-xl font-bold text-red-600">{stats.lowStock}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 bg-green-50 text-green-600 rounded-xl shrink-0">
              <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-500">Healthy</p>
              <p className="text-lg sm:text-xl font-bold text-green-600">{stats.healthy}</p>
            </div>
          </div>
        </div>

        {/* 3. Controls (Search & Filters) */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="relative w-full md:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all"
              placeholder="Search medicines..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
            <Filter className="h-4 w-4 text-gray-400 mr-1 shrink-0 hidden sm:block" />
            <button
              onClick={() => setStockFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex-1 sm:flex-none text-center ${
                stockFilter === 'all' 
                  ? 'bg-gray-900 text-white' 
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              All Medicines
            </button>
            <button
              onClick={() => setStockFilter('low')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex-1 sm:flex-none text-center ${
                stockFilter === 'low' 
                  ? 'bg-red-100 text-red-800 border border-red-200' 
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-red-50 hover:text-red-600'
              }`}
            >
              Low Stock Only
            </button>
          </div>
        </div>

        {/* 4. Data Container (Table for Desktop, Cards for Mobile) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* DESKTOP VIEW */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50/80 backdrop-blur-sm sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">Medicine</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">Dosage</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">Timeline</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">Order Need</th>
                  <th className="px-4 py-3 text-right text-[11px] font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredMedicines.map((med) => {
                  const needsRestock = med.stockInfo?.needsRestock;
                  const orderSuggestion = calculateStripsToOrder(med.consumptionRate, med.frequency, med.packSize, med.stockLeft, daysLeftInMonth);
                  
                  return (
                    <tr key={`desktop-${med._id}`} className="hover:bg-blue-50/50 transition-colors group">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 shrink-0 rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden border border-gray-200 shadow-sm">
                            {med.photo && med.photo !== 'default_medicine.png' && !med.photo.includes('/uploads/') ? (
                              <img src={med.photo} alt={med.name} className="h-full w-full object-cover" />
                            ) : (
                              <Pill className="h-5 w-5 text-gray-300" />
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 capitalize text-sm truncate max-w-[140px] md:max-w-[180px]" title={med.name}>{med.name}</div>
                            <div className="text-[11px] text-gray-500 truncate max-w-[140px]" title={med.packSize}>{med.packSize}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900 truncate max-w-[120px]">{med.dosage}</div>
                        <div className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                          <Box className="h-3 w-3 shrink-0" /> <span className="truncate max-w-[100px]">{med.consumptionRate} {med.frequency}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className={`text-sm font-bold ${needsRestock ? 'text-red-600' : 'text-gray-900'}`}>
                          {med.stockLeft} <span className="text-[11px] font-normal text-gray-500">units</span>
                        </div>
                        <div className="mt-1">
                          {needsRestock ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 uppercase tracking-wide">
                              <AlertCircle className="h-3 w-3 shrink-0" /> Reorder
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-800 uppercase tracking-wide">Healthy</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-[13px] text-gray-900">
                          <span className="text-gray-500 text-[11px]">Ends:</span> {med.stockInfo?.estimatedDepletion ? format(new Date(med.stockInfo.estimatedDepletion), 'MMM dd') : 'N/A'}
                        </div>
                        <div className="text-[13px] text-gray-900 mt-0.5">
                          <span className="text-gray-500 text-[11px]">Buy:</span> {med.stockInfo?.nextOrderDate ? format(new Date(med.stockInfo.nextOrderDate), 'MMM dd') : 'N/A'}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {orderSuggestion === 'Stocked' ? (
                          <div className="flex items-center gap-1.5 text-[11px] text-green-700 font-bold bg-green-50 px-2 py-1 rounded w-max border border-green-200">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Fully Stocked
                          </div>
                        ) : orderSuggestion ? (
                          <div>
                            <div className="flex items-center gap-1.5 text-[13px] text-blue-700 font-bold bg-blue-50 px-2 py-1 rounded w-max border border-blue-200 shadow-sm">
                              <ShoppingCart className="h-3.5 w-3.5 shrink-0" /> {orderSuggestion}
                            </div>
                            <div className="text-[10px] text-gray-400 mt-1 pl-1">Next {daysLeftInMonth} days</div>
                          </div>
                        ) : (
                          <span className="text-[13px] text-gray-300 italic">Data missing</span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right font-medium">
                        <div className="flex items-center justify-end gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link to={`/medicine/${med._id}`} className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-all">
                            <Eye className="h-4 w-4" />
                          </Link>
                          <button onClick={() => handleEditClick(med)} className="p-1.5 text-blue-400 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-all">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleDelete(med._id)} className="p-1.5 text-red-400 hover:text-red-700 hover:bg-red-50 rounded-md transition-all">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* MOBILE VIEW */}
          <div className="md:hidden flex flex-col divide-y divide-gray-100">
            {filteredMedicines.map((med) => {
              const needsRestock = med.stockInfo?.needsRestock;
              const orderSuggestion = calculateStripsToOrder(med.consumptionRate, med.frequency, med.packSize, med.stockLeft, daysLeftInMonth);

              return (
                <div key={`mobile-${med._id}`} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 shrink-0 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                        {med.photo && med.photo !== 'default_medicine.png' && !med.photo.includes('/uploads/') ? (
                          <img src={med.photo} alt={med.name} className="h-full w-full object-cover" />
                        ) : (
                          <Pill className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 capitalize text-base">{med.name}</h3>
                        <p className="text-xs text-gray-500">{med.packSize}</p>
                      </div>
                    </div>
                    {needsRestock && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-red-100 text-red-800 text-[10px] font-bold uppercase shrink-0">
                        <AlertCircle className="h-3 w-3" /> Low
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <div>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Dosage</p>
                      <p className="text-sm font-semibold text-gray-900 truncate">{med.dosage}</p>
                      <p className="text-xs text-gray-500">{med.consumptionRate} {med.frequency}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Stock Left</p>
                      <p className={`text-sm font-bold ${needsRestock ? 'text-red-600' : 'text-gray-900'}`}>
                        {med.stockLeft} <span className="text-xs font-medium text-gray-500">units</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 mb-4 text-sm">
                    <div className="flex items-center justify-between text-gray-600">
                      <div className="flex items-center gap-1.5"><Calendar className="h-4 w-4 text-gray-400"/> Ends</div>
                      <span className="font-medium text-gray-900">{med.stockInfo?.estimatedDepletion ? format(new Date(med.stockInfo.estimatedDepletion), 'MMM dd, yyyy') : 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                      <span className="text-xs font-semibold text-gray-500">Order Suggestion:</span>
                      {orderSuggestion === 'Stocked' ? (
                        <span className="text-xs font-bold text-green-600 flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5"/> Fully Stocked</span>
                      ) : orderSuggestion ? (
                        <span className="text-xs font-bold text-blue-600 flex items-center gap-1"><ShoppingCart className="h-3.5 w-3.5"/> {orderSuggestion}</span>
                      ) : (
                        <span className="text-xs text-gray-400">N/A</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                    <Link to={`/medicine/${med._id}`} className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium rounded-lg border border-gray-200 transition-colors">
                      <Eye className="h-4 w-4" /> View
                    </Link>
                    <button onClick={() => handleEditClick(med)} className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-medium rounded-lg border border-blue-200 transition-colors">
                      <Edit className="h-4 w-4" /> Edit
                    </button>
                    <button onClick={() => handleDelete(med._id)} className="flex items-center justify-center p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg border border-red-200 transition-colors shrink-0">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {filteredMedicines.length === 0 && (
            <div className="px-4 py-16 text-center">
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="p-4 bg-gray-50 rounded-full">
                  <Search className="h-10 w-10 text-gray-400" />
                </div>
                <div className="text-center">
                  <h3 className="text-base font-bold text-gray-900">No matches found</h3>
                  <p className="text-gray-500 text-xs mt-1">Try adjusting your search or filters.</p>
                </div>
                <button onClick={() => { setSearchTerm(''); setStockFilter('all'); }} className="mt-2 text-gray-600 hover:text-gray-900 underline text-sm font-medium">
                  Clear filters
                </button>
              </div>
            </div>
          )}
        </div>

        <AddMedicineModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
        <EditMedicineModal isOpen={isEditModalOpen} onClose={handleCloseEditModal} medicine={selectedMedicine} />
      </div>


      {/* ========================================== */}
      {/* 🖨️ PDF / PRINT VIEW (Hidden on Screen)       */}
      {/* ========================================== */}
      <div className="hidden print:block w-full bg-white text-black font-sans">
        
        {/* PDF Header */}
        <div className="border-b-2 border-gray-800 pb-4 mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-black tracking-tight">MediSync</h1>
            <h2 className="text-lg font-semibold text-gray-600 mt-1">Pharmacy Restock Checklist</h2>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-gray-500">Date Generated</p>
            <p className="text-lg font-bold">{format(new Date(), 'MMMM dd, yyyy')}</p>
          </div>
        </div>

        {/* Filter Notice (if applicable) */}
        {(searchTerm || stockFilter !== 'all') && (
          <div className="mb-4 text-sm font-bold text-gray-600 italic">
            * Showing filtered results ({stockFilter === 'low' ? 'Low Stock Only' : 'Custom Search'})
          </div>
        )}

        {/* Printable Table */}
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-800 text-sm uppercase tracking-wider text-gray-600">
              <th className="py-3 px-2 w-10">#</th>
              <th className="py-3 px-2 w-12 text-center">Buy</th>
              <th className="py-3 px-2">Medicine Details</th>
              <th className="py-3 px-2">Current Stock</th>
              <th className="py-3 px-2">Order Suggestion</th>
              <th className="py-3 px-2 text-right w-32">Price Paid</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-300">
            {filteredMedicines.map((med, index) => {
              const orderSuggestion = calculateStripsToOrder(med.consumptionRate, med.frequency, med.packSize, med.stockLeft, daysLeftInMonth);
              const needsRestock = med.stockInfo?.needsRestock;

              return (
                <tr key={`print-${med._id}`} className="break-inside-avoid">
                  
                  {/* S.No */}
                  <td className="py-4 px-2 text-sm font-bold text-gray-500 align-top">
                    {index + 1}.
                  </td>
                  
                  {/* Checkbox */}
                  <td className="py-4 px-2 align-top">
                    <div className="w-5 h-5 border-2 border-gray-800 rounded mx-auto"></div>
                  </td>
                  
                  {/* Medicine Details */}
                  <td className="py-4 px-2 align-top">
                    <div className="font-bold text-lg text-black capitalize leading-tight">{med.name}</div>
                    <div className="text-sm text-gray-800 mt-1 font-semibold">{med.dosage} • {med.consumptionRate} {med.frequency}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{med.packSize}</div>
                    
                    {/* NEW: Render Purpose & Instructions on the PDF for the Caregiver */}
                    {(med.purpose || med.instructions) && (
                      <div className="mt-2 text-[11px] text-gray-700 bg-gray-50 p-2 border border-gray-200 rounded">
                        {med.purpose && <div className="mb-0.5"><strong>Purpose:</strong> {med.purpose}</div>}
                        {med.instructions && <div><strong>Notes:</strong> {med.instructions}</div>}
                      </div>
                    )}
                  </td>
                  
                  {/* Stock Left */}
                  <td className="py-4 px-2 align-top">
                    <div className="font-bold text-base text-black">
                      {med.stockLeft} <span className="text-xs font-normal">units</span>
                    </div>
                    {needsRestock && (
                      <div className="text-[10px] font-bold text-black mt-1 uppercase border border-black inline-block px-1 rounded-sm">
                        Low Stock
                      </div>
                    )}
                  </td>
                  
                  {/* Order Suggestion */}
                  <td className="py-4 px-2 align-top">
                    {orderSuggestion === 'Stocked' ? (
                      <span className="text-sm font-bold text-gray-500 italic">Fully Stocked</span>
                    ) : orderSuggestion ? (
                      <div>
                        <div className="text-base font-bold text-black">{orderSuggestion}</div>
                        <div className="text-xs text-gray-500 mt-0.5">For {daysLeftInMonth} days</div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">N/A</span>
                    )}
                  </td>

                  {/* Price Field */}
                  <td className="py-4 px-2 align-bottom text-right">
                    <div className="flex items-end justify-end gap-1 text-gray-500">
                      <span className="font-bold text-sm mb-1">৳</span>
                      <div className="border-b-2 border-dashed border-gray-400 w-full h-8 mb-1"></div>
                    </div>
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Print Footer */}
        <div className="mt-12 border-t border-gray-200 pt-4 flex justify-between items-center text-sm text-gray-500 break-inside-avoid">
          <p>Total Items: {filteredMedicines.length}</p>
          <div className="flex items-center gap-2">
            <span className="font-bold text-black">Total Cost:</span>
            <span className="font-bold text-black">৳</span>
            <div className="border-b border-black w-32"></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Inventory;