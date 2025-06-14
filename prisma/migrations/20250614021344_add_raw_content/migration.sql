/*
  Warnings:

  - Added the required column `rawContent` to the `Comment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Comment" ADD COLUMN "rawContent" TEXT;

UPDATE "Comment" SET "rawContent" = "content";

ALTER TABLE "Comment" ALTER COLUMN "rawContent" SET NOT NULL;
