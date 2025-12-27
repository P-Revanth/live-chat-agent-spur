import db from "./db.js";

export async function saveMessage(
    conversationId: string,
    sender: "user" | "ai",
    text: string
) {
    // ensure conversation exists
    const insertConversation = db.prepare(`
    INSERT OR IGNORE INTO conversations (id) VALUES (?)
  `);
    insertConversation.run(conversationId);

    const insertMessage = db.prepare(`
    INSERT INTO messages (conversation_id, sender, text)
    VALUES (?, ?, ?)
  `);

    insertMessage.run(conversationId, sender, text);
}

export async function getConversationHistory(
    conversationId: string,
    limit: number = 10
) {
    const selectMessages = db.prepare(`
    SELECT sender, text
    FROM messages
    WHERE conversation_id = ?
    ORDER BY created_at ASC
    LIMIT ?
  `);

    const rows = selectMessages.all(conversationId, limit) as Array<{
        sender: "user" | "ai";
        text: string;
    }>;

    return rows.map((row) => ({
        sender: row.sender,
        text: row.text,
    }));
}