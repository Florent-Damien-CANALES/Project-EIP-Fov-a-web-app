import { FC, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import axios from "axios";
import { Category, Product } from "../types";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";

const Topbar: FC = () => {
    const location = useLocation();
    const [tabs] = useState(["Ajout", "Scan", "Catalogue"]);
    const [category, setCategory] = useState<Category | null>(null);
    const [product, setProduct] = useState<Product | null>(null);

    const [previousUrl, setPreviousUrl] = useState("");

    const { toast } = useToast();

    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        setCategory(null);
        setProduct(null);
        setPreviousUrl("/catalogue");
        const categoryId = location.pathname.split("/")[2]; // Index 2 contient l'id

        const fetchCategory = async () => {
            const response = await axios.get(
                `${API_URL}/categories/${categoryId}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "token"
                        )}`,
                    },
                }
            );
            const data = await response.data;
            setCategory(data);
        };

        if (categoryId) {
            fetchCategory();
            setPreviousUrl("/catalogue");
        }

        const productId = location.pathname.split("/")[3]; // Index 3 contient l'id

        const fetchProduct = async () => {
            const response = await axios.get(
                `${API_URL}/products/${productId}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "token"
                        )}`,
                    },
                }
            );
            const data = await response.data;
            setProduct(data);
        };

        if (productId) {
            fetchProduct();
            setPreviousUrl(`/catalogue/${categoryId}`);
        }
    }, [location.pathname, tabs, API_URL]);

    const handleTruncateDatabase = async () => {
        try {
            await axios.post(
                `${API_URL}/database/truncate`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "token"
                        )}`,
                    },
                }
            );
            toast({
                title: "Catalogue supprimé",
                description: "Le catalogue a été supprimé avec succès",
            });
        } catch (error) {
            toast({
                title: "Erreur",
                description:
                    "Une erreur est survenue lors de la suppression du catalogue",
                variant: "destructive",
            });
            console.error(error);
        }
    };

    const handleTrainAI = async () => {
        try {
            await axios.post(
                `${API_URL}/ai/train`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "token"
                        )}`,
                    },
                }
            );

            toast({
                title: "Entrainement IA",
                description:
                    "Le lancement de l'entraînement de l'IA a été effectué avec succès",
            });
        } catch (error) {
            toast({
                title: "Erreur",
                description:
                    "Une erreur est survenue lors du lancement de l'entraînement de l'IA",
                variant: "destructive",
            });
            console.error(error);
        }
    };

    return (
        <div className="top-0 left-0 w-full px-10 py-10 border-b flex justify-between items-center text-slate-400">
            <Link to={previousUrl} className="flex text-slate-800 align-middle">
                {(() => {
                    if (product) {
                        return (
                            <>
                                <ChevronLeft size={37} />
                                <p className="text-3xl">{product.name}</p>
                            </>
                        );
                    } else if (category) {
                        return (
                            <>
                                <ChevronLeft size={37} />
                                <p className="text-3xl">{category.name}</p>
                            </>
                        );
                    } else {
                        return <p className="text-3xl">Catalogue</p>;
                    }
                })()}
            </Link>
            {location.pathname == "/catalogue" ? (
                <div className="space-x-3">
                    <Button size={"lg"} onClick={handleTrainAI}>
                        Entraîner IA
                    </Button>
                    <Button
                        size={"lg"}
                        variant={"destructive"}
                        // onClick={() => {}}
                        onClick={handleTruncateDatabase}
                    >
                        Supprimer catalogue
                    </Button>
                </div>
            ) : null}
        </div>
    );
};

export default Topbar;
