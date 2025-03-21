-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_orderId_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_orderId_fkey";

-- DropForeignKey
ALTER TABLE "ShippingAddress" DROP CONSTRAINT "ShippingAddress_userId_fkey";

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "shippingAddressId" INTEGER;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_shippingAddressId_fkey" FOREIGN KEY ("shippingAddressId") REFERENCES "ShippingAddress"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShippingAddress" ADD CONSTRAINT "ShippingAddress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
