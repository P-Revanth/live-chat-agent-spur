import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { handleChatMessage } from "../services/chat_service.js";
import { getConversationHistory } from "../db/messages.js";

const router = Router();

// Get conversation history
router.get("/history/:sessionId", async (req, res) => {
    try {
        const { sessionId } = req.params;

        if (!sessionId) {
            return res.status(400).json({ error: "Session ID required" });
        }

        const messages = await getConversationHistory(sessionId, 10);

        res.json({ messages, sessionId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch history" });
    }
});

router.post("/message", async (req, res) => {
    try {
        const { message, sessionId } = req.body;

        if (!message || typeof message !== "string") {
            return res.status(400).json({ error: "Please enter a message." });
        }
        if (message.length > 1000) {
            return res.status(400).json({ error: "Message too long" });
        }

        const conversationId = sessionId || uuidv4();

        const reply = await handleChatMessage(conversationId, message);

        res.json({
            reply,
            sessionId: conversationId,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Something went wrong. Please try again.",
        });
    }
});

export default router;