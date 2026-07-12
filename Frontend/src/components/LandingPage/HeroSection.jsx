export default function HeroSection({
  logoImg,
  heroArtImg,
  title,
  copy,
  onGetStarted,
  onExploreFeatures,
}) {
  const scrollToFeatures = () => {
    document
      .getElementById("features")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleGetStarted = () => {
    if (typeof onGetStarted === "function") {
      onGetStarted();
      return;
    }
    scrollToFeatures();
  };

  const handleExplore = () => {
    if (typeof onExploreFeatures === "function") {
      onExploreFeatures();
      return;
    }
    scrollToFeatures();
  };

  return (
    <section
      id="home"
      className="w-full rounded-[28px] border border-slate-200/70 bg-white/85 px-6 py-8 shadow-[0_24px_70px_rgba(74,106,156,0.12)] backdrop-blur-md sm:px-8 lg:px-10 lg:py-10"
    >
      {/* Logo */}
      <header className="mb flex justify-center lg:justify-start">
        <img
          className="w-[420px] lg:w-[560px]"
          src={logoImg}
          alt="CodeSprint"
        />
      </header>

      {/* Hero Content */}
      <div className="grid items-center justify-items-center gap-12 lg:grid-cols-2 lg:gap-5">
        {/* Left Side */}
        <div className="max-w-[540px]">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.12em] text-blue-600">
            Practice, learn, and ship with confidence.
          </p>

          <h1 className="text-5xl font-bold leading-tight tracking-tight text-slate-950 sm:text-6xl">
            {title}
          </h1>

          <p className="mt-5 text-lg leading-8 text-slate-600">
            {copy}
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <button
              type="button"
              onClick={handleGetStarted}
              className="rounded-full bg-gradient-to-r from-sky-500 to-blue-700 px-7 py-4 font-semibold text-white shadow-[0_16px_30px_rgba(18,118,223,0.28)] transition duration-300 hover:-translate-y-1"
            >
              Get Started for Free
            </button>

            <button
              type="button"
              onClick={handleExplore}
              className="rounded-full border border-blue-200 bg-blue-50 px-7 py-4 font-semibold text-blue-700 transition duration-300 hover:bg-blue-100 hover:-translate-y-1"
            >
              Explore Features
            </button>
          </div>
        </div>

        {/* Right Side */}
        <figure className="flex justify-center">
          <img
            className="w-full max-w-[520px]"
            src={heroArtImg}
            alt="Student coding with charts, progress, and difficulty badges"
          />
        </figure>
      </div>
    </section>
  );
}