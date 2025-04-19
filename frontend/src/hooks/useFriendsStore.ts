import { create } from 'zustand';

export type Friend = {
  id: number;
  displayName: string;
  username: string;
  pronouns: string | null;
  bio: string | null;
};

export type FriendRequest = {
  id: number;
  username: string;
};

export type FriendsStore = {
  friends: Array<Friend>;
  friendRequests: Array<FriendRequest>;
  addFriend: (friend: Friend) => void;
  addFriendRequest: (friendRequest: FriendRequest) => void;
  removeFriendRequest: (friendRequestId: number) => void;
  setFriendsList: (friendsList: {
    friends: Array<Friend>;
    friendRequests: Array<FriendRequest>;
  }) => void;
};

export const useFriendsStore = create<FriendsStore>((set) => ({
  friends: [],
  friendRequests: [],
  addFriend: (friend: Friend) =>
    set((state: FriendsStore) => ({
      ...state,
      friends: [...state.friends, friend],
    })),
  addFriendRequest: (friendRequest: FriendRequest) =>
    set((state: FriendsStore) => ({
      ...state,
      friendRequests: [...state.friendRequests, friendRequest],
    })),
  removeFriendRequest: (friendRequestId: number) =>
    set((state: FriendsStore) => {
      console.log(friendRequestId);
      const updatedFriendRequests = state.friendRequests.filter(
        (friendRequest) => friendRequest.id !== friendRequestId,
      );
      return { ...state, friendRequests: updatedFriendRequests };
    }),

  setFriendsList: (friendsList: {
    friends: Array<Friend>;
    friendRequests: Array<FriendRequest>;
  }) => set((state: FriendsStore) => ({ ...state, ...friendsList })),
}));
