import React, { useState } from "react";
import OTPInput from "react-otp-input";
import api from "../../config/api/api";
import ButtonUI from "../../ui/button/Button";
import SpinLoading from "../../ui/loading/spinLoading";

const Confirm = ({ setOpen }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState("");

  const confimCodeSMS = async () => {
    setIsLoading(true);
    try {
      const secretKey = localStorage.getItem("secretKey");
      const confirmCode = await api.post("/authority/code-confirm", null, {
        params: { code: confirm },
        headers: {
          secretKey: secretKey,
        },
      });
      if (confirmCode.status === 200) {
        setConfirm("");
        setOpen(true);
      }
    } catch (error) {
      setError(error.response?.data.errorResponse.message);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <div className="w-full">
        <h1 className="mb-3 ml-12 w-full"> 4 talik sms kodni kiriting</h1>
      </div>
      <div className="flex items-center justify-center rounded-md">
        <OTPInput
          value={confirm}
          onChange={setConfirm}
          numInputs={4}
          renderSeparator={<span>{"-"}</span>}
          renderInput={(props) => <input {...props} />}
          containerStyle={{
            margin: "0 auto",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
          inputStyle={{
            width: 50,
            height: 50,
            borderRadius: 5,
            outlineColor: "teal",
            userSelect: "none",
            msTouchSelect: "none",
            fontSize: "20px",
            border: "1px solid green",
          }}
        />
      </div>
      <span className="my-3 text-errorTextColor">{error}</span>
      <ButtonUI
        disabled={(confirm.length === 0 < true) === confirm.length >= 4}
        className=" mt-5 h-[50px] w-[328px] rounded-md bg-btnColor text-whiteTextColor disabled:cursor-not-allowed disabled:bg-disableBtnColor"
        onClick={confimCodeSMS}
      >
        {isLoading ? <SpinLoading /> : "Davom etish"}
      </ButtonUI>
      {error.errorResponse}
    </div>
  );
};

export default Confirm;
