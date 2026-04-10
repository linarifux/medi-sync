import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMedicines, updateMedicine, reset } from '../../features/medicines/medicineSlice';
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, 
  CheckCircle2, XCircle, PauseCircle, Clock, Pill, Activity
} from 'lucide-react';
import { format, addDays, subDays, isToday, isFuture, isSameDay, parseISO } from 'date-fns';

const ConsumptionLog = () => {
  const dispatch = useDispatch();
  const { medicines, isLoading, isError, message } = useSelector((state) => state.medicines);

  // State to track which day we are viewing
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    if (isError) console.error(message);
    dispatch(getMedicines());
    return () => dispatch(reset());
  }, [isError, message, dispatch]);

  // Helper to go to previous/next day
  const handlePrevDay = () => setSelectedDate((prev) => subDays(prev, 1));
  const handleNextDay = () => {
    if (!isToday(selectedDate)) setSelectedDate((prev) => addDays(prev, 1));
  };

  // Helper to get the most recent consumption record for a specific medicine on the selected date
  const getRecordForDate = (medicine, targetDate) => {
    if (!medicine.consumptionHistory || medicine.consumptionHistory.length === 0) return null;
    
    // Find all records for this day, then grab the first one (since backend unshifts the newest to the front)
    const recordsForDay = medicine.consumptionHistory.filter(record => 
      isSameDay(parseISO(record.date), targetDate)
    );
    
    return recordsForDay.length > 0 ? recordsForDay[0] : null;
  };

  // Dispatch the status update to the backend
  const handleLogStatus = (medicine, status) => {
    const consumptionRecord = {
      date: selectedDate.toISOString(), // Log it for the currently selected date
      status: status,
      notes: ''
    };

    dispatch(updateMedicine({
      id: medicine._id,
      medicineData: { consumptionRecord }
    }));
  };

  // Calculate statistics for the selected day
  const dailyStats = useMemo(() => {
    let taken = 0, skipped = 0, missed = 0, pending = 0;

    medicines.forEach(med => {
      const record = getRecordForDate(med, selectedDate);
      if (!record) pending++;
      else if (record.status === 'taken') taken++;
      else if (record.status === 'skipped') skipped++;
      else if (record.status === 'missed') missed++;
    });

    return { taken, skipped, missed, pending, total: medicines.length };
  }, [medicines, selectedDate]);


  if (isLoading && medicines.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-500">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
        <p className="font-medium animate-pulse">Loading consumption log...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-12 w-full px-2 sm:px-0">
      
      {/* 1. Header & Date Navigator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Consumption Log</h1>
          <p className="mt-1 sm:mt-2 text-sm text-gray-500 max-w-2xl">
            Track daily medication intake. Ensure nothing is missed or double-dosed.
          </p>
        </div>

        {/* Date Navigator */}
        <div className="flex items-center justify-between sm:justify-center bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden w-full sm:w-auto shrink-0">
          <button 
            onClick={handlePrevDay}
            className="p-3 sm:px-4 sm:py-2.5 text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          <div className="flex flex-col items-center justify-center px-4 sm:px-6 w-40 sm:w-48 border-x border-gray-100">
            <div className="flex items-center gap-1.5 text-blue-600 font-bold text-sm">
              <CalendarIcon className="h-4 w-4" />
              {isToday(selectedDate) ? 'Today' : format(selectedDate, 'MMM dd, yyyy')}
            </div>
            <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mt-0.5">
              {format(selectedDate, 'EEEE')}
            </div>
          </div>

          <button 
            onClick={handleNextDay}
            disabled={isToday(selectedDate)}
            className="p-3 sm:px-4 sm:py-2.5 text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* 2. Daily Progress Overview */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm mb-8 flex flex-wrap gap-4 justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100">
            <Activity className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">Daily Progress</p>
            <p className="text-xs text-gray-500">{dailyStats.taken} of {dailyStats.total} medicines taken</p>
          </div>
        </div>

        <div className="flex gap-4 sm:gap-6 w-full sm:w-auto">
          <div className="flex flex-col items-center flex-1 sm:flex-none">
            <span className="text-2xl font-black text-green-600">{dailyStats.taken}</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Taken</span>
          </div>
          <div className="flex flex-col items-center flex-1 sm:flex-none">
            <span className="text-2xl font-black text-gray-400">{dailyStats.pending}</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pending</span>
          </div>
          <div className="flex flex-col items-center flex-1 sm:flex-none">
            <span className="text-2xl font-black text-yellow-500">{dailyStats.skipped}</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Skipped</span>
          </div>
          <div className="flex flex-col items-center flex-1 sm:flex-none">
            <span className="text-2xl font-black text-red-500">{dailyStats.missed}</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Missed</span>
          </div>
        </div>
      </div>

      {/* 3. Daily Checklist */}
      <div className="space-y-4">
        {medicines.length > 0 ? (
          medicines.map((med) => {
            const record = getRecordForDate(med, selectedDate);
            const status = record?.status; // 'taken', 'skipped', 'missed', or undefined
            
            return (
              <div 
                key={med._id} 
                className={`bg-white rounded-2xl border p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all shadow-sm hover:shadow ${
                  status === 'taken' ? 'border-green-200 bg-green-50/30' : 
                  status === 'missed' ? 'border-red-200 bg-red-50/30' :
                  status === 'skipped' ? 'border-yellow-200 bg-yellow-50/30' :
                  'border-gray-200'
                }`}
              >
                
                {/* Left: Medicine Info */}
                <div className="flex items-center gap-4">
                  <div className={`h-12 w-12 shrink-0 rounded-xl flex items-center justify-center border shadow-sm ${
                    status === 'taken' ? 'bg-green-100 border-green-200 text-green-600' : 
                    'bg-gray-50 border-gray-200 text-gray-400'
                  }`}>
                    {status === 'taken' ? <CheckCircle2 className="h-6 w-6" /> : <Pill className="h-6 w-6" />}
                  </div>
                  <div>
                    <h3 className={`font-bold text-lg capitalize leading-tight ${status === 'taken' ? 'text-gray-900 line-through decoration-2 decoration-green-500/40' : 'text-gray-900'}`}>
                      {med.name}
                    </h3>
                    <p className="text-sm text-gray-500 font-medium mt-0.5">
                      {med.dosage} • {med.consumptionRate} {med.frequency}
                    </p>
                  </div>
                </div>

                {/* Right: Action Buttons OR Status Badge */}
                <div className="flex items-center justify-end sm:shrink-0 mt-2 sm:mt-0 w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0 border-gray-100">
                  
                  {!status ? (
                    /* Pending State - Show Action Buttons */
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button 
                        onClick={() => handleLogStatus(med, 'taken')}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded-lg text-sm font-bold transition-colors"
                      >
                        <CheckCircle2 className="h-4 w-4" /> Take
                      </button>
                      <button 
                        onClick={() => handleLogStatus(med, 'skipped')}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border border-yellow-200 rounded-lg text-sm font-bold transition-colors"
                        title="Skipped intentionally (e.g. Doctor's advice)"
                      >
                        <PauseCircle className="h-4 w-4" /> Skip
                      </button>
                      <button 
                        onClick={() => handleLogStatus(med, 'missed')}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-sm font-bold transition-colors"
                        title="Forgot to take"
                      >
                        <XCircle className="h-4 w-4" /> Miss
                      </button>
                    </div>
                  ) : (
                    /* Logged State - Show Badge and Edit Button */
                    <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                      
                      {status === 'taken' && (
                        <span className="flex items-center gap-1.5 text-sm font-bold text-green-700 bg-green-100 px-3 py-1.5 rounded-lg">
                          <CheckCircle2 className="h-4 w-4" /> Marked as Taken
                        </span>
                      )}
                      {status === 'skipped' && (
                        <span className="flex items-center gap-1.5 text-sm font-bold text-yellow-700 bg-yellow-100 px-3 py-1.5 rounded-lg">
                          <PauseCircle className="h-4 w-4" /> Skipped
                        </span>
                      )}
                      {status === 'missed' && (
                        <span className="flex items-center gap-1.5 text-sm font-bold text-red-700 bg-red-100 px-3 py-1.5 rounded-lg">
                          <XCircle className="h-4 w-4" /> Missed
                        </span>
                      )}

                      {/* Allows user to overwrite a mistake */}
                      <button 
                        onClick={() => handleLogStatus(med, 'pending')} // We simulate "undo" by overriding the array with a new blank status if you want, OR just overwrite directly
                        className="text-xs font-bold text-gray-400 hover:text-gray-900 underline underline-offset-2"
                      >
                        Undo
                      </button>
                    </div>
                  )}

                </div>
              </div>
            );
          })
        ) : (
          <div className="py-12 text-center bg-white rounded-2xl border border-gray-200 shadow-sm">
             <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
             <h3 className="text-base font-bold text-gray-900">No medicines available</h3>
             <p className="text-gray-500 text-sm mt-1">Please add medicines to the inventory first.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsumptionLog;