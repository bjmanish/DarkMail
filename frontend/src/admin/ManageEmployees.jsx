import { useEffect, useState } from "react";
import {
  getEmployees,
  toggleEmployeeStatus,
  deleteEmployee,
} from "../api";

export default function ManageEmployees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadEmployees = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await getEmployees();
      setEmployees(Array.isArray(res) ? res : res.data || []);
    } catch (err) {
      setError("Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const handleToggle = async (emp) => {
    try {
      await toggleEmployeeStatus(emp._id, !emp.isActive);
      loadEmployees();
    } catch {
      alert("Failed to update status");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this employee?")) return;

    try {
      await deleteEmployee(id);
      loadEmployees();
    } catch {
      alert("Failed to delete employee");
    }
  };

  if (loading) {
    return (
      <div className="text-center text-gray-400 py-20">
        Loading employees...
      </div>
    );
  }

  return (
    <div className="bg-gray-950 text-white min-h-screen">
      <h2 className="text-2xl font-bold mb-6">
        Manage Employees
      </h2>

      {error && (
        <div className="mb-4 text-red-400">
          {error}
        </div>
      )}

      {employees.length === 0 ? (
        <div className="text-gray-400">
          No employees found.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-800 rounded-lg overflow-hidden">

            {/* Table Head */}
            <thead className="bg-gray-900 text-left">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Department</th>
                <th className="p-3">Role</th>
                <th className="p-3">Hire Date</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {employees.map((emp) => (
                <tr
                  key={emp._id}
                  className="border-t border-gray-800 hover:bg-gray-900 transition"
                >
                  <td className="p-3">{emp.name}</td>
                  <td className="p-3">{emp.email}</td>
                  <td className="p-3">{emp.department || "-"}</td>
                  <td className="p-3">{emp.role || "-"}</td>
                  <td className="p-3">
                    {emp.hireDate
                      ? new Date(emp.hireDate).toLocaleDateString()
                      : "-"}
                  </td>

                  {/* Status */}
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        emp.isActive
                          ? "bg-green-600"
                          : "bg-red-600"
                      }`}
                    >
                      {emp.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="p-3 flex gap-2 flex-wrap">
                    <button
                      onClick={() => handleToggle(emp)}
                      className="px-3 py-1 text-sm bg-indigo-600 hover:bg-indigo-700 rounded"
                    >
                      {emp.isActive ? "Deactivate" : "Activate"}
                    </button>

                    <button
                      onClick={() => handleDelete(emp._id)}
                      className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      )}
    </div>
  );
}
