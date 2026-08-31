const dns = require('dns');
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
}

const express = require('express');
const http = require('http'); // Added
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
const connectDB = require('./src/config/db');
const cookieParser = require('cookie-parser');
const routes = require('./src/routes/index');
const socketIO = require('./src/utils/socket'); // Added

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app); // Added

// Initialize Socket.io
socketIO.init(server); // Added

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Main Routes
app.use('/api/v1', routes);

app.get('/', (req, res) => {
    res.send(`
        <html>
        <body>
        <head><title>DSMS</title></head>
        <p>Welcome to MERN DSMS Web Appliction...</p>
        </body>
        </html>
        `);
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
