import { Input } from "antd";
import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ButtonUI from "../../ui/button/Button";
import SpinLoading from "../../ui/loading/spinLoading";
import useGenerateuuid from "./../../hooks/useGenerateuuid";
export default function RegisterComponent() {
  const { generateuiid } = useGenerateuuid();
  const [phone, setPhone] = useState("");

  const [isLoading, setisLoading] = useState(false);
  const navigate = useNavigate();
  const registerPhoneOrPhone = async () => {
    // Cookie-larni olish
    const generateUId = generateuiid();

    try {
      setisLoading(true);
      const data = await axios.post(
        `http://95.130.227.131:8080/api/v1/authority/register-by-phone`,
        null,
        {
          params: { phone: phone },
          headers: {
            accept: "*/*",
            authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            "content-type": "application/json",
            secretKey: generateUId,
          },
          xsrfCookieName: "XSRF-TOKEN",
        },
      );

      setPhone("");
      navigate("/auth/confirm");
      localStorage.setItem("secretKey", generateUId);
    } catch (error) {
      error.message;
    } finally {
      setisLoading(false);
    }
  };

  return (
    <div className="flex h-[80%] w-[80%] flex-col items-center justify-center ">
      <h1 className="mb-5 mt-3 text-center text-2xl">
        Ro&apos;yxatdan o&apos;tish
      </h1>
      <div></div>
      <div className=" mt-10 flex h-full w-full flex-col items-center justify-center ">
        <span className="mb-3 w-full  text-left">
          telefon raqamingizni kiriting
        </span>
        <div className="relative flex w-full flex-col items-start justify-center ">
          <span
            className={`absolute left-0 top-[27px] z-10 text-xl ${
              phone.length > 0
                ? `${phone.length >= 10 ? "text-red-500 " : ""}`
                : "text-[#BFBFBF]"
            }`}
          >
            +998
          </span>
          <Input
            type="number"
            placeholder="99 999 99 99"
            onChange={(e) => setPhone(e.target.value)}
            maxLength={9}
            value={phone}
            className="mb-3 mt-3 h-14 w-full  rounded-[5px_!important] p-3 indent-10  text-xl outline-none"
          />
        </div>
        {phone.length >= 10 ? (
          <span className="text-red-300">
            telefon raqam no&apos;to&apos;g&apos;ri kiritildi
          </span>
        ) : (
          ""
        )}
        <div className="send-details w-full">
          <ButtonUI
            disabled={phone.length === 9 ? false : true}
            onClick={() => registerPhoneOrPhone()}
            className="mb-5 mt-5 h-[50px] w-full rounded-md bg-bgColor text-white hover:text-[#fff] disabled:cursor-not-allowed disabled:bg-bgColor/60"
          >
            {isLoading ? <SpinLoading /> : "Davom etish"}
          </ButtonUI>
        </div>

        <span> yoki </span>

        <hr className="my-1 w-full" />
        <span className="my-3">
          ijtmoiy tarmoqlar orqali ro&apos;yxatdan o&apos;ting
        </span>

        <div className="w-full">
          <ButtonUI className="mb-1 mt-3 flex h-[50px] w-full items-center justify-start rounded-md border border-borderColor bg-whiteTextColor px-5 text-textColor disabled:cursor-not-allowed disabled:bg-bgColor/60">
            telegram
            <span className="m-auto">
              Telegram orqali ro&apos;yxatdan o&apos;tish
            </span>
          </ButtonUI>
        </div>
        <div className="w-full">
          <ButtonUI className="mb-1 mt-3 flex h-[50px] w-full items-center justify-start rounded-md border border-borderColor bg-whiteTextColor px-5 text-textColor disabled:cursor-not-allowed disabled:bg-bgColor/60">
            google
            <span className="m-auto">
              Google orqali ro&apos;yxatdan o&apos;tish
            </span>
          </ButtonUI>
        </div>
      </div>
    </div>
  );
}
