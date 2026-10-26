import {
  Button,
  Form,
  Input,
  Label,
  TextField,
  Select,
  ListBox,
  Spinner,
} from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check } from "iconsax-react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";

import { ZodRegister, type RegisterDataForm } from "./rigester.validation";
import { sendUserRigister } from "./register.api";
import { useNavigate } from "react-router";

export default function Register() {
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

  const navigator = useNavigate();

  async function SayHello(userData: RegisterDataForm) {
    console.log("Form Data:", userData);
    toast.promise(sendUserRigister(userData), {
      loading: "wait wait...",
      success: function (x) {
        reset();
        navigator("/Login");
        return <h1 className="text-emerald-500 capitalize">{x}</h1>;
      },
      error: function () {
        return <h1 className="text-red-600 capitalize">erorr data</h1>;
      },
    });
  }

  return (
    <div className=" dark:from-emerald-900 dark:to-slate-400       flex justify-center py-30 items-center min-h-screen bg-linear-to-r from-blue-500 to-purple-600">
      <Form
        onSubmit={handleSubmit(SayHello)}
        className="dark:bg-black dark:text-blue-300  flex lg:min-w-2xl bg-white shadow-2xl p-10 rounded-xl flex-col gap-4"
      >
        <h1 className="text-center text-2xl font-bold">Register</h1>

        {/* name Input */}
        {/* name Input */}
        <TextField isRequired type="text" isInvalid={!!errors.name}>
          <Label>name</Label>
          <Input
            {...register("name")}
            autoComplete="name"
            autoCorrect="off"
            autoCapitalize="words"
            placeholder="Enter your name"
          />
          {errors.name && (
            <span className="text-red-500 text-sm mt-1">
              {errors.name.message}
            </span>
          )}
        </TextField>

        {/* username Input */}
        <TextField isRequired type="text" isInvalid={!!errors.username}>
          <Label>username</Label>
          <Input
            {...register("username")}
            autoComplete="username"
            autoCorrect="off"
            autoCapitalize="none"
            placeholder="Enter your username"
          />
          {/* 👇 كان ناقص */}
          {errors.username && (
            <span className="text-red-500 text-sm mt-1">
              {errors.username.message}
            </span>
          )}
        </TextField>

        {/* email Input */}
        <TextField isRequired type="email" isInvalid={!!errors.email}>
          <Label>email</Label>
          <Input
            {...register("email")}
            autoComplete="email"
            autoCapitalize="none"
            autoCorrect="off"
            placeholder="Enter your email"
          />
          {errors.email && (
            <span className="text-red-500 text-sm mt-1">
              {errors.email.message}
            </span>
          )}
        </TextField>

        {/* password Input */}
        <TextField isRequired type="password" isInvalid={!!errors.password}>
          <Label>password</Label>
          <Input
            {...register("password")}
            autoComplete="new-password"
            autoCapitalize="none"
            autoCorrect="off"
            placeholder="Enter your password"
          />
          {/* 👇 كان ناقص */}
          {errors.password && (
            <span className="text-red-500 text-sm mt-1">
              {errors.password.message}
            </span>
          )}
        </TextField>

        {/* confirm password Input */}
        <TextField isRequired type="password" isInvalid={!!errors.rePassword}>
          <Label>Confirm Password</Label>
          <Input
            {...register("rePassword")}
            autoComplete="new-password"
            autoCapitalize="none"
            autoCorrect="off"
            placeholder="Confirm your password"
          />
          {errors.rePassword && (
            <span className="text-red-500 text-sm mt-1">
              {errors.rePassword.message}
            </span>
          )}
        </TextField>

        <Controller
          name="dateOfBirth"
          control={control}
          render={({ field, fieldState }) => (
            <TextField isRequired isInvalid={!!fieldState.error} type="date">
              <Label>Date of Birth</Label>
              <Input
                {...field}
                type="date"
                max={new Date().toISOString().split("T")[0]} // 👈 لا يسمح بتاريخ في المستقبل
                min="1970-01-01" // 👈 لا يسمح بتاريخ قديم جداً
                placeholder="Enter your date of birth"
              />
              {fieldState.error && (
                <span className="text-red-500 text-sm mt-1">
                  {fieldState.error.message}
                </span>
              )}
            </TextField>
          )}
        />
        <Controller
          name="gender"
          control={control}
          render={({ field, fieldState }) => (
            <Select
              placeholder="Select your gender"
              isInvalid={!!fieldState.error}
              // 👇 بدل {...field} اللي بيسبب المشكلة
              selectedKey={field.value}
              onSelectionChange={(key) => field.onChange(String(key))}
              onBlur={field.onBlur}
            >
              <Label>Gender</Label>
              <Select.Trigger>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox>
                  <ListBox.Item id="male" textValue="Male">
                    Male
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                  <ListBox.Item id="female" textValue="Female">
                    Female
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                </ListBox>
              </Select.Popover>
              {fieldState.error && (
                <span className="text-red-500 text-sm mt-1">
                  {fieldState.error.message}
                </span>
              )}
            </Select>
          )}
        />
        <div className="flex flex-col gap-2">
          <Button
            className={`w-full text-2xl  bg-emerald-950 text-emerald-400 border border-emerald-400 border-b-4 font-medium overflow-hidden relative px-4 py-2 rounded-md hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75`}
            type="submit"
            isPending={isSubmitting}
          >
            {isSubmitting ? (
              <Spinner color="current" size="lg" />
            ) : (
              <>
                <Check size="24" color="#f0ff" variant="Linear" /> Submit
              </>
            )}
          </Button>
          <Button className={`w-full text-red-500 text-2xl `} type="reset">
            Reset
          </Button>
        </div>
      </Form>
    </div>
  );
}
