"use client"

import { useState } from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader,
  DialogTitle,
  DialogDescription 
} from "@/components/ui/dialog"
import { Command, CommandEmpty, CommandGroup, CommandInput } from "@/components/ui/command"

interface SearchDialogProps {
  open: boolean
  setOpen: (open: boolean) => void
}

export function SearchDialog({ open, setOpen }: SearchDialogProps) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Search</DialogTitle>
          <DialogDescription>
            Search functionality is temporarily disabled for maintenance.
          </DialogDescription>
        </DialogHeader>
        <Command>
          <CommandInput
            placeholder="Type to search..."
            value=""
            onValueChange={() => {}}
          />
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup>
            <div className="p-4 text-sm text-muted-foreground">
              Search functionality is temporarily disabled for maintenance.
            </div>
          </CommandGroup>
        </Command>
      </DialogContent>
    </Dialog>
  )
} 