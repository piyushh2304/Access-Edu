import React, { FC, useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  AiOutlineEye,
  AiOutlineEyeInvisible,
  AiFillGithub,
} from "react-icons/ai";
import { FcGoogle } from "react-icons/fc";
import { styles } from "../../../app/styles/styles";
import { useLoginMutation } from "@/redux/features/auth/authApi";
import toast from "react-hot-toast";
import { signIn } from "next-auth/react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import useSpeechOnHover from "../../hooks/useSpeechOnHover";
// import { useSpeech } from "../../SpeechProvider";

type Props = {
  setRoute: (route: string) => void;
  setOpen: (open: boolean) => void;
  refetch: any;
};

const schema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email!")
    .required("Please enter your email"),
  password: Yup.string().required("Please enter your password!").min(6),
});

const Login: FC<Props> = ({ setRoute, setOpen, refetch }) => {
  const [show, setShow] = useState(false);
  const [login, { isLoading, isSuccess, error }] = useLoginMutation();
  const { user: authUser } = useSelector((state: any) => state.auth);
  const router = useRouter();



  const headingRef = useSpeechOnHover<HTMLHeadingElement>('Login with AccessEdu');
  const emailLabelRef = useSpeechOnHover<HTMLLabelElement>('Enter your email');
  const emailInputRef = useSpeechOnHover<HTMLInputElement>('Email input field');
  const passwordLabelRef = useSpeechOnHover<HTMLLabelElement>('Enter your password');
  const passwordInputRef = useSpeechOnHover<HTMLInputElement>('Password input field');
  const togglePasswordVisibilityRef = useSpeechOnHover<HTMLDivElement>(show ? 'Hide password' : 'Show password');
  const loginButtonRef = useSpeechOnHover<HTMLInputElement>('Login button');
  const orJoinWithRef = useSpeechOnHover<HTMLHeadingElement>('Or join with');
  const googleSignInRef = useSpeechOnHover<HTMLDivElement>('Sign in with Google');
  const githubSignInRef = useSpeechOnHover<HTMLDivElement>('Sign in with GitHub');
  const notHaveAccountRef = useSpeechOnHover<HTMLHeadingElement>('Not have any account?');
  const signUpLinkRef = useSpeechOnHover<HTMLSpanElement>('Sign up link');

  useEffect(() => {
    if (error) {
      if ("data" in error) {
        const errorData = error as any;
        toast.error(errorData.data.message);
      }
    }
  }, [error]);

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: schema,
    onSubmit: async ({ email, password }) => {
      try {
        const res = await login({ email, password }).unwrap();
        console.log("✅ [DEBUG] Login response received:", res);
        toast.success("Login successfully");
        setOpen(false);
        
        const redirectPath = res.user.role === "admin" ? "/admin" : "/profile";
        console.log("🚀 [DEBUG] Redirecting to:", redirectPath);
        
        router.push(redirectPath);
        
        // Ensure the state is updated and the modal is closed
        setOpen(false);
        if (typeof refetch === "function") {
          refetch();
        }
      } catch (err: any) {
        const msg = err.data?.message || err.message || "Login failed";
        toast.error(msg);
      }
    },
  });



  const { errors, touched, values, handleChange, handleSubmit } = formik;

  return (
    <div className="w-full">
      <h1 ref={headingRef} tabIndex={0} className={`${styles.title}`}>Login With AccessEdu</h1>
      <form onSubmit={handleSubmit}>
        <label ref={emailLabelRef} tabIndex={0} className={`${styles.label}`} htmlFor="email">
          Enter your Email
        </label>
        <input
          ref={emailInputRef}
          type="email"
          name="email"
          value={values.email}
          onChange={handleChange}
          id="email"
          placeholder="loginmail@gmail.com"
          className={`${errors.email && touched.email && "border-red-500"} ${
            styles.input
          }`}
        />
        {errors.email && touched.email && (
          <span className="text-red-500 pt-3 block">{errors.email}</span>
        )}
        <div className="w-full mt-5 relative mb-1">
          <label ref={passwordLabelRef} tabIndex={0} className={`${styles.label}`} htmlFor="password">
            Enter your password
          </label>
          <input
            ref={passwordInputRef}
            type={!show ? "password" : "text"}
            name="password"
            value={values.password}
            onChange={handleChange}
            id="password"
            placeholder="password!@"
            className={`${
              errors.password && touched.password && "border-red-500"
            } ${styles.input}`}
          />
          <div ref={togglePasswordVisibilityRef} tabIndex={0} onClick={() => setShow(!show)} className="absolute bottom-3 right-2 z-1 cursor-pointer">
            {!show ? (
              <AiOutlineEyeInvisible
                className="text-black dark:text-white"
                size={20}
              />
            ) : (
              <AiOutlineEye
                className="text-black dark:text-white"
                size={20}
              />
            )}
          </div>
        </div>
        {errors.password && touched.password && (
          <span className="text-red-500 pt-3 block">{errors.password}</span>
        )}
        <div className="w-full mt-5">
          <input 
            ref={loginButtonRef} 
            type="submit" 
            value={isLoading ? "Logging in..." : "Login"} 
            disabled={isLoading}
            className={`${styles.button} ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`} 
          />
        </div>
        <br />
        <h5 ref={orJoinWithRef} tabIndex={0} className="text-center pt-4 font-Poppins text-[14px] text-black dark:text-white">
          Or join with
        </h5>
        <div className="flex items-center justify-center my-3">
          <div 
            ref={googleSignInRef}
            tabIndex={0}
            className="cursor-pointer mr-2"
            onClick={() => signIn("google")}
          >
            <FcGoogle size={30} />
          </div>
          <div 
            ref={githubSignInRef}
            tabIndex={0}
            className="cursor-pointer ml-2"
            onClick={() => signIn("github")}
          >
            <AiFillGithub size={30} />
          </div>
        </div>
        <h5 ref={notHaveAccountRef} tabIndex={0} className="text-center pt-4 font-Poppins text-[14px]">
          Not have any account?
          <span
            ref={signUpLinkRef}
            tabIndex={0}
            className="text-[#2190ff] pl-1 cursor-pointer"
            onClick={() => setRoute("Sign-Up")}
          >
            Sign up
          </span>
        </h5>
      </form>
      <br />
    </div>
  );
};

export default Login;
