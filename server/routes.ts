import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { Webhook } from 'svix';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  const prisma = new PrismaClient();

  // Clerk Webhook endpoint
  app.post('/api/webhooks/clerk', async (req, res) => {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
      return res.status(500).json({ error: 'CLERK_WEBHOOK_SECRET not found' });
    }

    // Get the headers
    const svix_id = req.headers["svix-id"] as string;
    const svix_timestamp = req.headers["svix-timestamp"] as string;
    const svix_signature = req.headers["svix-signature"] as string;

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
      return res.status(400).json({ error: 'Error occured -- no svix headers' });
    }

    // Get the body
    const payload = JSON.stringify(req.body);
    const body = req.body;

    // Create a new Svix instance with your secret.
    const wh = new Webhook(WEBHOOK_SECRET);

    let evt: any;

    // Verify the payload with the headers
    try {
      evt = wh.verify(payload, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as any;
    } catch (err) {
      console.error('Error verifying webhook:', err);
      return res.status(400).json({ error: 'Error occured' });
    }

    // Do something with the payload
    const { id } = evt?.data;
    const eventType = evt?.type;

    console.log(`Webhook with and ID of ${id} and type of ${eventType}`);
    console.log('Webhook body:', body);

    if (eventType === 'user.created') {
      try {
        const { id, email_addresses } = evt.data;
        
        // Kullanıcıyı veritabanına ekle
        await prisma.user.create({
          data: {
            clerkUserId: id,
            email: email_addresses[0]?.email_address || '',
          }
        });

        console.log(`User ${id} added to database`);
      } catch (error) {
        console.error('Error adding user to database:', error);
        return res.status(500).json({ error: 'Error adding user to database' });
      }
    }

    res.status(200).json({ received: true });
  });

  // NOWPayments Create Crypto Payment API
  app.post('/api/payment/create-crypto-payment', async (req, res) => {
    const API_KEY = process.env.NOWPAYMENTS_API_KEY;
    
    if (!API_KEY) {
      return res.status(500).json({ error: 'NOWPAYMENTS_API_KEY not found' });
    }

    try {
      const paymentData = {
        price_amount: 60,
        price_currency: 'usd',
        pay_currency: 'btc',
        order_id: 'USER123',
        order_description: 'Profesyonel Plan Üyeliği',
        success_url: `${req.protocol}://${req.get('host')}/dashboard`
      };

      console.log('Sending to NOWPayments:', JSON.stringify(paymentData, null, 2));

      const response = await fetch('https://api.nowpayments.io/v1/invoice', {
        method: 'POST',
        headers: {
          'x-api-key': API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData)
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      const result = await response.json();
      
      console.log('NOWPayments API response:', JSON.stringify(result, null, 2));
      
      if (!response.ok) {
        console.error('NOWPayments API error:', result);
        return res.status(400).json({ error: 'Payment creation failed', details: result });
      }

      // Check all possible URL fields from the response
      const possibleUrls = [
        result.invoice_url,
        result.payment_url, 
        result.hosted_url,
        result.checkout_url,
        result.url
      ];

      console.log('Possible URLs in response:', possibleUrls);

      const paymentUrl = possibleUrls.find(url => url && typeof url === 'string');
      
      if (paymentUrl) {
        console.log('Using payment URL:', paymentUrl);
        res.json({ paymentUrl });
      } else {
        console.error('No payment URL found in response');
        res.status(400).json({ error: 'No payment URL received from NOWPayments', response: result });
      }
    } catch (error) {
      console.error('Error creating crypto payment:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // NOWPayments Crypto Webhook
  app.post('/api/payment/crypto-webhook', async (req, res) => {
    const IPN_SECRET = process.env.NOWPAYMENTS_IPN_SECRET;
    
    if (!IPN_SECRET) {
      return res.status(500).json({ error: 'NOWPAYMENTS_IPN_SECRET not found' });
    }

    try {
      // Get the signature from headers
      const receivedSignature = req.headers['x-nowpayments-sig'] as string;
      
      if (!receivedSignature) {
        return res.status(400).json({ error: 'Missing signature header' });
      }

      // Verify the webhook signature
      const payload = JSON.stringify(req.body);
      const expectedSignature = crypto
        .createHmac('sha512', IPN_SECRET)
        .update(payload)
        .digest('hex');

      if (receivedSignature !== expectedSignature) {
        console.error('Invalid webhook signature');
        return res.status(400).json({ error: 'Invalid signature' });
      }

      const { payment_status, order_id } = req.body;

      console.log(`Webhook received: Payment ${order_id} status: ${payment_status}`);

      // If payment is completed
      if (payment_status === 'finished') {
        try {
          // Find user by order_id (in this case it's the user ID)
          const user = await prisma.user.findFirst({
            where: {
              clerkUserId: order_id
            }
          });

          if (user) {
            // Update user subscription to Professional Plan
            await prisma.user.update({
              where: {
                id: user.id
              },
              data: {
                subscription: 'Profesyonel Plan'
              } as any
            });

            console.log(`User ${order_id} subscription updated to Profesyonel Plan`);
          } else {
            console.log(`User ${order_id} not found`);
          }
        } catch (dbError) {
          console.error('Database error:', dbError);
          return res.status(500).json({ error: 'Database update failed' });
        }
      }

      res.status(200).json({ status: 'success' });
    } catch (error) {
      console.error('Webhook processing error:', error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
