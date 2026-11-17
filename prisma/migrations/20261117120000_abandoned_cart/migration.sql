-- CreateTable
CREATE TABLE "AbandonedCart" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'sk',
    "items" JSONB NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,
    "remindedAt" TIMESTAMP(3),
    "optedOutAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AbandonedCart_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AbandonedCart_token_key" ON "AbandonedCart"("token");

-- CreateIndex
CREATE UNIQUE INDEX "AbandonedCart_email_key" ON "AbandonedCart"("email");

-- CreateIndex
CREATE INDEX "AbandonedCart_remindedAt_updatedAt_idx" ON "AbandonedCart"("remindedAt", "updatedAt");
