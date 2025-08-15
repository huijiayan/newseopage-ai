import { Hero } from '@/components/ui/Hero';
import CustomizableResearchUI from '@/components/ui/CustomizableResearchUI';
import SubscriptionCard from '@/components/ui/SubscriptionCard';

export default function Home() {

  return (
    <div className="min-h-screen bg-[#f5f7ff] dark:bg-dark-navy">


      <Hero />
      {/* CustomizableResearchUI 组件 */}
      <CustomizableResearchUI />

      {/* SubscriptionCard 组件 */}
      <SubscriptionCard />
    </div>
  );
}
