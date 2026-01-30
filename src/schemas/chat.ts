import * as v from "valibot";
import { transformKeys } from "../utils/transform";

// Chat schema (raw snake_case from API)
const ChatSchemaRaw = v.looseObject({
  id: v.number(),
  athlete_id: v.nullish(v.string()),
  created: v.nullish(v.string()),
  last_message: v.nullish(v.string()),
  unread_count: v.nullish(v.number()),
  athlete_name: v.nullish(v.string()),
  athlete_avatar: v.nullish(v.string()),
});

export const ChatSchema = v.pipe(ChatSchemaRaw, v.transform(transformKeys));
export type Chat = v.InferOutput<typeof ChatSchema>;

export const ChatsSchema = v.array(ChatSchema);
export type Chats = v.InferOutput<typeof ChatsSchema>;

// Message schema (raw snake_case from API)
const MessageSchemaRaw = v.looseObject({
  id: v.number(),
  chat_id: v.nullish(v.number()),
  activity_id: v.nullish(v.union([v.string(), v.number()])),
  athlete_id: v.nullish(v.string()),
  created: v.nullish(v.string()),
  content: v.nullish(v.string()), // "text" in our code, "content" in API
  seen: v.nullish(v.boolean()),
  athlete_name: v.nullish(v.string()),
  athlete_avatar: v.nullish(v.string()),
});

export const MessageSchema = v.pipe(MessageSchemaRaw, v.transform(transformKeys));
export type Message = v.InferOutput<typeof MessageSchema>;

export const MessagesSchema = v.array(MessageSchema);
export type Messages = v.InferOutput<typeof MessagesSchema>;

// NewMessageDTO schema (for sending messages, raw)
const NewMessageDTOSchemaRaw = v.looseObject({
  chat_id: v.nullish(v.number()),
  activity_id: v.nullish(v.union([v.string(), v.number()])),
  content: v.nullish(v.string()), // message content
});

export const NewMessageDTOSchema = v.pipe(NewMessageDTOSchemaRaw, v.transform(transformKeys));
export type NewMessageDTO = v.InferOutput<typeof NewMessageDTOSchema>;

// Decoder functions (internal use)
export function decodeChat(data: unknown): Chat {
  return v.parse(ChatSchema, data);
}

export function decodeChats(data: unknown): Chats {
  return v.parse(ChatsSchema, data);
}

export function decodeMessage(data: unknown): Message {
  return v.parse(MessageSchema, data);
}

export function decodeMessages(data: unknown): Messages {
  return v.parse(MessagesSchema, data);
}
