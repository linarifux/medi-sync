import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMedicines, reset } from '../../features/medicines/medicineSlice';
import { Search, AlertCircle, CheckCircle2, Pill, ShoppingCart, PackagePlus } from 'lucide-react';
import RestockModal from '../../components/medicine/RestockModal';

const Restock = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);

  const dispatch = useDispatch();
  const { medicines, isLoading, isError, message } = useSelector((state) => state.medicines);

  useEffect(() => {
    if (isError) console.error(message);
    dispatch(getMedicines());
    return () => dispatch(reset());
  }, [isError, message, dispatch]);

  const filteredMedicines = useMemo(() => {
    return medicines.filter((med) => 
      med.name.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => {
      // Bring medicines that need restock to the top of the list automatically
      const aNeeds = a.stockInfo?.needsRestock ? 1 : 0;
      const bNeeds = b.stockInfo?.needsRestock ? 1 : 0;
      return bNeeds - aNeeds;
    });
  }, [medicines, searchTerm]);

  const handleOpenRestock = (medicine) => {
    setSelectedMedicine(medicine);
    setIsRestockModalOpen(true);
  };

  const handleCloseRestock = () => {
    setIsRestockModalOpen(false);
    setSelectedMedicine(null);
  };

  if (isLoading && medicines.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-500">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
        <p className="font-medium animate-pulse">Loading stock data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-12 w-full">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Restock Hub</h1>
          <p className="mt-2 text-sm text-gray-500 max-w-2xl">
            Quickly add new purchases to your inventory. We'll automatically calculate units and update your main stock.
          </p>
        </div>
        
        {/* Search Bar */}
        <div className="mt-4 sm:mt-0 relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all"
            placeholder="Search medicine to restock..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Grid Layout for Restocking */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMedicines.length > 0 ? (
          filteredMedicines.map((med) => {
            const needsRestock = med.stockInfo?.needsRestock;
            
            return (
              <div key={med._id} className={`bg-white rounded-2xl shadow-sm border p-5 flex flex-col justify-between transition-all hover:shadow-md ${needsRestock ? 'border-red-200' : 'border-gray-200'}`}>
                
                {/* Card Top: Info & Badge */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 shrink-0 rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden border border-gray-100 shadow-sm">
                      {med.photo && med.photo !== 'default_medicine.png' && !med.photo.includes('/uploads/') ? (
                        <img src={med.photo} alt={med.name} className="h-full w-full object-cover" />
                      ) : (
                        <Pill className="h-6 w-6 text-gray-300" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 capitalize text-lg truncate max-w-[140px]" title={med.name}>
                        {med.name}
                      </h3>
                      <p className="text-xs text-gray-500">{med.packSize}</p>
                    </div>
                  </div>
                  
                  {/* Status Badge */}
                  {needsRestock ? (
                     <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-red-50 text-red-700 text-[10px] font-bold uppercase tracking-wider">
                       <AlertCircle className="h-3 w-3" /> Low
                     </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-green-50 text-green-700 text-[10px] font-bold uppercase tracking-wider">
                      <CheckCircle2 className="h-3 w-3" /> Ok
                    </span>
                  )}
                </div>

                {/* Card Middle: Current Stock */}
                <div className="bg-gray-50 rounded-xl p-3 mb-4 border border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider">Current Stock</p>
                    <p className={`text-2xl font-black ${needsRestock ? 'text-red-600' : 'text-gray-900'}`}>
                      {med.stockLeft} <span className="text-sm font-medium text-gray-500">units</span>
                    </p>
                  </div>
                </div>

                {/* Card Bottom: Action */}
                <button 
                  onClick={() => handleOpenRestock(med)}
                  className={`w-full py-2.5 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm transition-colors ${
                    needsRestock 
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm' 
                      : 'bg-white text-blue-600 border border-blue-200 hover:bg-blue-50'
                  }`}
                >
                  <ShoppingCart className="h-4 w-4" /> Restock Items
                </button>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-gray-200">
             <PackagePlus className="h-12 w-12 text-gray-300 mx-auto mb-3" />
             <p className="text-gray-500 font-medium">No medicines match your search.</p>
          </div>
        )}
      </div>

      <RestockModal 
        isOpen={isRestockModalOpen} 
        onClose={handleCloseRestock} 
        medicine={selectedMedicine} 
      />
    </div>
  );
};

export default Restock;