const express = require('express');
const routes = require('./routes');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./middleware/logger');
const path = require("path");
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./config/swagger');

const app = express();
app.set('trust proxy', 1); // Tin tưởng proxy (ngrok, nginx, etc.) để lấy đúng client IP
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/api', routes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Không tìm thấy endpoint' });
});

app.use(errorHandler);

module.exports = app;