import { ButtonLink } from '@/components/ButtonLink';
import { HorizontalLine, VerticalLine } from '@/components/Line';
import { Content, isFilled } from '@prismicio/client';
import { PrismicNextImage } from '@prismicio/next';
import clsx from 'clsx';
import { FaStar } from 'react-icons/fa6';
import { Scribble } from './Scribble';

async function getDominantColor(url: string) {
    const paletteUrl = new URL(url);
    paletteUrl.searchParams.set('palette', 'json');
    const response = await fetch(paletteUrl);
    const data = await response.json();

    return data.dominant_colors?.vibrant?.hex || data.dominant_colors?.vibrant_light?.hex;
}

type SkateboardRelationship = Extract<
    Content.ProductGridSliceDefaultPrimaryProductItem['skateboard'],
    { link_type: 'Document' }
>;

type Props = {
    skateboard: SkateboardRelationship;
};

const VERTICAL_LINE_CLASSES =
    'absolute top-0 h-full stroke-2 text-stone-300 transition-colors group-hover:text-stone-400';
const HORIZONTAL_LINE_CLASSES =
    '-mx-8 stroke-2 text-stone-300 transition-colors group-hover:text-stone-400';

export async function SkateboardProduct({ skateboard }: Props) {
    if (!skateboard.data) {
        return null;
    }

    const { customizer, image, name, price: priceInCents } = skateboard.data;

    const price = isFilled.number(priceInCents)
        ? `$${(priceInCents / 100).toFixed(2)}`
        : 'Price Not Available';

    const dominantColor = isFilled.image(image) ? await getDominantColor(image.url) : undefined;

    return (
        <div className="group relative mx-auto w-full max-w-72 px-8 pt-4">
            <VerticalLine className={clsx(VERTICAL_LINE_CLASSES, 'left-4')} />
            <VerticalLine className={clsx(VERTICAL_LINE_CLASSES, 'right-4')} />
            <HorizontalLine className={HORIZONTAL_LINE_CLASSES} />

            <div className="flex items-center justify-between ~text-sm/2xl">
                <span>{price}</span>
                <span className="inline-flex items-center gap-1">
                    <FaStar className="text-yellow-400" /> 37
                </span>
            </div>
            <div className="-mb-1 overflow-hidden py-4">
                <Scribble className="absolute inset-0 h-full w-full" color={dominantColor} />

                <PrismicNextImage
                    alt=""
                    field={image}
                    width={150}
                    className="mx-auto w-[58%] origin-top transform-gpu transition-transform duration-500 ease-in-out group-hover:scale-150"
                />
            </div>

            <h3 className="my-2 text-center font-sans leading-tight ~text-lg/xl">{name}</h3>

            <HorizontalLine className={HORIZONTAL_LINE_CLASSES} />

            <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <ButtonLink field={customizer}>Customize</ButtonLink>
            </div>
        </div>
    );
}
