-- AlterTable
ALTER TABLE "quotes" ADD COLUMN     "approved_at" TIMESTAMP(3),
ADD COLUMN     "expired_at" TIMESTAMP(3),
ADD COLUMN     "rejected_at" TIMESTAMP(3),
ADD COLUMN     "revision" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "sent_at" TIMESTAMP(3);
