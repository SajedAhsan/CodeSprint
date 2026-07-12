import { communityContent, featureCards, heroContent, premiumFeatures } from './landingPageContent'
import HeroSection from './HeroSection'
import FeaturesSection from './FeaturesSection'
import CommunitySection from './CommunitySection'
import PricingSection from './PricingSection'
import FooterSection from './FooterSection'

export default function LandingPage({ onGetStarted, onExploreFeatures, onPremiumClick, onFeatureSelect }) {
  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_30%),radial-gradient(circle_at_82%_16%,rgba(96,165,250,0.12),transparent_22%),linear-gradient(180deg,#edf5ff_0%,#f8fbff_48%,#f3f8ff_100%)] px-4 py-4 text-slate-900 sm:px-6 lg:px-8">
      <HeroSection
        logoImg={heroContent.logoImg}
        heroArtImg={heroContent.heroArtImg}
        title={heroContent.title}
        copy={heroContent.copy}
        onGetStarted={onGetStarted}
        onExploreFeatures={onExploreFeatures}
      />
      <FeaturesSection features={featureCards} onFeatureSelect={onFeatureSelect} />
      <CommunitySection
        communityImg={communityContent.communityImg}
        blogImg={communityContent.blogImg}
        posts={communityContent.posts}
      />
      <PricingSection features={premiumFeatures} onPremiumClick={onPremiumClick} />
      <FooterSection logoImg={heroContent.logoImg} />
    </main>
  )
}