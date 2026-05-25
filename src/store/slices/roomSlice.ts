import type { StateCreator } from 'zustand';
import type { StoreState } from '../useStore';
import type { Room, RoomMessage, RoomParticipant } from '../../types/models';

export interface RoomSlice {
  rooms: Room[];
  loadRooms: () => void;
  createRoom: (room: Omit<Room, 'id' | 'participantsList' | 'messages' | 'participants'>) => void;
  joinRoom: (roomId: string, user: RoomParticipant) => void;
  leaveRoom: (roomId: string, userId: string) => void;
  deleteRoom: (roomId: string) => void;
  sendRoomMessage: (roomId: string, message: Omit<RoomMessage, 'id' | 'timestamp'>) => void;
}

export const createRoomSlice: StateCreator<StoreState, [], [], RoomSlice> = (set) => ({
  rooms: [],
  loadRooms: () => {
    try {
      const stored = localStorage.getItem('parsomen_rooms');
      if (stored) {
        set({ rooms: JSON.parse(stored) });
      } else {
        // Default dummy room
        const defaultRoom: Room = {
          id: '1',
          title: 'Kadıköy Sahaf Gezginleri',
          hostId: 'system',
          hostName: 'Parsömen',
          hostAvatar: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=150',
          participants: 3,
          maxParticipants: 15,
          time: '14:30',
          isLive: false,
          type: 'Sessiz Okuma',
          participantsList: [
            { id: 'system', name: 'Parsömen', avatar: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=150' },
          ],
          messages: []
        };
        set({ rooms: [defaultRoom] });
        localStorage.setItem('parsomen_rooms', JSON.stringify([defaultRoom]));
      }
    } catch (e) {
      console.error('Error loading rooms', e);
    }
  },
  createRoom: (roomData) => {
    const newRoom: Room = {
      ...roomData,
      id: Date.now().toString(),
      participants: 1, // Host is the first participant
      participantsList: [{
        id: roomData.hostId,
        name: roomData.hostName,
        avatar: roomData.hostAvatar
      }],
      messages: []
    };
    set((state) => {
      const updated = [newRoom, ...state.rooms];
      localStorage.setItem('parsomen_rooms', JSON.stringify(updated));
      return { rooms: updated };
    });
  },
  joinRoom: (roomId, user) => {
    set((state) => {
      const updated = state.rooms.map(room => {
        if (room.id === roomId) {
          if (!room.participantsList.find(p => p.id === user.id)) {
            return {
              ...room,
              participants: room.participants + 1,
              participantsList: [...room.participantsList, user]
            };
          }
        }
        return room;
      });
      localStorage.setItem('parsomen_rooms', JSON.stringify(updated));
      return { rooms: updated };
    });
  },
  leaveRoom: (roomId, userId) => {
    set((state) => {
      const updated = state.rooms.map(room => {
        if (room.id === roomId) {
          return {
            ...room,
            participants: Math.max(0, room.participants - 1),
            participantsList: room.participantsList.filter(p => p.id !== userId)
          };
        }
        return room;
      });
      localStorage.setItem('parsomen_rooms', JSON.stringify(updated));
      return { rooms: updated };
    });
  },
  deleteRoom: (roomId) => {
    set((state) => {
      const updated = state.rooms.filter(room => room.id !== roomId);
      localStorage.setItem('parsomen_rooms', JSON.stringify(updated));
      return { rooms: updated };
    });
  },
  sendRoomMessage: (roomId, messageData) => {
    const newMessage: RoomMessage = {
      ...messageData,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
    set((state) => {
      const updated = state.rooms.map(room => {
        if (room.id === roomId) {
          return {
            ...room,
            messages: [...room.messages, newMessage]
          };
        }
        return room;
      });
      localStorage.setItem('parsomen_rooms', JSON.stringify(updated));
      return { rooms: updated };
    });
  }
});
