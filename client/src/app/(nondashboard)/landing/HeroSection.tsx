"use client";

import Image from "next/image";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const properties = [
  {
    image: "/landing-i1.png",
    title: "Find Your Dream Home",
    description: "Discover amazing rental houses with stunning views and modern amenities."
  },
  {
    image: "/placeholder.jpg",
    title: "Luxury Apartments Await",
    description: "Explore high-end apartments in prime locations that suit your lifestyle."
  },
  {
    image: "/placeholderr.jpg",
    title: "Cozy and Affordable Spaces",
    description: "Browse budget-friendly rental homes with great comfort and convenience."
  }
];

const HeroSection = () => {
  const router = useRouter();
  const [selectedProperty, setSelectedProperty] = useState(properties[0]);

  return (
    <div className="relative h-screen  flex flex-col md:flex-row items-center justify-between px-10 md:px-32">
      
      {/* Left Side - Hero Text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full relative md:w-1/2 text-center md:text-left space-y-6"
      >

        <Lines className="right-4 top-2"/>
        {/* Motto Title */}
        <h3 className="text-lg font-semibold text-secondary-300 uppercase tracking-wide">
          Your Dream Home, Just a Click Away
        </h3>

        {/* Main Heading */}
        <h1 className="text-5xl font-bold text-slate-700 leading-tight">
          {selectedProperty.title}
        </h1>

        {/* Description Paragraph */}
        <p className="text-lg text-gray-700">
          Finding the perfect home should be <span className="text-blue-800 hover:underline font-semibold italic">exciting, not stressful</span> . Whether you’re looking for a <span className="text-blue-800 font-semibold italic hover:underline">cozy apartment,</span> a <span className="text-blue-800  hover:underline font-semibold italic">luxury villa</span> , or a <span className="text-blue-800 hover:underline font-semibold italic">budget-friendly rental</span>, we’ve got you covered. Explore handpicked properties with <span className="text-blue-800 font-semibold italic hover:underline">detailed insights</span> to make the best decision for your lifestyle.
        </p>

        {/* Additional Highlighted Feature */}
        <p className="text-md text-secondary-400 italic">
           {['Verified Listings' , 'Virtual Tours', 'Instant Bookings', '24/7 Support'].map((feature, index) => (
            <span key={index} className="inline-block bg-secondary-100 text-secondary-500 px-2 py-1 rounded-full m-1">
              {feature}
            </span>
          ))}
        </p>

        {/* Search Bar */}
        <div className="flex justify-center md:justify-start">
         
          <Button 
          className="bg-secondary-500 text-white  rounded-xl border-none hover:bg-secondary-600 h-12 px-6 shadow-lg"
          onClick={()=>{
            router.push('search')
          }}
          >
            Discover your Home
          </Button>
        </div>
        <Lines  className="left-4 -bottom-20"/>
      </motion.div>


      {/* Right Side - Interactive Image */}
      <div className="relative w-full md:w-[500px] h-[450px] flex flex-col gap-4 items-center">
        <Image
          src={selectedProperty.image}
          alt="Selected Rental Property"
          className="object-cover object-center rounded-xl shadow-lg"
          priority
          width={500}
          height={450}
        />

        {/* Property Selector */}
        <div className="flex gap-2 ">
          {properties.map((property, index) => (
            <button
              key={index}
              onClick={() => setSelectedProperty(property)}
              className={`w-16 h-16 border-2 rounded-md overflow-hidden ${
                selectedProperty.image === property.image ? "border-secondary-500" : "border-gray-300"
              }`}
            >
              <Image
                src={property.image}
                alt={`Property ${index + 1}`}
                width={64}
                height={64}
                className="object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const Lines = ({className}: {className: string}) =>{
  return (
    <div className={"flex absolute   items-center  justify-center p-4" + " " + className}>
      <span className="w-32 h-4 absolute  rounded-[10px] bg-blue-600/80 -rotate-[45deg]"></span>
      <span className="w-32 h-4 absolute  left-4 rounded-[10px] bg-red-600/80 -rotate-[45deg]"></span>
      <span className="w-32 h-4 absolute  left-20  rounded-[10px] bg-yellow-600/80 -rotate-[45deg]"></span>
    </div>
  )
}

export default HeroSection;
