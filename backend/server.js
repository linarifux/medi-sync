import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import connectDB from './config/db.js';
import { notFound, errorHandler } from './middlewares/errorMiddleware.js';
import userRoutes from './routes/userRoutes.js';
import historyRoutes from './routes/historyRoutes.js'; // Add this at the top
import adminRoutes from './routes/adminRoutes.js'; // Add this line
import medicineRoutes from './routes/medicineRoutes.js'; // Add this line
import orderRoutes from './routes/orderRoutes.js';


// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middlewares
app.use(helmet()); // Security headers

app.use(cors({
  origin: ["https://medi-syn.netlify.app", "http://localhost:5173", "http://localhost:5000", "https://medi-sync-six.vercel.app"], // Allow requests from these origins
})); // Allow cross-origin requests from frontend

app.use(express.json()); // Parse incoming JSON payloads
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // API logging
}

// Basic Route
app.get('/', (req, res) => {
  res.send('MediSync API is running...');
});

// We will mount our routes here shortly (e.g., app.use('/api/medicines', medicineRoutes))
app.use('/api/users', userRoutes);
app.use('/api/history', historyRoutes); // Add this line to mount history routes
app.use('/api/admin', adminRoutes); // Add this line to mount admin routes
app.use('/api/medicines', medicineRoutes); // Add this line to mount medicine routes
app.use('/api/orders', orderRoutes);

// Error Handling Middlewares (Must be at the end)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});