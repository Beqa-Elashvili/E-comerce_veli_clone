"use client";
import React, { useEffect } from "react";
import { useState } from "react";
import { useAppSelector } from "../redux";
import { Form, Input, Checkbox } from "antd";
import form from "antd/es/form";
import { HashLoader } from "react-spinners";
import Button from "../(components)/Button";
import { SubmitHandler, FieldValues } from "react-hook-form";
import { useForm } from "antd/es/form/Form";
import useHandleQuantityIncart from "../hooks/useHandleQuantityInCart";
import useHandleCartquantity from "../hooks/useHandleCartQuantity";
import { MapPin } from "lucide-react";

function Chackout() {
  const [isInfo, setIsInfo] = useState<boolean>(true);
  const user = useAppSelector((state) => state.user.user);
  const [form] = useForm();
  const { TextArea } = Input;

  const [chackoutInfo, setChackoutInfo] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phoneNumber: user?.phoneNumber || null,
  });

  const { handleTotalPrice } = useHandleCartquantity();

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    const { phoneNumber, name, email } = data;
    try {
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
            errors: ["ნომერი უნდა შედგებოდეს 9 რიცხვისაგან!"],
          },
        ]);
        return;
      }
      setIsInfo(false);
    } catch (error: any) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        name: user?.name || "",
        email: user?.email || "",
        phoneNumber: user?.phoneNumber || "",
      });
      setChackoutInfo({
        name: user?.name || "",
        email: user?.email || "",
        phoneNumber: user?.phoneNumber || "",
      });
    }
  }, [user, form]);

  const handleInputValues = (key: string, value: string) => {
    setChackoutInfo((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div>
      <div className="flex items-center text-gray-800 text-sm gap-2">
        <p className={`${isInfo && "text-black"}`}>საკონტაქტო ინფორმაცია</p>
        <p>{">"}</p>
        <p className={`${!isInfo && "text-black"}`}>მიტანა</p>
      </div>
      <div className="flex gap-12">
        <div className="border mt-12 rounded-xl p-4 w-full">
          {isInfo ? (
            <Form
              initialValues={chackoutInfo}
              form={form}
              onFinish={onSubmit}
              className="flex flex-col gap-"
            >
              <Form.Item
                name="name"
                className="relative"
                rules={[
                  {
                    required: true,
                    message: "გთხოვთ შეიყვანოთ სახელი, გვარი!",
                  },
                ]}
              >
                <div className="relative">
                  <Input
                    name="name"
                    className="peer font-semibold rounded-lg pt-5 outline-none bg-gray-50 hover:bg-gray-50 focus:outline-none placeholder-transparent w-full"
                    required
                    type="text"
                    value={chackoutInfo?.name || ""}
                    onChange={(e) => handleInputValues("name", e.target.value)}
                  />
                  <label className="absolute pointer-events-none left-3 top-1 text-green-600  text-sm transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400">
                    სახელი, გვარი *
                  </label>
                </div>
              </Form.Item>
              <div className="flex gap-4 w-full">
                <Form.Item
                  className="w-full"
                  name="email"
                  rules={[
                    {
                      required: true,
                      message: "გთხოვთ შეიყვანოთ თქვენი მეილი!",
                    },
                  ]}
                >
                  <div className="relative">
                    <Input
                      name="email"
                      className="peer font-semibold rounded-lg pt-5 outline-none bg-gray-50 hover:bg-gray-50 focus:outline-none placeholder-transparent w-full"
                      required
                      value={chackoutInfo?.email || ""}
                      onChange={(e) =>
                        handleInputValues("email", e.target.value)
                      }
                      type="text"
                    />
                    <label className="absolute pointer-events-none left-3 top-1 text-gray-600  text-sm transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400">
                      მეილი*
                    </label>
                  </div>
                </Form.Item>
                <Form.Item
                  className="w-full"
                  name="phoneNumber"
                  labelAlign="right"
                  rules={[
                    {
                      required: true,
                      message: "გთხოვთ შეიყვანოთ მობილურის ნომერი!",
                    },
                  ]}
                >
                  <div className="relative">
                    <Input
                      name="phoneNumber"
                      className="peer font-semibold rounded-lg pt-5 outline-none bg-gray-50 hover:bg-gray-50 focus:outline-none placeholder-transparent w-full"
                      required
                      value={chackoutInfo?.phoneNumber || ""}
                      onChange={(e) =>
                        handleInputValues("phoneNumber", e.target.value)
                      }
                      maxLength={9}
                      type="number"
                    />
                    <label className="absolute pointer-events-none left-3 top-1 text-gray-600  text-sm transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400">
                      მობილურის ნომერი*
                    </label>
                  </div>
                </Form.Item>
              </div>
              <Button
                className="bg-black text-white p-4 w-28 font-semibold rounded-lg hover:bg-gray-900 duration-300 transition"
                type="submit"
              >
                შემდეგი
              </Button>
            </Form>
          ) : (
            <div className="flex flex-col gap-12">
              <div className="border hover:text-gray-800 cursor-pointer flex justify-between items-center rounded-lg p-4 w-full">
                <div className="flex items-center gap-4">
                  <MapPin className="bg-gray-400 p-2 size-12 rounded-lg" />
                  <div>
                    <h1 className="font-semibold">მისამართი</h1>
                    <p className="text-gray-600">დაამატე ახალი მისამართი</p>
                  </div>
                </div>
                <h1 className="text-2xl">{">"}</h1>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="font-semibold">უკონტაქტო მიწოდება</h1>
                  <p className="text-sm mt-2">
                    მონიშნე, თუ გსურს, შეკვეთა კართან, ტელეფონზე და კარის ზარის
                    დარეკვის გარეშე დაგიტოვოთ
                  </p>
                </div>
                <Checkbox />
              </div>
              <div>
                <TextArea className="max-h-40" />
              </div>
              <Button
                className="bg-black text-white p-4 w-44 font-semibold rounded-lg hover:bg-gray-900 duration-300 transition"
                type="submit"
              >
                დაამატე მისამართი
              </Button>
            </div>
          )}
        </div>

        <div className="border mt-12 rounded-xl p-4 flex flex-col gap-4 w-3/6">
          <h1 className="text-2xl font-semibold">კალათა</h1>
          <div className="flex flex-col gap-4 text-sm">
            <div className="flex justify-between items-center">
              <p>პროდუქტები</p>
              <p>{handleTotalPrice()}₾</p>
            </div>
            <div className="flex justify-between items-center">
              <p>მიტანის საფასური</p>
              <p>0.00 ₾</p>
            </div>
          </div>
          <hr />
          <div className="flex items-center font-semibold justify-between">
            <h1>ჯამური ღირებულება</h1>
            <h1>{handleTotalPrice()} ₾</h1>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chackout;
