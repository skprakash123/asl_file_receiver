export interface IGCPService {
   sendMessageTOPubSub(
    payload: any,
    topicName: string,
    id: number
  ): Promise<any>;
}
