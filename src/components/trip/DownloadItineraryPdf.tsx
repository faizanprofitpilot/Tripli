"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { jsPDF } from "jspdf";
import type { Trip } from "@/types/trip";

interface DownloadItineraryPdfProps {
  trip: Trip;
  className?: string;
}

export function DownloadItineraryPdf({ trip, className }: DownloadItineraryPdfProps) {
  function downloadPdf() {
    const doc = new jsPDF({ format: "a4", unit: "mm" });
    const pageW = 210; // A4 width in mm
    let y = 20;

    doc.setFontSize(22);
    doc.text(`${trip.destination} Trip`, 20, y);
    y += 12;

    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(`${trip.destination} · ${trip.days_count} ${trip.days_count === 1 ? "day" : "days"}`, 20, y);
    y += 10;

    if (trip.summary) {
      doc.setTextColor(60, 60, 60);
      const lines = doc.splitTextToSize(trip.summary, pageW - 40);
      doc.text(lines, 20, y);
      y += lines.length * 6 + 12;
    }

    if (trip.hotel) {
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text("Recommended hotel", 20, y);
      y += 8;
      doc.setFontSize(11);
      doc.text(trip.hotel.name, 20, y);
      y += 6;
      if (trip.hotel.address) {
        doc.setTextColor(80, 80, 80);
        doc.text(trip.hotel.address, 20, y);
        y += 6;
      }
      if (trip.hotel.price_range) {
        doc.text(`Price: ${trip.hotel.price_range}`, 20, y);
        y += 8;
      }
      doc.setTextColor(0, 0, 0);
      y += 8;
    }

    trip.days?.forEach((day) => {
      if (y > 260) {
        doc.addPage();
        y = 20;
      }
      doc.setFontSize(14);
      doc.text(`Day ${day.day_number}${day.theme ? ` — ${day.theme}` : ""}`, 20, y);
      y += 10;

      day.items?.forEach((item) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.text(`${item.slot}: ${item.name}`, 24, y);
        y += 5;
        if (item.rationale || item.description) {
          doc.setFontSize(9);
          doc.setTextColor(80, 80, 80);
          const desc = (item.rationale || item.description || "").slice(0, 120);
          if (desc) {
            const lines = doc.splitTextToSize(desc, pageW - 48);
            doc.text(lines, 24, y);
            y += lines.length * 4;
          }
          doc.setTextColor(0, 0, 0);
          y += 2;
        }
      });
      y += 6;
    });

    if (trip.cost_estimate && y > 250) {
      doc.addPage();
      y = 20;
    }
    if (trip.cost_estimate) {
      doc.setFontSize(14);
      doc.text("Cost estimate", 20, y);
      y += 8;
      doc.setFontSize(11);
      doc.text(`Hotel: $${trip.cost_estimate.hotel_total}`, 20, y);
      y += 6;
      doc.text(`Food: $${trip.cost_estimate.food_total}`, 20, y);
      y += 6;
      doc.text(`Activities: $${trip.cost_estimate.activities_total}`, 20, y);
      y += 6;
      doc.text(`Transport: $${trip.cost_estimate.transportation_total}`, 20, y);
      y += 8;
      doc.setFont("helvetica", "bold");
      doc.text(`Total: $${trip.cost_estimate.total}`, 20, y);
    }

    const filename = `tripli-${trip.destination.replace(/\s+/g, "-").toLowerCase()}-itinerary.pdf`;
    doc.save(filename);
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="default"
      onClick={downloadPdf}
      className={className}
    >
      <Download className="size-4 mr-2" />
      Download PDF
    </Button>
  );
}
