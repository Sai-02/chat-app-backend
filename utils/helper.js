const {
  BlobServiceClient,
  StorageSharedKeyCredential,
  newPipeline,
} = require("@azure/storage-blob");
require("dotenv").config();
const sharedKeyCredential = new StorageSharedKeyCredential(
  process.env.AZURE_STORAGE_ACCOUNT_NAME,
  process.env.AZURE_STORAGE_ACCOUNT_ACCESS_KEY
);
const pipeline = newPipeline(sharedKeyCredential);
const getBlobName = (originalName) => {
  const identifier = Math.random().toString().replace(/0\./, "");
  return `${identifier}-${originalName}`;
};
const blobServiceClient = new BlobServiceClient(
  `https://${process.env.AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net`,
  pipeline
);
const uploadImageAndGetURL = async (name,image) => {
  const blobName = getBlobName(name + "_" + image.name);
  const containerClient = blobServiceClient.getContainerClient("chat-app");
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  await blockBlobClient.uploadFile(image.path, image, {});
  const imageUrl = process.env.AZURE_STORED_IMAGE_URL + blobName;
  return imageUrl;
};

module.exports = {
  uploadImageAndGetURL,
};
