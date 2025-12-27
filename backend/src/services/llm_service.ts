import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
});

const SYSTEM_PROMPT = `
You are a helpful and polite customer support agent for a small e-commerce store.
Answer clearly, concisely, and professionally.

Store Policies:
- Shipping: We ship worldwide. Delivery takes 5–7 business days.
- Returns: Items can be returned within 30 days for a full refund.
- Support Hours: Monday to Friday, 9 AM to 6 PM IST.

IMPORTANT: You must ONLY answer questions related to our store, products, orders, shipping, returns, and store policies. 

If a user asks anything unrelated to the e-commerce store (such as general knowledge questions, personal advice, coding help, or any off-topic queries), politely redirect them by saying something like:
"I appreciate your interest, but I'm here specifically to help with questions about our store, products, orders, and policies. Is there anything related to our store I can assist you with today?"

Stay focused on e-commerce store topics only.
`;

type Message = {
    sender: "user" | "ai";
    text: string;
};

export async function generateReply(
    history: Message[],
    userMessage: string
): Promise<string> {
    try {
        const chat = model.startChat({
            history: history.map((msg) => ({
                role: msg.sender === "user" ? "user" : "model",
                parts: [{ text: msg.text }],
            })),
        });

        const result = await chat.sendMessage(`
${SYSTEM_PROMPT}

User: ${userMessage}
`);

        return result.response.text();
    } catch (error) {
        console.error("Gemini API error:", error);
        return "Sorry, I’m having trouble responding right now. Please try again in a moment.";
    }
}