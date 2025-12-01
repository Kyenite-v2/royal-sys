"use client"

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function Page() {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/server/login",{
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if(res.status !== 200) {
        setError(data.errorText);
        return
      }

      if(data.role === "Admin") {
        router.push("/admin");
        return
      } else {
        router.push("/index");
        return
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 flex items-center justify-center">
      <div className="w-full max-w-md">
        {/* Header / Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 bg-gray-900 rounded-full flex items-center justify-center border border-gray-700">
            <span className="text-gray-400 text-sm">App Logo</span>
          </div>
          <h1 className="text-3xl font-semibold mt-4">Royal Selection</h1>
          <p className="text-gray-400 text-sm mt-1">Login to continue — Mr. & Ms. Pageant System</p>
        </div>

        {/* Card */}
        <div className="bg-gray-900 rounded-2xl p-6 shadow-xl border border-gray-800">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-gray-300">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                placeholder="you@school.edu"
                required
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-gray-300">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                placeholder="••••••••"
                required
              />
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 rounded-xl bg-gradient-to-r from-yellow-500 to-yellow-400 text-black font-semibold disabled:opacity-60"
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            <div className="flex justify-end">
              <button
                type="button"
                className="text-sm text-gray-400 hover:underline"
              >
                Forgot password?
              </button>
            </div>
          </form>
        </div>

        <p className="text-center text-xs text-gray-500 mt-4">Only authorized judges and admins may log in.</p>
      </div>
    </div>
  );
}