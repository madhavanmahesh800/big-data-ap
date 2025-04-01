
import { Profile } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

interface ProfileCardProps {
  profile: Profile;
  isFollowing?: boolean;
  onFollow?: () => void;
  onUnfollow?: () => void;
  showActions?: boolean;
}

const ProfileCard = ({ 
  profile, 
  isFollowing = false, 
  onFollow, 
  onUnfollow,
  showActions = true
}: ProfileCardProps) => {
  const { username, profile_photo, description } = profile;
  
  const initials = username.slice(0, 2).toUpperCase();

  return (
    <Card className="card-shadow overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <Avatar className="h-12 w-12 border-2 border-brand-200">
            <AvatarImage src={profile_photo || undefined} alt={username} />
            <AvatarFallback className="bg-brand-300 text-white">{initials}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <Link to={`/profile/${username}`} className="font-medium hover:underline">
              {username}
            </Link>
            {description && (
              <p className="text-sm text-gray-500 line-clamp-2">{description}</p>
            )}
          </div>
          
          {showActions && onFollow && onUnfollow && (
            <div>
              {isFollowing ? (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onUnfollow}
                  className="border-brand-300 text-brand-500 hover:bg-brand-100"
                >
                  Following
                </Button>
              ) : (
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={onFollow}
                  className="bg-brand-400 hover:bg-brand-500"
                >
                  Follow
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileCard;
