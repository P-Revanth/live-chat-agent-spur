import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { handleChatMessage } from "../services/chat_service.js";

const router = Router();

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