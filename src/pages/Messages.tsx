
import { useState, useEffect, useRef } from "react";
import { getMessages, sendMessage, Message as MessageType, deleteMessage } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import Layout from "@/components/Layout";
import MessageItem from "@/components/MessageItem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SendHorizontal, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const Messages = () => {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const { username } = useAuth();
  const { toast } = useToast();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const fetchMessages = async () => {
    try {
      setLoading(true);
      const messagesData = await getMessages();
      setMessages(messagesData);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchMessages();
  }, [toast]);
  
  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    try {
      setSending(true);
      const sentMessage = await sendMessage(newMessage);
      setMessages(prev => [...prev, sentMessage]);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };
  
  const handleDeleteMessage = (id: string) => {
    setMessages(prev => prev.filter(message => message._id !== id));
  };
  
  const handleRefresh = () => {
    fetchMessages();
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <Card className="h-[calc(100vh-8rem)]">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle>Messages</CardTitle>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleRefresh} 
                title="Refresh messages"
              >
                <RefreshCw size={18} className="text-gray-500" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="flex flex-col h-[calc(100%-8rem)]">
            {/* Messages List */}
            <div className="flex-1 overflow-y-auto mb-4 pr-2">
              {loading ? (
                // Loading skeletons
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="mb-4">
                    <div className="flex items-start space-x-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-24 mb-1" />
                        <Skeleton className="h-16 w-full" />
                      </div>
                    </div>
                  </div>
                ))
              ) : messages.length > 0 ? (
                messages.map(message => (
                  <MessageItem 
                    key={message._id} 
                    message={message}
                    onDelete={handleDeleteMessage}
                    isOwnMessage={message.owner.username === username}
                  />
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">No messages yet. Start the conversation!</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Message Input */}
            <div>
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  disabled={sending}
                  className="flex-1"
                />
                <Button 
                  type="submit" 
                  className="bg-brand-400 hover:bg-brand-500"
                  disabled={sending || !newMessage.trim()}
                >
                  {sending ? (
                    <div className="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full" />
                  ) : (
                    <SendHorizontal size={18} />
                  )}
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Messages;
