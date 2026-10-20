import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { User, KeyRound } from "lucide-react";
import InputField from "./InputField";
import { signIn } from "../api/auth";
import { loginSchema } from "../schemas/auth";
import type { LoginValues } from "../schemas/auth";
import { errMsg } from "../utils";

export default function LoginForm() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: "", password: "" },
  });

  const login = useMutation({
    mutationFn: async (v: LoginValues) => {
      const key = v.identifier.includes("@") ? "email" : "username";
      const res = await signIn({ [key]: v.identifier, password: v.password });
      const token = res.data?.token ?? res.token;
      if (!token) throw new Error("No token received from the server");
      return { token, user: res.data?.user ?? res.user };
    },
    onSuccess: ({ token, user }) => {
      qc.clear(); // drop any cached data from a previous account
      localStorage.setItem("token", token);
      if (user) localStorage.setItem("user", JSON.stringify(user));
      navigate("/");
    },
  });

  return (
    <form onSubmit={handleSubmit((v) => login.mutate(v))} className="space-y-4" noValidate>
      <div>
        <h2 className="text-3xl font-bold">Log in to Route Posts</h2>
        <p className="mt-1 text-slate-500">Log in and continue your social journey.</p>
      </div>

      <InputField icon={User} placeholder="Email or username"
        error={errors.identifier?.message} {...register("identifier")} />
      <InputField icon={KeyRound} type="password" placeholder="Password"
        error={errors.password?.message} {...register("password")} />

      {login.isError && <p className="text-sm text-red-600">{errMsg(login.error)}</p>}

      <button disabled={login.isPending}
        className="h-14 w-full rounded-xl bg-brand text-lg font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60">
        {login.isPending ? "Logging in..." : "Log In"}
      </button>

      <p className="text-center">
        <a href="#" className="text-brand hover:underline">Forgot password?</a>
      </p>
    </form>
  );
}