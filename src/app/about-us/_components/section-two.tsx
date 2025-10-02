import ValuesIcon from "@/assets/icons/values.svg";
import DecorationPlayButton from "@/assets/images/decoration-play-button.png";
import Image, { type StaticImageData } from "next/image";

export default function SectionTwo() {
  return (
    <section className="relative z-20 m-8 flex flex-col justify-center gap-8 md:m-12 md:gap-12 lg:flex-row">
      <div className="order-2 flex flex-1 lg:order-1">
        <Image
          src={DecorationPlayButton}
          alt="Decoration Play Button"
          className="w-full rounded-2xl object-cover"
        />
      </div>
      <div className="order-1 flex flex-1 items-center lg:order-2">
        <div className="flex flex-col gap-4 rounded-xl bg-white p-4 shadow-md md:gap-6 md:p-8">
          <div className="flex items-end justify-between gap-4">
            <h4 className="text-xl font-semibold md:text-2xl">
              Our Values at Waelab
            </h4>
            <Image
              src={ValuesIcon as StaticImageData}
              alt="Waelab Icon"
              width={64}
              height={64}
              className="md:h-24 md:w-24"
            />
          </div>
          <p className="text-ui-grey text-sm md:text-base">
            At Waelab, we believe that creativity and innovation are the essence
            of progress. That is why we always strive to provide tools and
            technologies that inspire creativity and open new horizons for
            users. We are committed to delivering the highest standards of
            quality and excellence in everything we offer to ensure that our
            clients achieve professional results that rival traditional
            cinematic production.
            <br />
            We care about providing a smooth and easy-to-use experience, as we
            focus on designing simple and effective tools that make AI
            technologies available to everyone without any complexity. We are
            also committed to continuous development and keeping up with the
            latest innovations in artificial intelligence to improve our
            services and provide a renewed experience that meets our
            clients&apos; needs.
            <br />
            At Waelab, we work to empower creative talents, whether inside or
            outside the Kingdom, to turn their ideas into reality using the
            latest technologies. We strive for leadership both locally and
            globally, reflecting the spirit of Saudi innovation on the
            international stage.
          </p>
        </div>
      </div>
    </section>
  );
}
