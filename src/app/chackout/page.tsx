"use client";
import React, { useEffect, useRef } from "react";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../redux";
import { Form, Input, Checkbox, Select } from "antd";
import Button from "../(components)/Button";
import { SubmitHandler, FieldValues } from "react-hook-form";
import { useForm } from "antd/es/form/Form";
import useHandleCartquantity from "../hooks/useHandleCartQuantity";
import {
  CreditCard,
  MapPin,
  UserRound,
  Truck,
  Ticket,
  MoveRight,
  X,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Check,
} from "lucide-react";
import axios from "axios";
import { Product, ShippingAddress } from "../types/globalStateTypes";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { setIsCartItemUnauthentificated } from "@/redux/globalSlice";

function Chackout() {
  const [isInfo, setIsInfo] = useState<boolean>(true);
  const user = useAppSelector((state) => state.user.user);
  const { handleCartQuantity } = useHandleCartquantity();
  const router = useRouter();
  const [form] = useForm();
  const { TextArea } = Input;
  const [toFinish, setToFinish] = useState(false);

  const [chackoutInfo, setChackoutInfo] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phoneNumber: user?.phoneNumber || null,
  });
  const [isAddShoppingAddress, setisAddShoppingAddress] =
    useState<boolean>(false);
  const [shippingAddress, setshippingAddress] = useState<ShippingAddress[]>([]);
  const dispatch = useAppDispatch();

  const cart = useAppSelector(
    (state) => state.global.isCartItemUnauthentificated
  );

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

  const addShippingAddress: SubmitHandler<FieldValues> = async (data) => {
    const { postalCode, city, address, name } = data;
    try {
      if (postalCode.length !== 4) {
        form.setFields([
          {
            name: "postalCode",
            errors: ["საფოსტო კოდი უნდა შედგებეოდეს 4 სიმბოლოსაგან!"],
          },
        ]);
        return;
      }
      await axios.post("/api/shippingaddress", {
        userId: user?.id,
        name: name,
        city: city,
        address: address,
        postalCode: postalCode,
        country: "Georgia",
      });
      await getShippingAddress();
      setisAddShoppingAddress(false);
      console.log("address added  succesfuly!");
    } catch (error) {
      console.log(error);
    }
  };

  const getShippingAddress = async () => {
    const resp = await axios.get("/api/shippingaddress");
    setshippingAddress(resp.data);
    setChosenShipingAddress(resp.data[0]);
  };

  useEffect(() => {
    getShippingAddress();
  }, []);

  const [chosenShipingAddress, setChosenShipingAddress] =
    useState<ShippingAddress | null>();

  const shippingTime = [
    { day: "დღეს", time: "19:00 - 22:00" },
    { day: "დღეს", time: "22:00 - 01:00" },
    { day: "ხვალ", time: "09:00 - 12:00" },
    { day: "ხვალ", time: "12:00 - 15:00" },
    { day: "ხვალ", time: "15:00 - 19:00" },
  ];

  const [chosenTime, setChosenTime] = useState({
    day: shippingTime[0].day,
    time: shippingTime[0].time,
  });
  const handleCheckboxChange = (time: string) => {
    if (chosenTime.time === time) {
      return;
    }

    setChosenTime({
      day: shippingTime.find((item) => item.time === time)?.day || "",
      time,
    });
  };

  const handleFinish = () => {
    if (chosenTime && cart?.length !== 0) {
      setToFinish(true);
    } else {
      toast.warning(
        "გთხოვთ დაამატოთ მიტანის დრო და დაამატოთ პროდუქტები კალათაში"
      );
    }
  };
  const [saveCard, setSaveCard] = useState(true);

  const [couponError, setCouponError] = useState<boolean>(false);
  const [couponValue, setCouponValue] = useState("");

  const handleCupon = () => {
    const timeOut = setTimeout(() => {
      setCouponError(true);
    }, 1000);
    return () => clearTimeout(timeOut);
  };

  const [isSale, setIsSale] = useState<boolean>(false);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const modalRef = useRef<HTMLDivElement | null>(null);

  const closeModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isModalOpen]);

  const handleClickOutside = (e: any) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      closeModal();
    }
  };
  useEffect(() => {
    if (isModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isModalOpen]);

  const [success, setSuccess] = useState<boolean>(false);

  const handleModalSubmit: SubmitHandler<FieldValues> = async (data) => {
    try {
      await axios.post("/api/orders", {
        userId: user?.id,
        cartItems: cart,
        shippingAddress: chosenShipingAddress,
        paymentMethod: "CREDIT_CARD",
      });

      await axios.delete("/api/cart", {
        data: {
          deleteAll: true,
        },
      });
      dispatch(setIsCartItemUnauthentificated([]));
      setSuccess(true);
    } catch (error) {
      console.log(error);
    } finally {
      const timeOut = setTimeout(() => {
        setSuccess(false);
      }, 1000);
      // router.push("/");
      return () => clearTimeout(timeOut);
    }
  };

  const [value, setValue] = useState("");
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;

    inputValue = inputValue.replace(/\D/g, "");

    if (inputValue.length >= 3) {
      inputValue = inputValue.slice(0, 2) + "/" + inputValue.slice(2, 4);
    }

    if (inputValue.length > 5) {
      inputValue = inputValue.slice(0, 5);
    }

    setValue(inputValue);
  };

  return (
    <div className="pb-12">
      <div className="flex items-center text-gray-800 text-sm gap-2">
        <p
          onClick={() => {
            setIsInfo(true), setToFinish(false), setisAddShoppingAddress(false);
          }}
          className={`${isInfo && "text-black font-semibold"} cursor-pointer`}
        >
          საკონტაქტო ინფორმაცია
        </p>
        <p>{">"}</p>
        <p
          onClick={() => {
            setisAddShoppingAddress(true), setIsInfo(false), setToFinish(false);
          }}
          className={`${
            !isInfo && !toFinish && "text-black font-semibold"
          } cursor-pointer`}
        >
          მიტანა
        </p>
        {toFinish && (
          <div className="flex items-center gap-2">
            <p>{">"}</p>
            <p
              onClick={() => {
                setToFinish(true),
                  setisAddShoppingAddress(false),
                  setIsInfo(false);
              }}
              className="text-black font-semibold cursor-pointer"
            >
              გადახდა
            </p>
          </div>
        )}
      </div>
      <div className="md:flex items-center gap-12">
        {toFinish ? (
          <div className="flex flex-col w-full gap-4">
            <div className="border flex justify-between md:flex-col md:self-start rounded-xl w-full mt-12 p-4">
              <div className=" md:flex  justify-evenly space-y-4 md:space-y-0">
                <div className="flex items-center gap-1">
                  <UserRound />
                  <h1 className="font-semibold text-xl">მიმღები</h1>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin />
                  <h1 className="font-semibold text-xl">მისამართი</h1>
                </div>
                <div className="flex items-center gap-1">
                  <Truck />
                  <h1 className="font-semibold text-xl">მიწოდება</h1>
                </div>
              </div>
              <hr className="my-4 hidden md:block" />
              <div className="space-y-7 md:space-y-0 md:flex text-sm text-gray-400 justify-evenly">
                <p>
                  {user?.name}, {user?.phoneNumber}
                </p>
                <p>
                  {chosenShipingAddress?.city}, {chosenShipingAddress?.address}
                </p>
                <p>
                  {chosenTime.day}, {chosenTime?.time}
                </p>
              </div>
            </div>
            {cart?.length !== 0 && (
              <div className="border flex flex-col self-start rounded-xl w-full p-4">
                <div className="flex justify-between">
                  <h1 className="text-xl font-semibold">კალათა</h1>
                  <p
                    onClick={() => router.push("/cart")}
                    className="text-gray-400 cursor-pointer transition duration-300 hover:text-gray-500"
                  >
                    დეტალურად {">"}
                  </p>
                </div>
                <div>
                  {cart?.map((item: Product, index: number) => (
                    <div key={item.id} className="relative">
                      <img
                        className="h-20 w-20 object-contain"
                        src={item.images[0].url}
                        alt="image"
                      />
                      <p className="w-8 h-8 absolute left-20 bottom-4 items-center justify-center rounded-full bg-gray-800 inline-flex text-white">
                        {item.quantity}
                      </p>
                      {index !== cart.length - 1 && <hr className="my-2" />}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="border flex flex-col self-start rounded-xl w-full p-4">
              <div className="flex justify-between">
                <h1 className="text-xl font-semibold">
                  ახალი ბარათის დამატება
                </h1>
                <div
                  onClick={() => setSaveCard(!saveCard)}
                  className="flex gap-1"
                >
                  <p className="text-gray-400 cursor-pointer transition duration-300 hover:text-gray-500">
                    ბარათის დამახსოვრება
                  </p>
                  <Checkbox checked={saveCard} />
                </div>
              </div>
              <div className="mt-4 border flex items-center justify-between rounded-xl w-full p-2">
                <div className="flex items-center gap-2">
                  <div className="bg-gray-200 rounded-lg  p-2 inline-flex items-center">
                    <CreditCard className="size-8" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h1 className="font-semibold">ყველა ბანკის ბარათი</h1>
                    <p className="text-sm text-gray-400">VISA / MASTERCARD</p>
                  </div>
                </div>
                <Checkbox checked />
              </div>
            </div>
          </div>
        ) : (
          <>
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
                        onChange={(e) =>
                          handleInputValues("name", e.target.value)
                        }
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
                  {!isAddShoppingAddress ? (
                    <>
                      <div className="border hover:text-gray-800 cursor-pointer flex justify-between items-center rounded-lg p-4 w-full">
                        {!chosenShipingAddress ? (
                          <div
                            className="flex justify-between w-full items-center"
                            onClick={() => setisAddShoppingAddress(true)}
                          >
                            <div className="flex items-center gap-4">
                              <MapPin className="bg-gray-400 p-2 size-12 rounded-lg" />
                              <div>
                                <h1 className="font-semibold">მისამართი</h1>
                                <p className="text-gray-600">
                                  დაამატე ახალი მისამართი
                                </p>
                              </div>
                            </div>
                            <h1 className="text-2xl">{">"}</h1>
                          </div>
                        ) : (
                          <>
                            <div
                              onClick={() => setisAddShoppingAddress(true)}
                              className="flex items-center gap-4"
                            >
                              <MapPin className="bg-gray-400 p-2 size-12 rounded-lg" />
                              <div>
                                <h1 className="font-semibold">
                                  {chosenShipingAddress.address}
                                </h1>
                                <p className="text-gray-600">
                                  {chosenShipingAddress.city}
                                </p>
                              </div>
                            </div>
                            <h1 className="text-2xl">{">"}</h1>
                          </>
                        )}
                      </div>
                      <div>
                        {shippingAddress && shippingAddress.length !== 0 && (
                          <div>
                            <h1 className="font-semibold text-2xl">
                              აირჩიე მიტანის დრო
                            </h1>
                            <div className="my-4 grid md:grid-cols-3 gap-4">
                              {shippingTime.map((item) => (
                                <div
                                  key={item.time}
                                  className="bg-gray-200 flex items-center justify-between p-4 rounded-lg"
                                >
                                  <div className="flex items-center gap-1">
                                    <p className="font-semibold">{item.day}:</p>
                                    <p>
                                      <span>{item.time}</span>
                                    </p>
                                  </div>
                                  <Checkbox
                                    checked={chosenTime.time === item.time} // Check if this time is selected
                                    onChange={() =>
                                      handleCheckboxChange(item.time)
                                    }
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <div>
                            <h1 className="font-semibold">
                              უკონტაქტო მიწოდება
                            </h1>
                            <p className="text-sm mt-2">
                              მონიშნე, თუ გსურს, შეკვეთა კართან, ტელეფონზე და
                              კარის ზარის დარეკვის გარეშე დაგიტოვოთ
                            </p>
                          </div>
                          <Checkbox />
                        </div>
                      </div>
                      <div>
                        <TextArea className="max-h-40" />
                      </div>
                      {!chosenTime ? (
                        <>
                          <Button
                            className="bg-black text-white p-4 w-44 font-semibold rounded-lg hover:bg-gray-900 duration-300 transition"
                            type="submit"
                          >
                            დაამატე მისამართი
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            onClick={handleFinish}
                            className="bg-black text-white p-4 w-44 font-semibold rounded-lg hover:bg-gray-900 duration-300 transition"
                          >
                            შემდეგი
                          </Button>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <h1 className="font-semibold">მისამართის დამატება</h1>{" "}
                      {shippingAddress && shippingAddress.length !== 0 && (
                        <Select
                          defaultValue={shippingAddress[0].address || ""}
                          className="border rounded-lg h-16"
                          onChange={(id: string) => {
                            const selectedAddress = shippingAddress.find(
                              (item) => item.id === parseInt(id)
                            );
                            setChosenShipingAddress(selectedAddress);
                          }}
                        >
                          {shippingAddress?.map((item: ShippingAddress) => (
                            <Select.Option key={item.id} value={item.id}>
                              <div className="flex my-2 items-center gap-4">
                                <MapPin className="bg-gray-400 p-2 size-12 rounded-lg" />
                                <div>
                                  <h1 className="font-semibold">
                                    {item.address}
                                  </h1>
                                  <p className="text-gray-600">{item.city}</p>
                                </div>
                              </div>
                            </Select.Option>
                          ))}
                        </Select>
                      )}
                      <Form form={form} onFinish={addShippingAddress}>
                        <Form.Item name="address">
                          <div className="relative">
                            <Input
                              name="address"
                              className="peer font-semibold rounded-lg pt-5 outline-none bg-gray-50 hover:bg-gray-50 focus:outline-none placeholder-transparent w-full"
                              required
                              type="text"
                            />
                            <label className="absolute pointer-events-none left-3 top-1 text-gray-600  text-sm transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400">
                              შეიყვანე მისამართი*
                            </label>
                          </div>
                        </Form.Item>
                        <Form.Item name="city">
                          <div className="relative">
                            <Input
                              name="city"
                              className="peer font-semibold rounded-lg pt-5 outline-none bg-gray-50 hover:bg-gray-50 focus:outline-none placeholder-transparent w-full"
                              required
                              type="text"
                            />
                            <label className="absolute pointer-events-none left-3 top-1 text-gray-600  text-sm transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400">
                              ქალაქი*
                            </label>
                          </div>
                        </Form.Item>
                        <Form.Item name="postalCode">
                          <div className="relative">
                            <Input
                              name="საფოსტო კოდი"
                              className="peer font-semibold rounded-lg pt-5 outline-none bg-gray-50 hover:bg-gray-50 focus:outline-none placeholder-transparent w-full"
                              required
                              maxLength={4}
                              type="number"
                            />
                            <label className="absolute pointer-events-none left-3 top-1 text-gray-600  text-sm transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400">
                              საფოსტო კოდი*
                            </label>
                          </div>
                        </Form.Item>
                        <Form.Item name="name">
                          <div className="relative">
                            <Input
                              name="name"
                              className="peer font-semibold rounded-lg pt-5 outline-none bg-gray-50 hover:bg-gray-50 focus:outline-none placeholder-transparent w-full"
                              required
                              type="text"
                            />
                            <label className="absolute pointer-events-none left-3 top-1 text-gray-600  text-sm transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400">
                              დაარქვი სახელი მისამართს (მაგ: სამსახური)*
                            </label>
                          </div>
                        </Form.Item>
                        <TextArea
                          className="max-h-40"
                          placeholder="შეიყვანე დამატებითი ინფორმაცია"
                        />
                        <div className="flex gap-2 items-center">
                          <Button
                            className="bg-black mt-12 text-white p-4 w-50 font-semibold rounded-lg hover:bg-gray-900 duration-300 transition"
                            type="submit"
                          >
                            მისამართის დამახსოვრება
                          </Button>
                          <Button
                            onClick={() => setisAddShoppingAddress(false)}
                            className="bg-black mt-12 text-white p-4 w-50 font-semibold rounded-lg hover:bg-gray-900 duration-300 transition"
                          >
                            გაუქმება
                          </Button>
                        </div>
                      </Form>
                    </>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        <div className="border mt-12 rounded-xl p-4 flex flex-col self-start gap-4 w-full md:w-3/6">
          <h1 className="text-2xl font-semibold">კალათა</h1>
          <div className="flex flex-col gap-4 text-sm">
            <div className="flex justify-between items-center">
              <p>პროდუქტები ({handleCartQuantity() || 0})</p>
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
          {toFinish && (
            <div className="flex flex-col gap-4">
              {couponError && (
                <div className="mb-4 bg-yellow-100 border border-yellow-300 bg-opacity-50 rounded-xl p-3 py-4 text-sm flex items-center justify-center">
                  <span className="mr-2 bg-yellow-300  w-6 h-6 text-white  flex items-center justify-center rounded-full">
                    !
                  </span>
                  Coupon not found
                </div>
              )}
              <div className="relative flex items-center justify-end">
                <Input
                  value={couponValue}
                  onChange={(e) => {
                    setCouponValue(e.target.value), setCouponError(false);
                  }}
                  className="bg-green-100 border-none p-4 placeholder-green-500 text-sm font-semibold"
                  placeholder="გამოიყენე ვაუჩერი"
                />
                {!couponValue ? (
                  <Ticket className="absolute right-4 size-8 fill-green-500 text-green-300" />
                ) : (
                  <div className="absolute right-4 group flex items-center ">
                    <X
                      onClick={() => {
                        setCouponValue(""), setCouponError(false);
                      }}
                      className="size-4 cursor-pointer mr-4"
                    />
                    <div
                      onClick={handleCupon}
                      className="relative cursor-pointer "
                    >
                      <MoveRight className="right-4 size-8 h-9 w-9 p-2 rounded-full bg-green-300 hover:bg- text-black" />
                      <div className="absolute pointer-events-none inset-0 bg-white/10 w-full h-full translate-x-full opacity-0 group-hover:opacity-100 group-hover:animate-light-move"></div>
                    </div>
                  </div>
                )}
              </div>
              <Button
                onClick={() => setIsModalOpen(true)}
                className="bg-green-300 text-black p-4 font-semibold rounded-lg hover:bg-green-400 duration-300 transition"
              >
                გადახდა
              </Button>
              <div>
                {isModalOpen && (
                  <>
                    <div
                      onClick={closeModal}
                      className="fixed inset-0 bg-black opacity-50 z-40"
                    ></div>
                    <div className="fixed inset-0 flex items-center px-2 md:px-0 justify-center z-50">
                      <div
                        ref={modalRef}
                        className="bg-white flex flex-col gap-4 p-4 md:w-2/5 rounded-lg shadow-lg"
                      >
                        <div className="flex justify-between">
                          <h2 className="text-xl font-semibold">გადახდა</h2>
                          <X
                            onClick={closeModal}
                            className="size-5 cursor-pointer"
                          />
                        </div>
                        <div className="border p-2 w-full flex rounded-lg justify-between">
                          <p className="text-gray-500">თანხა:</p>
                          <p>{handleTotalPrice()} GEL</p>
                        </div>
                        <div className="border p-2 w-full rounded-lg">
                          <h1 className="py-4">გადაიხადე ბარათით</h1>
                          <Form onFinish={handleModalSubmit}>
                            <Form.Item name="cardNumber">
                              <div className="relative w-full">
                                <Input
                                  name="cardNumber"
                                  className="peer font-semibold rounded-lg pt-5 outline-none bg-gray-50 hover:bg-gray-50 focus:outline-none placeholder-transparent w-full"
                                  required
                                  maxLength={16}
                                  type="number"
                                />
                                <label className="absolute pointer-events-none left-3 top-1 text-gray-500  text-sm transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400">
                                  ბარათის ნომერი
                                </label>
                              </div>
                            </Form.Item>
                            <div className="flex w-full gap-4">
                              <Form.Item name="validity" className="w-full">
                                <div className="relative w-full">
                                  <Input
                                    value={value}
                                    onChange={handleChange}
                                    name="validity"
                                    maxLength={5}
                                    className="peer font-semibold rounded-lg pt-5 outline-none bg-gray-50 hover:bg-gray-50 focus:outline-none placeholder-transparent w-full"
                                    required
                                    type="text"
                                  />
                                  <label className="absolute pointer-events-none left-3 top-1 text-gray-500  text-sm transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400">
                                    მოქმედების ვადა
                                  </label>
                                </div>
                              </Form.Item>
                              <Form.Item name="CVC" className="w-full">
                                <div className="relative w-full">
                                  <Input
                                    name="CVC"
                                    className="peer font-semibold rounded-lg pt-5 outline-none bg-gray-50 hover:bg-gray-50 focus:outline-none placeholder-transparent w-full"
                                    required
                                    maxLength={3}
                                    type="number"
                                  />
                                  <label className="absolute pointer-events-none left-3 top-1 text-gray-500  text-sm transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400">
                                    CVC / CVV
                                  </label>
                                </div>
                              </Form.Item>
                            </div>
                            {success && (
                              <div className="flex items-center justify-center gap-2">
                                <Check className="w-8 bg-green-500 h-8 p-1 rounded-full" />
                                <p className="font-semibold text-lg">
                                  გადახდა წარმატებით შესრულდა
                                </p>
                              </div>
                            )}

                            <Button
                              type="submit"
                              className="bg-black mt-4 text-white w-full p-4 font-semibold rounded-lg  duration-300 transition"
                            >
                              გადახდა
                            </Button>
                          </Form>
                        </div>
                        <hr />
                        <div>
                          <div className="flex justify-center items-center gap-8">
                            <img src="DCC.png" alt="icon" />
                            <img src="visa.png" alt="icon" />
                            <img src="mastercard.png" alt="icon" />
                          </div>
                          <div className="flex justify-center mt-4 items-center gap-2">
                            <ShieldCheck className="fill-green-500 text-green-400" />{" "}
                            <p className="flex text-gray-600 text-sm gap-2">
                              ვერიფიცირებულია{" "}
                              <span className="font-semibold text-black">
                                თიბისი ბანკისაგან
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
              <Button
                onClick={() => setIsSale(!isSale)}
                className="relative bg-gray-300 flex  justify-center items-center gap-2  text-black p-4 font-semibold rounded-lg hover:bg-gray-400 duration-300 transition"
              >
                <p>განვადება</p>
                {isSale ? (
                  <ChevronUp className="absolute right-4" />
                ) : (
                  <ChevronDown className="absolute right-4" />
                )}
              </Button>
              <div
                className={`flex flex-col gap-4  ${
                  isSale
                    ? "opacity-100 transition duration-300"
                    : "opacity-0 transition duration-300"
                }`}
              >
                <div
                  className={`bg-gray-200 ${
                    isSale ? "flex" : "hidden"
                  }  hover:bg-gray-300 cursor-pointer transition duration-300 p-1 flex items-center gap-2 px-4 rounded-full`}
                >
                  <img className="size-8" src="/TBC.png" alt="icon" />
                  <div className="flex items-center justify-center gap-2 w-full">
                    <p className="font-semibold text-lg">თიბისი</p>
                    <span>| 6-12 თვემდე 0%-დან</span>
                  </div>
                  <MoveRight className="text-blue-500" />
                </div>
                <div
                  className={`bg-gray-200 ${
                    isSale ? "flex" : "hidden"
                  }  hover:bg-gray-300 cursor-pointer transition duration-300 p-1 flex items-center gap-2 px-4 rounded-full`}
                >
                  <img className="size-8" src="/BOG.png" alt="icon" />
                  <p className="font-semibold text-lg text-center w-full">
                    საქართველოს ბანკი
                  </p>
                  <MoveRight className="text-orange-500" />
                </div>
              </div>
              <div className="flex  items-center justify-center gap-4">
                <hr className="w-full" />
                <p>ან</p>
                <hr className="w-full" />
              </div>
              <div className="ring-1 hover:bg-gray-100 cursor-pointer transition duration-300 rounded-lg ring-black p-4 flex justify-center items-center gap-2">
                <img className="size-8" src="/BOG.png" alt="icon" />|
                <p className="text-lg text-purple-700">ნაწილ-ნაწილ გადახდა</p>
              </div>
              <div className="ring-1 hover:bg-gray-100 cursor-pointer transition duration-300 rounded-lg ring-black p-4 flex justify-center items-center gap-2">
                <img className="size-8" src="/TBC.png" alt="icon" />|
                <p className="text-lg text-gray-500">გაანაწილე თანხა</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Chackout;
