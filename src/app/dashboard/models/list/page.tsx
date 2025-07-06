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
    <main className="flex flex-col gap-6 pt-4 pb-16">
      <h1 className="text-2xl font-semibold tracking-tight">Model Catalog</h1>
      <ModelsTable />
    </main>
  );
}

function ModelsTable() {
  return (
    <Table className="border">
      <TableCaption>A list of available models.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Name</TableHead>
          <TableHead className="text-right">Price / sec</TableHead>
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
