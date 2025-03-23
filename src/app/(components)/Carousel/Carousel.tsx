import React, { useEffect, useState } from "react";
import { Carousel } from "antd";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { DotDuration } from "antd/es/carousel/style";

function CarouselComp({
  children,
  MainTitle,
  Cover,
  SlideToShow,
}: {
  children: React.ReactNode;
  MainTitle?: string;
  Cover?: React.ReactNode;
  SlideToShow?: number;
}) {
  const [slidesToShow, setSlidesToShow] = useState<number>(6); // Default slidesToShow
  const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth);
  const NextArrow = (props: any) => {
    const { onClick } = props;
    return (
      <div
        onClick={onClick}
        className="absolute hidden md:block bg-white cursor-pointer shadow-custom-light p-2 rounded-full right-0 top-1/2 transform -translate-y-1/2 z-20"
      >
        <ChevronRight className="hover:scale-150 transition duration-300" />
      </div>
    );
  };
  const PrevArrow = (props: any) => {
    const { onClick } = props;
    return (
      <div
        onClick={onClick}
        className="absolute hidden md:block cursor-pointer shadow-custom-light p-2 bg-white rounded-full left-0 top-1/2 transform -translate-y-1/2 z-20"
      >
        <ChevronLeft className="hover:scale-150 transition duration-300" />
      </div>
    );
  };
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (windowWidth >= 1200) {
      setSlidesToShow(6); 
    } else if (windowWidth >= 992) {
      setSlidesToShow(5); 
    } else if (windowWidth >= 768) {
      setSlidesToShow(5); 
    } else {
      setSlidesToShow(3); 
    }
  }, [windowWidth]);

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-wider mb-4">{MainTitle}</h1>
      {Cover && <div className="text-center pb-8 rounded-lg">{Cover}</div>}
      <div className="relative">
        <Carousel
          slidesToScroll={2}
          className="relative"
          nextArrow={<NextArrow />}
          prevArrow={<PrevArrow />}
          arrows
          slidesToShow={SlideToShow ? SlideToShow : slidesToShow}
          dots={false}
        >
          {children}
        </Carousel>
        <div className="absolute hidden md:block pointer-events-none inset-0 z-10">
          <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r  from-gray-50 to-transparent  pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none" />
        </div>
      </div>
    </div>
  );
}

export default CarouselComp;
