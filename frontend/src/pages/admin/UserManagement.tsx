import { FormEvent, useEffect, useState } from "react";

import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import { Department, Paginated, Role, User } from "../../types";

const ROLES: Role[] = ["ADMIN", "DEPT_HEAD", "EMPLOYEE"];

export default function UserManagement() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    role: "EMPLOYEE" as Role,
    department: "",
    password: "",
  });

  function loadUsers() {
    api.get<Paginated<User>>("/users").then((res) => setUsers(res.data.results));
  }

  useEffect(() => {
    if (currentUser?.role !== "ADMIN") return;
    loadUsers();
    api.get<Paginated<Department>>("/departments").then((res) => setDepartments(res.data.results));
  }, [currentUser]);

  if (currentUser?.role !== "ADMIN") {
    return (
      <div className="rounded border border-outline-variant bg-surface-bright p-6 text-on-surface-variant">
        You don't have access to User Management. This section is Admin-only.
      </div>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await api.post("/users", { ...form, department: form.department || null });
      setShowForm(false);
      setForm({ username: "", email: "", first_name: "", last_name: "", role: "EMPLOYEE", department: "", password: "" });
      loadUsers();
    } catch {
      setError("Couldn't create user — check all fields, especially a unique username/email.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeactivate(user: User) {
    await api.patch(`/users/${user.id}/deactivate`);
    loadUsers();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">User Management</h1>
          <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
            Manage Admin, Department Head, and Employee accounts.
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 rounded bg-primary-container px-4 py-2 font-data-label text-data-label uppercase text-on-primary-container transition-opacity hover:bg-opacity-90"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add User
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded border border-outline-variant bg-surface-bright p-4">
          {error && <p className="mb-3 text-sm text-error">{error}</p>}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block font-data-label text-data-label uppercase text-on-surface-variant">
                Username
              </label>
              <input
                required
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full rounded border border-outline-variant bg-surface px-3 py-2 text-on-surface outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1 block font-data-label text-data-label uppercase text-on-surface-variant">
                Email
              </label>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded border border-outline-variant bg-surface px-3 py-2 text-on-surface outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1 block font-data-label text-data-label uppercase text-on-surface-variant">
                First Name
              </label>
              <input
                required
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                className="w-full rounded border border-outline-variant bg-surface px-3 py-2 text-on-surface outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1 block font-data-label text-data-label uppercase text-on-surface-variant">
                Last Name
              </label>
              <input
                required
                value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                className="w-full rounded border border-outline-variant bg-surface px-3 py-2 text-on-surface outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1 block font-data-label text-data-label uppercase text-on-surface-variant">
                Role
              </label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
                className="w-full rounded border border-outline-variant bg-surface px-3 py-2 text-on-surface outline-none focus:border-primary"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block font-data-label text-data-label uppercase text-on-surface-variant">
                Department
              </label>
              <select
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                className="w-full rounded border border-outline-variant bg-surface px-3 py-2 text-on-surface outline-none focus:border-primary"
              >
                <option value="">None</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block font-data-label text-data-label uppercase text-on-surface-variant">
                Temporary Password
              </label>
              <input
                required
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full rounded border border-outline-variant bg-surface px-3 py-2 text-on-surface outline-none focus:border-primary"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="mt-4 rounded bg-primary-container px-4 py-2 font-data-label text-data-label uppercase text-on-primary-container disabled:opacity-60"
          >
            {submitting ? "Creating..." : "Create User"}
          </button>
        </form>
      )}

      <div className="overflow-hidden rounded border border-outline-variant bg-surface-bright">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="tear-line bg-surface font-data-label text-data-label uppercase text-on-surface-variant">
              <th className="p-3 font-normal">Name</th>
              <th className="p-3 font-normal">Email</th>
              <th className="p-3 font-normal">Role</th>
              <th className="p-3 font-normal">Department</th>
              <th className="p-3 font-normal">Status</th>
              <th className="p-3 font-normal">Actions</th>
            </tr>
          </thead>
          <tbody className="font-body-sm text-body-sm">
            {users.map((u) => (
              <tr key={u.id} className="tear-line hover:bg-surface-container-low">
                <td className="p-3 text-on-surface">
                  {u.first_name} {u.last_name}
                </td>
                <td className="p-3 text-on-surface-variant">{u.email}</td>
                <td className="p-3 font-data-label text-data-label text-on-surface-variant">{u.role}</td>
                <td className="p-3 text-on-surface-variant">{u.department_name || "—"}</td>
                <td className="p-3">
                  <span
                    className={`rounded px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
                      u.is_active ? "bg-[#0f5223]/20 text-[#4ade80]" : "bg-surface-variant text-on-surface-variant"
                    }`}
                  >
                    {u.is_active ? "Active" : "Deactivated"}
                  </span>
                </td>
                <td className="p-3">
                  {u.is_active && (
                    <button
                      onClick={() => handleDeactivate(u)}
                      className="font-data-label text-data-label text-error hover:underline"
                    >
                      Deactivate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
