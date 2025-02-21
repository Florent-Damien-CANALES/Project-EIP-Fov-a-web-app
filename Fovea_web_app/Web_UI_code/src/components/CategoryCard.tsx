import { FC, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Category } from "../types";

type CategoryCardProps = {
  id: string;
  size: string;
};

const API_URL = import.meta.env.VITE_API_URL;

const CategoryCard: FC<CategoryCardProps> = ({ id, size }) => {
  const [category, setCategory] = useState<Category | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<string>("");
  const navigate = useNavigate();

  const handleClick = (id: string) => {
    navigate(`/catalogue/${id}`);
  };

  useEffect(() => {
    const fetchCategory = async () => {
      const response = await axios.get(`${API_URL}/categories/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.data;
      setCategory(data);
    };
    fetchCategory();
  }, [id]);

  useEffect(() => {
    const fetchImage = async () => {
      if (category && category.coverPicture?.url) {
        try {
          const response = await axios.get(
            `${API_URL}${category.coverPicture.url}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
              responseType: "arraybuffer",
            }
          );

          const blob = new Blob([response.data], {
            type: response.headers["content-type"],
          });
          const url = URL.createObjectURL(blob);
          setBackgroundImage(url);
        } catch (error) {
          console.error("Error fetching image:", error);
        }
      }
    };
    fetchImage();
  }, [category]);

  return (
    <div
      className={
        size === "big"
          ? "h-[20.2rem] w-7/12 relative rounded-3xl overflow-hidden"
          : size === "small"
          ? "h-[20.2rem] w-5/12 relative rounded-3xl overflow-hidden"
          : "h-[20.2rem] w-full relative rounded-3xl overflow-hidden"
      }
      onClick={() => handleClick(id)}
    >
      <div className="absolute bg-gradient-to-t from-black to-transparent h-full w-full opacity-40"></div>
      <div
        className="h-full w-full bg-cover"
        style={{
          backgroundImage: `url(${backgroundImage})`,
        }}
      />
      <h1 className="absolute bottom-5 left-5 text-white text-4xl font-bold">
        {category?.name}
      </h1>
    </div>
  );
};

export default CategoryCard;
