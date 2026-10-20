import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { User, AtSign, Users, Calendar, KeyRound } from "lucide-react";
import InputField from "./InputField";
import { signUp } from "../api/auth";
import { registerSchema } from "../schemas/auth";
import type { RegisterValues } from "../schemas/auth";
import { errMsg } from "../utils";

type Props = { onSuccess: () => void };

export default function RegisterForm({ onSuccess }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "", username: "", email: "", gender: "",
      dateOfBirth: "", password: "", rePassword: "",
    },
  });

  const signup = useMutation({
    mutationFn: (v: RegisterValues) => {
      const { username, ...rest } = v;
      return signUp(username ? v : rest); // username is optional
    },
    onSuccess,
  });

  return (
    <form onSubmit={handleSubmit((v) => signup.mutate(v))} className="space-y-4" noValidate>
      <div>
        <h2 className="text-3xl font-bold">Create a new account</h2>
        <p className="mt-1 text-slate-500">It is quick and easy.</p>
      </div>

      <InputField icon={User} placeholder="Full name"
        error={errors.name?.message} {...register("name")} />
      <InputField icon={AtSign} placeholder="Username (optional)"
        error={errors.username?.message} {...register("username")} />
      <InputField icon={AtSign} type="email" placeholder="Email address"
        error={errors.email?.message} {...register("email")} />

      <InputField icon={Users} error={errors.gender?.message}>
        <select {...register("gender")}
          className="h-14 w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-4 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20">
          <option value="">Select gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
      </InputField>

      <InputField icon={Calendar} type="date"
        error={errors.dateOfBirth?.message} {...register("dateOfBirth")} />
      <InputField icon={KeyRound} type="password" placeholder="Password"
        error={errors.password?.message} {...register("password")} />
      <InputField icon={KeyRound} type="password" placeholder="Confirm password"
        error={errors.rePassword?.message} {...register("rePassword")} />

      {signup.isError && <p className="text-sm text-red-600">{errMsg(signup.error)}</p>}

      <button disabled={signup.isPending}
        className="h-14 w-full rounded-xl bg-brand text-lg font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60">
        {signup.isPending ? "Creating..." : "Create New Account"}
      </button>
    </form>
  );
}