import { Smartphone, Download, CheckCircle, ChefHat, Globe } from 'lucide-react';

export const KDSDownload = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-16">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <ChefHat className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Boufet Kitchen Display</h1>
          <p className="text-muted-foreground">Never lose another order in your kitchen</p>
        </div>
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-green-600" />
              </div>
              <div><h2 className="font-bold text-lg">Android Tablet</h2><p className="text-sm text-muted-foreground">Version 1.0.0 · ~101 MB</p></div>
            </div>
            <div className="space-y-2 mb-5">
              {['Enable "Install unknown apps" in Settings','Tap Download APK below','Open downloaded file to install','Open app — your orders appear instantly'].map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center shrink-0 mt-0.5">{i + 1}</div>
                  <p className="text-sm text-muted-foreground">{step}</p>
                </div>
              ))}
            </div>
            <a href="https://expo.dev/accounts/bloufet/projects/boufet-kds/builds/3adecc76-f1f1-4583-a959-8402ca4fc0c1"
              target="_blank" rel="noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-colors">
              <Download className="w-5 h-5" /> Download Android APK
            </a>
          </div>
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center">
                <Globe className="w-6 h-6 text-blue-600" />
              </div>
              <div><h2 className="font-bold text-lg">Any Browser</h2><p className="text-sm text-muted-foreground">iPad, laptop, any device</p></div>
            </div>
            <div className="space-y-2 mb-5">
              {['Open browser on your tablet or laptop','Go to your restaurant URL below','Bookmark it for quick access','Works on iPad, Android, any screen'].map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center shrink-0 mt-0.5">{i + 1}</div>
                  <p className="text-sm text-muted-foreground">{step}</p>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              {[{name:'Burger Vault',slug:'burger-vault'},{name:'Papa Johns',slug:'papa-johns'},{name:'Smoke2Snack',slug:'smoke2snack'},{name:'Blue Water Cafe',slug:'blue-water-cafe'}].map(r => (
                <a key={r.slug} href={`/r/${r.slug}/orders`} className="flex items-center justify-between px-3 py-2 bg-muted rounded-lg hover:bg-primary/10 transition-colors group">
                  <span className="text-sm font-medium">{r.name}</span>
                  <span className="text-xs text-muted-foreground group-hover:text-primary">boufet.com/r/{r.slug}/orders →</span>
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-bold mb-4 text-center">What's included</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {['3-column kitchen display','Real-time order alerts','Express order priority','Wedding & event orders','One-tap order workflow','Works offline (demo mode)','Auto-archive after 2hrs','Sound notifications','Any tablet or browser'].map(f => (
              <div key={f} className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-sm text-muted-foreground">{f}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-6">Free during Boufet beta · No subscription required · Setup takes under 5 minutes</p>
      </div>
    </div>
  );
};
