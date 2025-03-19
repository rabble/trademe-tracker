import { Link } from 'react-router-dom'

export function AboutPage() {
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
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80"
            alt="Beautiful house with garden"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-amber-700 to-pink-700 opacity-80 mix-blend-multiply" aria-hidden="true" />
        </div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">Our Story</h1>
          <p className="mt-6 text-2xl font-semibold text-indigo-100 max-w-3xl">
            From daydreams to digital collections
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="py-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900">
                How It All Started
              </h2>
              <p className="mt-4 text-lg text-gray-500">
                MiVoy was born from a desire that many of us share – the daydream of packing up and starting somewhere new. As a founder who has lived across multiple continents, I found myself constantly bookmarking properties in browser tabs and sharing links with my partner, only to lose track of them days later.
              </p>
              <p className="mt-4 text-lg text-gray-500">
                After moving to New Zealand, then back to the US, and exploring potential homes in Spain and Latin America, I realized there wasn't a good way to keep track of all the property listings that caught my eye across different countries and different sites.
              </p>
              <p className="mt-4 text-lg text-gray-500">
                What if there was a simple, beautiful way to collect all these possibilities in one place? That question sparked MiVoy – a platform that helps you collect, organize, and track property listings from around the world.
              </p>

              <h3 className="mt-8 text-2xl font-bold text-gray-900">
                Why "MiVoy"?
              </h3>
              <p className="mt-4 text-lg text-gray-500">
                "Mi voy" is Spanish for "I'm going!" or "I'm off!" – a phrase that perfectly captures that moment of excitement when you decide to embark on a new adventure. It's about taking that first step toward something new, whether it's moving abroad, finding a weekend cabin, or just exploring what's possible.
              </p>
              <p className="mt-4 text-lg text-gray-500">
                The name embodies our belief that your living space is more than just an address – it's the starting point for your next chapter.
              </p>
            </div>

            <div className="mt-12 relative text-base max-w-prose lg:mt-0 lg:ml-0">
              <blockquote className="mt-8 relative">
                <div className="absolute top-0 left-0 transform -translate-x-6 -translate-y-8">
                  <svg className="h-16 w-16 text-amber-400 opacity-50" fill="currentColor" viewBox="0 0 32 32" aria-hidden="true">
                    <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                  </svg>
                </div>
                <div className="relative z-10">
                  <p className="text-2xl font-medium text-gray-600 italic">
                    Home is not where you are from, it's where you want to belong.
                  </p>
                </div>
              </blockquote>
              <div className="mt-12">
                <img className="h-64 w-full object-cover rounded-lg shadow-lg" src="https://images.unsplash.com/photo-1511376979163-f804dff7ad7b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=987&q=80" alt="Mountain cabin" />
              </div>
            </div>
          </div>

          <div className="mt-16">
            <h2 className="text-3xl font-extrabold text-gray-900">
              What We're Building
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              MiVoy is like Pinterest for real estate – a visual collection of places you might want to call home someday. We help you:
            </p>
            <ul className="mt-4 space-y-2">
              <li className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-pink-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                </div>
                <p className="ml-3 text-base text-gray-600">Discover interesting properties from around the world</p>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-pink-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <p className="ml-3 text-base text-gray-600">Organize them into collections that inspire you</p>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-pink-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <p className="ml-3 text-base text-gray-600">Track price changes and status updates automatically</p>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-pink-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </div>
                <p className="ml-3 text-base text-gray-600">Share your finds with friends, family, or partners</p>
              </li>
            </ul>
            <p className="mt-6 text-lg text-gray-500">
              Whether you're actively searching for your next home, planning a future move abroad, or just enjoying the "what if" of browsing beautiful spaces, MiVoy helps you keep track of it all in one beautiful place.
            </p>
          </div>

          <div className="mt-16 lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900">
                About Rabble Labs & The Founder
              </h2>
              <p className="mt-4 text-lg text-gray-500">
                MiVoy is a product of <a href="https://rabblelabs.com" className="text-pink-600 hover:text-pink-700">Rabble Labs</a>, a studio focused on building tools for human connection and exploration.
              </p>
              <p className="mt-4 text-lg text-gray-500">
                Founded by Evan Henshaw-Plath (aka "Rabble"), a technologist with a passion for social systems and digital communities. As an early Twitter employee, activist, and digital nomad, Evan has lived and worked across multiple continents while helping build tools that connect people.
              </p>
              <p className="mt-4 text-lg text-gray-500">
                MiVoy grew from Evan's own experiences moving between countries and the challenge of keeping track of property listings across different platforms, currencies, and contexts. The platform aims to bring the same ease of collection and organization to property hunting that we've come to expect in other areas of digital life.
              </p>
              <div className="mt-6">
                <a href="https://twitter.com/rabble" className="text-pink-600 hover:text-pink-800 flex items-center">
                  <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                  Follow @rabble on Twitter
                </a>
              </div>
            </div>
            <div className="mt-12 lg:mt-0">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <img className="w-full object-cover h-64" src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80" alt="Team collaboration" />
                <div className="px-4 py-5 sm:p-6 bg-gradient-to-r from-amber-50 to-pink-50">
                  <blockquote className="italic text-gray-700">
                    "I believe in the power of 'what if' – those moments when we imagine a different life, in a different place. MiVoy is built to nurture those dreams, whether they remain pleasant daydreams or become your next chapter."
                    <footer className="mt-2 text-sm text-gray-500">
                      — Evan Henshaw-Plath, Founder
                    </footer>
                  </blockquote>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16">
            <h2 className="text-3xl font-extrabold text-gray-900">
              From Dream to Reality: My Uruguay Story
            </h2>
            <div className="mt-6 lg:grid lg:grid-cols-2 lg:gap-12">
              <div>
                <p className="text-lg text-gray-500">
                  My own journey with property dreams began when I visited Uruguay, exploring the enchanting bohemian beach town of Punta del Diablo. What started as a curious visit to this remote coastal village turned into a love affair with its pristine beaches, artistic community, and relaxed way of life.
                </p>
                <p className="mt-4 text-lg text-gray-500">
                  Captivated by the town's charm, I decided to purchase a small piece of land near the beach and build a traditional thatched roof cabin—a "rancho"—using local techniques and materials. This wasn't just about having a vacation home; it was about embracing a different lifestyle and connecting with a place that resonated with me.
                </p>
                <p className="mt-4 text-lg text-gray-500">
                  The journey from first seeing the property online to building my dream beach house was filled with challenges, excitement, and countless "what if" moments—exactly the kind of journey that inspired MiVoy. Today, my thatched beach house stands among the trees, a short walk from the ocean, available for others to experience through <a href="https://alquilereseneldiablo.com/cabana/arbol/" className="text-pink-600 hover:text-pink-700">AlquileresEnElDiablo.com</a>.
                </p>
              </div>
              <div className="mt-8 lg:mt-0">
                <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden shadow-lg">
                  <img 
                    src="https://alquilereseneldiablo.com/wp-content/uploads/2020/12/IMG_20201110_171231425-min-scaled.jpg" 
                    alt="Thatched roof beach house in Punta del Diablo, Uruguay" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="mt-3 text-sm text-gray-500 italic">
                  My thatched roof beach house nestled among the trees in Punta del Diablo, Uruguay
                </p>
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div>
                    <img 
                      src="https://alquilereseneldiablo.com/wp-content/uploads/2020/12/DSC_0085-min-scaled.jpg" 
                      alt="View from the deck of beach house" 
                      className="rounded-lg shadow-md w-full h-48 object-cover"
                    />
                  </div>
                  <div>
                    <img 
                      src="https://alquilereseneldiablo.com/wp-content/uploads/2020/12/DSC_0156-min-scaled.jpg" 
                      alt="Interior of the beach house" 
                      className="rounded-lg shadow-md w-full h-48 object-cover"
                    />
                  </div>
                </div>
                <p className="mt-4 text-base text-gray-700 font-medium">
                  This personal experience of turning a property dream into reality is what drives MiVoy—helping others organize and visualize their own "what if" moments, whether they remain dreams or become the next chapter in their story.
                </p>
              </div>
            </div>
          </div>

          {/* CTA section */}
          <div className="mt-16 bg-gradient-to-r from-amber-50 to-pink-50 rounded-lg overflow-hidden sm:grid sm:grid-cols-2 sm:gap-4 sm:items-center">
            <div className="p-8">
              <h2 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
                Join Our Journey
              </h2>
              <p className="mt-4 text-lg text-gray-500">
                MiVoy is still growing and evolving. We'd love to hear your feedback, learn about your property dreams, and build something that truly helps you collect and organize the spaces that inspire you.
              </p>
              <div className="mt-6 flex">
                <Link
                  to="/register"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-amber-500 to-pink-500 hover:from-amber-600 hover:to-pink-600"
                >
                  Start Your Collection
                </Link>
                <a
                  href="mailto:hello@mivoy.org"
                  className="ml-4 inline-flex items-center px-6 py-3 border border-pink-300 text-base font-medium rounded-md text-pink-700 bg-white hover:bg-pink-50"
                >
                  Get in Touch
                </a>
              </div>
            </div>
            <div className="p-8">
              <img
                className="w-full h-full object-cover rounded-lg shadow"
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1171&q=80"
                alt="Collaboration"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-amber-900 to-pink-900">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
          <div className="mt-8 border-t border-amber-700 pt-8 md:flex md:items-center md:justify-between">
            <div className="flex space-x-6 md:order-2">
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
              &copy; 2025 MiVoy by Rabble Labs. <span className="font-light italic">¿Adónde irás?</span> (Where will you go?)
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}