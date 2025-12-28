import { styles } from "@/app/styles/styles";
import React, { FC, useRef } from "react";
import toast from "react-hot-toast";
import { MdAddCircleOutline } from "react-icons/md";
import { useSpeechOnHover } from "@/app/hooks/useSpeechOnHover";

type Props = {
  benefits: { title: string }[];
  setBenefits: (benefits: { title: string }[]) => void;
  prerequisites: { title: string }[];
  setPrerequisites: (prerequisites: { title: string }[]) => void;
  active: number;
  setActive: (active: number) => void;
};

const CourseData: FC<Props> = ({
  benefits,
  setBenefits,
  prerequisites,
  setPrerequisites,
  active,
  setActive,
}) => {
  const benefitsLabelRef = useSpeechOnHover<HTMLLabelElement>("What are the benefits for starting this course");
  const addBenefitRef = useSpeechOnHover<SVGAElement>("Add benefit");
  const prerequisitesLabelRef = useSpeechOnHover<HTMLLabelElement>("What are the prerequisites for starting this course");
  const addPrerequisiteRef = useSpeechOnHover<SVGAElement>("Add prerequisite");
  const prevButtonRef = useSpeechOnHover<HTMLDivElement>("Previous button");
  const nextButtonRef = useSpeechOnHover<HTMLDivElement>("Next button");

  const handleBenefitChange = (index: number, value: any) => {
    const updatedBenefits = [...benefits];
    updatedBenefits[index] = { ...updatedBenefits[index], title: value };
    setBenefits(updatedBenefits);
  };

  const handlePrerequisiteChange = (index: number, value: any) => {
    const updatedPrerequisites = [...prerequisites];
    updatedPrerequisites[index] = {
      ...updatedPrerequisites[index],
      title: value,
    };
    setPrerequisites(updatedPrerequisites);
  };

  const handleAddBenefits = () => {
    setBenefits([...benefits, { title: "" }]);
  };

  const handleAddPrerequisites = () => {
    setPrerequisites([...prerequisites, { title: "" }]);
  };

  const prevButton = () => {
    setActive(active - 1);
  };
  const handleOptions = () => {
    if (
      benefits[benefits.length - 1]?.title !== "" &&
      prerequisites[prerequisites.length - 1]?.title !== ""
    ) {
      setActive(active + 1);
    } else {
      toast.error("Please fill the fields for go to next!");
    }
  };

  return (
    <div className="w-[80%] m-auto mt-24 block">
      <div>
        <label ref={benefitsLabelRef} tabIndex={0} htmlFor="benefits" className={`${styles.label} text-[20px]`}>
          What are the benefits for starting this course
        </label>
        <br />
        {benefits.map((benefit: any, index: number) => (
          <BenefitInput
            key={index}
            index={index}
            benefit={benefit}
            handleBenefitChange={handleBenefitChange}
          />
        ))}
        <MdAddCircleOutline
          ref={addBenefitRef}
          tabIndex={0}
          style={{ margin: "10px 0px", cursor: "pointer", width: "30px" }}
          onClick={handleAddBenefits}
        />
      </div>
      <br />
      <div>
        <label ref={prerequisitesLabelRef} tabIndex={0} htmlFor="prerequisites" className={`${styles.label} text-[20px]`}>
          What are the prerequisites for starting this course
        </label>
        <br />
        {prerequisites.map((prerequisite: any, index: number) => (
          <PrerequisiteInput
            key={index}
            index={index}
            prerequisite={prerequisite}
            handlePrerequisiteChange={handlePrerequisiteChange}
          />
        ))}
        <MdAddCircleOutline
          ref={addPrerequisiteRef}
          tabIndex={0}
          style={{ margin: "10px 0px", cursor: "pointer", width: "30px" }}
          onClick={handleAddPrerequisites}
        />
      </div>
      <div className="w-full flex items-center justify-between">
        <div
          ref={prevButtonRef}
          tabIndex={0}
          className="w-full 800px:w-[180px] flex justify-center items-center h-[40px] bg-[#37a39a] text-center text-[#fff] rounded mt-8 cursor-pointer"
          onClick={() => prevButton()}
        >
          Prev
        </div>
        <div
          ref={nextButtonRef}
          tabIndex={0}
          className="w-full 800px:w-[180px] flex justify-center items-center h-[40px] bg-[#37a39a] text-center text-[#fff] rounded mt-8 cursor-pointer"
          onClick={() => handleOptions()}
        >
          Next
        </div>
      </div>
    </div>
  );
};

export default CourseData;

interface BenefitInputProps {
    index: number;
    benefit: { title: string };
    handleBenefitChange: (index: number, value: string) => void;
}

const BenefitInput: FC<BenefitInputProps> = ({ index, benefit, handleBenefitChange }) => {
    const benefitInputRef = useSpeechOnHover<HTMLInputElement>(`Benefit ${index + 1} input field`);
    return (
        <input
            ref={benefitInputRef}
            tabIndex={0}
            type="text"
            name="benefits"
            placeholder="You will be able to build a full stack LMS Platform"
            required
            className={`${styles.input} my-2`}
            value={benefit.title}
            onChange={(e) => handleBenefitChange(index, e.target.value)}
        />
    )
}

interface PrerequisiteInputProps {
    index: number;
    prerequisite: { title: string };
    handlePrerequisiteChange: (index: number, value: string) => void;
}

const PrerequisiteInput: FC<PrerequisiteInputProps> = ({ index, prerequisite, handlePrerequisiteChange }) => {
    const prerequisiteInputRef = useSpeechOnHover<HTMLInputElement>(`Prerequisite ${index + 1} input field`);
    return (
        <input
            ref={prerequisiteInputRef}
            tabIndex={0}
            type="text"
            name="prerequisites"
            placeholder="You need basic knowledge of MERN stack"
            required
            className={`${styles.input} my-2`}
            value={prerequisite.title}
            onChange={(e) => handlePrerequisiteChange(index, e.target.value)}
        />
    )
}