import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { Webhook } from 'svix';
import { PrismaClient } from '@prisma/client';

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

  const httpServer = createServer(app);

  return httpServer;
}
