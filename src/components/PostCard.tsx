
import { useState } from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Post } from "@/lib/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Heart, MessageCircle, Share2 } from "lucide-react";

interface PostCardProps {
  post: Post;
}

const PostCard = ({ post }: PostCardProps) => {
  const { owner, imagePath, description, timestamp } = post;
  const [liked, setLiked] = useState(false);
  
  const toggleLike = () => {
    setLiked(!liked);
  };
  
  const formattedTime = formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  const initials = owner.username.slice(0, 2).toUpperCase();
  
  // Format the image URL correctly
  const imageUrl = imagePath.startsWith("http") 
    ? imagePath 
    : `http://localhost:4000${imagePath}`;

  return (
    <Card className="card-shadow overflow-hidden mb-6">
      <CardHeader className="p-4">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10 border border-brand-200">
            <AvatarImage src={owner.profile_photo || undefined} alt={owner.username} />
            <AvatarFallback className="bg-brand-300 text-white">{initials}</AvatarFallback>
          </Avatar>
          
          <div>
            <Link to={`/profile/${owner.username}`} className="font-medium hover:underline">
              {owner.username}
            </Link>
            <p className="text-xs text-gray-500">{formattedTime}</p>
          </div>
        </div>
      </CardHeader>
      
      <AspectRatio ratio={4/3} className="bg-gray-100">
        <img
          src={imageUrl}
          alt={description || "Post image"}
          className="object-cover w-full h-full"
          onError={(e) => {
            // Fallback if image fails to load
            e.currentTarget.src = "/placeholder.svg";
          }}
        />
      </AspectRatio>
      
      <CardContent className="p-4">
        {description && <p className="text-gray-700">{description}</p>}
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex justify-between">
        <div className="flex items-center space-x-6">
          <button 
            className={`flex items-center space-x-1 ${liked ? 'text-red-500' : 'text-gray-500'} hover:text-red-500 transition-colors`}
            onClick={toggleLike}
          >
            <Heart size={20} className={liked ? "fill-current" : ""} />
            <span className="text-sm">Like</span>
          </button>
          
          <button className="flex items-center space-x-1 text-gray-500 hover:text-brand-400 transition-colors">
            <MessageCircle size={20} />
            <span className="text-sm">Comment</span>
          </button>
        </div>
        
        <button className="flex items-center space-x-1 text-gray-500 hover:text-brand-400 transition-colors">
          <Share2 size={20} />
          <span className="text-sm">Share</span>
        </button>
      </CardFooter>
    </Card>
  );
};

export default PostCard;
