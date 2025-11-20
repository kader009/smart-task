import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

interface DashboardData {
  totalProjects: number;
  totalTasks: number;
  recentLogs: any[];
  memberStats: any[];
}

interface DashboardState {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  data: null,
  loading: false,
  error: null,
};

// Fetch dashboard data
export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchDashboardData',
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch('/api/dashboard');
      if (!res.ok) throw new Error('Failed to fetch dashboard data');
      return await res.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Reassign tasks
export const reassignTasks = createAsyncThunk(
  'dashboard/reassignTasks',
  async (teamId: string, { rejectWithValue }) => {
    try {
      const res = await fetch('/api/tasks/reassign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId }),
      });
      if (!res.ok) throw new Error('Failed to reassign tasks');
      return await res.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch dashboard data
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Reassign tasks
      .addCase(reassignTasks.pending, (state) => {
        state.loading = true;
      })
      .addCase(reassignTasks.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(reassignTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = dashboardSlice.actions;
export default dashboardSlice.reducer;
