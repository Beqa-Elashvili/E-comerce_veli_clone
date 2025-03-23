"use client";

import React, { useEffect, useState } from "react";
import Button from "@/app/(components)/Button";
import { Eye, EyeOff, X } from "lucide-react";
import { FieldValues, SubmitHandler } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "@/app/redux";
import { setIsRegisterForm } from "@/redux/globalSlice";
import axios from "axios";
import { Form, Input } from "antd";
import { toast } from "react-toastify";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import useGetUser from "@/app/actions/getUser";
import { HashLoader } from "react-spinners";
import useGetCartItems from "@/app/hooks/getCartItems";
import { setIsAuthModalOpen } from "@/redux/globalSlice";

function Register() {
  const [showPassword, setShowPassword] = useState({
    password: false,
    repeatPassword: false,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const { status } = useSession();

  const { getUser } = useGetUser();
  const { GetCart } = useGetCartItems();

  useEffect(() => {
    if (status === "authenticated") {
      dispatch(setIsAuthModalOpen(false));
    }
  }, [status]);

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
        setLoading(true);
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
                toast.success("Logged in!");
                router.push("/");
                await axios.post("/api/cart", {
                  userId: user.id,
                  product,
                });
                await GetCart();
                localStorage.removeItem("cart");
                console.log("პროდუქტები დაემატა კალათაში");
              }
            }
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
    <div className="w-full  min-h-screen flex flex-col items-center justify-center">
      <div className="border relative bg-white py-12 mx-4 px-4 z-30  mt-0 lg:mt-12 w-full md:w-2/3 lg:w-2/5 m-auto shadow-custom-light rounded-lg flex flex-col items-center justify-center h-full">
        <div
          onClick={() => dispatch(setIsAuthModalOpen(false))}
          className="bg-white cursor-pointer z-50 w-8 h-8 rounded-full flex items-center justify-center absolute -top-9 right-2"
        >
          <X />
        </div>
        {!isRegisterForm ? (
          <h1 className="text-3xl font-bold mb-8">გაიარე ავტორიზაცია</h1>
        ) : (
          <h1 className="text-3xl font-bold mb-8">შექმენი ანგარიში</h1>
        )}
        <div className="font-bold   text-md m-auto  md:text-xl flex items-center justify-between gap-8">
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
                    maxLength={9}
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
                className="bg-black text-white flex gap-2 justify-center  text-center font-semibold w-full focus:outline-none ring-1 rounded-md px-2 py-4 hover:ring-cyan-600  focus:ring-2 duration-300 transition"
                type="submit"
              >
                ანგარიშის შექმნა
                <HashLoader color="#2c80bc" size={24} loading={loading} />
              </Button>
            ) : (
              <Button
                className="bg-black text-white  flex gap-2 justify-center  text-center font-semibold w-full focus:outline-none ring-1 rounded-md px-2 py-4 hover:ring-cyan-600  focus:ring-2 duration-300 transition"
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
