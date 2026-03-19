const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log('✅ DATABASE IS LIVE');
    console.log('STATE:', mongoose.connection.readyState); // should be 1

    // ✅ LOAD ROUTES ONLY AFTER CONNECTION
    app.use('/api/workflows', require('./routes/workflows'));
    app.use('/api/rules', require('./routes/rules'));
    app.use('/api/executions', require('./routes/executions'));
    // Add this line to your server.js
    app.use('/api/steps', require('./routes/steps'));
    app.use('/', require('./routes/execution'));

    app.listen(5000, () => {
      console.log('🚀 Server running on http://localhost:5000');
    });

  } catch (err) {
    console.error('❌ DB Connection Failed:', err);
  }
};

startServer();