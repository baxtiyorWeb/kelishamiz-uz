import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, Eye, EyeClosed, Loader } from "lucide-react";
import api from "../../../config/auth/api";
import { useGenerateUuid } from "../../../hooks/services/useGenerateuuid.js";
import useAuthStore from "../../../store/index.js";

export const LoginComponent = () => {
  const { login, isAuthenticated } = useAuthStore();
  const [params, setParams] = useSearchParams();
  const [signIn, setSignIn] = useState({
    username: "",
    password: "",
  });

  const navigate = useNavigate();
  const [isLoading, setisLoading] = useState(false);
  const [inputType, setInputType] = useState("text");
  const [phone, setPhone] = useState("");
  const { generateUuid } = useGenerateUuid();

  const toggle = params.get("auth") || "login";
  const loginParams = () => {
    setParams({ auth: "login" });
  };
  const registerParams = () => {
    setParams({ auth: "register" });
  };

  const loginNameAndPassword = async (e) => {
    e.preventDefault();
    try {
      setisLoading(true);
      await login({ username: signIn.username, password: signIn.password });
    } catch (error) {
      console.log(error);
    } finally {
      setisLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const registerPhoneOrPhone = async () => {
    const generateUId = generateUuid();

    try {
      setisLoading(true);
      const data = await api.post(`/authority/register-by-phone`, null, {
        params: { phone: phone },
        headers: {
          secretKey: generateUId,
        },
        xsrfCookieName: "XSRF-TOKEN",
      });
      setPhone("");
      navigate("/auth/confirm");
      localStorage.setItem("secretKey", generateUId);
    } catch (error) {
    } finally {
      setisLoading(false);
    }
  };

  return (
    <div className="flex w-full flex-col items-center ">
      <div className="flex h-20 items-center justify-center">
        <button
          className="mx-10 h-12 w-[200px]  border-b border-bgColor hover:bg-bgColor hover:text-whiteTextColor"
          onClick={() => loginParams()}
        >
          login
        </button>
        <button
          className="mx-10 h-12 w-[200px]  border-b border-bgColor hover:bg-bgColor hover:text-whiteTextColor"
          onClick={() => registerParams()}
        >
          register
        </button>
      </div>
      {toggle === "login" ? (
        <form
          onSubmit={loginNameAndPassword}
          className="flex h-[580px] w-[80%] flex-col items-center justify-center "
        >
          <h1 className="mb-5 mt-3 text-center text-2xl">Profilga kirish</h1>
          <div className=" flex w-full flex-col items-start justify-center ">
            <span className="mb-1 w-auto text-left">loginingizni kiriting</span>
            <input
              type="text"
              placeholder="login"
              className="mb-3 mt-3 h-14  w-full rounded-[5px_!important] p-3  text-xl outline-none"
              onChange={(e) =>
                setSignIn({ ...signIn, username: e.target.value })
              }
            />
          </div>
          <div className="relative flex w-full flex-col items-start justify-center ">
            <span className="mb-1 w-auto text-left ">
              parolingizni kiriting
            </span>
            <input
              type={inputType ? "password" : "text"}
              placeholder="password"
              className="mt-3 h-14  w-full rounded-[5px_!important] p-3  text-xl outline-none"
              onChange={(e) =>
                setSignIn({ ...signIn, password: e.target.value })
              }
            />
            <span
              className="absolute bottom-5 right-5 cursor-pointer"
              onClick={() => setInputType(!inputType)}
            >
              {inputType ? (
                <Eye className="text-lg" />
              ) : (
                <EyeClosed className="text-lg" />
              )}
            </span>
          </div>

          <div className="send-details w-full">
            <button
              disabled={
                signIn.username != "" && signIn.password != "" ? false : true
              }
              className="mb-5 mt-5 h-[50px] flex justify-center items-center w-full rounded-md bg-btnColor text-white hover:text-[#fff] disabled:cursor-not-allowed disabled:bg-btnColor/60"
              type={"submit"}
            >
              {isLoading ? (
                <Loader className="animate-spin" />
              ) : (
                <span className="flex items-center justify-center">
                  Kirish <ArrowRight className="mx-3" />
                </span>
              )}
            </button>
          </div>
          <span>yoki</span>

          <div className="w-full">
            <button className="mb-1 mt-3 flex h-[50px] w-full items-center justify-start rounded-md border border-borderColor bg-whiteTextColor px-5 text-textColor disabled:cursor-not-allowed disabled:bg-bgColor/60">
              Google
              <span className="m-auto">Google orqali kirish</span>
            </button>
          </div>
          <div className="w-full">
            <button className="mb-1 mt-3 flex h-[50px] w-full items-center justify-start rounded-md border border-borderColor bg-whiteTextColor px-5 text-textColor disabled:cursor-not-allowed disabled:bg-bgColor/60">
              telegram
              <span className="m-auto">Google orqali kirish</span>
            </button>
          </div>
          <Link to={"/auth/register"} className="my-3 w-full text-end">
            <span className="cursor-pointer text-sky-500 hover:underline">
              ro&apos;yxatdan o&apos;tish
            </span>
          </Link>
        </form>
      ) : (
        <div
          className={`flex h-[580px] w-[80%] flex-col items-center justify-center  transition-all duration-100 ${
            toggle === "register" ? "opacity-100 " : "opacity-0 "
          } `}
        >
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
              <input
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
              <button
                disabled={phone.length === 9 ? false : true}
                onClick={() => registerPhoneOrPhone()}
                className="mb-5 mt-5 h-[50px] w-full rounded-md bg-bgColor text-textDarkColor hover:text-[#fff] disabled:cursor-not-allowed disabled:bg-bgColor/60"
              >
                {isLoading ? "loading ... " : "Davom etish"}
              </button>
            </div>

            <span> yoki </span>

            <hr className="my-1 w-full" />
            <span className="my-3">
              ijtmoiy tarmoqlar orqali ro&apos;yxatdan o&apos;ting
            </span>

            <div className="w-full">
              <button className="mb-1 mt-3 flex h-[50px] w-full items-center justify-start rounded-md border border-borderColor bg-whiteTextColor px-5 text-textColor disabled:cursor-not-allowed disabled:bg-bgColor/60">
                telegram
                <span className="m-auto">
                  Telegram orqali ro&apos;yxatdan o&apos;tish
                </span>
              </button>
            </div>
            <div className="w-full">
              <button className="mb-1 mt-3 flex h-[50px] w-full items-center justify-start rounded-md border border-borderColor bg-whiteTextColor px-5 text-textColor disabled:cursor-not-allowed disabled:bg-bgColor/60">
                Google
                <span className="m-auto">
                  Google orqali ro&apos;yxatdan o&apos;tish
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
