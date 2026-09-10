import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import { Organization } from "../../types";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [orgSlug, setOrgSlug] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Public endpoint — no auth needed, this has to work before login.
    api.get<Organization[]>("/organizations").then((res) => {
      setOrganizations(res.data);
      if (res.data.length > 0) setOrgSlug(res.data[0].slug);
    });
  }, []);

  const selectedOrg = organizations.find((o) => o.slug === orgSlug);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!orgSlug) {
      setError("Please select an organization.");
      return;
    }
    setSubmitting(true);
    try {
      await login(email, password, orgSlug);
      navigate("/");
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Invalid email or authentication key.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-background bg-[length:6px_6px] p-4"
      style={{
        backgroundImage:
          "repeating-linear-gradient(45deg, rgba(255,255,255,0.02) 0, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 6px)",
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-lg border border-outline-variant bg-surface-bright p-8"
      >
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 h-20 w-20 overflow-hidden rounded border border-outline-variant bg-surface-container">
            {selectedOrg?.logo_filename && (
              <img
                src={`/${selectedOrg.logo_filename}`}
                alt={selectedOrg.name}
                className="h-full w-full object-cover"
              />
            )}
          </div>
          <h1 className="font-headline-md text-headline-md font-black uppercase tracking-wider text-on-surface">
            {selectedOrg?.name || "Sign In"}
          </h1>
          <p className="font-data-label text-data-label uppercase text-on-surface-variant">
            Industrial Asset Tracking
          </p>
        </div>

        <div className="tear-line mb-6" />

        {error && <p className="mb-4 text-sm text-error">{error}</p>}

        <label className="mb-1 block font-data-label text-data-label uppercase text-on-surface-variant">
          Organization
        </label>
        <select
          required
          value={orgSlug}
          onChange={(e) => setOrgSlug(e.target.value)}
          className="mb-4 w-full rounded border border-outline-variant bg-surface px-3 py-2 text-on-surface outline-none focus:border-primary"
        >
          {organizations.length === 0 && <option value="">Loading organizations...</option>}
          {organizations.map((org) => (
            <option key={org.slug} value={org.slug}>
              {org.name}
            </option>
          ))}
        </select>

        <label className="mb-1 block font-data-label text-data-label uppercase text-on-surface-variant">
          Email Address
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full rounded border border-outline-variant bg-surface px-3 py-2 text-on-surface outline-none focus:border-primary"
          placeholder="operator@facility.local"
        />

        <label className="mb-1 block font-data-label text-data-label uppercase text-on-surface-variant">
          Authentication Key
        </label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-6 w-full rounded border border-outline-variant bg-surface px-3 py-2 text-on-surface outline-none focus:border-primary"
          placeholder="••••••••"
        />

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded bg-primary-container py-2 font-data-label text-data-label uppercase text-on-primary-container transition-opacity hover:bg-opacity-90 disabled:opacity-60"
        >
          {submitting ? "Authenticating..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}
