import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../services/api';

const initialState = {
  medicines: [],
  medicine: null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

// Fetch all medicines
export const getMedicines = createAsyncThunk('medicines/getAll', async (_, thunkAPI) => {
  try {
    const response = await API.get('/medicines');
    return response.data;
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

// Fetch single medicine
export const getMedicine = createAsyncThunk('medicines/getSingle', async (id, thunkAPI) => {
  try {
    const response = await API.get(`/medicines/${id}`);
    return response.data;
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

// Create new medicine
export const createMedicine = createAsyncThunk('medicines/create', async (medicineData, thunkAPI) => {
  try {
    const response = await API.post('/medicines', medicineData);
    return response.data;
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

// Update a medicine
export const updateMedicine = createAsyncThunk('medicines/update', async ({ id, medicineData }, thunkAPI) => {
  try {
    const response = await API.put(`/medicines/${id}`, medicineData);
    return response.data;
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

// Delete a medicine
export const deleteMedicine = createAsyncThunk('medicines/delete', async (id, thunkAPI) => {
  try {
    await API.delete(`/medicines/${id}`);
    return id; // Return the ID so the reducer knows which one to remove from the array
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const medicineSlice = createSlice({
  name: 'medicine',
  initialState,
  reducers: {
    reset: (state) => {
      state.isError = false;
      state.isSuccess = false;
      state.isLoading = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Medicines
      .addCase(getMedicines.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMedicines.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.medicines = action.payload;
      })
      .addCase(getMedicines.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Create Medicine
      .addCase(createMedicine.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createMedicine.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.medicines.push(action.payload);
      })
      .addCase(createMedicine.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Update Medicine
      .addCase(updateMedicine.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateMedicine.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        // Find the index of the updated medicine and replace it in the array
        const index = state.medicines.findIndex((med) => med._id === action.payload._id);
        if (index !== -1) {
          state.medicines[index] = action.payload;
        }
      })
      .addCase(updateMedicine.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Delete Medicine
      .addCase(deleteMedicine.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteMedicine.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        // Filter out the deleted medicine from the UI
        state.medicines = state.medicines.filter((med) => med._id !== action.payload);
      })
      .addCase(deleteMedicine.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Get Single Medicine
      .addCase(getMedicine.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMedicine.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.medicine = action.payload; // Set the single medicine
      })
      .addCase(getMedicine.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
  },
});

export const { reset } = medicineSlice.actions;
export default medicineSlice.reducer;