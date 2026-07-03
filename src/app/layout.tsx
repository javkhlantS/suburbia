import { Bowlby_One_SC, DM_Mono } from 'next/font/google';
import './globals.css';
import { SVGFilters } from '@/components/SVGFilters';
import { Metadata } from 'next';
import { createClient } from '@/prismicio';

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

export async function generateMetadata(): Promise<Metadata> {
    const client = createClient();
    const settings = await client.getSingle('settings');

    return {
        title: settings.data.site_title,
        description: settings.data.meta_description,
        openGraph: {
            images: settings.data.fallback_og_image.url ?? undefined,
        },
    };
}

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
                <main>{children}</main>
                <SVGFilters />
            </body>
        </html>
    );
}
