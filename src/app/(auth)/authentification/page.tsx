"use client";

import React, { useState } from "react";
import Button from "@/app/(components)/Button";
import { Eye, EyeOff } from "lucide-react";
import { FieldValues, SubmitHandler } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "@/app/redux";
import { setIsRegisterForm } from "@/redux/globalSlice";
import axios from "axios";
import { Form, Input } from "antd";
import { toast } from "react-toastify";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import useGetUser from "@/app/actions/getUser";
import { HashLoader } from "react-spinners";
import useGetCartItems from "@/app/hooks/getCartItems";

function Register() {
  const [showPassword, setShowPassword] = useState({
    password: false,
    repeatPassword: false,
  });
  const [loading, setLoading] = useState<boolean>(false);

  const { getUser } = useGetUser();
  const { GetCart } = useGetCartItems();

  const [form] = Form.useForm();

  const router = useRouter();
  const cartItems =
    useAppSelector((state) => state.global.isCartItemUnauthentificated) || [];

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    const { phoneNumber, password, repeatPassword, email } = data;

    try {
      setLoading(true);
      if (isRegisterForm) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
          form.setFields([
            {
              name: "email",
              errors: ["გთხოვთ შეიყვანოთ ვალიდური მეილი!"],
            },
          ]);
          return;
        }
        if (phoneNumber.length !== 9) {
          form.setFields([
            {
              name: "phoneNumber",
              errors: ["ნომერი უნდა შედგებოდეს 9 რიცხვისაგან"],
            },
          ]);
          return;
        }
        if (password !== repeatPassword) {
          form.setFields([
            {
              name: "repeatPassword",
              errors: ["შეყვანილი პაროლები არ ემთხვევა ერთმანეთს!"],
            },
          ]);
          return;
        }

        await axios.post("/api/register", {
          name: data.name,
          email: data.email,
          password: data.password,
          phoneNumber: data.phoneNumber,
        });

        toast.success("თქვენ წარმატებით დარეგისტრირდით!");
        dispatch(setIsRegisterForm(false));
      } else {
        signIn("credentials", {
          ...data,
          redirect: false,
        }).then(async (callback) => {
          if (callback?.error) {
            form.setFields([
              {
                name: "password",
                errors: ["იმეილი ან პაროლი არასწორია!"],
              },
            ]);
            return;
          }
          if (callback?.ok && !callback?.error) {
            const user = await getUser();
            if (user) {
              if (cartItems.length !== 0) {
                const product = cartItems.map((item) => ({
                  productId: item.id,
                  quantity: item.quantity,
                  selectedColor: item.selectedColor,
                  selectedSize: item.selectedSize,
                }));
                await axios.post("/api/cart", {
                  userId: user.id,
                  product,
                });
                await GetCart();
                localStorage.removeItem("cart");
                console.log("პროდუქტები დაემატა კალათაში");
              }
            }
            toast.success("Logged in!");
            router.push("/");
          }
        });
      }
      setLoading(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field: "password" | "repeatPassword") => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const dispatch = useAppDispatch();
  const isRegisterForm = useAppSelector((state) => state.global.isRegisterForm);

  const toggleIsRegisterForm = (value: string) => {
    if (value === "LOGIN") {
      dispatch(setIsRegisterForm(false));
    } else {
      dispatch(setIsRegisterForm(true));
    }
  };

  return (
    <div className=" w-full h-full flex items-center justify-center">
      <div className="border bg-white py-12 mx-4 px-4 z-30 mt-12 w-full md:w-2/3 lg:w-1/2 m-auto shadow-custom-light rounded-lg flex flex-col items-center justify-center h-full">
        <div className="font-bold   text-md  w-4/6  md:text-2xl flex items-center justify-between gap-8">
          <div
            onClick={() => toggleIsRegisterForm("LOGIN")}
            className={`${
              !isRegisterForm ? "text-black" : "text-gray-500"
            }  w-5/6 text-center cursor-pointer`}
          >
            <h1>ავტორიზაცია</h1>
            <hr className="mt-2" />
          </div>
          <div className="h-8 w-px  bg-gray-200" />
          <div
            onClick={() => toggleIsRegisterForm("")}
            className={`${
              isRegisterForm ? "text-black" : "text-gray-500"
            }  w-5/6 text-center cursor-pointer`}
          >
            <h1>რეგისტრაცია</h1>
            <hr className="mt-2" />
          </div>
        </div>
        <div className="w-full mt-4">
          <Form form={form} onFinish={onSubmit} className="flex flex-col gap-">
            {isRegisterForm ? (
              <>
                <Form.Item
                  name="name"
                  rules={[
                    {
                      required: true,
                      message: "გთხოვთ შეიყვანოთ სახელი, გვარი!",
                    },
                  ]}
                >
                  <Input
                    name="name"
                    className="py-2"
                    required
                    type="text"
                    placeholder="სახელი, გვარი"
                  />
                </Form.Item>
                <Form.Item
                  name="email"
                  rules={[
                    { required: true, message: "გთხოვთ შეიყვანოთ მეილი!" },
                  ]}
                >
                  <Input
                    name="email"
                    className="py-2"
                    required
                    placeholder="მეილი"
                    type="text"
                  />
                </Form.Item>
                <Form.Item
                  name="phoneNumber"
                  rules={[
                    {
                      required: true,
                      message: "გთხოვთ შეიყვანოთ მობილურის ნომერი!",
                    },
                  ]}
                >
                  <Input
                    name="phoneNumber"
                    className="py-2"
                    required
                    placeholder="მობილურის ნომერი"
                    type="number"
                  />
                </Form.Item>
                <Form.Item
                  name="password"
                  rules={[
                    { required: true, message: "გთხოვთ შეიყვანოთ პაროლი!" },
                  ]}
                >
                  <div className="relative flex items-center">
                    <div className="w-full">
                      <Input
                        className="py-2"
                        name="password"
                        placeholder="პაროლი"
                        type={showPassword.password ? "text" : "password"}
                      />
                    </div>
                    <span
                      onClick={() => togglePasswordVisibility("password")}
                      className="text-gray-500 absolute right-2 cursor-pointer"
                    >
                      {showPassword.password ? <EyeOff /> : <Eye />}
                    </span>
                  </div>
                </Form.Item>
                <Form.Item
                  name="repeatPassword"
                  rules={[
                    { required: true, message: "გთხოვთ გაიმეოროთ პაროლი!" },
                  ]}
                >
                  <div className="relative flex items-center">
                    <div className="w-full">
                      <Input
                        className="py-2"
                        name="repeatPassword"
                        placeholder="გაიმეორე პაროლი"
                        type={showPassword.repeatPassword ? "text" : "password"}
                      />
                    </div>
                    <span
                      onClick={() => togglePasswordVisibility("repeatPassword")}
                      className="text-gray-500 absolute right-2 cursor-pointer"
                    >
                      {showPassword.repeatPassword ? <EyeOff /> : <Eye />}
                    </span>
                  </div>
                </Form.Item>
              </>
            ) : (
              <>
                <Form.Item
                  name="email"
                  rules={[
                    { required: true, message: "გთხოვთ შეიყვანოთ მეილი!" },
                  ]}
                >
                  <Input
                    name="email"
                    required
                    className="py-2"
                    placeholder="მეილი"
                    type="text"
                  />
                </Form.Item>
                <Form.Item
                  name="password"
                  rules={[
                    { required: true, message: "გხოვთ შეიყვანოთ პაროლი!" },
                  ]}
                >
                  <div className="relative flex items-center">
                    <div className="w-full">
                      <Input
                        name="password"
                        className="py-2"
                        placeholder="პაროლი"
                        type={showPassword.password ? "text" : "password"}
                      />
                    </div>
                    <span
                      onClick={() => togglePasswordVisibility("password")}
                      className="text-gray-500 absolute right-2 cursor-pointer"
                    >
                      {showPassword.password ? <EyeOff /> : <Eye />}
                    </span>
                  </div>
                </Form.Item>
              </>
            )}
            <hr className="mb-4" />
            {isRegisterForm ? (
              <Button
                className="bg-cyan-500 flex gap-2 justify-center  text-center font-semibold w-full focus:outline-none ring-1 rounded-md px-2 py-2 hover:ring-cyan-600  focus:ring-2 duration-300 transition"
                type="submit"
              >
                ანგარიშის შექმნა
                <HashLoader color="#2c80bc" size={24} loading={loading} />
              </Button>
            ) : (
              <Button
                className="bg-cyan-500 flex gap-2 justify-center  text-center font-semibold w-full focus:outline-none ring-1 rounded-md px-2 py-2 hover:ring-cyan-600  focus:ring-2 duration-300 transition"
                type="submit"
              >
                შესვლა
                <HashLoader color="#2c80bc" size={24} loading={loading} />
              </Button>
            )}
          </Form>
        </div>
      </div>
    </div>
  );
}

export default Register;
