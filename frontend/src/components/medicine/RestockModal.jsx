import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { updateMedicine } from '../../features/medicines/medicineSlice'; // Ensure this action exists in your slice
import { X, PackagePlus, DollarSign, Store, Calendar, Calculator } from 'lucide-react';
import { format } from 'date-fns';

const RestockModal = ({ isOpen, onClose, medicine }) => {
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    strips: '',
    cost: '',
    source: '',
    purchaseDate: format(new Date(), 'yyyy-MM-dd'),
  });

  const [calculatedUnits, setCalculatedUnits] = useState(0);

  // Calculate units dynamically when strips change
  useEffect(() => {
    if (medicine && formData.strips) {
      const packMatch = medicine.packSize?.toString().match(/\d+/);
      const unitsPerPack = packMatch ? parseInt(packMatch[0], 10) : 10; // Fallback to 10 if unknown
      setCalculatedUnits(parseInt(formData.strips, 10) * unitsPerPack);
    } else {
      setCalculatedUnits(0);
    }
  }, [formData.strips, medicine]);

  if (!isOpen || !medicine) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 1. Calculate the new total stock
    const currentStock = parseInt(medicine.stockLeft, 10) || 0;
    const newStockLeft = currentStock + calculatedUnits;

    // 2. Prepare the order record (if your backend supports storing an array of orders)
    const newOrderRecord = {
      stripsBought: parseInt(formData.strips, 10),
      totalUnitsAdded: calculatedUnits,
      cost: parseFloat(formData.cost) || 0,
      source: formData.source,
      purchaseDate: formData.purchaseDate,
    };

    // 3. Dispatch the update to Redux
    // NOTE: Adjust the payload structure based on what your backend expects
    dispatch(updateMedicine({
      id: medicine._id,
      medicineData: {
        stockLeft: newStockLeft,
        // You can pass the order record to backend to push into an orderHistory array
        latestOrder: newOrderRecord 
      }
    }));

    // Reset and close
    setFormData({ strips: '', cost: '', source: '', purchaseDate: format(new Date(), 'yyyy-MM-dd') });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Restock Medicine</h2>
            <p className="text-xs text-gray-500 capitalize">Adding stock for {medicine.name}</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Strips Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">How many strips did you buy?</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <PackagePlus className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="number"
                name="strips"
                required
                min="1"
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                placeholder="e.g., 3"
                value={formData.strips}
                onChange={handleChange}
              />
            </div>
            
            {/* Auto-calculator visual */}
            <div className="mt-2 flex items-center gap-2 text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-lg border border-blue-100">
              <Calculator className="h-3.5 w-3.5" />
              <span>
                <strong>{formData.strips || 0}</strong> strips × <strong>{medicine.packSize?.match(/\d+/)?.[0] || 10}</strong> per strip = <strong>{calculatedUnits} new units</strong> added to inventory.
              </span>
            </div>
          </div>

          {/* Cost & Source Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Total Cost</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="number"
                  name="cost"
                  step="0.01"
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                  placeholder="0.00"
                  value={formData.cost}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Date</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="date"
                  name="purchaseDate"
                  required
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                  value={formData.purchaseDate}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Pharmacy / Source */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Pharmacy / Source</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Store className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                name="source"
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                placeholder="e.g., Lazz Pharma, CVS, etc."
                value={formData.source}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.strips}
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <PackagePlus className="h-4 w-4" /> Add to Stock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RestockModal;