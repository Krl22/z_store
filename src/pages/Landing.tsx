import { useProductos } from "@/hooks/useGoogleSheet";

export const Landing = () => {
  const { productos } = useProductos();
  return <div className="mt-40">hi</div>;
};
