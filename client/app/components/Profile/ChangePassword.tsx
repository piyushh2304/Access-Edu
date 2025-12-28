import { styles } from "@/app/styles/styles";
import { useUpdatePasswordMutation } from "@/redux/features/user/userApi";
import React, { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import useSpeechOnHover from "../../hooks/useSpeechOnHover";

type Props = {};

const ChangePassword = (props: Props) => {
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [updatePassword, { isSuccess, error }] = useUpdatePasswordMutation();

    const headingRef = useSpeechOnHover<HTMLHeadingElement>("Change Password heading");
    const oldPasswordLabelRef = useSpeechOnHover<HTMLLabelElement>("Enter your old password");
    const oldPasswordInputRef = useSpeechOnHover<HTMLInputElement>("Old password input field");
    const newPasswordLabelRef = useSpeechOnHover<HTMLLabelElement>("Enter your new password");
    const newPasswordInputRef = useSpeechOnHover<HTMLInputElement>("New password input field");
    const confirmPasswordLabelRef = useSpeechOnHover<HTMLLabelElement>("Enter your confirm password");
    const confirmPasswordInputRef = useSpeechOnHover<HTMLInputElement>("Confirm password input field");
    const updateButtonRef = useSpeechOnHover<HTMLInputElement>("Update password button");

    const passwordChangeHandler = async (e: any) => {
        e.preventDefault();
        if (confirmPassword !== newPassword) {
            toast.error("Passwords do not match");
        } else {
            await updatePassword({ oldPassword, newPassword });
        }
    };

    useEffect(() => {
        if (isSuccess) {
            toast.success("Password changed successfully");
        }
        if (error) {
            if ("data" in error) {
                const errorData = error as any;
                toast.error(errorData.data.message);
            }
        }
    }, [isSuccess, error]);

    return (
        <div className="w-full pl-7 px-2 800px:px-5 800px:pl-0">
            <h1 ref={headingRef} tabIndex={0} className="block text-[25px] 800px:text-[30px] font-Poopins text-center font-[500] text-black dark:text-[#fff] pb-2">
                Change Password
            </h1>
            <div className="w-full">
                <form
                    onSubmit={passwordChangeHandler}
                    className="flex flex-col items-center"
                >
                    <div className="w-[100%] 800px:w-[60%] mt-5">
                        <label
                            ref={oldPasswordLabelRef}
                            tabIndex={0}
                            htmlFor="oldPassword"
                            className="block pb-2 text-black dark:text-[#fff]"
                        >
                            Enter your old password
                        </label>
                        <input
                            ref={oldPasswordInputRef}
                            id="oldPassword"
                            type="password"
                            className={`${styles.input} !w-[95%] mb-4 800px:mb-0 text-black dark:text-[#fff]`}
                            required
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                        />
                    </div>
                    <div className="w-[100%] 800px:w-[60%] mt-2">
                        <label
                            ref={newPasswordLabelRef}
                            tabIndex={0}
                            htmlFor="newPassword"
                            className="block pb-2 text-black dark:text-[#fff]"
                        >
                            Enter your new password
                        </label>
                        <input
                            ref={newPasswordInputRef}
                            id="newPassword"
                            type="password"
                            className={`${styles.input} !w-[95%] mb-4 800px:mb-0 text-black dark:text-[#fff]`}
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                    </div>
                    <div className="w-[100%] 800px:w-[60%] mt-2">
                        <label
                            ref={confirmPasswordLabelRef}
                            tabIndex={0}
                            htmlFor="confirmPassword"
                            className="block pb-2 text-black dark:text-[#fff]"
                        >
                            Enter your confirm password
                        </label>
                        <input
                            ref={confirmPasswordInputRef}
                            id="confirmPassword"
                            type="password"
                            className={`${styles.input} !w-[95%] mb-4 800px:mb-0 text-black dark:text-[#fff]`}
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <input
                            ref={updateButtonRef}
                            tabIndex={0}
                            type="submit"
                            className={`w-[95%] h-[40px] border border-[#37a39a] text-center text-black dark:text-[#fff] rounded-[3px] mt-8 cursor-pointer`}
                            required
                            value="Update"
                        />
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChangePassword;
