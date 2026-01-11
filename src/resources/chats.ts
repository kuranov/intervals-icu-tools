import type { ApiError } from "../errors";
import type { Result } from "../result";

import type { IntervalsHttpClient } from "../http/httpClient";
import {
  decodeChat,
  decodeChats,
  decodeMessage,
  decodeMessages,
  type Chat,
  type Chats,
  type Message,
  type Messages,
  type NewMessageDTO,
} from "../schemas/chat";
import { transformKeysToSnake } from "../utils/transform";

export type ListMessagesOptions = {
  /** Local date (ISO-8601) for oldest message to return */
  oldest?: string;
  /** Local date (ISO-8601) for newest message to return (inclusive) */
  newest?: string;
  /** Max number of messages to return */
  limit?: number;
};

export class ChatsResource {
  constructor(private readonly http: IntervalsHttpClient) {}

  /**
   * List all chats for the athlete.
   */
  list(athleteId: string | number = 0): Promise<Result<Chats, ApiError>> {
    return this.http.requestJson(
      `athlete/${athleteId}/chats`,
      {},
      decodeChats
    );
  }

  /**
   * Get a single chat by ID.
   */
  get(chatId: number): Promise<Result<Chat, ApiError>> {
    return this.http.requestJson(`chats/${chatId}`, {}, decodeChat);
  }

  /**
   * List messages in a chat.
   */
  listMessages(
    chatId: number,
    options?: ListMessagesOptions
  ): Promise<Result<Messages, ApiError>> {
    const searchParams: Record<string, string> = {};
    if (options?.oldest) searchParams.oldest = options.oldest;
    if (options?.newest) searchParams.newest = options.newest;
    if (options?.limit !== undefined)
      searchParams.limit = String(options.limit);

    return this.http.requestJson(
      `chats/${chatId}/messages`,
      {
        searchParams: Object.keys(searchParams).length
          ? searchParams
          : undefined,
      },
      decodeMessages
    );
  }

  /**
   * Send a message to a chat.
   */
  sendMessage(data: NewMessageDTO): Promise<Result<Message, ApiError>> {
    return this.http.requestJson(
      "chats/send-message",
      { method: "POST", json: transformKeysToSnake(data) },
      decodeMessage
    );
  }

  /**
   * Mark a message as seen.
   */
  markSeen(
    chatId: number,
    messageId: number
  ): Promise<Result<void, ApiError>> {
    return this.http.requestJson(
      `chats/${chatId}/messages/${messageId}/seen`,
      { method: "PUT" },
      () => undefined
    );
  }

  /**
   * Delete a message from a chat.
   */
  deleteMessage(
    chatId: number,
    messageId: number
  ): Promise<Result<void, ApiError>> {
    return this.http.requestJson(
      `chats/${chatId}/messages/${messageId}`,
      { method: "DELETE" },
      () => undefined
    );
  }

  /**
   * List comments on an activity.
   */
  listActivityMessages(
    activityId: string | number
  ): Promise<Result<Messages, ApiError>> {
    return this.http.requestJson(
      `activity/${activityId}/messages`,
      {},
      decodeMessages
    );
  }

  /**
   * Add a comment to an activity.
   */
  addActivityMessage(
    activityId: string | number,
    text: string
  ): Promise<Result<Message, ApiError>> {
    return this.http.requestJson(
      `activity/${activityId}/messages`,
      { method: "POST", json: transformKeysToSnake({ text }) },
      decodeMessage
    );
  }
}
