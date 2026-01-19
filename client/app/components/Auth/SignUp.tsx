import React, { FC, useEffect, useState } from 'react'
import { useFormik } from 'formik'
import * as Yup from "yup"
import { AiOutlineEye, AiOutlineEyeInvisible, AiFillGithub } from "react-icons/ai"
import { FcGoogle } from "react-icons/fc"
import { styles } from '../../../app/styles/styles'
import { useRegisterMutation, useActivationMutation, useLoginMutation } from '@/redux/features/auth/authApi'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { signIn } from "next-auth/react";
import useSpeechOnHover from "../../hooks/useSpeechOnHover"
// import { useSpeech } from "../../SpeechProvider"
// import { VoiceAuthIndicator } from "./VoiceAuthIndicator"
// import { useVoiceAuth } from "../../hooks/useVoiceAuth"

type Props = {
    setRoute: (route: string) => void;
    setOpen: (open: boolean) => void;
    refetch?: any;
}

const schema = Yup.object().shape({
    name: Yup.string().required("Please enter your name!"),
    email: Yup.string().email("Invalid email!").required("Please enter your email"),
    password: Yup.string().required("Please enter your password!").min(6),
    role: Yup.string().oneOf(["user", "admin"], "Role must be either user or admin").required("Please select a role")
})

const SignUp: FC<Props> = ({ setRoute, setOpen, refetch }) => {
    const [show, setShow] = useState(false)
    const [register, { isLoading: isRegisterLoading, error }] = useRegisterMutation()
    const [activation, { isLoading: isActivationLoading }] = useActivationMutation()
    const [login, { isLoading: isLoginLoading }] = useLoginMutation()
    const router = useRouter()
    


    const headingRef = useSpeechOnHover<HTMLHeadingElement>('Join to AccessEdu');
    const nameLabelRef = useSpeechOnHover<HTMLLabelElement>('Enter your name');
    const nameInputRef = useSpeechOnHover<HTMLInputElement>('Name input field');
    const emailLabelRef = useSpeechOnHover<HTMLLabelElement>('Enter your email');
    const emailInputRef = useSpeechOnHover<HTMLInputElement>('Email input field');
    const passwordLabelRef = useSpeechOnHover<HTMLLabelElement>('Enter your password');
    const passwordInputRef = useSpeechOnHover<HTMLInputElement>('Password input field');
    const togglePasswordVisibilityRef = useSpeechOnHover<HTMLDivElement>(show ? 'Hide password' : 'Show password');
    const roleLabelRef = useSpeechOnHover<HTMLLabelElement>('Select your role');
    const roleSelectRef = useSpeechOnHover<HTMLSelectElement>('Role selection dropdown');
    const signUpButtonRef = useSpeechOnHover<HTMLInputElement>('Sign Up button');
    const orJoinWithRef = useSpeechOnHover<HTMLHeadingElement>('Or join with');
    const googleSignInRef = useSpeechOnHover<HTMLDivElement>('Sign in with Google');
    const githubSignInRef = useSpeechOnHover<HTMLDivElement>('Sign in with GitHub');
    const alreadyHaveAccountRef = useSpeechOnHover<HTMLHeadingElement>('Already have an account?');
    const signInLinkRef = useSpeechOnHover<HTMLSpanElement>('Sign in link');

    useEffect(() => {
        if (error) {
            if ("data" in error) {
                const errorData = error as any
                toast.error(errorData.data.message)
            }
        }
    }, [error])

    const formik = useFormik({
        initialValues: { name: "", email: "", password: "", role: "user" }
        , validationSchema: schema
        , onSubmit: async ({ name, email, password, role }) => {
            console.log("🚀 [DEBUG] SignUp onSubmit started", { name, email, role });
            try {
                // Add a warning if it takes too long (likely SMTP issue)
                const smtpTimeout = setTimeout(() => {
                    if (isRegisterLoading) {
                        toast("This is taking a while. Please ensure your backend SMTP settings are correct.", {
                            icon: '📧',
                            duration: 6000
                        });
                    }
                }, 15000);

                const res = await register({ name, email, password, role }).unwrap()
                clearTimeout(smtpTimeout);
                console.log("✅ [DEBUG] SignUp register response:", res);
                const token = res?.activationToken
                const code = res?.activationCode

                // If server provided activationCode, auto-activate and then auto-login
                if (token && code) {
                    await activation({ activation_token: token, activation_code: code }).unwrap()
                    await login({ email, password }).unwrap()
                    toast.success("Account created and logged in")
                    setOpen(false);
                    
                    const redirectPath = role === 'admin' ? '/admin' : '/profile';
                    console.log("🚀 [DEBUG] Redirecting to:", redirectPath);
                    router.push(redirectPath);

                    // Fallback
                    setTimeout(() => {
                        if (window.location.pathname !== redirectPath) {
                            window.location.href = redirectPath;
                        }
                    }, 1000);

                    if (typeof refetch === "function") {
                        refetch();
                    }
                } else {
                    // Fallback to verification flow when activationCode isn't available
                    const message = res?.message || 'Registration successful'
                    toast.success(message)
                    setRoute('Verification')
                }
            } catch (e: any) {
                console.error("❌ [DEBUG] SignUp error:", e);
                const msg = e?.data?.message || e?.message || 'Registration failed'
                toast.error(msg)
            }
        }
    });



    const { errors, touched, values, handleChange, handleSubmit } = formik

    return (
        <div className='w-full'>

            <h1 ref={headingRef} tabIndex={0} className={`${styles.title}`}>
                Join to AccessEdu
            </h1>
            <form onSubmit={handleSubmit}>
                <div className='mb-3'>
                    <label
                        ref={nameLabelRef}
                        tabIndex={0}
                        className={`${styles.label}`}
                        htmlFor="name"
                    >
                        Enter your Name
                    </label>
                    <input type="text"
                        ref={nameInputRef}
                        name='name' // Corrected name attribute
                        value={values.name}
                        onChange={handleChange}
                        id='name'
                        placeholder='John Doe'
                        className={`${errors.name && touched.name && "border-red-500"
                            } ${styles.input}`}
                    />
                    {errors.name && touched.name && (
                        <span className='text-red-500 pt-3 block'>
                            {errors.name}
                        </span>
                    )}
                </div>
                <label
                    ref={emailLabelRef}
                    tabIndex={0}
                    className={`${styles.label}`}
                    htmlFor="email"
                >
                    Enter your Email
                </label>
                <input type="email"
                    ref={emailInputRef}
                    name='email' // Corrected name attribute
                    value={values.email}
                    onChange={handleChange}
                    id='email'
                    placeholder='loginmail@gmail.com'
                    className={`${errors.email && touched.email && "border-red-500"
                        } ${styles.input}`}
                />
                {errors.email && touched.email && (
                    <span className='text-red-500 pt-3 block'>
                        {errors.email}
                    </span>
                )}
                <div className="w-full mt-5 relative mb-1">
                    <label
                        ref={passwordLabelRef}
                        tabIndex={0}
                        className={`${styles.label}`}
                        htmlFor="password" // Corrected htmlFor
                    >
                        Enter your password
                    </label>
                    <input
                        ref={passwordInputRef}
                        type={!show ? "password" : "text"}
                        name='password'
                        value={values.password}
                        onChange={handleChange}
                        id='password' // Corrected id
                        placeholder='password!@'
                        className={`${errors.password && touched.password && "border-red-500"
                            } ${styles.input}`}
                    />
                    <div ref={togglePasswordVisibilityRef} tabIndex={0} onClick={() => setShow(!show)} className="absolute bottom-3 right-2 z-1 cursor-pointer">
                        {!show ? (
                            <AiOutlineEyeInvisible
                                className='text-black dark:text-white'
                                size={20}
                            />
                        ) : (
                            <AiOutlineEye
                                className='text-black dark:text-white'
                                size={20}
                            />
                        )}
                    </div>
                </div>
                {errors.password && touched.password && (
                    <span className='text-red-500 pt-3 block'>
                        {errors.password}
                    </span>
                )}
                <div className='mb-3 mt-5'>
                    <label
                        ref={roleLabelRef}
                        tabIndex={0}
                        className={`${styles.label}`}
                        htmlFor="role"
                    >
                        Select your role
                    </label>
                    <select
                        ref={roleSelectRef}
                        name='role'
                        value={values.role}
                        onChange={handleChange}
                        id='role'
                        className={`${errors.role && touched.role && "border-red-500"
                            } ${styles.input}`}
                    >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                    </select>
                    {errors.role && touched.role && (
                        <span className='text-red-500 pt-3 block'>
                            {errors.role}
                        </span>
                    )}
                </div>
                <div className="w-full mt-5">
                    <input 
                        ref={signUpButtonRef} 
                        type="submit" 
                        value={isRegisterLoading || isActivationLoading || isLoginLoading ? "Processing..." : "Sign Up"} 
                        disabled={isRegisterLoading || isActivationLoading || isLoginLoading}
                        className={`${styles.button} ${(isRegisterLoading || isActivationLoading || isLoginLoading) ? "opacity-50 cursor-not-allowed" : ""}`} 
                    />
                </div>
                <br />
                <h5
                    ref={orJoinWithRef}
                    tabIndex={0}
                    className='text-center pt-4 font-Poppins text-[14px] text-black dark:text-white'
                >
                    Or join with
                </h5>
                <div className='flex items-center justify-center my-3'>
                    <div 
                        ref={googleSignInRef}
                        tabIndex={0}
                        className='cursor-pointer mr-2'
                        onClick={() => signIn("google")}
                    >
                        <FcGoogle size={30} />
                    </div>
                    <div 
                        ref={githubSignInRef}
                        tabIndex={0}
                        className='cursor-pointer ml-2'
                        onClick={() => signIn("github")}
                    >
                        <AiFillGithub size={30} />
                    </div>
                </div>
                <h5
                    ref={alreadyHaveAccountRef}
                    tabIndex={0}
                    className='text-center pt-4 font-Poppins text-[14px]'
                >
                    Already have an account?
                    <span
                        ref={signInLinkRef}
                        tabIndex={0}
                        className='text-[#2190ff] pl-1 cursor-pointer'
                        onClick={() => setRoute("Login")}
                    >
                        Sign in
                    </span>
                </h5>
            </form>
            <br />
        </div>
    )
}

export default SignUp;