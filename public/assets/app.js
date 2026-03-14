const state = {
  user: null,
  page: 1,
  limit: 6,
  totalPages: 1,
  search: "",
  status: "",
};

const authView = document.getElementById("authView");
const dashboardView = document.getElementById("dashboardView");
const registerForm = document.getElementById("registerForm");
const loginForm = document.getElementById("loginForm");
const taskForm = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");
const logoutButton = document.getElementById("logoutButton");
const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const pageLabel = document.getElementById("pageLabel");
const prevPageButton = document.getElementById("prevPageButton");
const nextPageButton = document.getElementById("nextPageButton");
const cancelEditButton = document.getElementById("cancelEditButton");
const taskFormTitle = document.getElementById("taskFormTitle");
const welcomeText = document.getElementById("welcomeText");
const toast = document.getElementById("toast");

const request = async (url, options = {}, isRetry = false) => {
  const response = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const payload = await response.json().catch(() => ({}));

  if (response.status === 401 && !isRetry && url !== "/api/auth/refresh-token") {
    const refreshResponse = await fetch("/api/auth/refresh-token", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (refreshResponse.ok) {
      return request(url, options, true);
    }
  }

  if (!response.ok) {
    throw new Error(payload.message || "Request failed");
  }

  return payload;
};

const showToast = (message) => {
  toast.textContent = message;
  toast.classList.remove("hidden");
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => {
    toast.classList.add("hidden");
  }, 2500);
};

const setView = (isAuthenticated) => {
  authView.classList.toggle("active", !isAuthenticated);
  dashboardView.classList.toggle("active", isAuthenticated);
};

const renderTasks = (tasks) => {
  if (!tasks.length) {
    taskList.innerHTML =
      '<div class="task-card"><h4>No tasks found</h4><p>Create your first task or change the active filters.</p></div>';
    return;
  }

  taskList.innerHTML = tasks
    .map(
      (task) => `
        <article class="task-card">
          <div class="task-meta">
            <span class="badge">${task.status}</span>
            <span class="badge">${new Date(task.createdAt).toLocaleDateString()}</span>
          </div>
          <h4>${task.title}</h4>
          <p>${task.description || "No description"}</p>
          <div class="task-actions">
            <button data-action="edit" data-id="${task._id}">Edit</button>
            <button class="ghost-button" data-action="delete" data-id="${task._id}">Delete</button>
          </div>
        </article>
      `,
    )
    .join("");
};

const loadTasks = async () => {
  const query = new URLSearchParams({
    page: String(state.page),
    limit: String(state.limit),
  });

  if (state.search) {
    query.set("search", state.search);
  }
  if (state.status) {
    query.set("status", state.status);
  }

  const payload = await request(`/api/tasks?${query.toString()}`);
  renderTasks(payload.data.tasks);
  state.totalPages = payload.data.pagination.totalPages;
  pageLabel.textContent = `Page ${payload.data.pagination.page} of ${state.totalPages}`;
  prevPageButton.disabled = state.page <= 1;
  nextPageButton.disabled = state.page >= state.totalPages;
};

const resetTaskForm = () => {
  taskForm.reset();
  taskForm.taskId.value = "";
  taskFormTitle.textContent = "Create task";
  cancelEditButton.classList.add("hidden");
};

const loadTaskIntoForm = async (taskId) => {
  const payload = await request(`/api/tasks/${taskId}`);
  const task = payload.data.task;
  taskForm.taskId.value = task._id;
  taskForm.title.value = task.title;
  taskForm.description.value = task.description;
  taskForm.status.value = task.status;
  taskFormTitle.textContent = "Edit task";
  cancelEditButton.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const bootstrapSession = async () => {
  try {
    const payload = await request("/api/auth/me");
    state.user = payload.data.user;
    welcomeText.textContent = `${state.user.name}'s tasks`;
    setView(true);
    await loadTasks();
  } catch {
    state.user = null;
    setView(false);
  }
};

registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(registerForm);

  await request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(Object.fromEntries(formData.entries())),
  });

  showToast("Registration successful");
  registerForm.reset();
  await bootstrapSession();
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(loginForm);

  await request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(Object.fromEntries(formData.entries())),
  });

  showToast("Logged in successfully");
  loginForm.reset();
  await bootstrapSession();
});

taskForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(taskForm);
  const taskId = formData.get("taskId");
  const payload = {
    title: formData.get("title"),
    description: formData.get("description"),
    status: formData.get("status"),
  };

  await request(taskId ? `/api/tasks/${taskId}` : "/api/tasks", {
    method: taskId ? "PUT" : "POST",
    body: JSON.stringify(payload),
  });

  showToast(taskId ? "Task updated" : "Task created");
  resetTaskForm();
  await loadTasks();
});

taskList.addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) {
    return;
  }

  const { action, id } = button.dataset;

  if (action === "edit") {
    await loadTaskIntoForm(id);
    return;
  }

  if (action === "delete") {
    await request(`/api/tasks/${id}`, { method: "DELETE" });
    showToast("Task deleted");
    await loadTasks();
  }
});

logoutButton.addEventListener("click", async () => {
  await request("/api/auth/logout", { method: "POST" });
  showToast("Logged out");
  resetTaskForm();
  state.user = null;
  setView(false);
});

searchInput.addEventListener("input", async (event) => {
  state.search = event.target.value.trim();
  state.page = 1;
  await loadTasks();
});

statusFilter.addEventListener("change", async (event) => {
  state.status = event.target.value;
  state.page = 1;
  await loadTasks();
});

prevPageButton.addEventListener("click", async () => {
  if (state.page > 1) {
    state.page -= 1;
    await loadTasks();
  }
});

nextPageButton.addEventListener("click", async () => {
  if (state.page < state.totalPages) {
    state.page += 1;
    await loadTasks();
  }
});

cancelEditButton.addEventListener("click", () => {
  resetTaskForm();
});

window.addEventListener("error", (event) => {
  showToast(event.error?.message || "Unexpected error");
});

window.addEventListener("unhandledrejection", (event) => {
  showToast(event.reason?.message || "Unexpected error");
});

bootstrapSession();
