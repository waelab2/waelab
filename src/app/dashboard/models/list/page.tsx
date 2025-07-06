import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { models } from "~/lib/constants";

export default function ModelsListPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] p-12 text-white">
      <ModelsTable />
    </main>
  );
}

function ModelsTable() {
  return (
    <Table className="border-2 border-white">
      <TableCaption className="text-white/75">
        A list of available models.
      </TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="text-white">ID</TableHead>
          <TableHead className="text-white">Name</TableHead>
          <TableHead className="text-right text-white">
            Price Per Second
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {models.map((model) => (
          <TableRow key={model.id}>
            <TableCell className="font-medium">{model.id}</TableCell>
            <TableCell>{model.name}</TableCell>
            <TableCell className="text-right">
              ${model.price_per_second}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
