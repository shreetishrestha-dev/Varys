"use client"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"

const companies = [
  { id: "leapfrog", name: "Leapfrog Technology" },
  { id: "cloudfactory", name: "CloudFactory" },
  { id: "fusemachines", name: "FUSEmachines" },
  { id: "verisk", name: "Verisk Nepal" },
  { id: "deerwalk", name: "Deerwalk" },
]

export default function CompanySelector({ selectedCompany, onCompanyChange }) {
  return (
    <Select value={selectedCompany} onValueChange={onCompanyChange}>
      <SelectTrigger className="w-[280px] bg-white z-50">
        <SelectValue placeholder="Choose company to analyze" />
      </SelectTrigger>
      <SelectContent className="bg-white z-50 border border-border shadow-lg animate-in fade-in opacity-100">
        {companies.map((company) => (
          <SelectItem
            key={company.id}
            value={company.id}
            className="text-black"
          >
            {company.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
