import * as zod from "zod";

export const ZodRegister = zod
  .object({
    name: zod
      .string()
      .regex(/^[a-zA-Z\s]{3,20}$/, "Name must be 3-20 letters only"),
    username: zod
      .string()
      .regex(/^[a-zA-Z\s]{3,20}$/, "Username must be 3-20 letters only"),
    email: zod.email("Invalid email address"),

    dateOfBirth: zod.string().refine((value) => {
      if (!value) return false;
      const selectedDate = new Date(value);
      const today = new Date();
      let age = today.getFullYear() - selectedDate.getFullYear();
      const monthDiff = today.getMonth() - selectedDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < selectedDate.getDate())) {
        age--;
      }
      return age >= 18;
    }, "You must be at least 18 years old"),

    gender: zod.enum(["male", "female"]),

    // 👇 نفس الـ Regex بتاع السيرفر بالضبط + Special Character
    password: zod
      .string()
      .regex(
        /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
        "Password must have uppercase, lowercase, number and special character (#?!@$%^&*-)"
      ),
    rePassword: zod
      .string()
      .regex(
        /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
        "Password must have uppercase, lowercase, number and special character (#?!@$%^&*-)"
      ),
  })
  .refine(
    ({ password, rePassword }) => password === rePassword,
    {
      message: "Passwords do not match",
      path: ["rePassword"],
    }
  );

export type RegisterDataForm = zod.infer<typeof ZodRegister>;