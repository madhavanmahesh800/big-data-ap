
import { useState, useEffect } from "react";
import { getPostsForFollowers, getRecommendations, Post, Profile, followUser, unfollowUser } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import Layout from "@/components/Layout";
import PostCard from "@/components/PostCard";
import ProfileCard from "@/components/ProfileCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [recommendations, setRecommendations] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [recommendationsLoading, setRecommendationsLoading] = useState(true);
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postsData = await getPostsForFollowers();
        setPosts(postsData);
      } catch (error) {
        console.error("Error fetching posts:", error);
        toast({
          title: "Error",
          description: "Failed to load posts",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    const fetchRecommendations = async () => {
      try {
        const recommendationsData = await getRecommendations();
        setRecommendations(recommendationsData);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      } finally {
        setRecommendationsLoading(false);
      }
    };

    fetchPosts();
    fetchRecommendations();
  }, [toast]);

  const handleFollow = async (username: string) => {
    try {
      await followUser(username);
      setFollowing(prev => new Set(prev).add(username));
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
      setFollowing(prev => {
        const newSet = new Set(prev);
        newSet.delete(username);
        return newSet;
      });
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

  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-6">
          <h1 className="text-2xl font-bold mb-6">Your Feed</h1>
          
          {loading ? (
            // Loading skeletons
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="mb-6">
                <CardHeader className="p-4">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div>
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16 mt-1" />
                    </div>
                  </div>
                </CardHeader>
                <Skeleton className="h-64 w-full" />
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2 mt-2" />
                </CardContent>
              </Card>
            ))
          ) : posts.length > 0 ? (
            posts.map(post => <PostCard key={post._id} post={post} />)
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-700">Your feed is empty</h3>
              <p className="text-gray-500 mt-2">Follow users to see their posts here</p>
            </div>
          )}
        </div>
        
        {/* Sidebar with Recommendations */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">People You May Know</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recommendationsLoading ? (
                // Loading skeletons for recommendations
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-3 py-2">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32 mt-1" />
                    </div>
                    <Skeleton className="h-8 w-16" />
                  </div>
                ))
              ) : recommendations.length > 0 ? (
                recommendations.map(profile => (
                  <ProfileCard
                    key={profile._id}
                    profile={profile}
                    isFollowing={following.has(profile.username)}
                    onFollow={() => handleFollow(profile.username)}
                    onUnfollow={() => handleUnfollow(profile.username)}
                  />
                ))
              ) : (
                <p className="text-gray-500 py-2">No recommendations available</p>
              )}
            </CardContent>
          </Card>
          
          {/* App Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">About ConnectX</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">
                ConnectX is a social platform that helps you connect with friends and share your life through posts and messages.
              </p>
              
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-gray-500">
                <div>Privacy Policy</div>
                <div>Terms of Service</div>
                <div>Help Center</div>
                <div>Contact Us</div>
              </div>
              
              <p className="mt-4 text-xs text-gray-400">
                © 2023 ConnectX. All rights reserved.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
