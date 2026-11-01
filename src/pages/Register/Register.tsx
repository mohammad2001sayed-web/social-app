import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar, Lock, Profile, Sms, User } from "iconsax-react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router";
import { ZodRegister, type RegisterDataForm } from "./rigester.validation";
import { sendUserRigister } from "./register.api";
import {
  AuthShell,
  NeuButton,
  NeuInput,
} from "../../components/AuthUI/AuthUI";

const TODAY = new Date().toISOString().split("T")[0];

export default function Register() {
  const navigate = useNavigate();

  const {
    handleSubmit,
    register,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<RegisterDataForm>({
    defaultValues: {
      name: "",
      username: "",
      email: "",
      dateOfBirth: "",
      gender: "" as "male" | "female",
      password: "",
      rePassword: "",
    },
    mode: "all",
    resolver: zodResolver(ZodRegister),
  });

  async function onSubmit(values: RegisterDataForm) {
    try {
      await toast.promise(sendUserRigister(values), {
        loading: "Creating your account...",
        success: (msg) => {
          reset();
          navigate("/login");
          return typeof msg === "string" ? msg : "Account created!";
        },
        error: (err: any) =>
          err?.response?.data?.message ||
          err?.message ||
          "Registration failed",
      });
    } catch {
      // الرسالة ظاهرة في الـ toast
    }
  }

  return (
    <AuthShell mode="register">
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="auth-stagger grid grid-cols-1 gap-5 sm:grid-cols-2"
      >
        <NeuInput
          label="Name"
          Icon={User}
          autoComplete="name"
          autoCapitalize="words"
          placeholder="Your name"
          error={errors.name?.message}
          {...register("name")}
        />

        <NeuInput
          label="Username"
          Icon={Profile}
          autoComplete="username"
          autoCapitalize="none"
          autoCorrect="off"
          placeholder="your_username"
          error={errors.username?.message}
          {...register("username")}
        />

        <NeuInput
          wrapperClassName="sm:col-span-2"
          label="Email"
          Icon={Sms}
          type="email"
          autoComplete="email"
          autoCapitalize="none"
          autoCorrect="off"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register("email")}
        />

        <NeuInput
          label="Password"
          Icon={Lock}
          type="password"
          autoComplete="new-password"
          placeholder="Create a password"
          error={errors.password?.message}
          {...register("password")}
        />

        <NeuInput
          label="Confirm password"
          Icon={Lock}
          type="password"
          autoComplete="new-password"
          placeholder="Repeat the password"
          error={errors.rePassword?.message}
          {...register("rePassword")}
        />

        <NeuInput
          label="Date of birth"
          Icon={Calendar}
          type="date"
          min="1970-01-01"
          max={TODAY}
          error={errors.dateOfBirth?.message}
          {...register("dateOfBirth")}
        />

        {/* الجندر: زرارين محفورين بدل القايمة */}
        <Controller
          name="gender"
          control={control}
          render={({ field, fieldState }) => (
            <fieldset className="min-w-0">
              <legend className="mb-1.5 ms-1 text-xs font-semibold text-(--mute)">
                Gender
              </legend>
              <div
                role="radiogroup"
                aria-label="Gender"
                aria-invalid={!!fieldState.error}
                onBlur={field.onBlur}
                className="neu-inset grid grid-cols-2 gap-1.5 rounded-2xl p-1.5"
              >
                {(["male", "female"] as const).map((g) => {
                  const active = field.value === g;
                  return (
                    <button
                      key={g}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => field.onChange(g)}
                      className={`h-9 cursor-pointer rounded-xl text-sm font-semibold capitalize transition-all duration-300 ${
                        active
                          ? "neu-raised-sm text-accent"
                          : "text-(--mute) hover:text-(--ink)"
                      }`}
                    >
                      {g}
                    </button>
                  );
                })}
              </div>
              {fieldState.error && (
                <p
                  role="alert"
                  className="mt-1.5 ms-1 text-xs font-medium text-red-600 dark:text-red-400"
                >
                  {fieldState.error.message}
                </p>
              )}
            </fieldset>
          )}
        />

        <NeuButton
          type="submit"
          loading={isSubmitting}
          className="sm:col-span-2"
        >
          Create account
        </NeuButton>

        <p className="text-center text-sm text-(--mute) sm:col-span-2">
          Already have an account?{" "}
          <Link
            to="/login"
            replace
            state={{ switched: true }}
            className="font-bold text-accent hover:underline"
          >
            Login
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}