import React, { useRef } from 'react';

interface CategoryButtonProps {
  item: any; // Adjust type as per your item structure
  category: string;
  setCategory: (category: string) => void;
}

const CategoryButton: React.FC<CategoryButtonProps> = ({ item, category, setCategory }) => {
  const categoryButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <div key={item._id}>
      <button
        ref={categoryButtonRef}
        className={`h-[35px] ${
          category === item._id ? "bg-[crimson]" : "bg-[#5050cb]"
        } m-3 px-3 rounded-[30px] flex items-center justify-center font-Poppins cursor-pointer`}
        onClick={() => setCategory(item._id)}
        aria-label={`Filter courses by ${item.title} category`}
      >
        {item.title}
      </button>
    </div>
  );
};

export default CategoryButton;
