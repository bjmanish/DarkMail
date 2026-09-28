
const API_BASE_URL =  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";



/* Helper: Get Auth Header   */
function getAuthHeaders() {

  const authData = localStorage.getItem("darkmail_auth");

  if (!authData) {
    return {};

  }

  try {
    const { token } = JSON.parse(authData);

    if (!token){
      return {  };
    }

    return {
      Authorization: `Bearer ${token}`,
    };
  } catch {
    return {};
  }
}

function handleAuthError(response) {
  if (response.status === 401) {
    localStorage.removeItem("darkmail_auth");
    // window.location.href = "/login";
    throw new Error("Session expired");
  }
}

/* Health Check           */
export async function getHealth() {
  const response = await fetch(`${API_BASE_URL}/health`);

  if (!response.ok) {
    throw new Error(`Health check failed: ${response.status}`);
  }

  return response.json();
}

/* Auth                      */

export async function loginUser(email, password) {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: "Login failed",
    }));
    throw new Error(error.error ?? "Login failed");
  }

  // console.log('response Login json :',response.json());

  return response.json();
}

export async function registerUser(email, password) {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: "Registration failed",
    }));
    throw new Error(error.error ?? "Registration failed");
  }

  return response.json();
}

/* Admin: Create Employee    */
export async function createEmployee(data) {
  const response = await fetch(`${API_BASE_URL}/api/employees`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: "Failed to create employee",
    }));
    throw new Error(error.error ?? "Failed to create employee");
  }

  return response.json();
}

/* Admin: Get Employees      */
export async function getEmployees() {
  const response = await fetch(`${API_BASE_URL}/api/employees`, {
    headers: {
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch employees");
  }

  return response.json();
}

/* Admin: Toggle Status      */

export async function toggleEmployeeStatus(id, isActive) {
  const response = await fetch(
    `${API_BASE_URL}/api/employees/${id}/status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ isActive }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update employee status");
  }

  return response.json();
}

/* Admin: Delete Employee    */

export async function deleteEmployee(id) {
  const response = await fetch(
    `${API_BASE_URL}/api/employees/${id}`,
    {
      method: "DELETE",
      headers: {
        ...getAuthHeaders(),
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to delete employee");
  }

  return response.json();
}

export async function sendEmailToAllEmployees(subject, body) {
  const response = await fetch(`${API_BASE_URL}/api/messages/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ subject, body }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: "Failed to send email",
    }));
    throw new Error(error.error ?? "Failed to send email");
  }

  return response.json();
}

export async function sendMessage(payload) {

  console.log("api send payload", payload);

  const isFormData = payload instanceof FormData;

  const response = await fetch(`${API_BASE_URL}/api/messages`, {

    method: "POST",

    headers: {
      ...getAuthHeaders(),
      ...(isFormData ? {} : { "Content-Type": "application/json" })
    },

    body: isFormData ? payload : JSON.stringify(payload),

  });

  if (!response.ok) {

    const error = await response.json().catch(() => ({
      error: "Failed to send message",
    }));

    throw new Error(error.error || "Failed to send message");

  }

  return response.json();
}

export async function getMessages() {
  const response = await fetch(`${API_BASE_URL}/api/messages`, {
    headers: {
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch messages");
  }

  return response.json();
}

/* SAVE DRAFT */

export async function saveDraft(data) {

  const response = await fetch(`${API_BASE_URL}/api/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to save draft");
  }

  return result;
}

export async function getMessagesByUserId(userId) {

  // console.log("user id:",userId);

  const url = `${API_BASE_URL}/api/messages/`;

  // console.log("url", url);

  const response = await fetch(`${API_BASE_URL}/api/messages`, {
    headers: {
      ...getAuthHeaders(),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch messages");
  }

  return data;
}

export async function markAsRead(messageId) {
  const response = await fetch(`${API_BASE_URL}/api/messages/${messageId}/read`, {
    method: "PATCH",
    headers: {
      ...getAuthHeaders(),
    },
  });

  if(!response.ok){
    throw new Error("Failed to mark message as read");
  }

  return response.json();
}

export async function moveToTrash(messageId){
  const response = await fetch(`${API_BASE_URL}/api/messages/${messageId}/trash`, {
    method: "PATCH",
    headers: {
      ...getAuthHeaders(),
    },
  });

  if(!response.ok){
    throw new Error("Failed to move message to trash");
  }

  return response.json(); 
}

export async function getTrash(){
  const response = await fetch(`${API_BASE_URL}/api/messages/trash`, {
    headers: {
      ...getAuthHeaders(),
    },
  });

  if(!response.ok){
    throw new Error("Failed to fetch trash messages");
  } 
  return response.json(); 
}

export async function getUnreadCount() {
  const response = await fetch(`${API_BASE_URL}/api/messages/unread-count`, {
    headers: {
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch unread count");
  }

  return response.json();
}

/* delete message permanently */
export const deleteMessagePermanent = async (id) => {

  console.log("Deleting message id:", id);

  const res = await fetch(`${API_BASE_URL}/api/messages/${id}`, {
    method: "DELETE",
    headers: {
      ...getAuthHeaders(),
    }
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({
      error: "Failed to delete message",
    }));

    throw new Error(error.error || "Failed to delete message");
  }

  return res.json();
}