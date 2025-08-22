import Script from 'next/script';

type GoogleAnalyticsProps = {
  gaId: string;
};

export const GoogleAnalytics = ({ gaId }: GoogleAnalyticsProps) => (
  <>
    <Script
      src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
      strategy="afterInteractive"
    />
    <Script id="google-analytics" strategy="afterInteractive">
      {`
        window.dataLayer = window.dataLayer || [];
        function gtag(){window.dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${gaId}');
      `}
    </Script>
  </>
);
