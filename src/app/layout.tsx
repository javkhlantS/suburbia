import { Bowlby_One_SC, DM_Mono } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/Header';
import { SVGFilters } from '@/components/SVGFilters';

const bowlbyOne = Bowlby_One_SC({
    variable: '--font-bowlby-sc',
    subsets: ['latin'],
    display: 'swap',
    weight: '400',
});

const dmMono = DM_Mono({
    variable: '--font-dm-mono',
    subsets: ['latin'],
    display: 'swap',
    weight: '400',
});

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="en"
            className={`${bowlbyOne.variable} ${dmMono.variable} antialiased font-mono font-medium text-zinc-800`}
        >
            <body>
                <main>
                    <Header />
                    {children}
                </main>
                <SVGFilters />
            </body>
        </html>
    );
}
