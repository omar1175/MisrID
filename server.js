require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const applicationRoutes = require('./routes/applicationRoutes');

const app = express();

app.use(express.json());

// Routes
app.use('/v1/auth', authRoutes);
// app.use('/v1/users', userRoutes);
app.use('/v1/applications', applicationRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// app.use((err, req, res, next) => {
//   if (err.name === 'MulterError' || err.message?.includes('images are allowed')) {
//     return res.status(400).json({
//       success: false,
//       message: err.message,
//     });
//   }
//   console.error('UNHANDLED ERROR:', err);
//   return res.status(500).json({
//     success: false,
//     message: 'Internal server error',
//   });
// });

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});