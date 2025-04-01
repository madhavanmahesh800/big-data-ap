
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUserProfile, updateProfile, getFollowing, getFollowers, followUser, unfollowUser, Profile as ProfileType } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pencil, Users, UserCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const Profile = () => {
  const { username: urlUsername } = useParams<{ username?: string }>();
  const { username: currentUsername } = useAuth();
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");
  const [followers, setFollowers] = useState<string[]>([]);
  const [following, setFollowing] = useState<string[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const isOwnProfile = !urlUsername || urlUsername === currentUsername;
  const displayUsername = urlUsername || currentUsername;
  
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const profileData = await getUserProfile(displayUsername || "");
        setProfile(profileData);
        setDescription(profileData.description || "");
        setProfilePhoto(profileData.profile_photo || "");
        
        // Only fetch followers/following if viewing own profile
        if (isOwnProfile) {
          const [followingData, followersData] = await Promise.all([
            getFollowing(),
            getFollowers()
          ]);
          setFollowing(followingData);
          setFollowers(followersData);
        } else {
          // Check if the current user is following the viewed profile
          const followingData = await getFollowing();
          setIsFollowing(followingData.includes(displayUsername || ""));
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        });
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    
    if (displayUsername) {
      fetchProfileData();
    }
  }, [displayUsername, isOwnProfile, currentUsername, toast, navigate]);
  
  const handleUpdateProfile = async () => {
    try {
      await updateProfile(profilePhoto, description);
      setProfile(prev => 
        prev ? { ...prev, profile_photo: profilePhoto, description } : null
      );
      setIsEditing(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated",
      });
    } catch (error) {
      console.error("Update error:", error);
      toast({
        title: "Update failed",
        description: "Failed to update profile",
        variant: "destructive",
      });
    }
  };
  
  const handleFollow = async () => {
    if (!displayUsername) return;
    
    try {
      await followUser(displayUsername);
      setIsFollowing(true);
      toast({
        title: "Success",
        description: `You are now following ${displayUsername}`,
      });
    } catch (error) {
      console.error("Follow error:", error);
      toast({
        title: "Error",
        description: "Failed to follow user",
        variant: "destructive",
      });
    }
  };
  
  const handleUnfollow = async () => {
    if (!displayUsername) return;
    
    try {
      await unfollowUser(displayUsername);
      setIsFollowing(false);
      toast({
        title: "Success",
        description: `You unfollowed ${displayUsername}`,
      });
    } catch (error) {
      console.error("Unfollow error:", error);
      toast({
        title: "Error",
        description: "Failed to unfollow user",
        variant: "destructive",
      });
    }
  };
  
  const initials = displayUsername ? displayUsername.slice(0, 2).toUpperCase() : "";

  if (loading) {
    return (
      <Layout>
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <Skeleton className="h-28 w-28 rounded-full" />
                <div className="space-y-2 flex-1 text-center md:text-left">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-4 w-64" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Profile Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Profile Picture */}
              <div className="relative">
                <Avatar className="h-28 w-28 border-4 border-brand-200">
                  <AvatarImage src={profilePhoto || undefined} alt={displayUsername} />
                  <AvatarFallback className="text-xl bg-brand-300 text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                
                {isEditing && (
                  <div className="mt-2">
                    <Input
                      type="text"
                      placeholder="Profile photo URL"
                      value={profilePhoto}
                      onChange={(e) => setProfilePhoto(e.target.value)}
                      className="w-full"
                    />
                  </div>
                )}
              </div>
              
              {/* Profile Info */}
              <div className="space-y-2 flex-1 text-center md:text-left">
                <h1 className="text-2xl font-bold">{displayUsername}</h1>
                
                {isEditing ? (
                  <Textarea
                    placeholder="Write a short bio..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full"
                    rows={3}
                  />
                ) : (
                  <p className="text-gray-600">
                    {profile?.description || "No bio provided"}
                  </p>
                )}
                
                <div className="flex items-center justify-center md:justify-start space-x-4 text-sm">
                  <div>
                    <span className="font-semibold">{followers.length}</span> followers
                  </div>
                  <div>
                    <span className="font-semibold">{following.length}</span> following
                  </div>
                </div>
                
                <div className="flex items-center justify-center md:justify-start space-x-3 mt-4">
                  {isOwnProfile ? (
                    isEditing ? (
                      <>
                        <Button onClick={handleUpdateProfile} className="bg-brand-400 hover:bg-brand-500">
                          Save Changes
                        </Button>
                        <Button variant="outline" onClick={() => setIsEditing(false)}>
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button 
                        variant="outline" 
                        onClick={() => setIsEditing(true)}
                        className="border-brand-300 text-brand-500 hover:bg-brand-100"
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit Profile
                      </Button>
                    )
                  ) : (
                    isFollowing ? (
                      <Button 
                        variant="outline" 
                        onClick={handleUnfollow}
                        className="border-brand-300 text-brand-500 hover:bg-brand-100"
                      >
                        <UserCheck className="mr-2 h-4 w-4" />
                        Following
                      </Button>
                    ) : (
                      <Button onClick={handleFollow} className="bg-brand-400 hover:bg-brand-500">
                        <Users className="mr-2 h-4 w-4" />
                        Follow
                      </Button>
                    )
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Tabs Section */}
        <Tabs defaultValue="followers" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="followers">Followers</TabsTrigger>
            <TabsTrigger value="following">Following</TabsTrigger>
          </TabsList>
          
          <TabsContent value="followers" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">People who follow {isOwnProfile ? "you" : displayUsername}</CardTitle>
              </CardHeader>
              <CardContent>
                {followers.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {followers.map((follower) => (
                      <div 
                        key={follower}
                        className="p-4 border rounded-md flex items-center space-x-3 hover:bg-gray-50 cursor-pointer"
                        onClick={() => navigate(`/profile/${follower}`)}
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-brand-300 text-white">
                            {follower.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{follower}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    {isOwnProfile 
                      ? "You don't have any followers yet." 
                      : `${displayUsername} doesn't have any followers yet.`}
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="following" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">People {isOwnProfile ? "you're" : `${displayUsername} is`} following</CardTitle>
              </CardHeader>
              <CardContent>
                {following.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {following.map((followedUser) => (
                      <div 
                        key={followedUser}
                        className="p-4 border rounded-md flex items-center space-x-3 hover:bg-gray-50 cursor-pointer"
                        onClick={() => navigate(`/profile/${followedUser}`)}
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-brand-300 text-white">
                            {followedUser.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{followedUser}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    {isOwnProfile 
                      ? "You're not following anyone yet." 
                      : `${displayUsername} isn't following anyone yet.`}
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Profile;
