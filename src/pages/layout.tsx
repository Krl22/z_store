// app/layout.tsx
import { FilterProvider } from "@/components/filter-context";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <FilterProvider>{children}</FilterProvider>
      </body>
    </html>
  );
}
