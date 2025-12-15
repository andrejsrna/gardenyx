-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('draft', 'pending', 'private', 'publish');

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "wcId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'simple',
    "status" "ProductStatus" NOT NULL DEFAULT 'publish',
    "sku" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "regularPrice" DECIMAL(10,2) NOT NULL,
    "salePrice" DECIMAL(10,2),
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "stockStatus" TEXT,
    "stockQuantity" INTEGER,
    "weight" DECIMAL(10,3),
    "categories" JSONB,
    "images" JSONB,
    "attributes" JSONB,
    "meta" JSONB,
    "shortDescription" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_wcId_key" ON "Product"("wcId");

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");

-- CreateIndex
CREATE INDEX "Product_wcId_idx" ON "Product"("wcId");

-- CreateIndex
CREATE INDEX "Product_slug_idx" ON "Product"("slug");
