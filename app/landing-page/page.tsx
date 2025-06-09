import Benefits from "../components/Benefits";
import Composition from "../components/Composition";
import CTAWithContent from "../components/CTAWithContent";
import Comparsion from "../components/landing-page/Comparsion";
import DosageHighlight from "../components/landing-page/DosageHighlight";
import FAQ from "../components/landing-page/FAQ";
import Hero from "../components/landing-page/Hero";
import Products from "../components/landing-page/Products";
import Reviews from "../components/Reviews";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <Benefits />
      <DosageHighlight />
      <Composition />
      <Reviews />
      <Comparsion />
      <CTAWithContent />
      <Products />
      <FAQ />
    </>
  );
}
