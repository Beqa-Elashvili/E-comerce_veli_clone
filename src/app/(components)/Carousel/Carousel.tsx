import React from "react";
import { Carousel } from "antd";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { DotDuration } from "antd/es/carousel/style";

function CarouselComp({
  children,
  MainTitle,
  Cover,
}: {
  children: React.ReactNode;
  MainTitle?: string;
  Cover?: React.ReactNode;
}) {
  const NextArrow = (props: any) => {
    const { onClick } = props;
    return (
      <div
        onClick={onClick}
        className="absolute bg-white cursor-pointer shadow-custom-light p-2 rounded-full right-0 top-1/2 transform -translate-y-1/2 z-20"
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
        className="absolute cursor-pointer shadow-custom-light p-2 bg-white rounded-full left-0 top-1/2 transform -translate-y-1/2 z-20"
      >
        <ChevronLeft className="hover:scale-150 transition duration-300" />
      </div>
    );
  };
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-wider mb-4">{MainTitle}</h1>
      {Cover && <div className="text-center pb-8 rounded-lg">{Cover}</div>}
      <div className="relative">
        <Carousel
          autoplay={{ dotDuration: true }}
          slidesToScroll={2}
          className="relative"
          nextArrow={<NextArrow />}
          prevArrow={<PrevArrow />}
          arrows
          slidesToShow={6}
          dots={false}
        >
          {children}
        </Carousel>
        <div className="absolute pointer-events-none inset-0 z-10">
          <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r  from-gray-50 to-transparent  pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none" />
        </div>
      </div>
    </div>
  );
}

export default CarouselComp;
