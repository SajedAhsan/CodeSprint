export default function CommunitySection({ communityImg, blogImg }) {
  return (
    <section
      id="community"
      className="w-full rounded-[28px] border border-slate-200/70 bg-white/85 p-5 shadow-[0_24px_70px_rgba(74,106,156,0.12)] backdrop-blur-md sm:p-7 lg:p-8"
    >
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Community Card */}
        <div className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-[0_16px_34px_rgba(58,94,146,0.1)]">
          <span className="text-sm font-bold uppercase tracking-[0.12em] text-blue-600">
            Engage and Learn
          </span>

          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-4xl">
            Community learning that keeps momentum high.
          </h2>

          <p className="mt-3 text-slate-600 leading-7">
            Ask questions, discuss solutions, collaborate with fellow
            programmers, and learn from experienced developers in an active
            coding community.
          </p>

          <img
            className="mt-6 w-full rounded-[18px]"
            src={communityImg}
            alt="Community discussion"
          />
        </div>

        {/* Blog Card */}
        <div className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-[0_16px_34px_rgba(58,94,146,0.1)]">
          <span className="text-sm font-bold uppercase tracking-[0.12em] text-blue-600">
            Blog
          </span>

          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-4xl">
            Short reads that reinforce the lesson.
          </h2>

          <p className="mt-3 text-slate-600 leading-7">
            Stay updated with programming tutorials, interview tips, algorithm
            explanations, competitive programming guides, and software
            engineering articles.
          </p>

          <img
            className="mt-6 w-full rounded-[18px]"
            src={blogImg}
            alt="Programming blog"
          />
        </div>
      </div>
    </section>
  );
}