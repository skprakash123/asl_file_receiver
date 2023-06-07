// import express from "express";
// import * as bodyParser from "body-parser";
// import axios from "axios";
// const dotenv = require("dotenv").config();
// const Client = require("ssh2-sftp-client");
// const sftp = new Client();
// import { Storage } from "@google-cloud/storage";
// import { PubSub } from "@google-cloud/pubsub";
// import { join } from "path";

// const gcpConfig = {
//   projectId: process.env.PROJECT_ID,
//   credentials: {
//     token_url: process.env.TOKEN_URL,
//     client_email: process.env.CLIENT_EMAIL,
//     client_id: process.env.CLIENT_ID,
//     private_key: process.env.PRIVATE_KEY!.split(String.raw`\n`).join("\n"),
//   },
// };

// //GCS - Cloud storage details
// const storage = new Storage(gcpConfig);
// const pubsub = new PubSub(gcpConfig);

// if (!dotenv) {
//   throw new Error("Unable to use dot env lib");
// }

// // Set the NODE_ENV to 'development' by default
// process.env.NODE_ENV = "development";

// //Bucket name should read from the environment variables
// const bucketName = process.env.bucketName;
// const Bucket = storage.bucket(bucketName!);

// // express server
// const app = express();

// // middlware for parse data in urlencoded
// app.use(
//   bodyParser.urlencoded({
//     extended: true,
//   })
// );

// // middlware for parse data in json
// app.use(bodyParser.json());

// //This POST API will upload the downloaded files to Google storage area in the bucket
// app.post("/", async (req: any, res: any) => {
//   console.log("req.body.downloadedFiles", req.body.downloadedFiles);
//   for (let i = 0; i < req.body.downloadedFiles.length; i++) {
//     const parentFolderName = req.body.downloadedFiles[i].split("/")[0];
//     const fileName = req.body.downloadedFiles[i].split("/")[1];
//     const fileNameWithoutExt = req.body.downloadedFiles[i]
//       .split("/")[1]
//       .split(".")[0];
//     //On the cloud storage area based on the file name we are storing data in different folders
//     const currentDate = new Date();
//     const year = currentDate.getFullYear();
//     const month = currentDate.getMonth() + 1;
//     const date = currentDate.getDate();
//     const destinationFolder = `QAR/${parentFolderName}/${year}/${month}/${date}/`;
//     // const destinationFolder = fileNameWithoutExt.includes("QAR")
//     //   ? `QAR/${parentFolderName}/${year}/${month}/${date}/`
//     //   : "ODW_data_files/";
//     //This function will upload the files to bucket

//     const upload = await Bucket.upload(`${__dirname}/sftp-files/${fileName}`, {
//       destination: `${destinationFolder}${fileName}`,
//     });
//     console.log("file uploaded ", fileName, " on bucket ", bucketName);
//     const payload = JSON.stringify({
//       fileType: "QAR",
//       // fileType: fileName.includes("QAR") ? "QAR" : "ODW",
//       fileName: fileName,
//       bucketName,
//       fileLocation: `https://storage.googleapis.com/${bucketName}/${destinationFolder}${fileName}`,
//     });
//     const payloadBuffer = Buffer.from(payload);
//     const sendMessage = await pubsub
//       .topic("ge-queue")
//       .publishMessage({ data: payloadBuffer });
//     console.log("sendMessage", sendMessage);
//   }
//   return res.status(200).json({
//     status: 200,
//     message: "Files uploaded successfully",
//   });
// });

// // This endpoint is for Document Management API. Listen all messages from Google Pub/Sub.
// app.post("/listen", (req: any, res: any) => {
//   try {
//     const message = req.body ? req.body.message : null;
//     console.log("message", message);
//     if (message) {
//       const buffer = Buffer.from(message.data, "base64").toString();
//       const data = JSON.parse(buffer!);
//       console.log("Ack Message", message.messageId);
//       return res.status(200).json({ messageId: message.messageId, data: data });
//     } else {
//       return res.status(200).json({ data: "No message data found" });
//     }
//   } catch (error) {
//     console.log("Error in listen message", error);
//     return res.status(500).json({
//       code: 500,
//       status: "Internal Server Error",
//       message: error,
//     });
//   }
// });

// //This function will get called via backgroung job service and will download the files from source SFTP
// async function downloadFolder() {
//   try {
//     //Connection to the SFTP server (This will be in configurable - For now it is static as we have demo SFTP server)
//     await sftp.connect({
//       host: process.env.HOST,
//       port: process.env.PORT,
//       user: process.env.USER,
//       password: process.env.PASSWORD,
//       secure: process.env.SECURE,
//     });
//     console.log("Connected to SFTP server");

//     const fileArrays: String[] = [];
//     const allextension = process.env.allFileExtension || "txt";
//     //This will list all the files present in the SFTP server
//     await downloadFiles(process.env.ftpServerPath!, fileArrays, allextension);
//     console.log("fileArrays", fileArrays);
//     await doPostRequest({ downloadedFiles: fileArrays });
//   } catch (err) {
//     console.error(err);
//   } finally {
//     await sftp.end();
//     console.log("Disconnected from SFTP server");
//   }
// }

// // Function for download all files from sftp.
// const downloadFiles = async (
//   path: string,
//   filesArray: any,
//   allextension: string
// ) => {
//   try {
//     const files = await sftp.list(path);

//     for (let i = 0; i < files.length; i++) {
//       const file = files[i];
//       const fileExtension = file.name.split(".")[1];
//       let filePath;
//       if (path !== "/") {
//         filePath = join(path, file.name);
//       } else {
//         filePath = file.name;
//       }
//       const stat = await sftp.stat(filePath);
//       // console.log("stat of ", file.name);
//       // console.log("stat", stat);
//       if (stat.isDirectory) {
//         await downloadFiles(filePath, filesArray, allextension);
//       } else {
//         console.log("path ", path);
//         console.log("fileArrays", filesArray);
//         if (
//           allextension.includes("*") ||
//           allextension.includes(fileExtension)
//         ) {
//           await sftp.get(`${filePath}`, `${__dirname}/sftp-files/${file.name}`);
//           const removePath = path.replace(/\\/g, "");
//           filesArray.push(`${removePath}/${file.name}`);
//         }
//       }
//     }

//     return filesArray;
//   } catch (error) {
//     console.error("Error from getAllFiles", error);
//   }
// };

// // API call for send data to FileReciver API
// async function doPostRequest(payload: any) {
//   try {
//     console.log("payload", payload);
//     const res = await axios.post(`${process.env.apiURL}`, payload);
//     console.log("API resp", res.data);
//     if (res.status === 200) {
//       // delete file after success from File Reciver API
//       for (let i = 0; i < payload.downloadedFiles.length; i++) {
//         const filePath = payload.downloadedFiles[i];
//         const deleteFile = await sftp.delete(filePath);
//         console.log(filePath, "File deleted", deleteFile);
//       }
//     }
//   } catch (error) {
//     console.log("Error in doPostRequest", error);
//   }
// }

// app.listen(3000, function() {
//   console.log("server is running on port 3000");
//   downloadFolder();
// });

import app from "./config/express";
import env from "./config/env";
import { iocContainer as Container } from "./config/container";
import { TYPES } from "./config/types";

app.listen(env.API_PORT, () => {
  console.log(
    `⚡️[server]: Server is running at ${env.API_HOST}:${env.API_PORT}`
  );
  console.log(
    `⚡️[server]: API ROOT: ${env.API_HOST}:${env.API_PORT}${env.API_ROOT}/${env.API_VERSION}`
  );
});
