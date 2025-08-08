
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import {
  ArrowRight,
  FileText,
  Users,
  Cloud,
  Moon,
  Sun,
  Sparkles,
  Zap,
  Shield,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import useAppStore from "../store/useAppStore";


const Home = () => {
  const featureRef = useRef(null);
  const navigate = useNavigate();
  const theme = useAppStore((state) => state.theme);
  const setTheme = useAppStore((state) => state.setTheme);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const scrollToFeature = () => {
    featureRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleDarkMode = () => {
    const newTheme = !theme;
    setTheme(newTheme);
    localStorage.setItem("darkMode", JSON.stringify(newTheme));
  };

  const features = [
    {
      icon: <Users className="w-6 h-6" />,
      title: "Real-Time Collaboration",
      description:
        "See changes as they happen with live cursor tracking and instant updates.",
      gradient: "from-blue-600 to-indigo-600",
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "Rich Text Editing",
      description:
        "Powerful formatting with support for markdown, tables, and media embeds.",
      gradient: "from-purple-600 to-pink-600",
    },
    {
      icon: <Cloud className="w-6 h-6" />,
      title: "Cloud Storage",
      description:
        "Your documents are automatically saved and synced across all devices.",
      gradient: "from-emerald-600 to-teal-600",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Lightning Fast",
      description:
        "Optimized performance ensures a smooth experience even with large documents.",
      gradient: "from-amber-500 to-orange-600",
    },
    
  ];

  return (
    <>
      <Helmet>
        <title>CollabEdit - Modern Collaborative Text Editor</title>
        <meta
          name="description"
          content="A next-generation collaborative text editor for modern teams"
        />
      </Helmet>

      <div
        className={`min-h-screen ${
          theme ? "bg-[#0a0d14]" : "bg-gray-50"
        } text-gray-100`}
      >
        {/* Navigation */}
        <nav
          className={`fixed top-0 left-0 right-0 z-50 py-4 px-6 transition-all duration-300 ${
            isScrolled
              ? theme
                ? "bg-[#0a0d14]/80 backdrop-blur-lg border-b border-gray-800/50"
                : "bg-white/80 backdrop-blur-lg border-b border-gray-200/50 text-gray-900"
              : theme
              ? "bg-transparent"
              : "bg-transparent text-gray-900"
          }`}
        >
          <div className="container mx-auto flex justify-between items-center">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold">
              <div className="relative">
                <div className="absolute -inset-1 rounded-full blur-md bg-gradient-to-r from-blue-600 to-indigo-600 opacity-70"></div>
                <FileText className="h-6 w-6 relative" />
              </div>
              <span>CollabEdit</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <div className="flex items-center gap-6">
                {/* <div
                  onClick={scrollToFeature}
                  className="hover:text-blue-500 cursor-pointer transition"
                >
                  Features
                </div> */}
                {/* <Link to="/demo" className="hover:text-blue-500 transition">
                  Demo
                </Link> */}
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={toggleDarkMode}
                  className={`p-2 rounded-full transition ${
                    theme
                      ? "bg-gray-800/50 hover:bg-gray-700/50"
                      : "bg-gray-200/50 hover:bg-gray-300/50"
                  }`}
                  aria-label="Toggle Dark Mode"
                >
                  {theme ? (
                    <Sun className="h-5 w-5 text-yellow-400" />
                  ) : (
                    <Moon className="h-5 w-5 text-gray-700" />
                  )}
                </button>

                <Link
                  to="/login"
                  className={`px-4 py-2 rounded-md transition ${
                    theme
                      ? "hover:bg-gray-800/70 border border-gray-700"
                      : "hover:bg-gray-200/70 border border-gray-300 text-gray-900"
                  }`}
                >
                  Login
                </Link>

                <Link
                  to="/signup"
                  className="relative px-5 py-2.5 rounded-md overflow-hidden group"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600"></span>
                  <span className="relative flex items-center justify-center text-white font-medium">
                    Sign Up
                  </span>
                </Link>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-md"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div
            className={`fixed inset-0 z-40 pt-20 ${
              theme ? "bg-[#0a0d14]" : "bg-white text-gray-900"
            }`}
          >
            <div className="container mx-auto px-6 py-8 flex flex-col gap-6">
              {/* <div
                className="text-xl py-3 border-b border-gray-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </div> */}
              {/* <Link
                to="/demo"
                className="text-xl py-3 border-b border-gray-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                Demo
              </Link> */}
              <Link
                to="/login"
                className="text-xl py-3 border-b border-gray-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="mt-4 py-3 rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center text-xl"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign Up
              </Link>
            </div>
          </div>
        )}

        {/* Hero Section */}
        <section
          className={`pt-32 pb-20 px-6 relative overflow-hidden ${
            theme ? "" : "text-gray-900"
          }`}
        >
          {/* Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-[30%] -left-[10%] w-[50%] h-[70%] rounded-full bg-blue-600/10 blur-3xl"></div>
            <div className="absolute -bottom-[30%] -right-[10%] w-[50%] h-[70%] rounded-full bg-indigo-600/10 blur-3xl"></div>
          </div>

          <div className="container mx-auto max-w-6xl relative">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-6 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border border-blue-500/20">
                <Sparkles className="h-3.5 w-3.5 mr-2 text-blue-500" />
                <span className={theme ? "text-blue-400" : "text-blue-600"}>
                  Next-gen document collaboration
                </span>
              </div>

              <h1 className="text-4xl md:text-6xl w-full font-bold leading-tight mb-6">
                Create, collaborate, and share documents{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                  in real-time
                </span>
              </h1>

              <p className="text-lg md:text-xl opacity-80 mb-8">
                A powerful text editor designed for modern teams. Experience
                seamless collaboration with advanced features.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/signup"
                  className="relative px-6 py-3.5 rounded-md overflow-hidden group"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600"></span>
                  <span className="relative flex items-center justify-center text-white font-medium">
                    Get Started Free
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </span>
                </Link>

                {/* <Link
                  to="/demo"
                  className={`px-6 py-3.5 rounded-md transition flex items-center justify-center gap-2 font-medium ${
                    theme
                      ? "bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700"
                      : "bg-gray-200/50 hover:bg-gray-300/50 border border-gray-300"
                  }`}
                >
                  See Demo
                </Link> */}
              </div>
            </div>

            {/* App Preview */}
            {/* <div className="relative mx-auto max-w-4xl">
              <div className="absolute inset-0 -z-10 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-2xl blur-xl transform translate-y-4"></div>

              <div
                className={`rounded-xl overflow-hidden shadow-2xl ${
                  theme
                    ? "bg-[#111827] border border-gray-800"
                    : "bg-white border border-gray-200"
                }`}
              >
                <div
                  className={`p-2 ${
                    theme ? "bg-[#0f172a]" : "bg-gray-50"
                  } flex items-center gap-2`}
                >
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div
                    className={`text-xs ml-2 ${
                      theme ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    document.collabedit.io
                  </div>
                </div>

                <div className="p-0">
                  <img
                    src="/placeholder.svg?height=600&width=1000"
                    alt="CollabEdit Interface Preview"
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </div> */}
          </div>
        </section>

        {/* Features Section */}
        <section
          ref={featureRef}
          className={`py-20 px-6 relative ${
            theme ? "bg-[#0c101d]" : "bg-gray-100 text-gray-900"
          }`}
        >
          <div className="container mx-auto max-w-6xl relative">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Powerful Features
              </h2>
              <p className="text-lg opacity-80 max-w-2xl mx-auto">
                Everything you need for seamless document collaboration
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`p-6 rounded-xl transition duration-300 group
  ${
    theme
      ? "bg-[#111827]/50 hover:bg-[#111827] hover:shadow-lg hover:shadow-blue-500/30 border border-gray-800"
      : "bg-white hover:shadow-xl hover:shadow-indigo-500/30 border border-gray-200"
  }`}
                >
                  <div
                    className={`flex items-center justify-center w-12 h-12 rounded-lg mb-4 bg-gradient-to-br ${feature.gradient}`}
                  >
                    {feature.icon}
                  </div>

                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="opacity-80 mb-4">{feature.description}</p>

                  <div
                    className={`inline-flex items-center text-sm font-medium bg-clip-text text-transparent bg-gradient-to-r ${feature.gradient}`}
                  >
                    
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        {/* <section
          className={`py-20 px-6 ${
            theme ? "bg-[#0a0d14]" : "bg-white text-gray-900"
          }`}
        >
          <div className="container mx-auto max-w-6xl">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-5xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                  99.9%
                </div>
                <p className="opacity-80">Uptime reliability</p>
              </div>

              <div className="text-center">
                <div className="text-5xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                  10,000+
                </div>
                <p className="opacity-80">Active users</p>
              </div>

              <div className="text-center">
                <div className="text-5xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600">
                  5M+
                </div>
                <p className="opacity-80">Documents created</p>
              </div>
            </div>
          </div>
        </section> */}

        {/* CTA Section */}
        <section
          className={`py-20 px-6 relative overflow-hidden ${
            theme ? "bg-[#0c101d]" : "bg-gray-100 text-gray-900"
          }`}
        >
          {/* Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-[30%] -right-[10%] w-[40%] h-[60%] rounded-full bg-blue-600/10 blur-3xl"></div>
            <div className="absolute bottom-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-3xl"></div>
          </div>

          <div className="container mx-auto max-w-4xl relative">
            <div
              className={`p-12 rounded-2xl ${
                theme
                  ? "bg-gradient-to-br from-[#111827]/80 to-[#0f172a]/80 border border-gray-800/50 backdrop-blur-sm"
                  : "bg-white/80 border border-gray-200/50 backdrop-blur-sm shadow-xl"
              }`}
            >
              <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Ready to transform your workflow?
                </h2>
                <p className="text-lg opacity-80 max-w-2xl mx-auto mb-8">
                  Start collaborating with your team in real-time today.
                </p>

                <Link
                  to="/signup"
                  className="relative inline-flex px-8 py-4 rounded-md overflow-hidden group"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600"></span>
                  <span className="relative flex items-center justify-center text-white font-medium text-lg">
                    Get Started Free
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer
          className={`py-12 px-6 ${
            theme
              ? "bg-[#0a0d14] border-t border-gray-800"
              : "bg-white border-t border-gray-200 text-gray-900"
          }`}
        >
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="absolute -inset-1 rounded-full blur-md bg-gradient-to-r from-blue-600 to-indigo-600 opacity-70"></div>
                  <FileText className="h-6 w-6 relative" />
                </div>
                <span className="text-xl font-bold">CollabEdit</span>
              </div>

              <div className="flex gap-6">
                <div
                  onClick={scrollToFeature}
                  className="hover:text-blue-500 cursor-pointer transition"
                >
                  Features
                </div>
                {/* <Link to="/demo" className="hover:text-blue-500 transition">
                  Demo
                </Link> */}
                <Link to="/login" className="hover:text-blue-500 transition">
                  Login
                </Link>
              </div>

              <p className="text-sm opacity-60">
                &copy; {new Date().getFullYear()} CollabEdit. A portfolio
                project.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Home;
