import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Sms } from "iconsax-react";
import { useContext } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router";
import { ZodLogin, type LoginDataForm } from "./Login.validation";
import { sendUserLogin } from "./login.api";
import { AuthContext } from "../../context/CounterContext/AuthContext/AuthContext";
import {
  AuthShell,
  NeuButton,
  NeuInput,
} from "../../components/AuthUI/AuthUI";

export default function Login() {
  const { getUserData, setuserData, setUserToken } = useContext(AuthContext);
  const navigate = useNavigate();

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LoginDataForm>({
    defaultValues: { email: "", password: "" },
    mode: "all",
    resolver: zodResolver(ZodLogin),
  });

  async function onSubmit(values: LoginDataForm) {
    try {
      await toast.promise(sendUserLogin(values), {
        loading: "Signing you in...",
        success: (x) => {
          const token = x.data.token || x.data.data?.token || "";

          // نحفظ التوكن ونحدّث الـ state فورًا عشان النافبار يتحدث
          localStorage.setItem("tkn", token);
          setUserToken(token);

          getUserData().then((data) => setuserData(data));

          reset();
          navigate("/post");
          return x.data.message || "Welcome back!";
        },
        error: (err: any) =>
          err?.response?.data?.message || err?.message || "Login failed",
      });
    } catch {
      // الرسالة ظاهرة في الـ toast
    }
  }

  return (
    <AuthShell mode="login">
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="auth-stagger flex flex-col gap-5"
      >
        <NeuInput
          label="Email"
          Icon={Sms}
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register("email")}
        />

        <NeuInput
          label="Password"
          Icon={Lock}
          type="password"
          autoComplete="current-password"
          placeholder="Your password"
          error={errors.password?.message}
          {...register("password")}
        />

        <NeuButton type="submit" loading={isSubmitting}>
          Login
        </NeuButton>

        <p className="text-center text-sm text-(--mute)">
          New to Circle?{" "}
          <Link
            to="/register"
            replace
            state={{ switched: true }}
            className="font-bold text-accent hover:underline"
          >
            Create an account
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}