import '../styles/globals.css';
import 'bootstrap/dist/css/bootstrap.min.css';
// bootstrap icons
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useEffect } from 'react';
import Script from 'next/script';

function MyApp({ Component, pageProps }) {
  // Bootstrap JS require Popper and jQuery if using bundle; but we'll load via CDN
  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"
        integrity="sha384-kenU1KFdBIe4zVF0s0G1M5b4hcpxyD9F7jL+hjXtkB+AmxN9CZv+IbbVYUew+OrCXaRkfj"
        crossOrigin="anonymous"
      />
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
