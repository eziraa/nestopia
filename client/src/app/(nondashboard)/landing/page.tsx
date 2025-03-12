import React from "react";
import HeroSection from "./HeroSection";
import FeaturesSection from "./FeaturesSection";
import DiscoverSection from "./DiscoverSection";
import FooterSection from "./FooterSection";
import PopularHouses from "./PopularHouses";

const Landing = () => {
  return (
    <div>
      <HeroSection />
      <PopularHouses/>
      <FeaturesSection />
      <DiscoverSection />
      <FooterSection />
    </div>
  );
};

export default Landing;
