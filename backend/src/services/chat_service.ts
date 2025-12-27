import { saveMessage, getConversationHistory } from "../db/messages.js";
import { generateReply } from "./llm_service.js";

export async function handleChatMessage(
    conversationId: string,
    userMessage: string
): Promise<string> {
    // Persist user message
    await saveMessage(conversationId, "user", userMessage);

    // Fetch history for context
    const history = await getConversationHistory(conversationId, 10);

    // Generate AI reply
    const reply = await generateReply(history, userMessage);

    // Persist AI reply
    await saveMessage(conversationId, "ai", reply);

    return reply;
}
