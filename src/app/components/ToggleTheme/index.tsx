import { setISDarkMode } from "@/redux/globalSlice";
import { useAppDispatch, useAppSelector } from "@/app/redux";

const ThemeToggle = () => {
  const dispatch = useAppDispatch();
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const toggleTheme = () => {
    dispatch(setISDarkMode(!isDarkMode));
  };

  return (
    <button
      onClick={toggleTheme}
      className="px-4 py-2 bg-gray-200 dark:bg-gray-800 text-black dark:text-white rounded"
    >
      {isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
    </button>
  );
};

export default ThemeToggle;
