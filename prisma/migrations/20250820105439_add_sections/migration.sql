-- CreateEnum
CREATE TYPE "public"."SectionKind" AS ENUM ('WELCOME', 'AMENITIES', 'GUIDE');

-- CreateTable
CREATE TABLE "public"."Section" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "kind" "public"."SectionKind" NOT NULL,
    "title" TEXT,
    "body" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Section_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Section_propertyId_kind_key" ON "public"."Section"("propertyId", "kind");

-- AddForeignKey
ALTER TABLE "public"."Section" ADD CONSTRAINT "Section_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "public"."Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;
