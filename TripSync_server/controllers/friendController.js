import User from '../models/userModel.js';
import FriendRequest from '../models/friendRequest.js';
export const getAllUsers = async (req, res) => {
    try {
      const userId = req.user;
      if (!userId) return res.status(401).json({ error: 'User not authenticated' });
  
      // Get all users except the current user
      const users = await User.find({ _id: { $ne: userId } })
        .select('name profilePhoto friendList')
        .lean();
  
      // Get pending friend requests sent by the current user
      const sentRequests = await FriendRequest.find({ fromUser: userId, status: 'pending' })
        .select('toUser')
        .lean();
      const sentRequestUserIds = sentRequests.map((req) => req.toUser.toString());
  
      // Map users with friend status
      const usersWithStatus = users.map((user) => ({
        _id: user._id,
        name: user.name,
        profilePhoto: user.profilePhoto,
        isFriend: user.friendList.some((friendId) => friendId.toString() === userId.toString()),
        isPending: sentRequestUserIds.includes(user._id.toString()),
      }));
  
      res.status(200).json(usersWithStatus);
    } catch (err) {
      console.error('Error fetching users:', err);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  };
  
  export const sendFriendRequest = async (req, res) => {
    try {
      const { toUserId } = req.body;
      const fromUserId = req.user;
  
      if (!fromUserId) return res.status(401).json({ error: 'User not authenticated' });
      if (!toUserId) return res.status(400).json({ error: 'Recipient user ID is required' });
      if (fromUserId.toString() === toUserId) {
        return res.status(400).json({ error: 'Cannot send friend request to yourself' });
      }
  
      // Check if users are already friends
      const fromUser = await User.findById(fromUserId).select('friendList');
      if (fromUser.friendList.includes(toUserId)) {
        return res.status(400).json({ error: 'User is already a friend' });
      }
  
      // Check if a pending request already exists
      const existingRequest = await FriendRequest.findOne({
        fromUser: fromUserId,
        toUser: toUserId,
        status: 'pending',
      });
      if (existingRequest) {
        return res.status(400).json({ error: 'Friend request already sent' });
      }
  
      // Create friend request
      const friendRequest = new FriendRequest({
        fromUser: fromUserId,
        toUser: toUserId,
      });
      await friendRequest.save();
  
      res.status(200).json({ message: 'Friend request sent' });
    } catch (err) {
      console.error('Error sending friend request:', err);
      res.status(500).json({ error: 'Failed to send friend request' });
    }
  };
  
  export const getFriendRequests = async (req, res) => {
    try {
      const userId = req.user;
      if (!userId) return res.status(401).json({ error: 'User not authenticated' });
  
      // Get pending friend requests received by the user
      const friendRequests = await FriendRequest.find({ toUser: userId, status: 'pending' })
        .populate('fromUser', 'name profilePhoto')
        .lean();
  
      const formattedRequests = friendRequests.map((req) => ({
        _id: req._id,
        fromUser: {
          _id: req.fromUser._id,
          name: req.fromUser.name,
          profilePhoto: req.fromUser.profilePhoto,
        },
      }));
  
      res.status(200).json(formattedRequests);
    } catch (err) {
      console.error('Error fetching friend requests:', err);
      res.status(500).json({ error: 'Failed to fetch friend requests' });
    }
  };
  
  export const acceptFriendRequest = async (req, res) => {
    try {
      const { requestId } = req.body;
      const userId = req.user;
  
      if (!userId) return res.status(401).json({ error: 'User not authenticated' });
      if (!requestId) return res.status(400).json({ error: 'Request ID is required' });
  
      // Find the friend request
      const friendRequest = await FriendRequest.findById(requestId);
      if (!friendRequest) {
        return res.status(404).json({ error: 'Friend request not found' });
      }
      if (friendRequest.toUser.toString() !== userId.toString()) {
        return res.status(403).json({ error: 'Unauthorized to accept this request' });
      }
      if (friendRequest.status !== 'pending') {
        return res.status(400).json({ error: 'Request is not pending' });
      }
  
      // Update friend lists
      await User.findByIdAndUpdate(friendRequest.fromUser, {
        $addToSet: { friendList: friendRequest.toUser },
      });
      await User.findByIdAndUpdate(friendRequest.toUser, {
        $addToSet: { friendList: friendRequest.fromUser },
      });
  
      // Update request status
      friendRequest.status = 'accepted';
      await friendRequest.save();
  
      res.status(200).json({ message: 'Friend request accepted' });
    } catch (err) {
      console.error('Error accepting friend request:', err);
      res.status(500).json({ error: 'Failed to accept friend request' });
    }
  };
  
  export const rejectFriendRequest = async (req, res) => {
    try {
      const { requestId } = req.body;
      const userId = req.user;
  
      if (!userId) return res.status(401).json({ error: 'User not authenticated' });
      if (!requestId) return res.status(400).json({ error: 'Request ID is required' });
  
      // Find the friend request
      const friendRequest = await FriendRequest.findById(requestId);
      if (!friendRequest) {
        return res.status(404).json({ error: 'Friend request not found' });
      }
      if (friendRequest.toUser.toString() !== userId.toString()) {
        return res.status(403).json({ error: 'Unauthorized to reject this request' });
      }
  
      // Update request status
      friendRequest.status = 'rejected';
      await friendRequest.save();
  
      res.status(200).json({ message: 'Friend request rejected' });
    } catch (err) {
      console.error('Error rejecting friend request:', err);
      res.status(500).json({ error: 'Failed to reject friend request' });
    }
  };
  export const getFriends = async (req, res) => {
    try {
      const userId = req.user;
      if (!userId) return res.status(401).json({ error: 'User not authenticated' });
  
      // Find the user and populate their friendList
      const user = await User.findById(userId)
        .populate('friendList', 'name email profilePhoto')
        .lean();
  
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      // Format the friends list
      const friends = user.friendList.map((friend) => ({
        _id: friend._id,
        name: friend.name,
        email: friend.email,
        profilePhoto: friend.profilePhoto,
      }));
  
      res.status(200).json(friends);
    } catch (err) {
      console.error('Error fetching friends:', err);
      res.status(500).json({ error: 'Failed to fetch friends' });
    }
  };