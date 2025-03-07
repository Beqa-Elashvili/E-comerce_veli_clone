import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const connectDb = async () => {
  try {
    await prisma.$connect(); // Connect to the database
    console.log("Connected to the database successfully!");
  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
};
export default connectDb;
