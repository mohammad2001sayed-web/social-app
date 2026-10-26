import axios from "axios";
import type { RigisterResponse } from "./register.interface";
import type { RegisterDataForm } from "./rigester.validation";

export async function sendUserRigister(userData: RegisterDataForm) {
  // ✅ بنبعت كل البيانات بما فيها rePassword لأن السيرفر محتاجها
  try {
    const res = await axios.post<RigisterResponse>(
      `${import.meta.env.VITE_BASE_URL}/users/signup`,
      userData,
    );
    return res.data.message;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Something went wrong"
      );
    }
    throw new Error("Something went wrong");
  }
}