import { BadRequest } from "../errors/BadRequest";
import { IFileReceiverService } from "../interfaces/IFileReceiverService";
import BaseController from "./BaseController";
import * as express from "express";

export default class FileReceiverController extends BaseController {
  private _filereceiverService: IFileReceiverService;

  constructor(filereceiverService: IFileReceiverService) {
    super();
    this._filereceiverService = filereceiverService;
  }

  async fileManager(req: express.Request, res: express.Response) {
    try {
      // validate input
      this.validateRequest(req);

      if (!req.file) {
        throw new BadRequest("Please upload a file.");
      }

      console.log(`File: ${req.file.originalname} successfully uploaded.`);
      const country = req.body.country;
      console.log(country, "this is country name from frcontroller")
      const folderName = req.body.folderName;
      console.log(folderName, "this is foldername from filemanager - fr controller")
      const tailNumber = req.body.tailNumber;
      console.log("Request Body");
      console.log("tailNumber: ", tailNumber);
      const id = Number(req.body.id);
      console.log("id: ", id);
      const file = req.file;
      console.log("file: ", file);

      const fileManager = await this._filereceiverService.fileManager(
        country,
        folderName,
        tailNumber,
        file,
        id
      );

      // Return response
      return this.sendJSONResponse(
        res,
        "File Uploaded Successfully",
        null,
        fileManager
      );
    } catch (error) {
      return this.sendErrorResponse(req, res, error);
    }
  }
}
