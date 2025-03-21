import { useAppDispatch, useAppSelector } from "@/app/redux";
import React from "react";
import { useRef, useEffect } from "react";
import { setIsAuthModalOpen } from "@/redux/globalSlice";
import Register from "@/app/(auth)/authentification";
export function useAuthModal() {
  const isAuthModalOpen = useAppSelector(
    (state) => state.global.isAuthModalOpen
  );
  function AuthModal() {
    const dispatch = useAppDispatch();

    const authRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
      if (isAuthModalOpen) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "auto";
      }

      const handleClickOutside = (event: MouseEvent) => {
        if (authRef.current) {
          if (!authRef.current.contains(event.target as Node)) {
            dispatch(setIsAuthModalOpen(false));
          }
        }
      };

      if (isAuthModalOpen) {
        document.addEventListener("mousedown", handleClickOutside);
      }

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.body.style.overflow = "auto";
      };
    }, [isAuthModalOpen, dispatch]);
    return (
      <div
        ref={authRef}
        className={` ${
          isAuthModalOpen ? "block" : "hidden"
        } fixed bg-gray-800 inset-0 z-40 h-full bg-opacity-60`}
      >
        {isAuthModalOpen && (
          <div className="absolute inset-0 top-12">
            {isAuthModalOpen && <Register />}
          </div>
        )}
      </div>
    );
  }
  return { AuthModal, setIsAuthModalOpen, isAuthModalOpen };
}
