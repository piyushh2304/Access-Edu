"use client";

import {
  useEditLayoutMutation,
  useGetHeroDataQuery,
} from "@/redux/features/layout/layoutApi";
import React, { useEffect, useState, useRef } from "react";
import Loader from "../../Loader";
import { styles } from "@/app/styles/styles";
import { AiOutlineDelete } from "react-icons/ai";
import toast from "react-hot-toast";
import { IoMdAddCircleOutline } from "react-icons/io";
import { useSpeechOnHover } from "@/app/hooks/useSpeechOnHover";

type Props = {};

const EditCategories = (props: Props) => {
  const { data, isLoading, refetch } = useGetHeroDataQuery("Categories", {
    refetchOnMountOrArgChange: true,
  });
  const [editLayout, { isSuccess: layoutSuccess, error }] =
    useEditLayoutMutation();
  const [categories, setCategories] = useState<any[]>([]);

  const headingRef = useSpeechOnHover<HTMLHeadingElement>("All Categories");
  const addCategoryRef = useSpeechOnHover<SVGAElement>("Add new category");
  const saveButtonRef = useSpeechOnHover<HTMLDivElement>("Save changes");

  useEffect(() => {
    if (data) {
      setCategories(data.layout.categories);
    }
    if (layoutSuccess) {
      refetch();
      toast.success("Categories updated successfylly");
    }

    if (error) {
      if ("data" in error) {
        const errorData = error as any;
        toast.error(errorData?.data?.message);
      }
    }
  }, [data, layoutSuccess, error]);

  const handleCategoriesAdd = (id: any, value: string) => {
    setCategories((prevCategory: any) =>
      prevCategory.map((i: any) => (i._id === id ? { ...i, title: value } : i))
    );
  };
  const newCategoriesHandler = () => {
    if (categories[categories.length - 1].title === "") {
      toast.error("Category title cannot be empty");
    } else
      setCategories((prevCategory: any) => [...prevCategory, { title: "" }]);
  };
  const areCategoriesUnchanged = (
    originalCategories: any[],
    newCategories: any[]
  ) => {
    return JSON.stringify(originalCategories) === JSON.stringify(newCategories);
  };

  const isAnyCategoryTitleEmpty = (categories: any[]) => {
    return categories.some((q) => q.title === "" || q.answer === "");
  };

  const handleEdit = async () => {
    if (
      !areCategoriesUnchanged(data.layout.categories, categories) &&
      !isAnyCategoryTitleEmpty(categories)
    ) {
      await editLayout({
        type: "Categories",
        categories,
      });
    }
  };

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <div className="mt-[120px] text-center">
            <h1 ref={headingRef} tabIndex={0} className={`${styles.title}`}>All Categories</h1>
            {categories &&
              categories.map((item: any, index: number) => {
                return (
                  <CategoryItem
                    key={index}
                    item={item}
                    handleCategoriesAdd={handleCategoriesAdd}
                    setCategories={setCategories}
                  />
                );
              })}
            <br />
            <br />
            <div className="w-full flex justify-center">
              <IoMdAddCircleOutline
                ref={addCategoryRef}
                tabIndex={0}
                className="dark:text-white text-black text-[25px] cursor-pointer"
                onClick={newCategoriesHandler}
              />
            </div>
            <div
              ref={saveButtonRef}
              tabIndex={0}
              className={`${
                styles.button
              } !w-[100px] !min-h-[40px] dark:text-white text-black bg-[#cccccc34] 
              ${
                areCategoriesUnchanged(data?.layout.categories, categories) ||
                isAnyCategoryTitleEmpty(categories)
                  ? "!cursor-not-allowed"
                  : "!cursor-pointer !bg-[#42d383]"
              } !rounded absolute bottom-12 right-12
              `}
              onClick={
                areCategoriesUnchanged(data?.layout.categories, categories) ||
                isAnyCategoryTitleEmpty(categories)
                  ? () => null
                  : handleEdit
              }
            >
              Save
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default EditCategories;

interface CategoryItemProps {
    item: any;
    handleCategoriesAdd: (id: any, value: string) => void;
    setCategories: React.Dispatch<React.SetStateAction<any[]>>;
}

const CategoryItem: FC<CategoryItemProps> = ({ item, handleCategoriesAdd, setCategories }) => {
    const inputRef = useSpeechOnHover<HTMLInputElement>(`Category title input for ${item.title}`);
    const deleteRef = useSpeechOnHover<SVGAElement>(`Delete category ${item.title}`);

    return (
        <div className="p-3">
            <div className="flex items-center w-full justify-center">
                <input
                    ref={inputRef}
                    tabIndex={0}
                    type="text"
                    className={`${styles.input} !w-[unset] !border-none !text-[20px]`}
                    value={item.title}
                    onChange={(e) =>
                        handleCategoriesAdd(item._id, e.target.value)
                    }
                    placeholder="Enter category title"
                />
                <AiOutlineDelete
                    ref={deleteRef}
                    tabIndex={0}
                    className="dark:text-white text-black text-[18px] cursor-pointer"
                    onClick={() => {
                        setCategories((prevCategory: any) =>
                            prevCategory.filter((i: any) => i._id !== item._id)
                        );
                    }}
                />
            </div>
        </div>
    );
}