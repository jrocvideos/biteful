import { Smartphone, Download, Shield, CheckCircle, Bike } from 'lucide-react';

export const DriverDownload = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <Bike className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Boufet Driver App</h1>
          <p className="text-muted-foreground">Download the app and start earning today</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6 mb-4 shadow-sm">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="font-bold text-lg">Android</h2>
              <p className="text-sm text-muted-foreground">Version 1.0.0 · ~25 MB</p>
            </div>
          </div>
          <div className="space-y-2 mb-5">
            {['Allow install from unknown sources in Settings','Tap the button below to download','Open the downloaded file to install'].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center shrink-0 mt-0.5">{i + 1}</div>
                <p className="text-sm text-muted-foreground">{step}</p>
              </div>
            ))}
          </div>
          <a href="/boufet-driver.apk" download="boufet-driver.apk" className="w-full flex items-center justify-center gap-3 py-4 bg-primary text-primary-foreground rounded-xl font-bold text-lg hover:bg-primary/90 transition-colors">
            <Download className="w-5 h-5" />
            Download for Android
          </a>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6 mb-6 opacity-60">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="font-bold text-lg">iPhone (iOS)</h2>
              <p className="text-sm text-muted-foreground">Coming soon</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">iPhone drivers — open <span className="font-semibold text-foreground">boufet.com/driver</span> in Safari and tap <span className="font-semibold text-foreground">Share → Add to Home Screen</span>.</p>
        </div>
        <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-1"><Shield className="w-4 h-4 text-green-500" /><span>Safe & secure</span></div>
          <div className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-500" /><span>BC law compliant</span></div>
          <div className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-500" /><span>$21/hr guaranteed</span></div>
        </div>
      </div>
    </div>
  );
};
