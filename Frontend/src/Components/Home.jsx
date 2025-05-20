  import React, { useState, useEffect } from "react";
  import { Link, useNavigate } from "react-router-dom";
  import { Helmet } from "react-helmet";
  import { Loader2 } from "lucide-react";
  import { FiSun, FiMoon } from "react-icons/fi";
  import useAppStore from "../store/useAppStore";
  // Reusable button component
  const CTAButton = ({ children, to, variant = "primary", className = "" }) => (
    <Link
      to={to}
      className={`py-3 px-6 rounded-lg transition font-semibold ${
        variant === "primary"
          ? "bg-blue-600 text-white hover:bg-blue-500"
          : "bg-white text-blue-600 hover:bg-blue-500 hover:text-white"
      } ${className}`}
    >
      {children}
    </Link>
  );

  const FeatureCard = ({ title, description, onClick }) => (
    <div
      className="p-6 rounded-lg shadow hover:shadow-lg transition cursor-pointer group"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
    >
      <h3 className="text-xl font-bold mb-4 group-hover:text-blue-600">
        {title}
      </h3>
      <p>{description}</p>
    </div>
  );

  const Home = () => {
    const isLoading = false;
    const navigate = useNavigate();

    // Zustand store values and setters
    const theme = useAppStore((state) => state.theme);
    const setTheme = useAppStore((state) => state.setTheme);

    // Toggle theme handler
    const toggleDarkMode = () => {
      const newTheme = !theme;
      setTheme(newTheme);
      localStorage.setItem("darkMode", JSON.stringify(newTheme));
    };

    const features = [
      {
        title: "Real-Time Collaboration",
        description:
          "Edit documents with your team in real-time with live cursor tracking and updates.",
        onClick: () => navigate("/features/collaboration"),
      },
      {
        title: "Rich Text Editing",
        description: "Format your text easily with headings, lists, and more.",
        onClick: () => navigate("/features/editing"),
      },
      {
        title: "Cloud Storage",
        description: "Save your work securely and access it from anywhere.",
        onClick: () => navigate("/features/storage"),
      },
    ];

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      );
    }

    return (
      <>
        <Helmet>
          <title>Collaborative Text Editor - Create and Share Documents</title>
          <meta
            name="description"
            content="Experience seamless teamwork with our real-time collaborative text editor."
          />
        </Helmet>

        <div
          className={`min-h-screen ${
            theme ? "bg-gray-900 text-gray-100" : "bg-gray-100 text-gray-800"
          } flex flex-col`}
        >
          {/* Navigation */}
          <nav
            className={`py-4 px-6 ${
              theme ? "bg-gray-800" : "bg-blue-600 text-white"
            }`}
          >
            <div className="container mx-auto flex justify-between items-center">
              <Link to="/" className="text-xl font-bold">
                CollabEdit
              </Link>
              <div className="space-x-4 flex items-center">
                <button
                  onClick={toggleDarkMode}
                  className="px-4 py-2 rounded-md transition flex items-center justify-center"
                  style={{ color: theme ? "yellow" : "white" }}
                  aria-label="Toggle Dark Mode"
                >
                  {theme ? <FiSun size={20} /> : <FiMoon size={20} />}
                </button>
                <Link to="/login" className="hover:text-blue-200 transition">
                  Login
                </Link>
                <CTAButton to="/signup" variant="secondary">
                  Sign Up
                </CTAButton>
              </div>
            </div>
          </nav>

          {/* Hero Section */}
          <header
            className={`py-16 px-6 text-center ${
              theme ? "bg-gray-800 text-white" : "bg-blue-600 text-white"
            }`}
          >
            <div className="container mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Create. Collaborate. Share.
              </h1>
              <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
                Experience seamless teamwork with our real-time collaborative text
                editor.
              </p>
              <CTAButton
                to="/login"
                variant="secondary"
                aria-label="Get Started with CollabEdit"
              >
                Get Started
              </CTAButton>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-grow container mx-auto py-12 px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Why Choose Us?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <FeatureCard
                  key={index}
                  title={feature.title}
                  description={feature.description}
                  onClick={feature.onClick}
                />
              ))}
            </div>
          </main>

          {/* Footer */}
          <footer
            className={`py-8 px-6 ${
              theme ? "bg-gray-800 text-white" : "bg-blue-600 text-white"
            }`}
          >
            <div className="container mx-auto text-center">
              <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="mb-6 max-w-xl mx-auto">
                Sign up today and start collaborating effortlessly with your team.
                Join thousands of users who trust our platform.
              </p>
              <CTAButton to="/signup" variant="secondary">
                Sign Up Now
              </CTAButton>
              <div className="mt-8 text-sm text-gray-400">
                <p>&copy; 2024 CollabEdit. All rights reserved.</p>
              </div>
            </div>
          </footer>
        </div>
      </>
    );
  };

  export default Home;