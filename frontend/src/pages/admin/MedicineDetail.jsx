import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { getMedicine, deleteMedicine, reset } from '../../features/medicines/medicineSlice';
import { format } from 'date-fns';
import { 
  ArrowLeft, Pill, AlertCircle, Calendar, Activity, 
  Package, CheckCircle2, ShoppingCart, FileText, Info, Edit, Trash2 
} from 'lucide-react';
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

const MedicineDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { medicine, isLoading, isError, message } = useSelector((state) => state.medicines);

  // Calculate remaining days in the current month
  const today = new Date();
  const daysInCurrentMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const daysLeftInMonth = daysInCurrentMonth - today.getDate() + 1;

  useEffect(() => {
    if (isError) {
      console.error(message);
    }
    dispatch(getMedicine(id));

    return () => {
      dispatch(reset());
    };
  }, [id, isError, message, dispatch]);

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this medicine? This action cannot be undone.')) {
      dispatch(deleteMedicine(id));
      navigate('/'); // Redirect to inventory after deletion
    }
  };

  if (isLoading || !medicine) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
        <p>Loading medicine details...</p>
      </div>
    );
  }

  const needsRestock = medicine.stockInfo?.needsRestock;
  const orderSuggestion = calculateStripsToOrder(
    medicine.consumptionRate, 
    medicine.frequency, 
    medicine.packSize, 
    medicine.stockLeft, 
    daysLeftInMonth
  );

  // Calculate a simple percentage for the progress bar (maxed at 30 days for a "full" bar)
  const daysLeft = medicine.stockInfo?.daysLeft || 0;
  const stockHealthPercentage = Math.min((daysLeft / 30) * 100, 100);

  return (
    <div className="max-w-5xl mx-auto pb-10">
      {/* Top Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Inventory
        </button>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium border border-blue-200"
          >
            <Edit className="h-4 w-4" /> Edit
          </button>
          <button 
            onClick={handleDelete}
            className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium border border-red-200"
          >
            <Trash2 className="h-4 w-4" /> Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Main Identity & Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex flex-col sm:flex-row border-b border-gray-100">
              {/* Image Section */}
              <div className="sm:w-1/3 bg-gray-50 p-8 flex items-center justify-center border-r sm:border-b-0 border-b border-gray-100 min-h-[250px]">
                {medicine.photo && medicine.photo !== 'default_medicine.png' && !medicine.photo.includes('/uploads/') ? (
                  <img src={medicine.photo} alt={medicine.name} className="max-h-48 object-contain rounded-lg drop-shadow-sm" />
                ) : (
                  <div className="h-32 w-32 bg-gray-200 rounded-full flex items-center justify-center shadow-inner">
                    <Pill className="h-16 w-16 text-gray-400" />
                  </div>
                )}
              </div>
              
              {/* Identity & Core Details */}
              <div className="p-8 sm:w-2/3 flex flex-col justify-center">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h1 className="text-3xl font-extrabold text-gray-900 capitalize">{medicine.name}</h1>
                  {needsRestock ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">
                      <AlertCircle className="h-4 w-4" /> Needs Restock
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
                      <CheckCircle2 className="h-4 w-4" /> Healthy Stock
                    </span>
                  )}
                </div>
                <p className="text-lg text-gray-600 mb-6 font-medium">{medicine.packSize}</p>
                
                <div className="grid grid-cols-2 gap-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2.5 rounded-lg text-blue-700">
                      <Activity className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Dosage</p>
                      <p className="text-base font-semibold text-gray-900">{medicine.dosage}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-100 p-2.5 rounded-lg text-purple-700">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Frequency</p>
                      <p className="text-base font-semibold text-gray-900 capitalize">
                        {medicine.consumptionRate} per {medicine.frequency}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information Section */}
            <div className="p-8 bg-white">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
                <FileText className="h-5 w-5 text-gray-400" /> Additional Information
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                    <Info className="h-4 w-4 text-blue-500" /> Purpose / Use Case
                  </h4>
                  <p className="text-gray-600 text-sm leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100 min-h-[80px]">
                    {medicine.purpose || "No specific purpose recorded."}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-orange-500" /> Instructions / Notes
                  </h4>
                  <p className="text-gray-600 text-sm leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100 min-h-[80px]">
                    {medicine.instructions || medicine.notes || "No special instructions provided."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Stock Projections & Ordering */}
        <div className="space-y-6">
          
          {/* Main Stock Card */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Package className="h-5 w-5 text-gray-400" /> Inventory Status
            </h3>

            {/* Stock Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm font-medium mb-2">
                <span className="text-gray-600">Supply Health</span>
                <span className={daysLeft <= 7 ? 'text-red-600' : 'text-green-600'}>
                  {daysLeft} days remaining
                </span>
              </div>
              <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    daysLeft <= 7 ? 'bg-red-500' : daysLeft <= 14 ? 'bg-yellow-400' : 'bg-green-500'
                  }`}
                  style={{ width: `${stockHealthPercentage}%` }}
                ></div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-500">Current Units Left</p>
                  <p className="text-xs text-gray-400 mt-0.5">Physical count</p>
                </div>
                <p className={`text-3xl font-black ${needsRestock ? 'text-red-600' : 'text-gray-900'}`}>
                  {medicine.stockLeft}
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-sm font-medium text-gray-500 mb-1">Estimated Depletion</p>
                <p className="text-lg font-bold text-gray-900">
                  {medicine.stockInfo?.estimatedDepletion ? format(new Date(medicine.stockInfo.estimatedDepletion), 'MMMM dd, yyyy') : 'N/A'}
                </p>
              </div>
              
              <div className={`p-4 rounded-xl border ${needsRestock ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-100'}`}>
                <p className={`text-sm font-medium mb-1 ${needsRestock ? 'text-red-800' : 'text-gray-500'}`}>Next Order Date</p>
                <p className={`text-lg font-bold ${needsRestock ? 'text-red-700' : 'text-gray-900'}`}>
                  {medicine.stockInfo?.nextOrderDate ? format(new Date(medicine.stockInfo.nextOrderDate), 'MMMM dd, yyyy') : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Smart Order Suggestion Card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100 shadow-sm relative overflow-hidden">
            {/* Decorative background circle */}
            <div className="absolute -top-6 -right-6 h-24 w-24 bg-blue-200 rounded-full opacity-50 blur-2xl"></div>
            
            <h3 className="text-sm font-bold text-blue-800 uppercase tracking-wider mb-2 flex items-center gap-2 relative z-10">
              <ShoppingCart className="h-4 w-4" /> Smart Suggestion
            </h3>
            
            <p className="text-gray-700 text-sm mb-4 relative z-10">
              To keep your mother covered for the remaining <strong>{daysLeftInMonth} days</strong> of this month, you should have:
            </p>
            
            <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm text-center relative z-10">
              {orderSuggestion === 'Stocked' ? (
                 <p className="text-lg font-bold text-green-600 flex items-center justify-center gap-2">
                   <CheckCircle2 className="h-5 w-5" /> Fully Stocked
                 </p>
              ) : (
                <>
                  <p className="text-3xl font-black text-blue-600">{orderSuggestion}</p>
                  <p className="text-xs text-gray-500 mt-1">Based on {medicine.packSize}</p>
                </>
              )}
            </div>
          </div>

        </div>
      </div>

      {isEditModalOpen && (
        <EditMedicineModal 
          isOpen={isEditModalOpen} 
          onClose={() => setIsEditModalOpen(false)} 
          medicine={medicine} 
        />
      )}
    </div>
  );
};

export default MedicineDetail;