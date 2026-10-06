import Image, { type ImageProps } from "next/image";
import { IMAGES } from "@/constants";

type Props = Omit<ImageProps, "src" | "alt"> & { alt?: string };

/** Transparent IEEE logo: dark text on light theme, white text on dark theme. */
export default function Logo({ alt = "IEEE", className = "", ...rest }: Props) {
  return (
    <>
      <Image src={IMAGES.logoLight} alt={alt} className={`${className} dark:hidden`} {...rest} />
      <Image src={IMAGES.logoDark} alt="" aria-hidden className={`${className} hidden dark:block`} {...rest} />
    </>
  );
}
