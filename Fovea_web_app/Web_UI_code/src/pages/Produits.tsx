// Produits.tsx
import { FC, useEffect, useState } from "react";
import ProduitCard from "../components/ProduitCard";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { Product } from "../types";

const API_URL = import.meta.env.VITE_API_URL;
const Produits: FC = () => {
  const categoryId = useLocation().pathname.split("/").filter(Boolean).pop();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/products?category=${categoryId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const products = response.data;
        setProducts(products);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, [categoryId]);

  return (
    <div>
      <div className="grid grid-cols-4 gap-10">
        {products.map((product: Product) => (
          <ProduitCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default Produits;
