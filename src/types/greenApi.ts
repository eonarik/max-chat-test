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
      extendedTextMessageData?: {
        text: string;
        description?: string;
        title?: string;
        previewType?: string;
      };
      [key: string]: unknown;
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
  status?: "read" | "sent" | "delivered" | "error";
}

export interface GetStateInstanceResponse {
  stateInstance:
    | "authorized"
    | "notAuthorized"
    | "blocked"
    | "sleepMode"
    | "starting";
}

export interface Chat {
  id: string;
  sendId?: string;
  phone: string;
  name?: string;
  type?: "user" | "group" | "channel" | "bot";
  phoneNumber?: number;
  messages: ChatMessage[];
  lastMessage?: string;
  lastActivity?: number;
}

export interface GreenApiChat {
  chatId: string;
  name: string;
  type: "user" | "group" | "channel" | "bot";
  phoneNumber: number;
}

export interface ChatHistoryItem {
  idMessage: string;
  timestamp: number;
  type: "incoming" | "outgoing";
  typeMessage: string;
  textMessage?: string;
  extendedTextMessage?: {
    text: string;
    description?: string;
    title?: string;
    previewType?: string;
  };
  statusMessage?: string;
  chatId: string;
  chatType?: string;
  senderId?: string;
  senderName?: string;
  sendByApi?: boolean;
  isEdited?: boolean;
  isDeleted?: boolean;
}
