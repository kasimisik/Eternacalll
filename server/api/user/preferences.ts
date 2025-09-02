import { Request, Response } from 'express';
import { db } from '../../db';
import { userPreferences } from '../../../shared/schema';
import { eq } from 'drizzle-orm';

export async function getUserPreferences(req: Request, res: Response) {
  try {
    const userId = req.headers['x-user-id'] as string;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const preferences = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId))
      .limit(1);

    if (preferences.length === 0) {
      return res.json({ preferences: null });
    }

    res.json({ preferences: preferences[0] });
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    res.status(500).json({ 
      error: 'Failed to fetch user preferences',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export async function saveUserPreferences(req: Request, res: Response) {
  try {
    const userId = req.headers['x-user-id'] as string;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const preferenceData = req.body;

    // Check if preferences already exist
    const existingPreferences = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId))
      .limit(1);

    if (existingPreferences.length > 0) {
      // Update existing preferences
      const updated = await db
        .update(userPreferences)
        .set({
          ...preferenceData,
          updatedAt: new Date(),
        })
        .where(eq(userPreferences.userId, userId))
        .returning();

      res.json({ success: true, preferences: updated[0] });
    } else {
      // Create new preferences
      const created = await db
        .insert(userPreferences)
        .values({
          userId,
          ...preferenceData,
        })
        .returning();

      res.json({ success: true, preferences: created[0] });
    }
  } catch (error) {
    console.error('Error saving user preferences:', error);
    res.status(500).json({ 
      error: 'Failed to save user preferences',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export async function deleteUserPreferences(req: Request, res: Response) {
  try {
    const userId = req.headers['x-user-id'] as string;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    await db
      .delete(userPreferences)
      .where(eq(userPreferences.userId, userId));

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting user preferences:', error);
    res.status(500).json({ 
      error: 'Failed to delete user preferences',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}