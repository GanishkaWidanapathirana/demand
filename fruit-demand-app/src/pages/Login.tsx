// src/pages/Login.tsx

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const schema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type FormData = z.infer<typeof schema>;

export default function Login() {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const { message } = await res.json();
        throw new Error(message || "Login failed");
      }

      const result = await res.json();
      localStorage.setItem("authToken", result.access_token); // adjust based on your backend
      //localStorage.setItem("authToken", "result.token");
      navigate("/dashboard");
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 space-y-5"
      >
        <h1 className="text-3xl font-bold text-center text-purple-800">Fruitlytics Tool</h1>
        <p className="text-center text-gray-500">Sign in to your account</p>

        <div>
          <input
            {...register("email")}
            type="email"
            placeholder="Email"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:outline-none"
          />
          {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <input
            {...register("password")}
            type="password"
            placeholder="Password"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:outline-none"
          />
          {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>}
        </div>

        {errorMessage && <p className="text-sm text-red-600 text-center">{errorMessage}</p>}

        <button
          type="submit"
          className="w-full py-2 bg-gradient-to-r from-emerald-500 to-blue-500 rounded text-white hover:from-emerald-400 hover:to-blue-400 transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
          Login
        </button>
      </form>
    </div>
  );
}
