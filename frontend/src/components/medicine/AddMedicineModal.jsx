import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createMedicine } from '../../features/medicines/medicineSlice';
import { X } from 'lucide-react';

const AddMedicineModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: 'daily',
    consumptionRate: '',
    stockLeft: '',
    packSize: '',
  });
  const [photo, setPhoto] = useState(null);

  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.medicines);

  if (!isOpen) return null;

  const { name, dosage, frequency, consumptionRate, stockLeft, packSize } = formData;

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onFileChange = (e) => {
    setPhoto(e.target.files[0]);
  };

  const onSubmit = (e) => {
    e.preventDefault();

    // Since we have a file, we MUST use FormData instead of a standard JSON object
    const data = new FormData();
    data.append('name', name);
    data.append('dosage', dosage);
    data.append('frequency', frequency);
    data.append('consumptionRate', consumptionRate);
    data.append('stockLeft', stockLeft);
    data.append('packSize', packSize);
    
    if (photo) {
      data.append('photo', photo);
    }

    dispatch(createMedicine(data)).then(() => {
      // Clear form and close modal on success
      setFormData({
        name: '', dosage: '', frequency: 'daily', consumptionRate: '', stockLeft: '', packSize: ''
      });
      setPhoto(null);
      onClose();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 relative m-4">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>

        <h2 className="text-xl font-bold text-gray-900 mb-6">Add New Medicine</h2>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Medicine Name</label>
              <input type="text" name="name" value={name} onChange={onChange} required placeholder="e.g., Vergon" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dosage</label>
              <input type="text" name="dosage" value={dosage} onChange={onChange} required placeholder="e.g., 5mg" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
              <select name="frequency" value={frequency} onChange={onChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white">
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="as_needed">As Needed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pills per {frequency === 'daily' ? 'Day' : 'Week'}</label>
              <input type="number" step="0.1" name="consumptionRate" value={consumptionRate} onChange={onChange} required placeholder="e.g., 2" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Stock Left</label>
              <input type="number" name="stockLeft" value={stockLeft} onChange={onChange} required placeholder="e.g., 23" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Pack Size Description</label>
              <input type="text" name="packSize" value={packSize} onChange={onChange} required placeholder="e.g., 40 Tablets (1 Strip)" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload Photo</label>
              <input type="file" accept="image/*" onChange={onFileChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
            <button type="submit" disabled={isLoading} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
              {isLoading ? 'Saving...' : 'Save Medicine'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default AddMedicineModal;