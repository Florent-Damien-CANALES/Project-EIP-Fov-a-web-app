/*
  Warnings:

  - You are about to drop the `_InvoiceToProduct` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `_InvoiceToProduct` DROP FOREIGN KEY `_InvoiceToProduct_A_fkey`;

-- DropForeignKey
ALTER TABLE `_InvoiceToProduct` DROP FOREIGN KEY `_InvoiceToProduct_B_fkey`;

-- DropTable
DROP TABLE `_InvoiceToProduct`;

-- CreateTable
CREATE TABLE `ProductInvoice` (
    `id` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL,
    `invoiceId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ProductInvoice` ADD CONSTRAINT `ProductInvoice_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductInvoice` ADD CONSTRAINT `ProductInvoice_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `Invoice`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
