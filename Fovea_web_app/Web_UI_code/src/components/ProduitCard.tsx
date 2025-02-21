import { FC, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Product } from "../types";
import axios from "axios";

type ProductCardProps = {
    product: Product;
};
const API_URL = import.meta.env.VITE_API_URL;

const ProduitCard: FC<ProductCardProps> = (props: ProductCardProps) => {
    const navigate = useNavigate();

    const [image, setImage] = useState<string>("");

    const handleClick = (
        categoryId: string | undefined,
        id: string | undefined
    ) => {
        navigate(`/catalogue/${categoryId}/${id}`);
    };

    useEffect(() => {
        const fetchImage = async () => {
            // url is _x.jpg, so sort by 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11...
            const sortedPictures = props.product.pictures.sort((a, b) => {
                const aNumber = parseInt(a.url.split("_")[1].split(".")[0]);
                const bNumber = parseInt(b.url.split("_")[1].split(".")[0]);
                return aNumber - bNumber;
            });
            if (sortedPictures[0]?.url) {
                try {
                    const response = await axios.get(
                        `${API_URL}${sortedPictures[0].url}`,
                        {
                            responseType: "arraybuffer",
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem(
                                    "token"
                                )}`,
                            },
                        }
                    );
                    const blob = new Blob([response.data], {
                        type: response.headers["content-type"],
                    });
                    const url = URL.createObjectURL(blob);
                    setImage(url);
                } catch (error) {
                    console.error("Error fetching image:", error);
                }
            }
        };
        fetchImage();
    }, [props.product.pictures]);

    return (
        <div
            className="h-[13rem] relative rounded-3xl overflow-hidden"
            onClick={() =>
                handleClick(props.product.category?.id, props.product.id)
            }
        >
            <div className="absolute w-full h-full bg-black opacity-25" />
            <div
                className="h-full w-full"
                style={{
                    backgroundImage: `url(${image})`,
                    backgroundPosition: "-50px -130px",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "130%",
                }}
            />
            <h1 className="absolute bottom-5 left-5 text-white text-3xl font-bold">
                {props.product.name}
            </h1>
        </div>
    );
};

export default ProduitCard;
