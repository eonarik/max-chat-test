export interface Credentials {
  apiUrl: string;
  idInstance: string;
  apiTokenInstance: string;
}

export interface SendMessageRequest {
  chatId: string;
  message: string;
}

export interface SendMessageResponse {
  idMessage: string;
}

export interface ReceiveNotificationResponse {
  receiptId: number;
  body: {
    typeWebhook: string;
    instanceData: {
      idInstance: number;
      wid: string;
      typeInstance: string;
    };
    timestamp: number;
    idMessage: string;
    senderData: {
      chatId: string;
      chatName: string;
      sender: string;
      senderName: string;
    };
    messageData: {
      typeMessage: string;
      textMessageData?: {
        textMessage: string;
      };
    };
  };
}

export interface DeleteNotificationResponse {
  result: boolean;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  text: string;
  timestamp: number;
  isOutgoing: boolean;
  status?: "sent" | "delivered" | "error";
}

export interface Chat {
  id: string;
  phone: string;
  messages: ChatMessage[];
  lastMessage?: string;
  lastActivity?: number;
}

export interface GetStateInstanceResponse {
  stateInstance:
    | "authorized"
    | "notAuthorized"
    | "blocked"
    | "sleepMode"
    | "starting";
}
