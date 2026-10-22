import { useCallback, useState } from 'react';
import Nav from './components/Nav';
import Hero from './components/Hero';
import AppStrip from './components/AppStrip';
import LiveDemo from './components/LiveDemo';
import Features from './components/Features';
import UseCases from './components/UseCases';
import TypingTest from './components/TypingTest';
import SpeedCalculator from './components/SpeedCalculator';
import Privacy from './components/Privacy';
import Pricing from './components/Pricing';
import Faq from './components/Faq';
import FinalCta from './components/FinalCta';
import Footer from './components/Footer';
import WaitlistDialog from './components/WaitlistDialog';

export default function App() {
  const [typingWpm, setTypingWpm] = useState<number | null>(null);
  const [speakingWpm, setSpeakingWpm] = useState<number | null>(null);
  const [waitlist, setWaitlist] = useState<{ open: boolean; plan: string }>({ open: false, plan: 'Pro' });
  const openWaitlist = useCallback((plan = 'Pro') => setWaitlist({ open: true, plan }), []);
  const closeWaitlist = useCallback(() => setWaitlist((current) => ({ ...current, open: false })), []);

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Nav onJoin={() => openWaitlist()} />
      <main id="main">
        <Hero onJoin={() => openWaitlist()} />
        <AppStrip />
        <LiveDemo />
        <Features />
        <UseCases />
        <TypingTest onTypingWpm={setTypingWpm} onSpeakingWpm={setSpeakingWpm} />
        <SpeedCalculator typingResult={typingWpm} speakingResult={speakingWpm} />
        <Privacy />
        <Pricing onChoose={openWaitlist} />
        <Faq />
        <FinalCta onJoin={() => openWaitlist()} />
      </main>
      <Footer />
      <WaitlistDialog open={waitlist.open} plan={waitlist.plan} onClose={closeWaitlist} />
    </>
  );
}
