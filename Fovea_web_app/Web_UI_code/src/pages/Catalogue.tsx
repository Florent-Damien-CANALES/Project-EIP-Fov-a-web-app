// Catalogue.tsx
import { FC } from "react";
import CategoryCard from "../components/CategoryCard";

const Catalogue: FC = () => {
  const rows = [
    [
      ["b3b55529-f4fa-4a7a-824b-b3655b1baf7a", "big"],
      ["5ce44506-cc91-4b27-9bc5-33570e41c525", "small"],
    ],
    [
      ["d51a2ef5-bcfe-4372-9ed1-71b69705118c", "small"],
      ["28fd9122-48c9-4945-8042-d1af478ed8a5", "big"],
    ],
    [["0846b19b-931c-4135-9537-16c0fc0857d2", "max"]],
  ];

  return (
    <div>
      <div className="space-y-10 pb-bottomBar">
        {rows &&
          rows.map((row) => (
            <div className="flex flex-row h-full space-x-10" key={row[0][0]}>
              {row.map((category) => (
                <CategoryCard
                  id={category[0]}
                  size={category[1]}
                  key={category[0]}
                />
              ))}
            </div>
          ))}
      </div>
    </div>
  );
};

export default Catalogue;
