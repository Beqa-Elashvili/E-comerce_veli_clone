import { useAppSelector } from "../redux";

export default function useHandleCartquantity() {
  const cart = useAppSelector(
    (state) => state.global.isCartItemUnauthentificated
  );
  const handleCartQuantity = () => {
    const total = cart?.reduce((acc, item) => acc + item.quantity, 0);
    return total || 0;
  };
  const handleTotalPrice = () => {
    const total = cart?.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    return total?.toFixed(2) || 0;
  };
  return { handleCartQuantity, handleTotalPrice };
}
