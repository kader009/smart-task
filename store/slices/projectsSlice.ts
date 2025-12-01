import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

interface Project {
  _id: string;
  name: string;
  description: string;
  teamId: { _id: string; name: string } | string;
}

interface Task {
  _id: string;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Pending' | 'In Progress' | 'Done';
  assignedTo: { _id: string; name: string } | null;
  projectId: { _id: string; name: string } | string;
}

interface ProjectsState {
  projects: Project[];
  selectedProject: Project | null;
  tasks: Task[];
  loading: boolean;
  error: string | null;
}

const initialState: ProjectsState = {
  projects: [],
  selectedProject: null,
  tasks: [],
  loading: false,
  error: null,
};

// Fetch projects
export const fetchProjects = createAsyncThunk(
  'projects/fetchProjects',
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch('/api/projects');
      if (res.status === 401) {
        return rejectWithValue({ message: 'Unauthorized', status: 401 });
      }
      if (!res.ok) throw new Error('Failed to fetch projects');
      return await res.json();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch projects';
      return rejectWithValue(message);
    }
  }
);

// Fetch tasks
export const fetchTasks = createAsyncThunk(
  'projects/fetchTasks',
  async (projectId: string, { rejectWithValue }) => {
    try {
      const res = await fetch(`/api/tasks?projectId=${projectId}`);
      if (res.status === 401) {
        return rejectWithValue({ message: 'Unauthorized', status: 401 });
      }
      if (!res.ok) throw new Error('Failed to fetch tasks');
      return await res.json();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch tasks';
      return rejectWithValue(message);
    }
  }
);

// Create project
export const createProject = createAsyncThunk(
  'projects/createProject',
  async (
    project: { name: string; description: string; teamId: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(project),
      });
      if (res.status === 401) {
        return rejectWithValue({ message: 'Unauthorized', status: 401 });
      }
      if (!res.ok) throw new Error('Failed to create project');
      return await res.json();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to create project';
      return rejectWithValue(message);
    }
  }
);

// Create task
export const createTask = createAsyncThunk(
  'projects/createTask',
  async (
    task: {
      title: string;
      description: string;
      priority: string;
      status: string;
      assignedTo: string | null;
      projectId: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task),
      });
      if (res.status === 401) {
        return rejectWithValue({ message: 'Unauthorized', status: 401 });
      }
      if (!res.ok) throw new Error('Failed to create task');
      return await res.json();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to create task';
      return rejectWithValue(message);
    }
  }
);

// Delete task
export const deleteTask = createAsyncThunk(
  'projects/deleteTask',
  async (taskId: string, { rejectWithValue }) => {
    try {
      const res = await fetch(`/api/tasks?id=${taskId}`, {
        method: 'DELETE',
      });
      if (res.status === 401) {
        return rejectWithValue({ message: 'Unauthorized', status: 401 });
      }
      if (!res.ok) throw new Error('Failed to delete task');
      return taskId;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete task';
      return rejectWithValue(message);
    }
  }
);

// Update task
export const updateTask = createAsyncThunk(
  'projects/updateTask',
  async (
    task: {
      _id: string;
      title: string;
      description: string;
      priority: string;
      status: string;
      assignedTo: string | { _id: string; name: string } | null;
      projectId: string | { _id: string; name: string };
    },
    { rejectWithValue }
  ) => {
    try {
      const taskId = task._id;
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task),
      });
      if (res.status === 401) {
        return rejectWithValue({ message: 'Unauthorized', status: 401 });
      }
      if (!res.ok) throw new Error('Failed to update task');
      return await res.json();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to update task';
      return rejectWithValue(message);
    }
  }
);

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    setSelectedProject: (state, action) => {
      state.selectedProject = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch projects
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload;
        if (action.payload.length > 0 && !state.selectedProject) {
          state.selectedProject = action.payload[0];
        }
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch tasks
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create project
      .addCase(createProject.fulfilled, (state, action) => {
        state.projects.push(action.payload);
        state.selectedProject = action.payload;
      })
      // Create task
      .addCase(createTask.fulfilled, (state, action) => {
        state.tasks.push(action.payload);
      })
      // Delete task
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter((task) => task._id !== action.payload);
      })
      // Update task
      .addCase(updateTask.fulfilled, (state, action) => {
        const index = state.tasks.findIndex(
          (t) => t._id === action.payload._id
        );
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
      });
  },
});

export const { setSelectedProject, clearError } = projectsSlice.actions;
export default projectsSlice.reducer;
