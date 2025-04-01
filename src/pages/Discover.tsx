
import { useState, useEffect } from "react";
import { getUserProfile, Profile as ProfileType, followUser, unfollowUser, getFollowing } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import Layout from "@/components/Layout";
import ProfileCard from "@/components/ProfileCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, UserPlus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const Discover = () => {
  const [searchUsername, setSearchUsername] = useState("");
  const [searchResult, setSearchResult] = useState<ProfileType | null>(null);
  const [searching, setSearching] = useState(false);
  const [following, setFollowing] = useState<string[]>([]);
  const [followingUpdated, setFollowingUpdated] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchFollowing = async () => {
      try {
        const followingData = await getFollowing();
        setFollowing(followingData);
      } catch (error) {
        console.error("Error fetching following:", error);
      }
    };
    
    fetchFollowing();
  }, [followingUpdated]);
  
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchUsername.trim()) return;
    
    try {
      setSearching(true);
      setSearchResult(null);
      const profile = await getUserProfile(searchUsername);
      setSearchResult(profile);
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "User not found",
        description: "No user found with that username",
        variant: "destructive",
      });
    } finally {
      setSearching(false);
    }
  };
  
  const handleFollow = async (username: string) => {
    try {
      await followUser(username);
      setFollowingUpdated(!followingUpdated);
      toast({
        title: "Success",
        description: `You are now following ${username}`,
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
  
  const handleUnfollow = async (username: string) => {
    try {
      await unfollowUser(username);
      setFollowingUpdated(!followingUpdated);
      toast({
        title: "Success",
        description: `You unfollowed ${username}`,
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
  
  const isFollowing = (username: string) => following.includes(username);

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Discover People</h1>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Find users</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  value={searchUsername}
                  onChange={(e) => setSearchUsername(e.target.value)}
                  placeholder="Search by username..."
                  className="pl-10"
                  disabled={searching}
                />
              </div>
              <Button
                type="submit"
                className="bg-brand-400 hover:bg-brand-500"
                disabled={searching || !searchUsername.trim()}
              >
                {searching ? "Searching..." : "Search"}
              </Button>
            </form>
            
            {searching ? (
              <div className="mt-4">
                <Skeleton className="h-20 w-full" />
              </div>
            ) : searchResult ? (
              <div className="mt-4">
                <ProfileCard
                  profile={searchResult}
                  isFollowing={isFollowing(searchResult.username)}
                  onFollow={() => handleFollow(searchResult.username)}
                  onUnfollow={() => handleUnfollow(searchResult.username)}
                />
              </div>
            ) : null}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Connect with others on ConnectX</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-brand-100 rounded-lg text-center">
                <UserPlus className="mx-auto h-10 w-10 text-brand-500 mb-3" />
                <h3 className="text-lg font-medium text-gray-800 mb-2">Find Friends</h3>
                <p className="text-sm text-gray-600">
                  Search for people you know by their username and connect with them.
                </p>
              </div>
              
              <div className="p-6 bg-green-50 rounded-lg text-center">
                <svg className="mx-auto h-10 w-10 text-green-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Complete Your Profile</h3>
                <p className="text-sm text-gray-600">
                  Add a profile photo and description to help others find and connect with you.
                </p>
              </div>
              
              <div className="p-6 bg-blue-50 rounded-lg text-center">
                <svg className="mx-auto h-10 w-10 text-blue-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Share Content</h3>
                <p className="text-sm text-gray-600">
                  Create and share posts to express yourself and engage with the community.
                </p>
              </div>
              
              <div className="p-6 bg-yellow-50 rounded-lg text-center">
                <svg className="mx-auto h-10 w-10 text-yellow-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Send Messages</h3>
                <p className="text-sm text-gray-600">
                  Communicate with your connections through our messaging system.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Discover;
