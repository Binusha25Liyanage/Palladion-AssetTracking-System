import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { api } from "../../lib/api";
import { AssetCategory, Department, Paginated } from "../../types";

export default function AssetRegister() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<AssetCategory[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    category: "",
    serial_number: "",
    description: "",
    department: "",
    location: "",
    purchase_date: "",
    purchase_value: "",
    useful_life_years: "5",
  });

  useEffect(() => {
    api.get<Paginated<AssetCategory>>("/categories").then((res) => setCategories(res.data.results));
    api.get<Paginated<Department>>("/departments").then((res) => setDepartments(res.data.results));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await api.post("/assets", {
        ...form,
        category: Number(form.category),
        department: form.department ? Number(form.department) : null,
        purchase_date: form.purchase_date || null,
        purchase_value: form.purchase_value || null,
        useful_life_years: Number(form.useful_life_years) || 5,
      });
      navigate(`/assets/${res.data.id}`);
    } catch {
      setError("Couldn't register the asset — check the required fields (Name and Category) and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Register New Asset</h1>
        <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
          An asset tag is generated automatically once saved.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="rounded border border-outline-variant bg-surface-bright p-4">
        {error && <p className="mb-3 text-sm text-error">{error}</p>}

        <div className="mb-4">
          <label className="mb-1 block font-data-label text-data-label uppercase text-on-surface-variant">
            Name
          </label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded border border-outline-variant bg-surface px-3 py-2 text-on-surface outline-none focus:border-primary"
          />
        </div>

        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block font-data-label text-data-label uppercase text-on-surface-variant">
              Category
            </label>
            <select
              required
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full rounded border border-outline-variant bg-surface px-3 py-2 text-on-surface outline-none focus:border-primary"
            >
              <option value="">Select a category...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block font-data-label text-data-label uppercase text-on-surface-variant">
              Serial Number
            </label>
            <input
              value={form.serial_number}
              onChange={(e) => setForm({ ...form, serial_number: e.target.value })}
              className="w-full rounded border border-outline-variant bg-surface px-3 py-2 text-on-surface outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="mb-1 block font-data-label text-data-label uppercase text-on-surface-variant">
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="w-full rounded border border-outline-variant bg-surface px-3 py-2 text-on-surface outline-none focus:border-primary"
          />
        </div>

        <div className="tear-line mb-4 pb-4" />

        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
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
          <div>
            <label className="mb-1 block font-data-label text-data-label uppercase text-on-surface-variant">
              Location
            </label>
            <input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full rounded border border-outline-variant bg-surface px-3 py-2 text-on-surface outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block font-data-label text-data-label uppercase text-on-surface-variant">
              Purchase Date
            </label>
            <input
              type="date"
              value={form.purchase_date}
              onChange={(e) => setForm({ ...form, purchase_date: e.target.value })}
              className="w-full rounded border border-outline-variant bg-surface px-3 py-2 text-on-surface outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="mb-1 block font-data-label text-data-label uppercase text-on-surface-variant">
              Purchase Value
            </label>
            <input
              type="number"
              step="0.01"
              value={form.purchase_value}
              onChange={(e) => setForm({ ...form, purchase_value: e.target.value })}
              className="w-full rounded border border-outline-variant bg-surface px-3 py-2 text-on-surface outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="mb-1 block font-data-label text-data-label uppercase text-on-surface-variant">
              Useful Life (years)
            </label>
            <input
              type="number"
              min="1"
              value={form.useful_life_years}
              onChange={(e) => setForm({ ...form, useful_life_years: e.target.value })}
              className="w-full rounded border border-outline-variant bg-surface px-3 py-2 text-on-surface outline-none focus:border-primary"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="rounded bg-primary-container px-4 py-2 font-data-label text-data-label uppercase text-on-primary-container disabled:opacity-60"
        >
          {submitting ? "Registering..." : "Register Asset"}
        </button>
      </form>
    </div>
  );
}
