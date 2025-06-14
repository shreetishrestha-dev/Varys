import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

export default function Filters({ company, setCompany }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
      <div className="flex flex-col space-y-2">
        <label className="text-sm font-medium text-slate-700">Company</label>
        <Select value={company} onValueChange={setCompany}>
          <SelectTrigger className="min-w-[200px]">
            <SelectValue placeholder="Select company..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Leapfrog">Leapfrog</SelectItem>
            <SelectItem value="CloudFactory">CloudFactory</SelectItem>
            <SelectItem value="Fusemachines">Fusemachines</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}