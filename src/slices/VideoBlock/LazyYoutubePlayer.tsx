'use client';

import { KeyTextField } from '@prismicio/client';
import { useEffect, useMemo, useRef, useState } from 'react';

type VideoProps = {
    youTubeID: KeyTextField;
};

export function LazyYouTubePlayer({ youTubeID }: VideoProps) {
    const [isInView, setIsInView] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const videoID = youTubeID?.trim();
    const playerSrc = useMemo(() => {
        if (!videoID) {
            return '';
        }

        const params = new URLSearchParams({
            autoplay: '1',
            controls: '0',
            enablejsapi: '1',
            loop: '1',
            modestbranding: '1',
            mute: '1',
            playsinline: '1',
            playlist: videoID,
            rel: '0',
        });

        return `https://www.youtube-nocookie.com/embed/${videoID}?${params.toString()}`;
    }, [videoID]);

    const playVideo = () => {
        const player = iframeRef.current?.contentWindow;

        if (!player) {
            return;
        }

        player.postMessage(JSON.stringify({ event: 'command', func: 'mute', args: [] }), '*');
        player.postMessage(JSON.stringify({ event: 'command', func: 'playVideo', args: [] }), '*');
    };

    useEffect(() => {
        const currentContainerRef = containerRef.current;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                }
            },
            { threshold: 0, rootMargin: '1500px' },
        );

        if (currentContainerRef) {
            observer.observe(currentContainerRef);
        }

        return () => {
            if (currentContainerRef) {
                observer.unobserve(currentContainerRef);
            }
        };
    }, []);

    return (
        <div className="relative h-full w-full" ref={containerRef}>
            {isInView && playerSrc && (
                <iframe
                    ref={iframeRef}
                    src={playerSrc}
                    title="YouTube video player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    className="pointer-events-none h-full w-full border-0"
                    onLoad={playVideo}
                />
            )}
        </div>
    );
}
