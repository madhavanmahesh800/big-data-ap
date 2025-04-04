
import { useState, useEffect, useRef } from "react";
import { getMessages, sendMessage, Message as MessageType, deleteMessage, getFollowing } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import Layout from "@/components/Layout";
import MessageItem from "@/components/MessageItem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SendHorizontal, RefreshCw, UserPlus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";

const Messages = () => {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [following, setFollowing] = useState<string[]>([]);
  const [loadingFollowing, setLoadingFollowing] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string>("");
  
  const { username } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const fetchMessages = async () => {
    try {
      setLoading(true);
      const messagesData = await getMessages();
      
      // Sort messages by timestamp in ascending order (oldest first)
      const sortedMessages = [...messagesData].sort((a, b) => {
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      });
      
      setMessages(sortedMessages);
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
  
  const fetchFollowing = async () => {
    try {
      setLoadingFollowing(true);
      console.log("Fetching following list...");
      const followingData = await getFollowing();
      console.log("Following data:", followingData);
      setFollowing(followingData);
      
      // Set the first user as default if available
      if (followingData.length > 0 && !selectedUser) {
        setSelectedUser(followingData[0]);
      }
    } catch (error) {
      console.error("Error fetching following:", error);
      toast({
        title: "Error",
        description: "Failed to load users you follow",
        variant: "destructive",
      });
    } finally {
      setLoadingFollowing(false);
    }
  };
  
  useEffect(() => {
    fetchMessages();
    fetchFollowing();
  }, [toast]);
  
  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedUser) return;
    
    try {
      setSending(true);
      const sentMessage = await sendMessage(newMessage);
      setMessages(prev => [...prev, sentMessage]);
      setNewMessage("");
      
      toast({
        title: "Message sent",
        description: `Message sent to ${selectedUser}`,
      });
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
    fetchFollowing();
  };
  
  const goToDiscover = () => {
    navigate('/discover');
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <Card className="h-[calc(100vh-8rem)]">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle>Messages</CardTitle>
              <div className="flex space-x-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={goToDiscover} 
                  title="Find people to follow"
                >
                  <UserPlus size={18} className="text-gray-500" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleRefresh} 
                  title="Refresh messages"
                >
                  <RefreshCw size={18} className="text-gray-500" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="flex flex-col h-[calc(100%-8rem)]">
            {/* User Selection */}
            <div className="mb-4">
              <Select 
                value={selectedUser} 
                onValueChange={setSelectedUser}
                disabled={loadingFollowing || following.length === 0}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a user to message" />
                </SelectTrigger>
                <SelectContent>
                  {following.map((user) => (
                    <SelectItem key={user} value={user}>
                      {user}
                    </SelectItem>
                  ))}
                  {following.length === 0 && !loadingFollowing && (
                    <SelectItem value="no-users" disabled>
                      You're not following anyone yet
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {loadingFollowing && (
                <div className="mt-2">
                  <Skeleton className="h-4 w-32" />
                </div>
              )}
              {following.length === 0 && !loadingFollowing && (
                <p className="text-sm text-gray-500 mt-2">
                  You need to follow users before you can message them.{" "}
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-brand-500" 
                    onClick={goToDiscover}
                  >
                    Discover users
                  </Button>
                </p>
              )}
            </div>
            
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
                  placeholder={selectedUser ? `Message to ${selectedUser}...` : "Select a user first..."}
                  disabled={sending || !selectedUser}
                  className="flex-1"
                />
                <Button 
                  type="submit" 
                  className="bg-brand-400 hover:bg-brand-500"
                  disabled={sending || !newMessage.trim() || !selectedUser}
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
