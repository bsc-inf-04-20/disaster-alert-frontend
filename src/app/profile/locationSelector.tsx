"use client";
import React, { useState, useEffect } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Props = {
  setUser: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (address: string, lat: number, lng: number) => void;
  initialValue?: string;
  title: string;
};

export function LocationDialog({
  isOpen, onClose, onSave, initialValue = "", title, setUser
}: Props) {
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  // const [user, setUser] = useState<User | null>(null)
  // Debounce and fetch from OpenCage
  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (query.length < 3) {
        setSuggestions([]);
        return;
      }
      const key = process.env.NEXT_PUBLIC_OPENCAGE_KEY;
      const url = new URL("https://api.opencagedata.com/geocode/v1/json");
      url.searchParams.set("q", query);
      url.searchParams.set("key", key!);
      url.searchParams.set("limit", "5");

      try {
        const res = await fetch(url.toString());
        const data = await res.json();
        setSuggestions(data.results);
      } catch (err) {
        console.error("OpenCage fetch error:", err);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  // Reset state when dialog reopens
  useEffect(() => {
    if (isOpen) {
      setQuery(initialValue);
      setSuggestions([]);
    }
  }, [isOpen, initialValue]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <div className="relative">
          <Input
            placeholder="Search for address"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {suggestions.length > 0 && (
            <ul className="absolute z-10 bg-white border w-full max-h-60 overflow-auto">
              {suggestions.map((result, i) => (
                <li
                  key={i}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    const { formatted } = result;
                    const { lat, lng } = result.geometry;
                    onSave(formatted, lat, lng);
                    onClose();
                    setSuggestions([]);
                  }}
                >
                  {result.formatted}
                </li>
              ))}
            </ul>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
