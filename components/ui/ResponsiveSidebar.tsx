import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "./Button";

interface ResponsiveSidebarProps {
  children: React.ReactNode;
  compactMode?: boolean;
}

export const ResponsiveSidebar: React.FC<ResponsiveSidebarProps> = ({
  children,
  compactMode = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    if (!isMobile || !isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById("responsive-sidebar");
      const hamburger = document.getElementById("hamburger-button");

      if (
        sidebar &&
        hamburger &&
        !sidebar.contains(event.target as Node) &&
        !hamburger.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, isMobile]);

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  return (
    <>
      {/* Mobile Hamburger Button */}
      {isMobile && (
        <Button
          id="hamburger-button"
          onClick={() => setIsOpen(!isOpen)}
          className={`fixed top-4 left-4 z-50 rounded-full p-3 shadow-lg lg:hidden ${
            isOpen ? "bg-gray-100" : ""
          }`}
          aria-label="Toggle sidebar"
        >
          {isOpen ? (
            <X className={compactMode ? "w-4 h-4" : "w-5 h-5"} />
          ) : (
            <Menu className={compactMode ? "w-4 h-4" : "w-5 h-5"} />
          )}
        </Button>
      )}

      {/* Mobile Backdrop */}
      {isMobile && isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" />
      )}

      {/* Sidebar */}
      <div
        id="responsive-sidebar"
        className={`
          ${isMobile ? "fixed" : "relative"} 
          ${isMobile ? (isOpen ? "left-0" : "-left-full") : "left-0"}
          ${isMobile ? "top-0 h-full w-80" : "w-full h-auto"}
          ${isMobile ? "z-50" : "z-auto"}
          ${isMobile ? "bg-white shadow-xl" : "bg-transparent"}
          ${isMobile ? "overflow-y-auto" : "overflow-visible"}
          transition-all duration-300 ease-in-out
          ${isMobile ? "p-4 pt-16" : "p-0"}
        `}
      >
        {children}
      </div>
    </>
  );
};
