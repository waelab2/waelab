import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";

export default function GeneratePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="mx-auto w-full max-w-2xl">
        <div className="rounded-lg bg-white p-8 shadow-md">
          <h1 className="mb-6 text-center text-2xl font-bold text-gray-900">
            Generate Content
          </h1>
          <div className="grid w-full gap-4">
            <Textarea
              placeholder="Type your message here..."
              className="min-h-[150px] resize-none"
            />
            <Button className="w-full">Generate</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
