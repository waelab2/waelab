import About from "./_components/about";
import Hero from "./_components/hero";

// import { LatestPost } from "~/app/_components/post";
// import { api, HydrateClient } from "~/trpc/server";

export default async function Home() {
  // const hello = await api.post.hello({ text: "from tRPC" });

  // void api.post.getLatest.prefetch();

  return (
    <>
      <Hero />
      <About />
    </>
  );

  // return (
  //   // <HydrateClient>
  //   <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
  //     <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
  //       <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
  //         Generate with <span className="text-[hsl(280,100%,70%)]">Waelab</span>
  //       </h1>
  //       <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
  //         <Link
  //           className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20"
  //           href="/generate"
  //         >
  //           <h3 className="text-2xl font-bold">Generate →</h3>
  //           <div className="text-lg">Start generating videos with Waelab.</div>
  //         </Link>
  //         <Link
  //           className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20"
  //           href="/models"
  //         >
  //           <h3 className="text-2xl font-bold">Models →</h3>
  //           <div className="text-lg">Learn more about available models.</div>
  //         </Link>
  //       </div>
  //       {/* <div className="flex flex-col items-center gap-2">
  //           <p className="text-2xl text-white">
  //             {hello ? hello.greeting : "Loading tRPC query..."}
  //           </p>
  //         </div> */}

  //       {/* <LatestPost /> */}
  //     </div>
  //   </main>
  //   // </HydrateClient>
  // );
}
