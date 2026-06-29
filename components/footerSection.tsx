'use client';

import { useState } from 'react';
import { Code, ExternalLink } from 'lucide-react';
import { FaTwitter, FaLinkedinIn } from 'react-icons/fa';
import { IoIosMail } from 'react-icons/io';
import { Button } from '@/components/ui/button';

export default function FooterSection() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async () => {
    if (!email || !email.includes('@')) return;
    // TODO: wire up to your newsletter API
    console.log('Subscribe:', email);
    setSubscribed(true);
    setEmail('');
  };

  return (
    <footer className="relative border-t bg-gradient-to-br from-slate-50 via-white to-slate-50/80 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950/80">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-800/25 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" />

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="grid gap-8 sm:gap-10 lg:gap-12 grid-cols-1 sm:grid-cols-2 lg:grid-cols-12">

          {/* Brand */}
          <div className="space-y-4 sm:space-y-6 lg:col-span-5 xl:col-span-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl shadow-lg">
                <Code className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary via-primary/90 to-primary/80 bg-clip-text text-transparent">
                  CodeProctor
                </span>
                <span className="text-xs text-muted-foreground/80 font-medium tracking-wide">
                  TECHNICAL INTERVIEWS
                </span>
              </div>
            </div>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-md">
              The all-in-one platform for technical interviews combining live
              video proctoring with a powerful coding environment.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-foreground/80">Follow us:</span>
              <div className="flex gap-2">
                {[
                  { href: 'https://x.com/ajSingh308', icon: <FaTwitter className="h-4 w-4" />, label: 'Twitter' },
                  { href: 'https://www.linkedin.com/in/ajay308', icon: <FaLinkedinIn className="h-4 w-4" />, label: 'LinkedIn' },
                  { href: 'mailto:codeproctor.team@gmail.com', icon: <IoIosMail className="h-4 w-4" />, label: 'Email' },
                ].map(({ href, icon, label }) => (
                  <a
                    key={label}
                    href={href}
                    target={href.startsWith('mailto') ? undefined : '_blank'}
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="group flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-border/50 bg-background/50 backdrop-blur-sm text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 hover:scale-105"
                  >
                    <span className="group-hover:scale-110 transition-transform duration-200">
                      {icon}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Product */}
          <div className="space-y-4 sm:space-y-6 lg:col-span-2 xl:col-span-2">
            <h3 className="text-sm sm:text-base font-semibold text-foreground tracking-wide uppercase relative">
              Product
              <div className="absolute -bottom-1 left-0 w-8 h-0.5 bg-gradient-to-r from-primary to-primary/60 rounded-full" />
            </h3>
            <ul className="space-y-3">
              {[
                { href: '#features', label: 'Features' },
                { href: '/docs', label: 'Documentation' },
              ].map(({ href, label }) => (
                <li key={label}>
                  <a href={href} className="group flex items-center text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors duration-200">
                    <span className="group-hover:translate-x-1 transition-transform duration-200">{label}</span>
                    <ExternalLink className="ml-1 h-3 w-3 opacity-0 group-hover:opacity-100 transition-all duration-200" />
                  </a>
                </li>
              ))}
              <li>
                <div className="flex items-center gap-2">
                  <span className="text-sm sm:text-base text-muted-foreground/60">API</span>
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 rounded-full border border-amber-200 dark:border-amber-800/50">
                    Coming Soon
                  </span>
                </div>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4 sm:space-y-6 lg:col-span-2 xl:col-span-2">
            <h3 className="text-sm sm:text-base font-semibold text-foreground tracking-wide uppercase relative">
              Support
              <div className="absolute -bottom-1 left-0 w-8 h-0.5 bg-gradient-to-r from-primary to-primary/60 rounded-full" />
            </h3>
            <ul className="space-y-3">
              {[
                { href: '#faq', label: 'FAQ' },
                { href: '/report-issue', label: 'Report Bug' },
              ].map(({ href, label }) => (
                <li key={label}>
                  <a href={href} className="group flex items-center text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors duration-200">
                    <span className="group-hover:translate-x-1 transition-transform duration-200">{label}</span>
                    <ExternalLink className="ml-1 h-3 w-3 opacity-0 group-hover:opacity-100 transition-all duration-200" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4 sm:space-y-6 lg:col-span-3 xl:col-span-2">
            <h3 className="text-sm sm:text-base font-semibold text-foreground tracking-wide uppercase relative">
              Company
              <div className="absolute -bottom-1 left-0 w-8 h-0.5 bg-gradient-to-r from-primary to-primary/60 rounded-full" />
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="/blog" className="group flex items-center text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors duration-200">
                  <span className="group-hover:translate-x-1 transition-transform duration-200">Blog</span>
                  <ExternalLink className="ml-1 h-3 w-3 opacity-0 group-hover:opacity-100 transition-all duration-200" />
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4 sm:space-y-6 lg:col-span-12 xl:col-span-2 lg:border-t lg:pt-8 xl:border-t-0 xl:pt-0">
            <h3 className="text-sm sm:text-base font-semibold text-foreground tracking-wide uppercase relative">
              Stay Updated
              <div className="absolute -bottom-1 left-0 w-8 h-0.5 bg-gradient-to-r from-primary to-primary/60 rounded-full" />
            </h3>
            <div className="space-y-3">
              <p className="text-xs sm:text-sm text-muted-foreground">
                Get the latest updates and features delivered to your inbox.
              </p>
              {subscribed ? (
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                  ✅ You're subscribed!
                </p>
              ) : (
                <div className="flex flex-col sm:flex-row xl:flex-col gap-2">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
                    className="flex-1 px-3 py-2 text-sm bg-background/50 border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200"
                  />
                  <Button
                    onClick={handleSubscribe}
                    className="px-4 py-2 text-sm cursor-pointer font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg transition-colors duration-200 whitespace-nowrap"
                  >
                    Subscribe
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border/30 mt-8 sm:mt-12 lg:mt-16 pt-6 sm:pt-8">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6 lg:gap-8">
            {/* Left */}
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 lg:gap-8">
              <div className="flex items-center gap-2 group">
                <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg border border-primary/20 group-hover:border-primary/40 transition-all duration-300">
                  <Code className="h-4 w-4 text-primary group-hover:scale-110 transition-transform duration-300" />
                </div>
                <span className="text-sm font-semibold text-foreground/90 group-hover:text-foreground transition-colors duration-300">
                  CodeProctor
                </span>
              </div>
              <a
                href="/docs"
                className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-all duration-200"
              >
                <div className="flex items-center justify-center w-5 h-5 rounded border border-border/50 bg-background/50 group-hover:border-primary/50 group-hover:bg-primary/5 transition-all duration-200">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span className="group-hover:translate-x-0.5 transition-transform duration-200">Documentation</span>
              </a>
            </div>

            {/* Right */}
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 lg:gap-8">
              <div className="text-xs sm:text-sm text-muted-foreground/80 text-center sm:text-left">
                © {new Date().getFullYear()} CodeProctor. All rights reserved.
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground/70">
                <span>Made with</span>
                <span className="text-red-500 animate-pulse text-sm">❤️</span>
                <span>by</span>
                <a
                  href="https://github.com/Ajay-308"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-foreground/80 hover:text-primary transition-colors duration-200 underline decoration-dotted underline-offset-2 hover:decoration-solid"
                >
                  ajay
                </a>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground/60 bg-background/50 px-3 py-1.5 rounded-full border border-border/30">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-sm shadow-green-500/50" />
                <span className="font-medium">All systems operational</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}