
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Message, deleteMessage } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface MessageItemProps {
  message: Message;
  onDelete: (id: string) => void;
  isOwnMessage?: boolean;
}

const MessageItem = ({ message, onDelete, isOwnMessage = false }: MessageItemProps) => {
  const { _id, owner, message: text, timestamp } = message;
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  
  const formattedTime = formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  const initials = owner.username.slice(0, 2).toUpperCase();
  
  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      try {
        setIsDeleting(true);
        await deleteMessage(_id);
        onDelete(_id);
        toast({
          title: "Message deleted",
          variant: "default",
        });
      } catch (error) {
        console.error("Delete error:", error);
        toast({
          title: "Error",
          description: "Failed to delete message",
          variant: "destructive",
        });
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <Card className={cn(
      "mb-4", 
      isOwnMessage ? "bg-brand-100 border-brand-200" : "bg-white"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={owner.profile_photo || undefined} alt={owner.username} />
            <AvatarFallback className="bg-brand-300 text-white">{initials}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex justify-between items-center">
              <span className="font-medium">{owner.username}</span>
              <span className="text-xs text-gray-500">{formattedTime}</span>
            </div>
            <p className="mt-1 text-gray-700">{text}</p>
          </div>
        </div>
      </CardContent>
      
      {isOwnMessage && (
        <CardFooter className="px-4 py-2 flex justify-end">
          <button 
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-gray-400 hover:text-red-500 transition-colors"
            title="Delete message"
          >
            <Trash2 size={16} />
          </button>
        </CardFooter>
      )}
    </Card>
  );
};

export default MessageItem;
