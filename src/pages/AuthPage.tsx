import { useState } from "react";
import AboutCard from "../components/AboutCard";
import LoginForm from "../components/LoginForm";
import RegisterForm from "../components/RegisterForm";

type Tab = "login" | "register";

export default function AuthPage() {
  const [tab, setTab] = useState<Tab>("login");

  const tabClass = (name: Tab) =>
    `flex-1 py-3 rounded-xl font-semibold transition ${
      tab === name ? "bg-white text-brand shadow" : "text-slate-600"
    }`;

  return (
    <main className="min-h-screen px-6 py-12 lg:px-32 grid gap-12 lg:grid-cols-[1.4fr_1fr] items-center">
      <section>
        <h1 className="text-7xl font-extrabold text-brand">Route Posts</h1>
        <p className="mt-6 mb-8 text-3xl text-slate-800 max-w-2xl">
          Connect with friends and the world around you on Route Posts.
        </p>
        <AboutCard />
      </section>

      <section className="rounded-3xl bg-white p-8 shadow-sm">
        <div className="flex gap-2 rounded-2xl bg-slate-100 p-1.5 mb-8">
          <button onClick={() => setTab("login")} className={tabClass("login")}>Login</button>
          <button onClick={() => setTab("register")} className={tabClass("register")}>Register</button>
        </div>

        {tab === "login" ? <LoginForm /> : <RegisterForm onSuccess={() => setTab("login")} />}
      </section>
    </main>
  );
}