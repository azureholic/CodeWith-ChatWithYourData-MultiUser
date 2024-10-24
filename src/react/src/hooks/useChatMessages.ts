import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ChatService } from "../services/ChatService";
import { IChatMessage } from "../models/ChatMessage";
import { useMsal } from "@azure/msal-react";

export const useChatMessages = (chatId: string | undefined) => {

    const chatService = new ChatService();
    const { instance } = useMsal();
    const userId = instance.getAllAccounts()[0].localAccountId;

    const [messages, setMessages] = useState<IChatMessage[]>([]);

    const { isPending: chatPending, error: chatError, data: messagesResult } = useQuery({
        queryKey: ['chat', chatId],
        queryFn: async () => chatService.getChatMessagesAsync({chatId: chatId || "", userId: userId}),
        enabled: chatId != undefined,
        staleTime: 10000
    });

    useEffect(() => {
        if (messagesResult) {
            setMessages(messagesResult.filter(message => message.role !== 'system'));

        }
    }, [messagesResult])


    const sendMessage = async ({ message }: { message: string }) => {

        if(!chatId) return; 
        let result = '';
        setMessages(prev => {
            const updated = [...prev];
            updated.push({
                role: 'user',
                content: message
            },
                {
                    role: 'assistant',
                    content: result
                });
            return updated;
        });

        const response = await chatService.sendMessageAsync({chatId: chatId, message: message, userId: userId});
        
        if (!response || !response.body) {
            return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        const loop = true;
        while (loop) {
            const { value, done } = await reader.read();
            if (done) {
                break;
            }
            const decodedChunk = decoder.decode(value, { stream: true });
            result += decodedChunk;
            setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                    role: 'assistant',
                    content: result
                };
                return updated;
            });
        }
    };

    return {
        chatPending,
        chatError,
        messages,
        sendMessage
    };

}