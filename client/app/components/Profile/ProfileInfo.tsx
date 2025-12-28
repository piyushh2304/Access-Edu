import Image from "next/image"
import { styles } from "@/app/styles/styles"
import React, { FC, useEffect, useState, useRef } from 'react'
import { AiOutlineCamera } from "react-icons/ai"
import avatarIcon from "../../../public/assets/avatar.jpg"
import { useEditProfileMutation, useUpdateAvatarMutation } from "@/redux/features/user/userApi"
import { useLoadUserQuery } from "@/redux/features/api/apiSlice"
import toast from "react-hot-toast"
import useSpeechOnHover from "@/app/hooks/useSpeechOnHover";

type Props = {
    avatar: string | null;
    user: any;
    updateAvatar: (avatar: string) => void;
    updateUser: (user: any) => void;
    refreshUserData: () => void;
}

const ProfileInfo: FC<Props> = ({ avatar, user, updateAvatar, updateUser, refreshUserData }) => {
    const [name, setName] = useState(user && user.name)
    const [updateAvatarMutation, { isSuccess, error, isLoading, reset }] = useUpdateAvatarMutation()
    const [editProfile, { isSuccess: success, error: updateError, reset: editProfileReset }] = useEditProfileMutation()

    const avatarImageRef = useSpeechOnHover<HTMLImageElement>('User profile avatar');
    const changeAvatarButtonRef = useSpeechOnHover<HTMLLabelElement>('Change profile picture button');
    const fullNameLabelRef = useSpeechOnHover<HTMLLabelElement>('Full Name input field');
    const fullNameInputRef = useSpeechOnHover<HTMLInputElement>('Full Name input field');
    const fullAddressLabelRef = useSpeechOnHover<HTMLLabelElement>('Full Address input field');
    const fullAddressInputRef = useSpeechOnHover<HTMLInputElement>('Full Address input field');
    const updateButtonRef = useSpeechOnHover<HTMLInputElement>('Update profile button');
    const loadingSpinnerRef = useSpeechOnHover<HTMLDivElement>('Loading, updating profile picture');

    const imageHandler = async (e: any) => {
        const file = e.target.files[0]
        
        if (!file) {
            toast.error("No file selected")
            return
        }
        
        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024 // 5MB
        if (file.size > maxSize) {
            toast.error("Image file is too large. Maximum size is 5MB.")
            return
        }
        
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
        if (!allowedTypes.includes(file.type)) {
            toast.error("Invalid image format. Please use JPG, PNG, or WebP.")
            return
        }
        
        const fileReader = new FileReader()

        fileReader.onload = () => {
            if (fileReader.readyState === 2) {
                const avatar = fileReader.result
                console.log("Avatar data length:", avatar?.toString().length)
                console.log("Avatar data preview:", avatar?.toString().substring(0, 100))
                updateAvatarMutation(avatar)
                updateAvatar(avatar as string)
            }
        }
        fileReader.onerror = (error) => {
            console.error("FileReader error:", error)
            toast.error("Failed to read image file")
        }
        
        fileReader.readAsDataURL(file)
    }

    useEffect(() => {
        if (isSuccess) {
            toast.success("Avatar updated successfully")
            refreshUserData()
            reset()
        }
        if (success) {
            toast.success("Profile updated successfully")
            refreshUserData()
            editProfileReset()
        }
        if (error || updateError) {
            console.log("Update error:", error || updateError)
            console.log("Error details:", {
                status: (error as any)?.status,
                data: (error as any)?.data,
                message: (error as any)?.message
            })
            const errorMessage = (error as any)?.data?.message || (updateError as any)?.data?.message || "Update failed"
            toast.error(errorMessage)
        }
    }, [isSuccess, error, success, updateError, refreshUserData, reset, editProfileReset])

    const handleSubmit = async (e: any) => {
        e.preventDefault()
        if (name !== "") {
            await editProfile({
                name: name,
            })
        }
    }

    return (
        <>
            <div
                className="w-full flex justify-center"
            >
                <div className="relative">
                    <Image
                        ref={avatarImageRef}
                        tabIndex={0}
                        width={120}
                        height={120}
                        src={avatar || (user?.avatar?.url || avatarIcon)}
                        alt="User avatar"
                        className="w-[120px] h-[120px] object-cover cursor-pointer border-[3px] border-[#37a39a] rounded-full"
                    />
                    <input
                        type="file"
                        name=""
                        id="avatar"
                        className="hidden"
                        onChange={imageHandler}
                        accept="image/png, image/jpg, image/jgep, image/webp"
                    />
                    <label ref={changeAvatarButtonRef} tabIndex={0} htmlFor="avatar">
                        <div
                            className={`w-[30px] h-[30px] rounded-full absolute bottom-2 right-2 flex items-center justify-center cursor-pointer ${isLoading ? 'bg-gray-500' : 'bg-slate-900'}`}
                        >
                            <AiOutlineCamera size={20} className="z-1" />
                        </div>
                    </label>
                    {isLoading && (
                        <div ref={loadingSpinnerRef} tabIndex={0} className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}
                </div>
            </div>
            <br />
            <br />
            <div
                className="w-full pl-6 800px:pl-10"
            >
                <form onSubmit={handleSubmit}>
                    <div className="800px:w-[50%] m-auto block pb-4">

                        <div className="w-[100%]">
                            <label ref={fullNameLabelRef} tabIndex={0} htmlFor="fullName" className="block pb-2">Full Name</label>
                            <input type="text"
                                ref={fullNameInputRef}
                                id="fullName"
                                className={`${styles.input} !w-[95%] mb-4 800px:mb-0`}
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div className="w-[100%] pt-2">
                            <label ref={fullAddressLabelRef} tabIndex={0} htmlFor="fullAddress" className="block pb-2">Full Address</label>
                            <input
                                ref={fullAddressInputRef}
                                id="fullAddress"
                                type="text"
                                className={`${styles.input} !w-[95%] mb-4 800px:mb-0`}
                                readOnly
                                value={user?.email}
                                required
                            />
                        </div>
                        <input type="submit"
                            ref={updateButtonRef}
                            tabIndex={0}
                            className={`w-full 800px:w-[250px] h-[40px] border border-[#37a39a] text-center dark:text-[#fff] text-black rounded-[3px] mt-8 cursor-pointer`}
                            required
                            value="Update"
                        />
                    </div>
                </form>
                <br />
            </div>
        </>
    )
}

export default ProfileInfo