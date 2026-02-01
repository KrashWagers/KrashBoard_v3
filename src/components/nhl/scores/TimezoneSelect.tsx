import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type TimezoneOption = {
  label: string
  value: string
}

type TimezoneSelectProps = {
  value: string
  onChange: (value: string) => void
  options?: TimezoneOption[]
}

const defaultOptions: TimezoneOption[] = [
  { label: 'Eastern Time', value: 'America/New_York' },
  { label: 'Central Time', value: 'America/Chicago' },
  { label: 'Mountain Time', value: 'America/Denver' },
  { label: 'Pacific Time', value: 'America/Los_Angeles' },
  { label: 'UTC', value: 'UTC' },
]

export function TimezoneSelect({ value, onChange, options = defaultOptions }: TimezoneSelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[180px] border border-gray-700 bg-[#171717]">
        <SelectValue placeholder="Select timezone" />
      </SelectTrigger>
      <SelectContent className="border border-gray-700 bg-[#171717]">
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
