"use client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"

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
      <SelectTrigger className="w-[280px]">
        <SelectValue placeholder="Choose company to analyze" />
      </SelectTrigger>
      <SelectContent>
        {companies.map((company) => (
          <SelectItem key={company.id} value={company.id}>
            {company.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
