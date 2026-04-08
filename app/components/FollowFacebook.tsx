function FacebookIcon() {
  return (
    <svg
      className="w-6 h-6 mr-3 fill-current"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.142v3.24h-1.918c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
    </svg>
  );
}

export default function FollowFacebook() {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-400 via-emerald-500 to-teal-400"></div>
      
      {/* Animated background elements */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse z-0"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-green-300/20 rounded-full blur-3xl animate-pulse delay-1000 z-0"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-emerald-300/15 rounded-full blur-3xl animate-pulse delay-500 z-0"></div>

      <div className="relative container mx-auto px-6 z-10">
        {/* Additional floating glass elements */}
        <div className="absolute top-20 left-1/4 w-24 h-24 backdrop-blur-md bg-white/5 rounded-2xl border border-white/20 shadow-lg animate-bounce delay-300 z-0"></div>
        <div className="absolute bottom-20 right-1/4 w-20 h-20 backdrop-blur-md bg-white/5 rounded-xl border border-white/20 shadow-lg animate-bounce delay-700 z-0"></div>
        
        {/* Main glass card */}
        <div className="max-w-4xl mx-auto backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 shadow-2xl p-12 text-center relative z-20">
          {/* Decorative glass elements */}
          <div className="absolute top-6 right-6 w-20 h-20 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10"></div>
          <div className="absolute bottom-6 left-6 w-16 h-16 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10"></div>
          
          <div className="relative z-10">
            <h2 className="text-5xl font-bold mb-8 tracking-tight text-white drop-shadow-lg">
              Sledujte nás na{" "}
              <span className="bg-gradient-to-r from-green-200 to-emerald-200 bg-clip-text text-transparent">
                Facebooku!
              </span>
            </h2>
            
            <p className="text-xl mb-12 max-w-2xl mx-auto leading-relaxed text-white/90 drop-shadow-sm">
              Buďte súčasťou našej komunity! Získajte exkluzívny obsah, novinky o produktoch a zapojte sa do diskusií.
            </p>
            
            {/* Glass button */}
            <div className="inline-block p-1 rounded-full bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-sm">
              <a
                href="https://www.facebook.com/profile.php?id=61575962272009" // TODO: Replace with actual Facebook page URL
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center backdrop-blur-md bg-white/20 hover:bg-white/30 text-white font-semibold py-5 px-10 rounded-full text-lg border border-white/30 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent"
              >
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-white/20 mr-3 group-hover:bg-white/30 transition-colors duration-300">
                    <FacebookIcon />
                  </div>
                  <span className="drop-shadow-sm">Prejsť na Facebook</span>
                </div>
                
                {/* Arrow icon */}
                <svg 
                  className="w-5 h-5 ml-3 transform group-hover:translate-x-1 transition-transform duration-300" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>
            
            <div className="mt-12 text-sm text-white/70 drop-shadow-sm backdrop-blur-sm bg-white/5 rounded-full py-3 px-6 inline-block border border-white/10">
              Kliknutím na tlačidlo budete presmerovaný na našu oficiálnu Facebook stránku.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 
