import Link from 'next/link';

export default function AutomationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      {/* Header */}
      <header className="border-b border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-white">
            PPVentures
          </Link>
          <nav className="flex gap-6">
            <Link href="/services" className="text-gray-300 hover:text-white">Services</Link>
            <Link href="/automation" className="text-orange-400 font-semibold">AI Automation</Link>
            <Link href="/about" className="text-gray-300 hover:text-white">About</Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 text-center px-4">
        <h1 className="text-5xl font-bold text-white mb-6">
          Get 10 Hours Back Every Week — <span className="text-green-400">AI Agents Run Your Business While You Sleep</span>
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
          PPVentures gives solo consultants and small agencies a 24/7 virtual ops team. 
          AI agents that find leads, book meetings and follow up — automatically.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="#signup" className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-lg text-lg">
            Start My Free 14-Day Trial →
          </Link>
          <Link href="#how-it-works" className="border-2 border-gray-500 text-gray-300 hover:text-white hover:border-gray-300 font-bold py-4 px-8 rounded-lg text-lg">
            See It In Action ↓
          </Link>
        </div>
        <p className="text-gray-400 mt-4">$297/month after 14-day free trial</p>
      </section>

      {/* Social Proof Bar */}
      <section className="py-8 bg-gray-800/50 border-y border-gray-700">
        <div className="max-w-4xl mx-auto px-4 flex flex-wrap justify-center gap-8 text-gray-300">
          <span>🤖 Powered by the same AI agents that run PPVentures 24/7</span>
          <span>⚡ Live in under 5 minutes</span>
          <span>💰 Pays for itself with one new client</span>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-10">Sound familiar?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-600">
              <div className="text-4xl mb-4">😩</div>
              <p className="text-gray-300">You're doing $20/hour admin tasks instead of $200/hour client work</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-600">
              <div className="text-4xl mb-4">📧</div>
              <p className="text-gray-300">Leads go cold because you forgot to follow up</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-600">
              <div className="text-4xl mb-4">📅</div>
              <p className="text-gray-300">You spend 3 hours a week just scheduling meetings back and forth</p>
            </div>
          </div>
          <p className="text-xl text-gray-300 mt-10">
            You didn't start a business to work 60-hour weeks. Let AI handle the ops.
          </p>
        </div>
      </section>

      {/* Three Agents Section */}
      <section className="py-16 bg-gray-800">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Your 3-Agent Virtual Operations Team
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Agent 1: Lead Finder */}
            <div className="bg-gray-700 rounded-xl p-6 border border-gray-600">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-white mb-2">AI Lead Finder</h3>
              <p className="text-gray-300 mb-4">
                Searches the web every day for businesses that match your ideal client profile
              </p>
              <p className="text-gray-300 mb-4">
                Delivers a fresh list of 10 qualified prospects every morning
              </p>
              <span className="inline-block bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm">
                🕐 Runs daily at 7AM
              </span>
            </div>
            
            {/* Agent 2: Appointment Scheduler */}
            <div className="bg-gray-700 rounded-xl p-6 border border-gray-600">
              <div className="text-4xl mb-4">📅</div>
              <h3 className="text-xl font-bold text-white mb-2">AI Appointment Scheduler</h3>
              <p className="text-gray-300 mb-4">
                Drafts personalized meeting request emails for each prospect
              </p>
              <p className="text-gray-300 mb-4">
                Follows up automatically if they don't respond in 48 hours
              </p>
              <span className="inline-block bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm">
                💤 Sends while you sleep
              </span>
            </div>
            
            {/* Agent 3: Follow-up Agent */}
            <div className="bg-gray-700 rounded-xl p-6 border border-gray-600">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-xl font-bold text-white mb-2">AI Follow-up Agent</h3>
              <p className="text-gray-300 mb-4">
                Keeps every lead warm with timely personalized messages
              </p>
              <p className="text-gray-300 mb-4">
                Never lets a hot prospect go cold because you got busy
              </p>
              <span className="inline-block bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm">
                🔥 Zero leads lost
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">How It Works</h2>
          <div className="space-y-8">
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xl shrink-0">1</div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Sign up and tell us about your business</h3>
                <p className="text-gray-400">2 minutes — just your name, email, and target customer profile</p>
              </div>
            </div>
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xl shrink-0">2</div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Configure your 3 AI agents</h3>
                <p className="text-gray-400">Set your target client, preferences, and scheduling availability</p>
              </div>
            </div>
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xl shrink-0">3</div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Watch leads and appointments roll in</h3>
                <p className="text-gray-400">Your agents work 24/7 from day one — no training needed</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 bg-gray-800 px-4">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-2xl text-gray-300 mb-2">Less than the cost of one hour of your time per day</h2>
          <div className="bg-gray-900 rounded-2xl p-8 text-center mt-6 border border-gray-600">
            <h3 className="text-2xl font-bold text-white mb-4">Business AI Automation Suite</h3>
            <div className="text-6xl font-bold text-green-400 mb-2">$297<span className="text-2xl text-gray-400">/month</span></div>
            <p className="text-gray-400 mb-6">Start with a free 14-day trial — no credit card required</p>
            <ul className="text-left text-gray-300 space-y-3 mb-8">
              <li>✅ <strong>AI Lead Finder</strong> — 10 new prospects daily</li>
              <li>✅ <strong>AI Appointment Scheduler</strong> — automated outreach</li>
              <li>✅ <strong>AI Follow-up Agent</strong> — zero cold leads</li>
              <li>✅ <strong>Live dashboard</strong> — see everything in real time</li>
              <li>✅ <strong>Cancel anytime</strong> — no lock-in</li>
            </ul>
            <Link href="#signup" className="block w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-lg text-xl">
              Start Free Trial — No Card Needed →
            </Link>
            <p className="text-gray-500 text-sm mt-4">Then $297/month. Cancel anytime.</p>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 text-center">
        <h2 className="text-4xl font-bold text-white mb-4">Your competitors are already automating. Are you?</h2>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Join the businesses using PPVentures AI agents to win back their time and grow faster.
        </p>
        <Link href="#signup" className="inline-block bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-12 rounded-lg text-xl">
          Get Started Free Today →
        </Link>
      </section>

      {/* Signup Form */}
      <section id="signup" className="py-16 px-4 bg-gray-800">
        <div className="max-w-md mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            Start Your Free Trial
          </h2>
          <form action="/api/automation/signup" method="POST" className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-2">Your Name</label>
              <input type="text" name="name" required
                className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:border-green-500 focus:outline-none"
                placeholder="John Smith" />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Email Address</label>
              <input type="email" name="email" required
                className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:border-green-500 focus:outline-none"
                placeholder="john@yourbusiness.com" />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Business Name</label>
              <input type="text" name="business_name" required
                className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:border-green-500 focus:outline-none"
                placeholder="Your Business LLC" />
            </div>
            <button type="submit" 
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-lg text-lg">
              Start Free Trial
            </button>
            <p className="text-gray-400 text-center text-sm">No credit card required</p>
          </form>
        </div>
      </section>

      <footer className="py-8 border-t border-gray-700 text-center text-gray-400">
        <p>© 2026 PPVentures. Built by AI agents.</p>
      </footer>
    </div>
  );
}
