-- AlterEnum
ALTER TYPE "Status" ADD VALUE 'inReview';

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "githubPrNumber" INTEGER,
ADD COLUMN     "githubPrUrl" TEXT;

-- CreateTable
CREATE TABLE "Installation" (
    "id" SERIAL NOT NULL,
    "githubInstallationId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Installation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Installation_githubInstallationId_key" ON "Installation"("githubInstallationId");

-- CreateIndex
CREATE UNIQUE INDEX "Installation_userId_key" ON "Installation"("userId");

-- AddForeignKey
ALTER TABLE "Installation" ADD CONSTRAINT "Installation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
