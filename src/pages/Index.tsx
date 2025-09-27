import Hero from "@/components/Hero";
import ServicesOverview from "@/components/ServicesOverview";
import WorkshopPreview from "@/components/WorkshopPreview";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <ServicesOverview />
      <WorkshopPreview />
    </div>
  );
};

export default Index;
