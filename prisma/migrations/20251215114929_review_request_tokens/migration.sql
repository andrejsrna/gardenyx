-- CreateTable
CREATE TABLE "ReviewRequest" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "orderId" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "rating" INTEGER,
    "content" TEXT,
    "name" TEXT,
    "couponCode" TEXT,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReviewRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ReviewRequest_token_key" ON "ReviewRequest"("token");

-- CreateIndex
CREATE INDEX "ReviewRequest_email_idx" ON "ReviewRequest"("email");

-- CreateIndex
CREATE INDEX "ReviewRequest_orderId_idx" ON "ReviewRequest"("orderId");
