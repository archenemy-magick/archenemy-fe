import Head from "next/head";

export default function App({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <Head>
        <meta
          name="google-site-verification"
          content="pAS8ajpEz7buMbrDq_yI3VlnE7CbyKJOboKsgZJIHOM"
        />
      </Head>
      <body>{children}</body>
    </html>
  );
}
