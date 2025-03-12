"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

const CallToActionSection = () => {
  return (
    <div className="relative py-24">
      <Image
        src="/landing-call-to-action.jpg"
        fill
        alt="Nestopia Search Section Background"
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-black bg-opacity-70"></div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        viewport={{ once: true }}
        className="relative max-w-5xl mx-auto px-6 sm:px-10 lg:px-16 py-16 text-center md:text-left"
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
              Find Your Perfect Rental Property
            </h2>
            <p className="text-lg text-gray-200 mt-4">
              Browse a diverse selection of rental properties tailored to your needs and location preferences.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="px-6 py-3 bg-white text-primary-700 font-semibold rounded-lg transition duration-300 hover:bg-primary-500 hover:text-white shadow-md"
            >
              Search
            </button>
            <Link
              href="/signup"
              className="px-6 py-3 bg-secondary-500 text-white font-semibold rounded-lg transition duration-300 hover:bg-secondary-600 shadow-md"
              scroll={false}
            >
              Sign Up
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CallToActionSection;
