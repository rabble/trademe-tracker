import { Link } from 'react-router-dom'

export function FAQPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero section */}
      <div className="relative bg-gradient-to-r from-amber-700 to-pink-700">
        {/* Navigation */}
        <div className="relative z-10">
          <nav className="relative max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-4" aria-label="Global">
            <div className="flex items-center flex-1">
              <div className="flex items-center justify-between w-full">
                <Link to="/">
                  <span className="sr-only">MiVoy</span>
                  <h1 className="text-2xl font-bold text-white">MiVoy</h1>
                </Link>
                <div className="hidden space-x-8 md:flex md:ml-10">
                  <Link to="/about" className="text-base font-medium text-white hover:text-pink-100">About</Link>
                  <Link to="/how-it-works" className="text-base font-medium text-white hover:text-pink-100">How It Works</Link>
                  <Link to="/faq" className="text-base font-medium text-white hover:text-pink-100">FAQ</Link>
                </div>
              </div>
            </div>
            <div className="flex space-x-4">
              <Link to="/login" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-pink-700 bg-white hover:bg-pink-50">
                Sign in
              </Link>
            </div>
          </nav>
        </div>
        
        <div className="absolute inset-0">
          <img
            className="w-full h-full object-cover"
            src="https://images.unsplash.com/photo-1556912172-45a7e3d3cbf5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80"
            alt="Person using laptop with house models"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-amber-700 to-pink-700 opacity-80 mix-blend-multiply" aria-hidden="true" />
        </div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">Frequently Asked Questions</h1>
          <p className="mt-6 text-2xl font-semibold text-indigo-100 max-w-3xl">
            Find answers to common questions about MiVoy
          </p>
        </div>
      </div>

      {/* FAQ content */}
      <div className="py-16 bg-white overflow-hidden">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900">
                Getting Started
              </h2>
              <dl className="mt-6 space-y-6 divide-y divide-gray-200">
                <div className="pt-6">
                  <dt className="text-lg">
                    <button
                      className="text-left w-full flex justify-between items-start text-gray-900"
                    >
                      <span className="font-medium text-gray-900">Is MiVoy free to use?</span>
                    </button>
                  </dt>
                  <dd className="mt-2 pr-12">
                    <p className="text-base text-gray-500">
                      Yes! MiVoy's core features are completely free to use. Create an account and start collecting, organizing, and tracking properties right away. We offer a Premium tier for power users that includes additional features like advanced analytics, unlimited collections, and enhanced sharing capabilities. 
                    </p>
                  </dd>
                </div>

                <div className="pt-6">
                  <dt className="text-lg">
                    <button
                      className="text-left w-full flex justify-between items-start text-gray-900"
                    >
                      <span className="font-medium text-gray-900">How do I save properties to my boards?</span>
                    </button>
                  </dt>
                  <dd className="mt-2 pr-12">
                    <p className="text-base text-gray-500">
                      It's easy! You can save properties to your boards in several ways:
                    </p>
                    <ul className="mt-3 list-disc pl-5 text-base text-gray-500 space-y-2">
                      <li>Use our browser extension to save any property you find online with one click</li>
                      <li>Copy and paste the URL of a property into MiVoy</li>
                      <li>Search for properties directly within MiVoy and save them to your boards</li>
                      <li>Upload photos of properties you've seen in person</li>
                    </ul>
                    <p className="mt-3 text-base text-gray-500">
                      Once saved, you can organize properties into different collections based on location, style, price range, or any category that inspires you.
                    </p>
                  </dd>
                </div>

                <div className="pt-6">
                  <dt className="text-lg">
                    <button
                      className="text-left w-full flex justify-between items-start text-gray-900"
                    >
                      <span className="font-medium text-gray-900">Can I share my boards on social media?</span>
                    </button>
                  </dt>
                  <dd className="mt-2 pr-12">
                    <p className="text-base text-gray-500">
                      Absolutely! MiVoy makes it simple to share your property collections with others. You can:
                    </p>
                    <ul className="mt-3 list-disc pl-5 text-base text-gray-500 space-y-2">
                      <li>Share a view-only link with friends and family</li>
                      <li>Post your collections directly to social media platforms</li>
                      <li>Invite specific people to collaborate on collections</li>
                      <li>Create public collections that anyone can browse for inspiration</li>
                    </ul>
                    <p className="mt-3 text-base text-gray-500">
                      You control the privacy settings for each collection, so you decide who sees what.
                    </p>
                  </dd>
                </div>
              </dl>
            </div>

            <div>
              <h2 className="text-3xl font-extrabold text-gray-900">
                Using MiVoy
              </h2>
              <dl className="mt-6 space-y-6 divide-y divide-gray-200">
                <div className="pt-6">
                  <dt className="text-lg">
                    <button
                      className="text-left w-full flex justify-between items-start text-gray-900"
                    >
                      <span className="font-medium text-gray-900">Does MiVoy help with the actual buying process?</span>
                    </button>
                  </dt>
                  <dd className="mt-2 pr-12">
                    <p className="text-base text-gray-500">
                      MiVoy is primarily a tool for discovering, organizing, and tracking properties you're interested in. While we don't directly facilitate property purchases, we do provide:
                    </p>
                    <ul className="mt-3 list-disc pl-5 text-base text-gray-500 space-y-2">
                      <li>Links to the original property listings where you can contact sellers or agents</li>
                      <li>Information resources about buying property in different regions</li>
                      <li>Price history and status tracking to help inform your decisions</li>
                      <li>Notes and collaboration features to help you compare options</li>
                    </ul>
                    <p className="mt-3 text-base text-gray-500">
                      Think of us as your research and organization assistant for the property journey!
                    </p>
                  </dd>
                </div>

                <div className="pt-6">
                  <dt className="text-lg">
                    <button
                      className="text-left w-full flex justify-between items-start text-gray-900"
                    >
                      <span className="font-medium text-gray-900">Is MiVoy available in my country?</span>
                    </button>
                  </dt>
                  <dd className="mt-2 pr-12">
                    <p className="text-base text-gray-500">
                      Yes! MiVoy is a global platform available worldwide. You can create collections of properties from any country or region. Our browser extension works with most major property websites globally, and you can always manually add properties from any source.
                    </p>
                    <p className="mt-3 text-base text-gray-500">
                      While our interface is currently in English, we're working on adding additional languages to make MiVoy more accessible to everyone, everywhere.
                    </p>
                  </dd>
                </div>
              </dl>
            </div>

            <div>
              <h2 className="text-3xl font-extrabold text-gray-900">
                Privacy & Security
              </h2>
              <dl className="mt-6 space-y-6 divide-y divide-gray-200">
                <div className="pt-6">
                  <dt className="text-lg">
                    <button
                      className="text-left w-full flex justify-between items-start text-gray-900"
                    >
                      <span className="font-medium text-gray-900">How does MiVoy protect my privacy?</span>
                    </button>
                  </dt>
                  <dd className="mt-2 pr-12">
                    <p className="text-base text-gray-500">
                      We take your privacy seriously. Here's how we protect your information:
                    </p>
                    <ul className="mt-3 list-disc pl-5 text-base text-gray-500 space-y-2">
                      <li>Your collections are private by default - only you can see them unless you choose to share</li>
                      <li>We never sell your personal information to third parties</li>
                      <li>You control what information is visible on your profile</li>
                      <li>You can delete your data at any time</li>
                      <li>We use industry-standard security measures to protect your account</li>
                    </ul>
                    <p className="mt-3 text-base text-gray-500">
                      For complete details, please view our <Link to="/privacy" className="text-pink-600 hover:text-pink-800">Privacy Policy</Link>.
                    </p>
                  </dd>
                </div>

                <div className="pt-6">
                  <dt className="text-lg">
                    <button
                      className="text-left w-full flex justify-between items-start text-gray-900"
                    >
                      <span className="font-medium text-gray-900">Is my payment information secure?</span>
                    </button>
                  </dt>
                  <dd className="mt-2 pr-12">
                    <p className="text-base text-gray-500">
                      Absolutely. For premium subscriptions, we use industry-leading payment processors that adhere to the highest security standards. We never store your complete credit card information on our servers. All payment transactions are encrypted and processed securely.
                    </p>
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-lg text-gray-600">
              Can't find the answer you're looking for? We'd love to help!
            </p>
            <div className="mt-4">
              <a
                href="mailto:hello@mivoy.org"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-amber-500 to-pink-500 hover:from-amber-600 hover:to-pink-600"
              >
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-amber-900 to-pink-900">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
          <div className="mt-8 border-t border-amber-700 pt-8 md:flex md:items-center md:justify-between">
            <div className="flex space-x-6 md:order-2">
              <Link to="/about" className="text-amber-300 hover:text-pink-300 transition-colors duration-200">
                About
              </Link>
              <Link to="/how-it-works" className="text-amber-300 hover:text-pink-300 transition-colors duration-200">
                How It Works
              </Link>
              <Link to="/faq" className="text-amber-300 hover:text-pink-300 transition-colors duration-200">
                FAQ
              </Link>
              <a href="https://twitter.com/rabble" className="text-amber-300 hover:text-pink-300 transition-colors duration-200">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="https://github.com/rabble" className="text-amber-300 hover:text-pink-300 transition-colors duration-200">
                <span className="sr-only">GitHub</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
            <p className="mt-8 text-base text-amber-300 md:mt-0 md:order-1">
              &copy; 2025 MiVoy by <a href="https://rabblelabs.com" className="hover:text-pink-300 transition-colors duration-200">Rabble Labs</a>. <span className="font-light italic">¿Adónde irás?</span> (Where will you go?)
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}