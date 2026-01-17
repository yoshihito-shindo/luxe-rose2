const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_mock';
const stripe = require('stripe')(STRIPE_KEY);

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    identity: 'Luxe-Rose-System-v2',
    stripe_mode: STRIPE_KEY.startsWith('sk_live') ? 'live' : 'test',
    server_time: new Date().toISOString()
  });
});

app.post('/api/create-payment-intent', async (req, res) => {
  const { planId, amount } = req.body;
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount),
      currency: 'jpy',
      metadata: { planId },
      automatic_payment_methods: { enabled: true },
    });
    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('[STRIPE ERROR]:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.use(express.static(__dirname));

app.get('*', (req, res) => {
  if (req.url.startsWith('/api/')) {
    return res.status(404).json({ error: 'API not found' });
  }
  const indexPath = path.join(__dirname, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Web assets missing.');
  }
});

const PORT = process.env.PORT || 3001;
app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`
  ==========================================
  🚀 LUXE & ROSE DEPLOYED SUCCESSFULLY
  ==========================================
  Port: ${PORT}
  Stripe Mode: ${STRIPE_KEY.startsWith('sk_live') ? 'LIVE' : 'TEST'}
  Backend URL: ${process.env.RENDER_EXTERNAL_URL || 'http://localhost:'+PORT}
  ==========================================
  `);
});