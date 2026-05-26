// lib/Appwriteconfig.js
import { Client, Account } from "appwrite";

const APPWRITE_CONFIG = {
  endpoint:            process.env.REACT_APP_APPWRITE_ENDPOINT,
  projectId:           process.env.REACT_APP_APPWRITE_PROJECT_ID,
  databaseId:          process.env.REACT_APP_APPWRITE_DATABASE_ID,
  collectionId:        process.env.REACT_APP_APPWRITE_COLLECTION_ID,
  billId:              process.env.REACT_APP_APPWRITE_BILL_ID,
  paymentCollectionId: process.env.REACT_APP_APPWRITE_PAYMENT_COLLECTION_ID,
};

const client = new Client()
  .setEndpoint(APPWRITE_CONFIG.endpoint)
  .setProject(APPWRITE_CONFIG.projectId);

export const account = new Account(client);
export default APPWRITE_CONFIG;