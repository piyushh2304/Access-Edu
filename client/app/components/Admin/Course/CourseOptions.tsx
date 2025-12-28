import React, { FC, useRef } from 'react'
import { IoMdCheckmark } from 'react-icons/io'
import { useSpeechOnHover } from '@/app/hooks/useSpeechOnHover'

type Props = {
    active: number;
    setActive: (active: number) => void
}

const CourseOptions: FC<Props> = ({ active, setActive }) => {
    const options = [
        "Course Information",
        "Course Options",
        "Course Content",
        "Coure Preview"
    ]
    return (
        <div>
            {options.map((option: any, index: number) => (
                <OptionItem
                    key={index}
                    option={option}
                    index={index}
                    active={active}
                    setActive={setActive}
                    length={options.length}
                />
            ))}
        </div>
    )
}

export default CourseOptions;

interface OptionItemProps {
    option: string;
    index: number;
    active: number;
    setActive: (active: number) => void;
    length: number;
}

const OptionItem: FC<OptionItemProps> = ({ option, index, active, setActive, length }) => {
    const optionRef = useSpeechOnHover<HTMLDivElement>(`Step ${index + 1}: ${option}`);

    return (
        <div ref={optionRef} tabIndex={0} key={index} className={`w-full flex py-5 cursor-pointer`} onClick={() => setActive(index)}>
            <div
                className={`w-[35px] h-[35px] rounded-full flex items-center justify-center ${active + 1 > index ? "bg-blue-500" : "bg-[#384766]"
                    } relative`}
            >
                <IoMdCheckmark className='text-[25px]' />
                {index !== length - 1 && (
                    <div
                        className={`absolute h-[30px] w-1 ${active + 1 > index ? "bg-blue-500" : "bg-[#384766]"
                            } bottom-[-100%]`}
                    />
                )}
            </div>
            <h5
                className={`pl-3 ${active === index
                    ? "dark:text-white text-black"
                    : "dark:text-white text-black"
                    } text-[20px]`}
            >
                {option}
            </h5>
        </div>
    )
}
