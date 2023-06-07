export interface IFileReceiverService {
  fileManager(country:string, folderName:string, tailNumber: string, file: any, id: number): Promise<any>;
}
