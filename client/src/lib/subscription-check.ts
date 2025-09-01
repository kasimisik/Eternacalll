import { PrismaClient } from '@prisma/client';
import type { Request, Response, NextFunction } from 'express';

const prisma = new PrismaClient();

// Bu, API endpoint'lerimizi sarmalayacak olan güvenlik fonksiyonudur
export function withSubscriptionCheck(
  handler: (req: Request, res: Response, userId: string) => Promise<void>
) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // 1. Adım: Kullanıcının kimliğini doğrula (Clerk auth header'dan alınır)
      const userId = req.headers['x-clerk-user-id'] as string;
      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      // 2. Adım: Veritabanından abonelik durumunu kontrol et
      const userSubscription = await prisma.user.findUnique({
        where: { clerkUserId: userId },
        select: {
          subscription: true
        }
      });

      // 3. Adım: Yetkilendirme kontrolü
      if (userSubscription?.subscription !== 'Profesyonel Plan') {
        res.status(403).json({ error: "Forbidden - Active subscription required" });
        return;
      }

      // Tüm kontrollerden geçerse, asıl API kodunu çalıştır
      await handler(req, res, userId);

    } catch (error) {
      console.error("Subscription check middleware error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };
}