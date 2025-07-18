"use client"
import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { fetchCompanies } from "../api/mockApi"

export default function CompanySelector({ selectedCompany, onCompanyChange }) {
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const companiesData = await fetchCompanies()
        setCompanies(companiesData)
      } catch (error) {
        console.error("Failed to load companies:", error)
      } finally {
        setLoading(false)
      }
    }

    loadCompanies()
  }, [])

  if (loading) {
    return (
      <Select disabled>
        <SelectTrigger className="w-[280px] bg-white z-50">
          <SelectValue placeholder="Loading companies..." />
        </SelectTrigger>
      </Select>
    )
  }

  return (
    <Select value={selectedCompany} onValueChange={onCompanyChange}>
      <SelectTrigger className="w-[280px] bg-white z-50">
        <SelectValue placeholder="Choose company to analyze" />
      </SelectTrigger>
      <SelectContent className="bg-white z-50 border border-border shadow-lg animate-in fade-in opacity-100">
        {companies.map((company) => (
          <SelectItem key={company.id} value={company.name} className="text-black">
            {company.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
