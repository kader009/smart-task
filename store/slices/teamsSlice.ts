import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

interface Team {
  _id: string;
  name: string;
}

interface Member {
  _id: string;
  name: string;
  role: string;
  capacity: number;
  teamId: string;
}

interface TeamsState {
  teams: Team[];
  selectedTeam: Team | null;
  members: Member[];
  loading: boolean;
  error: string | null;
}

const initialState: TeamsState = {
  teams: [],
  selectedTeam: null,
  members: [],
  loading: false,
  error: null,
};

// Fetch all teams
export const fetchTeams = createAsyncThunk(
  'teams/fetchTeams',
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch('/api/teams');
      if (res.status === 401) {
        return rejectWithValue({ message: 'Unauthorized', status: 401 });
      }
      if (!res.ok) throw new Error('Failed to fetch teams');
      return await res.json();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch teams';
      return rejectWithValue(message);
    }
  }
);

// Fetch members for a team
export const fetchMembers = createAsyncThunk(
  'teams/fetchMembers',
  async (teamId: string, { rejectWithValue }) => {
    try {
      const res = await fetch(`/api/teams/${teamId}/members`);
      if (res.status === 401) {
        return rejectWithValue({ message: 'Unauthorized', status: 401 });
      }
      if (!res.ok) throw new Error('Failed to fetch members');
      return await res.json();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch members';
      return rejectWithValue(message);
    }
  }
);

// Create team
export const createTeam = createAsyncThunk(
  'teams/createTeam',
  async (name: string, { rejectWithValue }) => {
    try {
      const res = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (res.status === 401) {
        return rejectWithValue({ message: 'Unauthorized', status: 401 });
      }
      if (!res.ok) throw new Error('Failed to create team');
      return await res.json();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to create team';
      return rejectWithValue(message);
    }
  }
);

// Add member
export const addMember = createAsyncThunk(
  'teams/addMember',
  async (
    {
      teamId,
      member,
    }: {
      teamId: string;
      member: { name: string; role: string; capacity: number };
    },
    { rejectWithValue }
  ) => {
    try {
      const res = await fetch(`/api/teams/${teamId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(member),
      });
      if (res.status === 401) {
        return rejectWithValue({ message: 'Unauthorized', status: 401 });
      }
      if (!res.ok) throw new Error('Failed to add member');
      return await res.json();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to add member';
      return rejectWithValue(message);
    }
  }
);

// Delete member
export const deleteMember = createAsyncThunk(
  'teams/deleteMember',
  async (
    { teamId, memberId }: { teamId: string; memberId: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await fetch(`/api/teams/${teamId}/members/${memberId}`, {
        method: 'DELETE',
      });
      if (res.status === 401) {
        return rejectWithValue({ message: 'Unauthorized', status: 401 });
      }
      if (!res.ok) throw new Error('Failed to delete member');
      return memberId;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete member';
      return rejectWithValue(message);
    }
  }
);

const teamsSlice = createSlice({
  name: 'teams',
  initialState,
  reducers: {
    setSelectedTeam: (state, action) => {
      state.selectedTeam = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch teams
      .addCase(fetchTeams.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTeams.fulfilled, (state, action) => {
        state.loading = false;
        state.teams = action.payload;
        if (action.payload.length > 0 && !state.selectedTeam) {
          state.selectedTeam = action.payload[0];
        }
      })
      .addCase(fetchTeams.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch members
      .addCase(fetchMembers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMembers.fulfilled, (state, action) => {
        state.loading = false;
        state.members = action.payload;
      })
      .addCase(fetchMembers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create team
      .addCase(createTeam.fulfilled, (state, action) => {
        state.teams.push(action.payload);
        state.selectedTeam = action.payload;
      })
      // Add member
      .addCase(addMember.fulfilled, (state, action) => {
        state.members.push(action.payload);
      })
      // Delete member
      .addCase(deleteMember.fulfilled, (state, action) => {
        state.members = state.members.filter((m) => m._id !== action.payload);
      });
  },
});

export const { setSelectedTeam, clearError } = teamsSlice.actions;
export default teamsSlice.reducer;
