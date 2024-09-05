"use client";

import Logo from "./Logo";
import { FaGithub } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="absolute bottom-0 left-0 right-0 z-30 w-full text-base-100 p-4">
      <div className="container mx-auto p-4 flex justify-between items-center">
        <Logo />
        <a
          href="https://github.com/eftpmc/melodari-v2"
          target="_blank"
          rel="noopener noreferrer"
          className="text-base-100 hover:text-primary"
        >
          <FaGithub size={24} />
        </a>
      </div>
    </footer>
  );
};

export default Footer;
